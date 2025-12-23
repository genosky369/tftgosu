import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// GET /api/posts/:id - 글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 글 조회
    const { data: post, error } = await supabase
      .from('posts')
      .select('id, title, content, author, is_admin, view_count, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: '글을 찾을 수 없습니다' }, { status: 404 });
    }

    // 조회수 증가 (비동기, 에러 무시)
    supabase
      .from('posts')
      .update({ view_count: post.view_count + 1 })
      .eq('id', id)
      .then();

    return NextResponse.json({ post: { ...post, view_count: post.view_count + 1 } });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// PUT /api/posts/:id - 글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, password } = body;

    // 입력값 검증
    if (!title || !content || !password) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요' }, { status: 400 });
    }

    // 제목 길이 검증 (2~100자)
    if (title.length < 2 || title.length > 100) {
      return NextResponse.json({ error: '제목은 2~100자로 입력해주세요' }, { status: 400 });
    }

    // 내용 길이 검증 (1~1000자)
    if (content.length < 1 || content.length > 1000) {
      return NextResponse.json({ error: '내용은 1~1000자로 입력해주세요' }, { status: 400 });
    }

    // 글 조회 (비밀번호 확인용)
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('password_hash')
      .eq('id', id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: '글을 찾을 수 없습니다' }, { status: 404 });
    }

    // 비밀번호 확인
    const isValid = await bcrypt.compare(password, post.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다' }, { status: 401 });
    }

    // 글 수정
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: '글 수정에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// DELETE /api/posts/:id - 글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: '비밀번호를 입력해주세요' }, { status: 400 });
    }

    // 글 조회 (비밀번호 확인용)
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('password_hash')
      .eq('id', id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: '글을 찾을 수 없습니다' }, { status: 404 });
    }

    // 비밀번호 확인
    const isValid = await bcrypt.compare(password, post.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다' }, { status: 401 });
    }

    // 글 삭제
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: '글 삭제에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
