"use client";

import { useState } from "react";
import type { WorldRuneResult } from "@/types/simulator";
import { generateTeamCode } from "@/data/championTeamCodeMap";

interface ResultCardProps {
  result: WorldRuneResult;
  rank: number;
  isMinimal: boolean;
}

// 코스트별 색상
const COST_COLORS: Record<number, string> = {
  1: "#9ca3af",
  2: "#22c55e",
  3: "#3b82f6",
  4: "#a855f7",
  5: "#eab308",
};

export default function ResultCard({ result, rank, isMinimal }: ResultCardProps) {
  const { targetRegions, champions, championCount, totalCost, regionCoverages, remainingSlots } = result;
  const [copied, setCopied] = useState(false);

  // 팀 코드 복사
  const handleCopyTeamCode = async () => {
    const championNames = champions.map(c => c.name);
    const teamCode = generateTeamCode(championNames);

    try {
      await navigator.clipboard.writeText(teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
    }
  };

  return (
    <div className="bg-background-card rounded-xl p-4 border border-accent-blue/20 hover:border-accent-worldrune/50 transition-colors">
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-text-muted">#{rank}</span>
          {isMinimal && (
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
              최소 기물
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-text-sub text-xs">필요 기물</span>
              <p className="text-accent-worldrune font-bold">{championCount}명</p>
            </div>
            <div>
              <span className="text-text-sub text-xs">총 코스트</span>
              <p className="text-text font-bold">{totalCost}</p>
            </div>
            <div>
              <span className="text-text-sub text-xs">여유 슬롯</span>
              <p className="text-text-muted font-bold">{remainingSlots}개</p>
            </div>
          </div>
        </div>
      </div>

      {/* 목표 지역 */}
      <div className="mb-3">
        <p className="text-xs text-text-sub mb-1">목표 지역 4개</p>
        <div className="flex flex-wrap gap-1">
          {targetRegions.map(region => (
            <span
              key={region}
              className="px-2 py-1 bg-accent-worldrune/20 text-accent-worldrune rounded text-xs font-medium"
            >
              {region}
            </span>
          ))}
        </div>
      </div>

      {/* 지역별 커버 상세 */}
      <div className="mb-3">
        <p className="text-xs text-text-sub mb-1">지역 활성화 상세</p>
        <div className="grid grid-cols-2 gap-2">
          {regionCoverages.map(coverage => (
            <div
              key={coverage.region}
              className={`
                p-2 rounded-lg text-xs
                ${coverage.isActive
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-red-500/10 border border-red-500/30"
                }
              `}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={coverage.isActive ? "text-green-400" : "text-red-400"}>
                  {coverage.isActive ? "✓" : "✗"} {coverage.region}
                </span>
                <span className="text-text-muted">
                  {coverage.current}/{coverage.required}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {coverage.contributors.map((c, idx) => (
                  <span
                    key={idx}
                    className={`
                      px-1 py-0.5 rounded text-[10px]
                      ${c.type === 'symbol'
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                      }
                    `}
                  >
                    {c.type === 'symbol' ? '상징' : c.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 챔피언 목록 */}
      {champions.length > 0 && (
        <div>
          <p className="text-xs text-text-sub mb-1">필요 챔피언</p>
          <div className="flex flex-wrap gap-1">
            {champions
              .sort((a, b) => b.cost - a.cost)
              .map((champion, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${COST_COLORS[champion.cost]}20`,
                    color: COST_COLORS[champion.cost],
                    border: `1px solid ${COST_COLORS[champion.cost]}40`,
                  }}
                >
                  {champion.name}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* 챔피언 없이 완성 */}
      {champions.length === 0 && (
        <div className="text-center py-2 bg-green-500/10 rounded-lg">
          <span className="text-green-400 text-sm font-medium">
            상징만으로 4개 지역 활성화 가능!
          </span>
        </div>
      )}

      {/* 팀 코드 복사 버튼 - 챔피언이 있을 때만 표시 */}
      {champions.length > 0 && (
        <button
          onClick={handleCopyTeamCode}
          className={`
            w-full py-2 mt-3 rounded-lg text-sm font-medium transition-all
            ${copied
              ? "bg-green-500/20 text-green-400 border border-green-500/50"
              : "bg-background-header text-text-sub hover:bg-background hover:text-text border border-transparent"
            }
          `}
        >
          {copied ? "복사 완료!" : "팀 코드 복사"}
        </button>
      )}
    </div>
  );
}
