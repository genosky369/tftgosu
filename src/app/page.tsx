"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SimulatorGrid from "@/components/simulator/SimulatorGrid";

interface Post {
  id: string;
  title: string;
  author: string;
  is_admin: boolean;
}

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/posts?page=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.posts) {
          setRecentPosts(data.posts.slice(0, 5));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="text-center py-12 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-accent-pink">TFT</span>
          <span className="text-text">고수</span>
        </h1>
        <p className="text-text-sub text-lg">
          TFT 시뮬레이터로 최적의 조합을 찾아보세요
        </p>
      </section>

      {/* 시뮬레이터 그리드 */}
      <SimulatorGrid />

      {/* 하단 섹션: 게시판 미리보기 */}
      <section className="mt-12">
        {/* 자유게시판 */}
        <div className="bg-background-card rounded-xl p-6 border border-accent-blue/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📢</span>
              <h3 className="text-lg font-bold">자유게시판</h3>
            </div>
            <Link href="/board" className="text-sm text-accent-pink hover:underline">
              더보기 →
            </Link>
          </div>
          <ul className="space-y-2 text-text-sub">
            {recentPosts.length === 0 ? (
              <li className="truncate">• 게시글이 없습니다</li>
            ) : (
              recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/board/${post.id}`}
                    className="truncate hover:text-text block"
                  >
                    • {post.is_admin && <span className="text-accent-pink">[관리자] </span>}
                    {post.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="mt-16 py-8 border-t border-accent-blue/20 text-center text-text-sub text-sm">
        <p>© 2024 TFT고수. 건의사항은 오픈카톡으로 연락주세요.</p>
      </footer>
    </div>
  );
}
