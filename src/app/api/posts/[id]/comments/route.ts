import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAdminFromCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/posts/:id/comments - 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: comments, error } = await getSupabase()
      .from('comments')
      .select('id, content, author, is_admin, created_at')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: '댓글 조회 실패' }, { status: 500 });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// POST /api/posts/:id/comments - 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, author, password } = body;

    // 관리자 여부 확인
    const admin = await getAdminFromCookie();

    // 내용 검증 (공통)
    if (!content) {
      return NextResponse.json({ error: '댓글 내용을 입력해주세요' }, { status: 400 });
    }

    // 내용 길이 검증 (1~500자)
    if (content.length < 1 || content.length > 500) {
      return NextResponse.json({ error: '댓글은 1~500자로 입력해주세요' }, { status: 400 });
    }

    // 게시글 존재 확인
    const { data: post, error: postError } = await getSupabase()
      .from('posts')
      .select('id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다' }, { status: 404 });
    }

    let commentData;

    if (admin) {
      // 관리자: 닉네임/비밀번호 없이 댓글 작성
      commentData = {
        post_id: id,
        content: content.trim(),
        author: '관리자',
        password_hash: '',  // 관리자 댓글은 빈 문자열 (삭제 시 관리자 권한으로 처리)
        is_admin: true,
      };
    } else {
      // 일반 사용자: 닉네임/비밀번호 필수
      if (!author || !password) {
        return NextResponse.json({ error: '닉네임과 비밀번호를 입력해주세요' }, { status: 400 });
      }

      // 닉네임 길이 검증 (2~10자)
      if (author.length < 2 || author.length > 10) {
        return NextResponse.json({ error: '닉네임은 2~10자로 입력해주세요' }, { status: 400 });
      }

      // 비밀번호 길이 검증 (4~20자)
      if (password.length < 4 || password.length > 20) {
        return NextResponse.json({ error: '비밀번호는 4~20자로 입력해주세요' }, { status: 400 });
      }

      // 비밀번호 해시
      const password_hash = await bcrypt.hash(password, 10);

      commentData = {
        post_id: id,
        content: content.trim(),
        author: author.trim(),
        password_hash,
        is_admin: false,
      };
    }

    // 댓글 저장
    const { data: comment, error } = await getSupabase()
      .from('comments')
      .insert(commentData)
      .select('id, content, author, is_admin, created_at')
      .single();

    if (error) {
      console.error('댓글 작성 오류:', error);
      return NextResponse.json({ error: '댓글 작성에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
