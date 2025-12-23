"use client";

import type { SimulatorResult } from "@/types/simulator";
import ResultCard from "./ResultCard";

interface ResultListProps {
  results: SimulatorResult[];
}

export default function ResultList({ results }: ResultListProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-text-sub">
        <p className="text-4xl mb-4">🔍</p>
        <p>위에서 레벨과 상징을 선택하고</p>
        <p>계산 버튼을 눌러주세요</p>
      </div>
    );
  }

  // 브론즈 개수별 그룹핑
  const grouped = results.reduce((acc, result) => {
    const key = result.bronzeCount;
    if (!acc[key]) acc[key] = [];
    acc[key].push(result);
    return acc;
  }, {} as Record<number, SimulatorResult[]>);

  // 브론즈 개수 내림차순 정렬
  const sortedKeys = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* 결과 요약 */}
      <div className="bg-background-card rounded-xl p-4 border border-accent-pink/30">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-text-sub text-sm">최대 브론즈 시너지</span>
            <p className="text-3xl font-bold text-accent-pink">
              {sortedKeys[0]}개
            </p>
          </div>
          <div className="text-right">
            <span className="text-text-sub text-sm">검색된 조합</span>
            <p className="text-xl font-bold text-text">{results.length}개</p>
          </div>
        </div>
      </div>

      {/* 브론즈 개수별 결과 */}
      {sortedKeys.map(bronzeCount => (
        <div key={bronzeCount}>
          <h3 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
            <span className="text-accent-bronze">🥉</span>
            브론즈 {bronzeCount}개 조합
            <span className="text-sm font-normal text-text-sub">
              ({grouped[bronzeCount].length}개)
            </span>
          </h3>
          <div className="grid gap-4">
            {grouped[bronzeCount].slice(0, 5).map((result, idx) => (
              <ResultCard
                key={idx}
                result={result}
                rank={idx + 1}
              />
            ))}
          </div>
          {grouped[bronzeCount].length > 5 && (
            <p className="text-center text-text-sub text-sm mt-2">
              +{grouped[bronzeCount].length - 5}개 더 있음
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
