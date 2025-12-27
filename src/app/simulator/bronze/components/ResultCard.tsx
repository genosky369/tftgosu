import type { SimulatorResult } from "@/types/simulator";
import { getChampionImageUrl } from "@/lib/championImage";
import Image from "next/image";

interface ResultCardProps {
  result: SimulatorResult;
  rank: number;
}

// 코스트별 테두리 색상
const COST_BORDER_COLORS: Record<number, string> = {
  1: "#9ca3af", // 회색
  2: "#22c55e", // 초록
  3: "#3b82f6", // 파랑
  4: "#a855f7", // 보라
  5: "#eab308", // 골드
  7: "#ef4444", // 빨강 (특수 유닛)
};

export default function ResultCard({ result, rank }: ResultCardProps) {
  const { champions, activeSynergies, bronzeCount, totalCost } = result;

  // 활성화된 브론즈 시너지만 필터링
  const activeBronze = activeSynergies.filter(s => s.isActive);

  return (
    <div className="bg-background-card rounded-xl p-4 border border-accent-blue/20 hover:border-accent-bronze/50 transition-colors">
      {/* 헤더: 순위와 브론즈 개수 */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-text-muted">#{rank}</span>
          <div className="px-3 py-1 bg-accent-bronze/20 rounded-lg">
            <span className="text-accent-bronze font-bold">{bronzeCount}개</span>
            <span className="text-text-sub text-sm ml-1">브론즈</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-text-sub text-sm">총 코스트</span>
          <span className="text-text font-bold ml-2">{totalCost}</span>
        </div>
      </div>

      {/* 챔피언 목록 (이미지 + 이름) */}
      <div className="mb-3">
        <p className="text-xs text-text-sub mb-2">챔피언 구성</p>
        <div className="flex flex-wrap gap-2">
          {champions
            .sort((a, b) => b.cost - a.cost) // 코스트 높은 순 정렬
            .map((champion, idx) => {
              const imageUrl = getChampionImageUrl(champion.apiName);
              const borderColor = COST_BORDER_COLORS[champion.cost] || COST_BORDER_COLORS[5];

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1"
                  title={champion.name}
                >
                  <div
                    className="relative w-12 h-12 rounded-md overflow-hidden"
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

      {/* 활성화된 브론즈 시너지 */}
      <div>
        <p className="text-xs text-text-sub mb-2">활성화된 브론즈 시너지</p>
        <div className="flex flex-wrap gap-1">
          {activeBronze.map((synergy, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-accent-bronze/10 text-accent-bronze rounded text-xs"
            >
              {synergy.name} ({synergy.current}/{synergy.required})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
