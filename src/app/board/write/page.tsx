"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // 관리자 여부 확인
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          setIsAdmin(true);
        }
      } catch {
        // 관리자 아님
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/board/${data.postId}`);
      } else {
        setError(data.error || "글 작성에 실패했습니다");
      }
    } catch {
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

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

      {/* 글 작성 폼 */}
      <div className="bg-background-card rounded-xl border border-accent-blue/20 p-6">
        <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>✏️</span>
          <span>글쓰기</span>
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 관리자 표시 또는 닉네임 & 비밀번호 */}
          {checkingAdmin ? (
            <div className="p-3 bg-background rounded-lg border border-accent-blue/30">
              <span className="text-text-sub">확인 중...</span>
            </div>
          ) : isAdmin ? (
            <div className="p-3 bg-accent-pink/10 border border-accent-pink/30 rounded-lg">
              <span className="text-accent-pink font-medium">관리자로 작성합니다</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-sub mb-1">
                  닉네임 <span className="text-text-sub/50">(2~10자)</span>
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  maxLength={10}
                  placeholder="닉네임을 입력하세요"
                  className="w-full px-4 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text placeholder-text-sub/50"
                />
              </div>
              <div>
                <label className="block text-sm text-text-sub mb-1">
                  비밀번호 <span className="text-text-sub/50">(4~20자, 수정/삭제용)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={20}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text placeholder-text-sub/50"
                />
              </div>
            </div>
          )}

          {/* 제목 */}
          <div>
            <label className="block text-sm text-text-sub mb-1">
              제목 <span className="text-text-sub/50">(2~100자)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text placeholder-text-sub/50"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm text-text-sub mb-1">
              내용 <span className="text-text-sub/50">({content.length}/1000자)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              rows={10}
              placeholder="내용을 입력하세요"
              className="w-full px-4 py-2 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text placeholder-text-sub/50 resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-4">
            <Link
              href="/board"
              className="px-6 py-2 text-text-sub border border-accent-blue/30 rounded-lg hover:bg-accent-blue/10 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-accent-pink text-white rounded-lg hover:bg-accent-pink/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "작성 중..." : "작성하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
