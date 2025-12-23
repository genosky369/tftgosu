"use client";

export default function LogoPreviewPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4 text-center">로고 마크 시안</h1>
      <p className="text-center text-text-sub mb-8 text-sm">
        LOL 챌린저 마크 스타일 로고 (아이콘)
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {/* 시안 1: 왕관 방패 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 1: 왕관 방패</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            {/* 방패 외곽 */}
            <path d="M40 5 L70 15 L70 45 Q70 65 40 75 Q10 65 10 45 L10 15 Z"
                  fill="url(#shield1)" stroke="#22d3ee" strokeWidth="2"/>
            {/* 왕관 */}
            <path d="M25 30 L30 40 L35 32 L40 42 L45 32 L50 40 L55 30 L55 45 L25 45 Z"
                  fill="url(#gold1)"/>
            {/* 중앙 보석 */}
            <circle cx="40" cy="55" r="8" fill="url(#gem1)" stroke="#fbbf24" strokeWidth="1"/>
            <defs>
              <linearGradient id="shield1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0891b2"/>
                <stop offset="100%" stopColor="#164e63"/>
              </linearGradient>
              <linearGradient id="gold1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde047"/>
                <stop offset="100%" stopColor="#d97706"/>
              </linearGradient>
              <radialGradient id="gem1">
                <stop offset="0%" stopColor="#fef3c7"/>
                <stop offset="100%" stopColor="#f59e0b"/>
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* 시안 2: 날개 엠블럼 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 2: 날개 엠블럼</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
            {/* 왼쪽 날개 */}
            <path d="M40 40 Q20 35 5 20 Q15 40 20 50 Q30 55 40 50 Z" fill="url(#wing2)"/>
            {/* 오른쪽 날개 */}
            <path d="M40 40 Q60 35 75 20 Q65 40 60 50 Q50 55 40 50 Z" fill="url(#wing2)"/>
            {/* 중앙 원형 */}
            <circle cx="40" cy="40" r="15" fill="url(#center2)" stroke="#fbbf24" strokeWidth="2"/>
            {/* 별 */}
            <path d="M40 30 L42 37 L50 37 L44 42 L46 50 L40 45 L34 50 L36 42 L30 37 L38 37 Z"
                  fill="#fef3c7"/>
            <defs>
              <linearGradient id="wing2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="100%" stopColor="#0e7490"/>
              </linearGradient>
              <linearGradient id="center2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde047"/>
                <stop offset="100%" stopColor="#b45309"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 시안 3: 다이아몬드 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 3: 다이아몬드</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            {/* 외곽 다이아 */}
            <path d="M40 5 L70 40 L40 75 L10 40 Z" fill="url(#dia3)" stroke="#22d3ee" strokeWidth="2"/>
            {/* 내부 다이아 */}
            <path d="M40 20 L55 40 L40 60 L25 40 Z" fill="url(#diaInner3)" stroke="#fbbf24" strokeWidth="1"/>
            {/* 중앙 */}
            <circle cx="40" cy="40" r="8" fill="#fef3c7"/>
            <defs>
              <linearGradient id="dia3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0e7490"/>
                <stop offset="50%" stopColor="#22d3ee"/>
                <stop offset="100%" stopColor="#0e7490"/>
              </linearGradient>
              <linearGradient id="diaInner3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde047"/>
                <stop offset="100%" stopColor="#d97706"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 시안 4: 육각 문장 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 4: 육각 문장</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
            {/* 외곽 육각형 */}
            <path d="M40 5 L65 20 L65 50 L40 75 L15 50 L15 20 Z"
                  fill="url(#hex4)" stroke="#fbbf24" strokeWidth="2"/>
            {/* 내부 육각형 */}
            <path d="M40 18 L55 28 L55 48 L40 62 L25 48 L25 28 Z"
                  fill="url(#hexInner4)"/>
            {/* 왕관 심볼 */}
            <path d="M30 38 L33 45 L37 40 L40 47 L43 40 L47 45 L50 38 L50 50 L30 50 Z"
                  fill="#fef3c7"/>
            <defs>
              <linearGradient id="hex4" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#164e63"/>
                <stop offset="100%" stopColor="#0e7490"/>
              </linearGradient>
              <linearGradient id="hexInner4" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde047"/>
                <stop offset="100%" stopColor="#92400e"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 시안 5: 검과 방패 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 5: 검과 방패</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            {/* 원형 방패 */}
            <circle cx="40" cy="42" r="28" fill="url(#shield5)" stroke="#22d3ee" strokeWidth="2"/>
            <circle cx="40" cy="42" r="20" fill="url(#shieldInner5)" stroke="#fbbf24" strokeWidth="1"/>
            {/* 검 */}
            <path d="M40 10 L43 15 L43 50 L40 55 L37 50 L37 15 Z" fill="url(#sword5)"/>
            <path d="M33 42 L47 42 L47 46 L33 46 Z" fill="#fbbf24"/>
            <circle cx="40" cy="58" r="4" fill="#fbbf24"/>
            <defs>
              <linearGradient id="shield5" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0891b2"/>
                <stop offset="100%" stopColor="#164e63"/>
              </linearGradient>
              <linearGradient id="shieldInner5" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#083344"/>
                <stop offset="100%" stopColor="#155e75"/>
              </linearGradient>
              <linearGradient id="sword5" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7"/>
                <stop offset="50%" stopColor="#fbbf24"/>
                <stop offset="100%" stopColor="#d97706"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 시안 6: 별 엠블럼 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 6: 별 엠블럼</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
            {/* 외곽 원 */}
            <circle cx="40" cy="40" r="35" fill="url(#starBg6)" stroke="#22d3ee" strokeWidth="2"/>
            {/* 큰 별 */}
            <path d="M40 10 L45 30 L65 30 L50 42 L55 62 L40 50 L25 62 L30 42 L15 30 L35 30 Z"
                  fill="url(#star6)" stroke="#fef3c7" strokeWidth="1"/>
            <defs>
              <linearGradient id="starBg6" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#164e63"/>
                <stop offset="100%" stopColor="#0c4a6e"/>
              </linearGradient>
              <linearGradient id="star6" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde047"/>
                <stop offset="100%" stopColor="#b45309"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 시안 7: 왕관 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 7: 왕관</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
            {/* 왕관 본체 */}
            <path d="M15 55 L20 25 L30 40 L40 20 L50 40 L60 25 L65 55 Z"
                  fill="url(#crown7)" stroke="#fbbf24" strokeWidth="2"/>
            {/* 보석들 */}
            <circle cx="25" cy="50" r="5" fill="#22d3ee"/>
            <circle cx="40" cy="48" r="6" fill="#22d3ee"/>
            <circle cx="55" cy="50" r="5" fill="#22d3ee"/>
            {/* 왕관 밴드 */}
            <path d="M15 55 L65 55 L65 65 L15 65 Z" fill="url(#band7)"/>
            <defs>
              <linearGradient id="crown7" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde047"/>
                <stop offset="100%" stopColor="#b45309"/>
              </linearGradient>
              <linearGradient id="band7" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d97706"/>
                <stop offset="100%" stopColor="#78350f"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 시안 8: 원형 문장 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 8: 원형 문장</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            {/* 외곽 링 */}
            <circle cx="40" cy="40" r="35" fill="none" stroke="url(#ring8)" strokeWidth="6"/>
            {/* 내부 원 */}
            <circle cx="40" cy="40" r="25" fill="url(#inner8)"/>
            {/* T 심볼 */}
            <path d="M25 28 L55 28 L55 35 L44 35 L44 58 L36 58 L36 35 L25 35 Z"
                  fill="url(#t8)"/>
            <defs>
              <linearGradient id="ring8" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="50%" stopColor="#fbbf24"/>
                <stop offset="100%" stopColor="#22d3ee"/>
              </linearGradient>
              <linearGradient id="inner8" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#164e63"/>
                <stop offset="100%" stopColor="#0c4a6e"/>
              </linearGradient>
              <linearGradient id="t8" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7"/>
                <stop offset="100%" stopColor="#fbbf24"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 시안 9: 삼각 방패 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 9: 삼각 방패</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
            {/* 외곽 삼각형 */}
            <path d="M40 8 L72 70 L8 70 Z" fill="url(#tri9)" stroke="#fbbf24" strokeWidth="2"/>
            {/* 내부 삼각형 */}
            <path d="M40 22 L60 60 L20 60 Z" fill="url(#triInner9)"/>
            {/* 중앙 원 */}
            <circle cx="40" cy="48" r="10" fill="url(#triCenter9)" stroke="#22d3ee" strokeWidth="2"/>
            <defs>
              <linearGradient id="tri9" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde047"/>
                <stop offset="100%" stopColor="#92400e"/>
              </linearGradient>
              <linearGradient id="triInner9" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0891b2"/>
                <stop offset="100%" stopColor="#164e63"/>
              </linearGradient>
              <radialGradient id="triCenter9">
                <stop offset="0%" stopColor="#fef3c7"/>
                <stop offset="100%" stopColor="#fbbf24"/>
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* 시안 10: 쌍검 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 10: 쌍검</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            {/* 원형 배경 */}
            <circle cx="40" cy="40" r="30" fill="url(#swordBg10)"/>
            {/* 왼쪽 검 */}
            <path d="M20 60 L25 55 L35 35 L33 33 L28 35 L15 65 Z" fill="url(#blade10)"/>
            <path d="M25 55 L30 50" stroke="#fbbf24" strokeWidth="3"/>
            {/* 오른쪽 검 */}
            <path d="M60 60 L55 55 L45 35 L47 33 L52 35 L65 65 Z" fill="url(#blade10)"/>
            <path d="M55 55 L50 50" stroke="#fbbf24" strokeWidth="3"/>
            {/* 중앙 보석 */}
            <circle cx="40" cy="40" r="8" fill="url(#gem10)" stroke="#fbbf24" strokeWidth="2"/>
            <defs>
              <linearGradient id="swordBg10" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#164e63"/>
                <stop offset="100%" stopColor="#0c4a6e"/>
              </linearGradient>
              <linearGradient id="blade10" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe"/>
                <stop offset="50%" stopColor="#22d3ee"/>
                <stop offset="100%" stopColor="#0891b2"/>
              </linearGradient>
              <radialGradient id="gem10">
                <stop offset="0%" stopColor="#fef3c7"/>
                <stop offset="100%" stopColor="#f59e0b"/>
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* 시안 11: 독수리 날개 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 11: 독수리 날개</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
            {/* 왼쪽 날개 */}
            <path d="M40 35 Q25 25 8 15 Q10 30 15 40 Q20 50 35 55 L40 50 Z" fill="url(#eagleWing11)"/>
            {/* 오른쪽 날개 */}
            <path d="M40 35 Q55 25 72 15 Q70 30 65 40 Q60 50 45 55 L40 50 Z" fill="url(#eagleWing11)"/>
            {/* 중앙 방패 */}
            <path d="M30 40 L40 30 L50 40 L50 55 Q50 65 40 70 Q30 65 30 55 Z"
                  fill="url(#eagleShield11)" stroke="#fbbf24" strokeWidth="1"/>
            {/* 별 */}
            <path d="M40 42 L42 48 L48 48 L43 52 L45 58 L40 54 L35 58 L37 52 L32 48 L38 48 Z"
                  fill="#fef3c7"/>
            <defs>
              <linearGradient id="eagleWing11" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde047"/>
                <stop offset="100%" stopColor="#b45309"/>
              </linearGradient>
              <linearGradient id="eagleShield11" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="100%" stopColor="#0e7490"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 시안 12: 심플 뱃지 */}
        <div className="bg-background-card rounded-xl border border-cyan-500/30 p-6 flex flex-col items-center">
          <p className="text-text-sub text-xs mb-4">시안 12: 심플 뱃지</p>
          <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            {/* 뱃지 모양 */}
            <path d="M40 5 L55 15 L65 30 L65 50 L55 65 L40 75 L25 65 L15 50 L15 30 L25 15 Z"
                  fill="url(#badge12)" stroke="#22d3ee" strokeWidth="2"/>
            {/* 내부 */}
            <path d="M40 15 L50 22 L55 35 L55 47 L50 58 L40 65 L30 58 L25 47 L25 35 L30 22 Z"
                  fill="url(#badgeInner12)"/>
            {/* G 심볼 */}
            <text x="40" y="48" textAnchor="middle" fontSize="28" fontWeight="bold" fill="url(#badgeText12)">G</text>
            <defs>
              <linearGradient id="badge12" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0891b2"/>
                <stop offset="100%" stopColor="#164e63"/>
              </linearGradient>
              <linearGradient id="badgeInner12" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#083344"/>
                <stop offset="100%" stopColor="#155e75"/>
              </linearGradient>
              <linearGradient id="badgeText12" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7"/>
                <stop offset="100%" stopColor="#fbbf24"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <p className="text-center text-text-sub mt-12">
        마음에 드는 시안 번호를 알려주세요!
      </p>

      <div className="mt-8 p-4 bg-background-header rounded-lg text-sm text-text-sub">
        <p className="font-bold mb-2">챌린저 마크 디자인 요소</p>
        <ul className="list-disc list-inside space-y-1">
          <li>색상: 시안(Cyan) + 골드(Gold) + 화이트(White)</li>
          <li>형태: 방패, 날개, 왕관, 별, 육각형</li>
          <li>그라데이션과 발광 효과</li>
        </ul>
      </div>
    </div>
  );
}
