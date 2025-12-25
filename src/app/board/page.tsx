"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Post {
  id: string;
  title: string;
  author: string;
  is_admin: boolean;
  view_count: number;
  created_at: string;
  comment_count: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${page}`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("글 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}-${day}`;
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(pagination.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // 이전 버튼
    if (pagination.currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => setCurrentPage(pagination.currentPage - 1)}
          className="px-3 py-1 text-text-sub hover:text-text"
        >
          &lt;
        </button>
      );
    }

    // 페이지 번호들
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${
            i === pagination.currentPage
              ? "bg-accent-pink text-white"
              : "text-text-sub hover:text-text"
          }`}
        >
          {i}
        </button>
      );
    }

    // 다음 버튼
    if (pagination.currentPage < pagination.totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => setCurrentPage(pagination.currentPage + 1)}
          className="px-3 py-1 text-text-sub hover:text-text"
        >
          &gt;
        </button>
      );
    }

    return <div className="flex justify-center gap-1 mt-6">{pages}</div>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">자유게시판</h1>
        <Link
          href="/board/write"
          className="px-4 py-2 bg-accent-pink text-white rounded-lg hover:bg-accent-pink/80 transition-colors"
        >
          글쓰기
        </Link>
      </div>

      {/* 게시글 목록 */}
      <div className="bg-background-card rounded-xl border border-accent-blue/20 overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-background-header border-b border-accent-blue/20 text-sm text-text-sub">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 md:col-span-7">제목</div>
          <div className="col-span-2 text-center hidden md:block">작성자</div>
          <div className="col-span-2 md:col-span-1 text-center">날짜</div>
          <div className="col-span-3 md:col-span-1 text-center">조회</div>
        </div>

        {/* 게시글 행들 */}
        {loading ? (
          <div className="py-12 text-center text-text-sub">로딩 중...</div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-text-sub">
            게시글이 없습니다. 첫 글을 작성해보세요!
          </div>
        ) : (
          posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/board/${post.id}`}
              className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-accent-blue/10 hover:bg-accent-blue/5 transition-colors"
            >
              <div className="col-span-1 text-center text-text-sub text-sm">
                {pagination
                  ? pagination.totalCount - (pagination.currentPage - 1) * pagination.limit - index
                  : "-"}
              </div>
              <div className="col-span-6 md:col-span-7 truncate">
                {post.is_admin && (
                  <span className="text-xs bg-accent-pink/20 text-accent-pink px-1.5 py-0.5 rounded mr-2">
                    관리자
                  </span>
                )}
                <span className="text-text hover:text-accent-pink">{post.title}</span>
                {post.comment_count > 0 && (
                  <span className="text-white ml-1">[{post.comment_count}]</span>
                )}
              </div>
              <div className="col-span-2 text-center text-text-sub text-sm truncate hidden md:block">
                {post.author}
              </div>
              <div className="col-span-2 md:col-span-1 text-center text-text-sub text-sm">
                {formatDate(post.created_at)}
              </div>
              <div className="col-span-3 md:col-span-1 text-center text-text-sub text-sm">
                {post.view_count}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {renderPagination()}
    </div>
  );
}
