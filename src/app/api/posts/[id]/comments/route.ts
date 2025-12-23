import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// GET /api/posts/:id/comments - 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: comments, error } = await supabase
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

    // 입력값 검증
    if (!content || !author || !password) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요' }, { status: 400 });
    }

    // 닉네임 길이 검증 (2~10자)
    if (author.length < 2 || author.length > 10) {
      return NextResponse.json({ error: '닉네임은 2~10자로 입력해주세요' }, { status: 400 });
    }

    // 비밀번호 길이 검증 (4~20자)
    if (password.length < 4 || password.length > 20) {
      return NextResponse.json({ error: '비밀번호는 4~20자로 입력해주세요' }, { status: 400 });
    }

    // 내용 길이 검증 (1~500자)
    if (content.length < 1 || content.length > 500) {
      return NextResponse.json({ error: '댓글은 1~500자로 입력해주세요' }, { status: 400 });
    }

    // 게시글 존재 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다' }, { status: 404 });
    }

    // 비밀번호 해시
    const password_hash = await bcrypt.hash(password, 10);

    // 댓글 저장
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: id,
        content: content.trim(),
        author: author.trim(),
        password_hash,
        is_admin: false,
      })
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
