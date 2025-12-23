"use client";

import type { WorldRuneResult } from "@/types/simulator";
import ResultCard from "./ResultCard";

interface ResultListProps {
  results: WorldRuneResult[];
}

export default function ResultList({ results }: ResultListProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-text-sub">
        <p className="text-4xl mb-4">🌍</p>
        <p>위에서 레벨과 옵션을 설정하고</p>
        <p>계산 버튼을 눌러주세요</p>
      </div>
    );
  }

  // 최소 기물 수 찾기
  const minChampionCount = Math.min(...results.map(r => r.championCount));

  // 기물 수별 그룹핑
  const grouped = results.reduce((acc, result) => {
    const key = result.championCount;
    if (!acc[key]) acc[key] = [];
    acc[key].push(result);
    return acc;
  }, {} as Record<number, WorldRuneResult[]>);

  // 기물 수 오름차순 정렬
  const sortedKeys = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* 결과 요약 */}
      <div className="bg-background-card rounded-xl p-4 border border-accent-worldrune/30">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-text-sub text-sm">최소 필요 기물</span>
            <p className="text-3xl font-bold text-accent-worldrune">
              {minChampionCount}명
            </p>
          </div>
          <div className="text-right">
            <span className="text-text-sub text-sm">검색된 조합</span>
            <p className="text-xl font-bold text-text">{results.length}개</p>
          </div>
        </div>
      </div>

      {/* 기물 수별 결과 */}
      {sortedKeys.map(championCount => (
        <div key={championCount}>
          <h3 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
            <span className="text-accent-worldrune">🌍</span>
            {championCount}명 조합
            <span className="text-sm font-normal text-text-sub">
              ({grouped[championCount].length}개)
            </span>
            {championCount === minChampionCount && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                최소
              </span>
            )}
          </h3>
          <div className="grid gap-4">
            {grouped[championCount].slice(0, 5).map((result, idx) => (
              <ResultCard
                key={idx}
                result={result}
                rank={idx + 1}
                isMinimal={championCount === minChampionCount}
              />
            ))}
          </div>
          {grouped[championCount].length > 5 && (
            <p className="text-center text-text-sub text-sm mt-2">
              +{grouped[championCount].length - 5}개 더 있음
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
