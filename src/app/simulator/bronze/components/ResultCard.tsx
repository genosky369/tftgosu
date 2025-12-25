import type { SimulatorResult } from "@/types/simulator";

interface ResultCardProps {
  result: SimulatorResult;
  rank: number;
}

// 코스트별 색상
const COST_COLORS: Record<number, string> = {
  1: "#9ca3af", // 회색
  2: "#22c55e", // 초록
  3: "#3b82f6", // 파랑
  4: "#a855f7", // 보라
  5: "#eab308", // 골드
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

      {/* 챔피언 목록 */}
      <div className="mb-3">
        <p className="text-xs text-text-sub mb-2">챔피언 구성</p>
        <div className="flex flex-wrap gap-1">
          {champions
            .sort((a, b) => b.cost - a.cost) // 코스트 높은 순 정렬
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
