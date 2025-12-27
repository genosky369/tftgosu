import type { WorldRuneResult } from "@/types/simulator";
import { getChampionImageUrl } from "@/lib/championImage";
import Image from "next/image";

interface ResultCardProps {
  result: WorldRuneResult;
  rank: number;
  isMinimal: boolean;
}

// 보유 챔피언 여부 확인
const isOwnedChampion = (name: string, ownedNames: string[]): boolean => {
  return ownedNames.includes(name);
};

// 코스트별 색상
const COST_COLORS: Record<number, string> = {
  1: "#9ca3af",
  2: "#22c55e",
  3: "#3b82f6",
  4: "#a855f7",
  5: "#eab308",
  7: "#ef4444", // 빨강 (특수 유닛)
};

export default function ResultCard({ result, rank, isMinimal }: ResultCardProps) {
  const { targetRegions, champions, ownedChampionNames = [], championCount, totalCost, regionCoverages, remainingSlots } = result;

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

      {/* 챔피언 목록 (이미지 + 이름) */}
      {champions.length > 0 && (
        <div>
          <p className="text-xs text-text-sub mb-1">
            필요 챔피언
            {ownedChampionNames.length > 0 && (
              <span className="text-accent-worldrune ml-2">
                (보유: {ownedChampionNames.length}명)
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {champions
              .sort((a, b) => {
                // 보유 챔피언을 먼저 표시
                const aOwned = isOwnedChampion(a.name, ownedChampionNames);
                const bOwned = isOwnedChampion(b.name, ownedChampionNames);
                if (aOwned !== bOwned) return aOwned ? -1 : 1;
                return b.cost - a.cost;
              })
              .map((champion, idx) => {
                const owned = isOwnedChampion(champion.name, ownedChampionNames);
                const imageUrl = getChampionImageUrl(champion.apiName);
                const borderColor = owned ? '#10b981' : (COST_COLORS[champion.cost] || COST_COLORS[5]);

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1"
                    title={champion.name}
                  >
                    <div
                      className={`relative w-12 h-12 rounded-md overflow-hidden ${owned ? 'ring-2 ring-accent-worldrune' : ''}`}
                      style={{ border: `2px solid ${borderColor}` }}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={champion.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-xs"
                          style={{ backgroundColor: `${borderColor}30`, color: borderColor }}
                        >
                          {champion.name.slice(0, 2)}
                        </div>
                      )}
                      {owned && (
                        <div className="absolute top-0 right-0 bg-accent-worldrune text-white text-[8px] px-1 rounded-bl">
                          ★
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
    </div>
  );
}
