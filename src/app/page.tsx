"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import SimulatorGrid from "@/components/simulator/SimulatorGrid";

const CHALLENGER_EMBLEM_URL = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/challenger.png";

interface Post {
  id: string;
  title: string;
  author: string;
  is_admin: boolean;
  comment_count: number;
}

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    // 게시글 로드
    fetch("/api/posts?page=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.posts) {
          setRecentPosts(data.posts.slice(0, 5));
        }
      })
      .catch(() => {});

    // 방문 기록 (통계는 관리자 페이지에서만 표시)
    fetch("/api/visitors", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="text-center py-12 mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image
            src={CHALLENGER_EMBLEM_URL}
            alt="Challenger"
            width={64}
            height={64}
            className="drop-shadow-[0_0_15px_rgba(251,191,36,0.7)]"
            unoptimized
          />
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="text-cyan-400">TFT</span>
            <span className="text-yellow-400">고수</span>
          </h1>
        </div>
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
            <h3 className="text-lg font-bold">자유게시판</h3>
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
                    {post.comment_count > 0 && (
                      <span className="text-white ml-1">[{post.comment_count}]</span>
                    )}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="mt-16 py-8 border-t border-accent-blue/20 text-center">
        {/* 건의하기 버튼 */}
        <a
          href="https://open.kakao.com/o/spn5XZ7h"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FEE500] text-[#391B1B] font-bold rounded-full hover:bg-[#FDD835] transition-colors shadow-lg hover:shadow-xl"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.83 5.32 4.6 6.7-.15.54-.8 2.82-.83 3.01 0 0-.02.13.05.19.07.05.16.03.16.03.21-.03 2.44-1.6 3.45-2.27.51.08 1.04.12 1.57.12 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
          </svg>
          건의하기
        </a>
        <p className="mt-4 text-text-sub text-sm">
          © 2025 TFT고수
        </p>
      </footer>
    </div>
  );
}
