import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// GET /api/posts - 글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10; // 페이지당 10개
    const offset = (page - 1) * limit;

    // 총 글 개수 조회
    const { count, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({ error: '글 개수 조회 실패' }, { status: 500 });
    }

    // 글 목록 조회 (최신순)
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, author, is_admin, view_count, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: '글 목록 조회 실패' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: count || 0,
        limit,
      },
    });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// POST /api/posts - 글 작성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, author, password } = body;

    // 입력값 검증
    if (!title || !content || !author || !password) {
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

    // 제목 길이 검증 (2~100자)
    if (title.length < 2 || title.length > 100) {
      return NextResponse.json({ error: '제목은 2~100자로 입력해주세요' }, { status: 400 });
    }

    // 내용 길이 검증 (1~1000자)
    if (content.length < 1 || content.length > 1000) {
      return NextResponse.json({ error: '내용은 1~1000자로 입력해주세요' }, { status: 400 });
    }

    // 비밀번호 해시
    const password_hash = await bcrypt.hash(password, 10);

    // 글 저장
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        password_hash,
        is_admin: false,
        view_count: 0,
      })
      .select('id')
      .single();

    if (error) {
      console.error('글 작성 오류:', error);
      return NextResponse.json({ error: '글 작성에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ success: true, postId: post.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
