"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Admin {
  id: string;
  username: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/me");
      if (res.ok) {
        const data = await res.json();
        setAdmin(data.admin);
      } else {
        router.push("/admin/login");
      }
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-text-sub py-12">로딩 중...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>📊</span>
            <span>관리자 대시보드</span>
          </h1>
          <p className="text-text-sub text-sm mt-1">
            안녕하세요, <span className="text-accent-pink">{admin.username}</span>님
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          로그아웃
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-background-card rounded-xl border border-accent-blue/20 p-6">
          <p className="text-text-sub text-sm mb-1">오늘 방문자</p>
          <p className="text-3xl font-bold text-accent-pink">-</p>
          <p className="text-text-sub text-xs mt-1">방문자 통계 구현 예정</p>
        </div>
        <div className="bg-background-card rounded-xl border border-accent-blue/20 p-6">
          <p className="text-text-sub text-sm mb-1">총 방문자</p>
          <p className="text-3xl font-bold text-accent-blue">-</p>
          <p className="text-text-sub text-xs mt-1">방문자 통계 구현 예정</p>
        </div>
        <div className="bg-background-card rounded-xl border border-accent-blue/20 p-6">
          <p className="text-text-sub text-sm mb-1">총 게시글</p>
          <p className="text-3xl font-bold">-</p>
          <p className="text-text-sub text-xs mt-1">곧 구현 예정</p>
        </div>
        <div className="bg-background-card rounded-xl border border-accent-blue/20 p-6">
          <p className="text-text-sub text-sm mb-1">총 댓글</p>
          <p className="text-3xl font-bold">-</p>
          <p className="text-text-sub text-xs mt-1">곧 구현 예정</p>
        </div>
      </div>

      {/* 관리 메뉴 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/board"
          className="bg-background-card rounded-xl border border-accent-blue/20 p-6 hover:border-accent-pink/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <h3 className="font-bold">게시글 관리</h3>
              <p className="text-text-sub text-sm">
                게시글 보기 및 삭제
              </p>
            </div>
          </div>
        </Link>
        <Link
          href="/"
          className="bg-background-card rounded-xl border border-accent-blue/20 p-6 hover:border-accent-pink/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏠</span>
            <div>
              <h3 className="font-bold">홈으로</h3>
              <p className="text-text-sub text-sm">
                메인 페이지로 이동
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* 안내 문구 */}
      <div className="mt-8 p-4 bg-accent-blue/10 rounded-lg border border-accent-blue/20">
        <p className="text-text-sub text-sm">
          💡 <strong>관리자 권한:</strong> 게시글과 댓글 상세 페이지에서 비밀번호 없이 삭제할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
