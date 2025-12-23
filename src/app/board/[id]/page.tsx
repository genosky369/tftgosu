"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  is_admin: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  is_admin: boolean;
  created_at: string;
}

type ModalType = "edit" | "delete" | "deleteComment" | null;

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // 모달 상태
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalPassword, setModalPassword] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  // 댓글 작성 상태
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentPassword, setCommentPassword] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
    checkAdminStatus();
  }, [id]);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch("/api/admin/me");
      setIsAdmin(res.ok);
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      if (res.ok) {
        setPost(data.post);
        setEditTitle(data.post.title);
        setEditContent(data.post.content);
      } else {
        setError(data.error || "글을 불러올 수 없습니다");
      }
    } catch {
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${id}/comments`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments);
      }
    } catch {
      console.error("댓글 로딩 실패");
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openModal = (type: ModalType, commentId?: string) => {
    setModalType(type);
    setModalPassword("");
    setModalError("");
    if (type === "edit" && post) {
      setEditTitle(post.title);
      setEditContent(post.content);
    }
    if (type === "deleteComment" && commentId) {
      setDeleteCommentId(commentId);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setModalPassword("");
    setModalError("");
    setDeleteCommentId(null);
  };

  const handleEdit = async () => {
    if (!modalPassword) {
      setModalError("비밀번호를 입력해주세요");
      return;
    }
    setModalLoading(true);
    setModalError("");

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          password: modalPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        closeModal();
        fetchPost();
      } else {
        setModalError(data.error || "수정에 실패했습니다");
      }
    } catch {
      setModalError("서버 오류가 발생했습니다");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    // 관리자가 아닌 경우만 비밀번호 필수
    if (!isAdmin && !modalPassword) {
      setModalError("비밀번호를 입력해주세요");
      return;
    }
    setModalLoading(true);
    setModalError("");

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: isAdmin ? "" : modalPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/board");
      } else {
        setModalError(data.error || "삭제에 실패했습니다");
      }
    } catch {
      setModalError("서버 오류가 발생했습니다");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");
    setCommentLoading(true);

    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentContent,
          author: commentAuthor,
          password: commentPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCommentContent("");
        fetchComments();
      } else {
        setCommentError(data.error || "댓글 작성에 실패했습니다");
      }
    } catch {
      setCommentError("서버 오류가 발생했습니다");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId) {
      setModalError("삭제할 댓글이 없습니다");
      return;
    }
    // 관리자가 아닌 경우만 비밀번호 필수
    if (!isAdmin && !modalPassword) {
      setModalError("비밀번호를 입력해주세요");
      return;
    }
    setModalLoading(true);
    setModalError("");

    try {
      const res = await fetch(`/api/comments/${deleteCommentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: isAdmin ? "" : modalPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        closeModal();
        fetchComments();
      } else {
        setModalError(data.error || "삭제에 실패했습니다");
      }
    } catch {
      setModalError("서버 오류가 발생했습니다");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-text-sub py-12">로딩 중...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-background-card rounded-xl border border-red-500/30 p-8 text-center">
          <p className="text-red-400 mb-4">{error || "글을 찾을 수 없습니다"}</p>
          <Link
            href="/board"
            className="text-accent-pink hover:underline"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 상단 네비게이션 */}
      <div className="mb-4">
        <Link
          href="/board"
          className="text-text-sub hover:text-text transition-colors"
        >
          ← 목록으로
        </Link>
      </div>

      {/* 글 상세 */}
      <article className="bg-background-card rounded-xl border border-accent-blue/20 overflow-hidden">
        {/* 제목 */}
        <div className="px-6 py-4 border-b border-accent-blue/20">
          <h1 className="text-xl font-bold flex items-center gap-2">
            {post.is_admin && (
              <span className="text-xs bg-accent-pink/20 text-accent-pink px-2 py-0.5 rounded">
                관리자
              </span>
            )}
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-sub">
            <span>{post.author}</span>
            <span>|</span>
            <span>{formatDateTime(post.created_at)}</span>
            <span>|</span>
            <span>조회 {post.view_count}</span>
          </div>
        </div>

        {/* 본문 */}
        <div className="px-6 py-6 min-h-[200px] whitespace-pre-wrap break-words">
          {post.content}
        </div>

        {/* 수정/삭제 버튼 */}
        <div className="px-6 py-4 border-t border-accent-blue/20 flex gap-2 justify-end">
          <button
            className="px-4 py-2 text-sm text-text-sub border border-accent-blue/30 rounded-lg hover:bg-accent-blue/10 transition-colors"
            onClick={() => openModal("edit")}
          >
            수정
          </button>
          <button
            className="px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
            onClick={() => openModal("delete")}
          >
            삭제
          </button>
        </div>
      </article>

      {/* 댓글 섹션 */}
      <section className="mt-6 bg-background-card rounded-xl border border-accent-blue/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-accent-blue/20">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>💬</span>
            <span>댓글 {comments.length}개</span>
          </h2>
        </div>

        {/* 댓글 목록 */}
        <div className="divide-y divide-accent-blue/10">
          {comments.length === 0 ? (
            <div className="px-6 py-8 text-center text-text-sub">
              첫 댓글을 작성해보세요!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    {comment.is_admin && (
                      <span className="text-xs bg-accent-pink/20 text-accent-pink px-1.5 py-0.5 rounded">
                        관리자
                      </span>
                    )}
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-text-sub">|</span>
                    <span className="text-text-sub">{formatCommentDate(comment.created_at)}</span>
                  </div>
                  <button
                    onClick={() => openModal("deleteComment", comment.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    삭제
                  </button>
                </div>
                <p className="text-text whitespace-pre-wrap break-words">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* 댓글 작성 폼 */}
        <form onSubmit={handleCommentSubmit} className="px-6 py-4 border-t border-accent-blue/20">
          {commentError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {commentError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <input
                type="text"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="닉네임 (2~10자)"
                maxLength={10}
                className="w-full px-3 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text text-sm placeholder-text-sub/50"
              />
            </div>
            <div>
              <input
                type="password"
                value={commentPassword}
                onChange={(e) => setCommentPassword(e.target.value)}
                placeholder="비밀번호 (4~20자)"
                maxLength={20}
                className="w-full px-3 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text text-sm placeholder-text-sub/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 입력하세요 (1~500자)"
              maxLength={500}
              rows={2}
              className="flex-1 px-3 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text text-sm placeholder-text-sub/50 resize-none"
            />
            <button
              type="submit"
              disabled={commentLoading}
              className="px-4 py-2 bg-accent-pink text-white rounded-lg hover:bg-accent-pink/80 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {commentLoading ? "..." : "작성"}
            </button>
          </div>
        </form>
      </section>

      {/* 수정 모달 */}
      {modalType === "edit" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-xl border border-accent-blue/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-accent-blue/20">
              <h2 className="text-lg font-bold">글 수정</h2>
            </div>
            <div className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {modalError}
                </div>
              )}
              <div>
                <label className="block text-sm text-text-sub mb-1">제목</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text"
                />
              </div>
              <div>
                <label className="block text-sm text-text-sub mb-1">
                  내용 <span className="text-text-sub/50">({editContent.length}/1000)</span>
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  maxLength={1000}
                  rows={8}
                  className="w-full px-4 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-text-sub mb-1">비밀번호 확인</label>
                <input
                  type="password"
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  placeholder="글 작성 시 입력한 비밀번호"
                  className="w-full px-4 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text placeholder-text-sub/50"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-accent-blue/20 flex gap-2 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-text-sub border border-accent-blue/30 rounded-lg hover:bg-accent-blue/10 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                disabled={modalLoading}
                className="px-4 py-2 bg-accent-pink text-white rounded-lg hover:bg-accent-pink/80 transition-colors disabled:opacity-50"
              >
                {modalLoading ? "수정 중..." : "수정하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 모달 */}
      {modalType === "delete" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-xl border border-accent-blue/20 w-full max-w-md">
            <div className="px-6 py-4 border-b border-accent-blue/20">
              <h2 className="text-lg font-bold text-red-400">글 삭제</h2>
            </div>
            <div className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {modalError}
                </div>
              )}
              <p className="text-text-sub">
                정말로 이 글을 삭제하시겠습니까?<br />
                삭제된 글은 복구할 수 없습니다.
              </p>
              {isAdmin ? (
                <div className="p-3 bg-accent-pink/10 border border-accent-pink/30 rounded-lg text-accent-pink text-sm">
                  👑 관리자 권한으로 삭제합니다
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-text-sub mb-1">비밀번호 확인</label>
                  <input
                    type="password"
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder="글 작성 시 입력한 비밀번호"
                    className="w-full px-4 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text placeholder-text-sub/50"
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-accent-blue/20 flex gap-2 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-text-sub border border-accent-blue/30 rounded-lg hover:bg-accent-blue/10 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={modalLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-500/80 transition-colors disabled:opacity-50"
              >
                {modalLoading ? "삭제 중..." : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 삭제 모달 */}
      {modalType === "deleteComment" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-xl border border-accent-blue/20 w-full max-w-md">
            <div className="px-6 py-4 border-b border-accent-blue/20">
              <h2 className="text-lg font-bold text-red-400">댓글 삭제</h2>
            </div>
            <div className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {modalError}
                </div>
              )}
              <p className="text-text-sub">
                정말로 이 댓글을 삭제하시겠습니까?
              </p>
              {isAdmin ? (
                <div className="p-3 bg-accent-pink/10 border border-accent-pink/30 rounded-lg text-accent-pink text-sm">
                  👑 관리자 권한으로 삭제합니다
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-text-sub mb-1">비밀번호 확인</label>
                  <input
                    type="password"
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder="댓글 작성 시 입력한 비밀번호"
                    className="w-full px-4 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text placeholder-text-sub/50"
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-accent-blue/20 flex gap-2 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-text-sub border border-accent-blue/30 rounded-lg hover:bg-accent-blue/10 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteComment}
                disabled={modalLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-500/80 transition-colors disabled:opacity-50"
              >
                {modalLoading ? "삭제 중..." : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
