"use client";

import Image from "next/image";
import type { RyzeSimulatorResult } from "@/types/simulator";
import { getChampionImageUrl } from "@/lib/championImage";

interface ResultListProps {
  results: RyzeSimulatorResult[];
}

// 코스트별 테두리 색상
const COST_COLORS: Record<number, string> = {
  1: "#9ca3af",
  2: "#22c55e",
  3: "#3b82f6",
  4: "#a855f7",
  5: "#eab308",
  7: "#f97316", // 오렌지 (라이즈)
};

export default function ResultList({ results }: ResultListProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text">
        결과 ({results.length}개)
      </h2>

      {results.map((result, index) => (
        <div
          key={index}
          className="bg-background-card rounded-xl p-4 border border-accent-ryze/20"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-accent-ryze">
                {index + 1}위
              </span>
              <span className="px-3 py-1 bg-accent-ryze/20 text-accent-ryze rounded-full text-sm font-medium">
                {result.regionCount}지역 활성화
              </span>
            </div>
            <div className="text-right text-sm text-text-muted">
              <p>챔피언 {result.championCount}명</p>
              <p>총 코스트 {result.totalCost}</p>
            </div>
          </div>

          {/* 활성화된 지역 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-text-sub mb-2">활성화 지역</h4>
            <div className="flex flex-wrap gap-2">
              {result.activeRegions
                .filter(r => r.isActive)
                .map(region => (
                  <span
                    key={region.name}
                    className="px-2 py-1 bg-accent-ryze/20 text-accent-ryze rounded text-xs font-medium"
                  >
                    ✓ {region.name} ({region.count}/{region.threshold})
                  </span>
                ))}
            </div>
            {/* 미활성화 지역 (카운트 있는 것만) */}
            {result.activeRegions.filter(r => !r.isActive && r.count > 0).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {result.activeRegions
                  .filter(r => !r.isActive && r.count > 0)
                  .map(region => (
                    <span
                      key={region.name}
                      className="px-2 py-1 bg-background text-text-muted rounded text-xs"
                    >
                      {region.name} ({region.count}/{region.threshold})
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* 덱 구성 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-text-sub mb-2">
              덱 구성 ({result.championCount}명 + 라이즈)
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.champions
                .sort((a, b) => {
                  // 보유 챔피언 먼저, 그 다음 코스트 높은 순
                  const aOwned = result.ownedChampionNames.includes(a.name);
                  const bOwned = result.ownedChampionNames.includes(b.name);
                  if (aOwned !== bOwned) return aOwned ? -1 : 1;
                  return b.cost - a.cost;
                })
                .map(champion => {
                  const isOwned = result.ownedChampionNames.includes(champion.name);
                  const isUnlock = result.unlockRequired.includes(champion.name);
                  const imageUrl = getChampionImageUrl(champion.apiName);
                  const borderColor = isOwned ? '#f97316' : (COST_COLORS[champion.cost] || COST_COLORS[5]);

                  return (
                    <div
                      key={champion.name}
                      className="flex flex-col items-center gap-1"
                      title={`${champion.name} (${champion.cost}코) - ${champion.traits.join(", ")}`}
                    >
                      <div
                        className={`relative w-12 h-12 rounded-md overflow-hidden ${isOwned ? 'ring-2 ring-accent-ryze' : ''}`}
                        style={{ border: `2px solid ${borderColor}` }}
                      >
                        <Image
                          src={imageUrl}
                          alt={champion.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {isOwned && (
                          <div className="absolute top-0 right-0 bg-accent-ryze text-white text-[8px] px-1 rounded-bl">
                            ★
                          </div>
                        )}
                        {isUnlock && (
                          <div className="absolute bottom-0 left-0 bg-yellow-500 text-white text-[8px] px-1 rounded-tr">
                            🔒
                          </div>
                        )}
                      </div>
                      <span
                        className="text-center leading-tight"
                        style={{
                          color: borderColor,
                          fontSize: champion.name.length > 6 ? '8px' : champion.name.length > 4 ? '9px' : '10px'
                        }}
                      >
                        {champion.name}
                      </span>
                    </div>
                  );
                })}
              {/* 라이즈 (고정) */}
              <div
                className="flex flex-col items-center gap-1"
                title="라이즈 (7코) - 룬 마법사"
              >
                <div
                  className="relative w-12 h-12 rounded-md overflow-hidden"
                  style={{ border: `2px solid ${COST_COLORS[7]}` }}
                >
                  <Image
                    src={getChampionImageUrl("TFT16_Ryze")}
                    alt="라이즈"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] px-1 rounded-bl">
                    👑
                  </div>
                </div>
                <span
                  className="text-center leading-tight"
                  style={{ color: COST_COLORS[7], fontSize: '10px' }}
                >
                  라이즈
                </span>
              </div>
            </div>
          </div>

          {/* 라이즈 해금 조건 */}
          <div className="bg-background rounded-lg p-3">
            <h4 className="text-sm font-medium text-text-sub mb-2">라이즈 해금 조건</h4>
            <div className="flex items-center gap-4 text-sm">
              <span className={result.regionCount >= 4 ? "text-green-400" : "text-red-400"}>
                {result.regionCount >= 4 ? "✓" : "✗"} 4지역 이상 활성화 ({result.regionCount}지역)
              </span>
            </div>

            {/* 해금 필요 챔피언 */}
            {result.unlockRequired.length > 0 && (
              <div className="mt-2 pt-2 border-t border-background-header">
                <p className="text-xs text-yellow-400 flex items-center gap-1">
                  <span>⚠️</span>
                  해금 필요 챔피언: {result.unlockRequired.join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
