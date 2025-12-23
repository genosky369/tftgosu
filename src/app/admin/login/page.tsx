"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 이미 로그인되어 있는지 확인
  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => {
        if (res.ok) {
          router.push("/admin/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "로그인에 실패했습니다");
      }
    } catch {
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-background-card rounded-xl border border-accent-blue/20 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">관리자 로그인</h1>
          <p className="text-text-sub text-sm">TFT고수 관리자 페이지</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-sub mb-1">아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="관리자 아이디"
              autoComplete="username"
              className="w-full px-4 py-3 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text placeholder-text-sub/50"
            />
          </div>

          <div>
            <label className="block text-sm text-text-sub mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-background border border-accent-blue/30 rounded-lg focus:outline-none focus:border-accent-pink text-text placeholder-text-sub/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-pink text-white rounded-lg hover:bg-accent-pink/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

      </div>
    </div>
  );
}
