import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminFromCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// DELETE /api/comments/:id - 댓글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    // 관리자 권한 확인
    const admin = await getAdminFromCookie();

    // 관리자가 아닌 경우 비밀번호 필수
    if (!admin && !password) {
      return NextResponse.json({ error: '비밀번호를 입력해주세요' }, { status: 400 });
    }

    // 댓글 존재 확인
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('password_hash')
      .eq('id', id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다' }, { status: 404 });
    }

    // 관리자가 아닌 경우 비밀번호 확인
    if (!admin) {
      const isValid = await bcrypt.compare(password, comment.password_hash);
      if (!isValid) {
        return NextResponse.json({ error: '비밀번호가 일치하지 않습니다' }, { status: 401 });
      }
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: '댓글 삭제에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
