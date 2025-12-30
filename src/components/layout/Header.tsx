"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const OPEN_CHAT_URL = "https://open.kakao.com/o/spn5XZ7h";
const CHALLENGER_EMBLEM_URL = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/challenger.png";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background-header border-b border-accent-blue/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={CHALLENGER_EMBLEM_URL}
              alt="Challenger"
              width={32}
              height={32}
              className="drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              unoptimized
            />
            <span className="text-xl font-bold">
              <span className="text-cyan-400">TFT</span>
              <span className="text-yellow-400">고수</span>
            </span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/meta"
              className="text-text-sub hover:text-text transition-colors"
            >
              메타 티어리스트
            </Link>
            <Link
              href="/board"
              className="text-text-sub hover:text-text transition-colors"
            >
              자유게시판
            </Link>
            <a
              href={OPEN_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-sub hover:text-text transition-colors"
            >
              건의하기
            </a>
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="text-2xl">{isMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {/* 모바일 네비게이션 */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-accent-blue/30">
            <Link
              href="/meta"
              className="block py-2 text-text-sub hover:text-text transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              메타 티어리스트
            </Link>
            <Link
              href="/board"
              className="block py-2 text-text-sub hover:text-text transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              자유게시판
            </Link>
            <a
              href={OPEN_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2 text-text-sub hover:text-text transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              건의하기
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
