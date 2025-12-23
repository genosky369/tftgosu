import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { signToken, createTokenCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호를 입력해주세요' },
        { status: 400 }
      );
    }

    // 관리자 조회
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, username, password_hash')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const token = signToken({ id: admin.id, username: admin.username });

    // 응답 생성
    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, username: admin.username },
    });

    // 쿠키 설정
    response.headers.set('Set-Cookie', createTokenCookie(token));

    return response;
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
