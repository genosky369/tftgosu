"use client";

import { useState } from "react";
import { REGIONS } from "@/data/regions";
import { CHAMPIONS } from "@/data/champions";

interface InputFormProps {
  onCalculate: (
    level: number,
    regionSymbols: string[],
    excludedRegions: string[],
    excludedChampions: string[],
    maxCost: number
  ) => void;
  isCalculating: boolean;
}

const LEVELS = [6, 7, 8, 9, 10];
const COSTS = [1, 2, 3, 4, 5];

export default function InputForm({ onCalculate, isCalculating }: InputFormProps) {
  const [level, setLevel] = useState(8);
  const [maxCost, setMaxCost] = useState(5);
  const [symbolCounts, setSymbolCounts] = useState<Record<string, number>>({});
  const [excludedRegions, setExcludedRegions] = useState<string[]>([]);
  const [excludedChampions, setExcludedChampions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(5); // 코스트별 탭

  // 총 상징 개수
  const totalSymbolCount = Object.values(symbolCounts).reduce((sum, count) => sum + count, 0);

  // 상징 증가
  const incrementSymbol = (region: string) => {
    if (totalSymbolCount >= 4) return;
    setSymbolCounts(prev => ({
      ...prev,
      [region]: (prev[region] || 0) + 1
    }));
  };

  // 상징 감소
  const decrementSymbol = (region: string) => {
    setSymbolCounts(prev => {
      const current = prev[region] || 0;
      if (current <= 0) return prev;
      if (current === 1) {
        const { [region]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [region]: current - 1 };
    });
  };

  // 지역 제외 토글
  const toggleExcludeRegion = (region: string) => {
    setExcludedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  // 챔피언 제외 토글
  const toggleExcludeChampion = (championName: string) => {
    setExcludedChampions(prev =>
      prev.includes(championName)
        ? prev.filter(c => c !== championName)
        : [...prev, championName]
    );
  };

  // 계산 실행
  const handleCalculate = () => {
    const symbolsArray: string[] = [];
    for (const [region, count] of Object.entries(symbolCounts)) {
      for (let i = 0; i < count; i++) {
        symbolsArray.push(region);
      }
    }
    onCalculate(level, symbolsArray, excludedRegions, excludedChampions, maxCost);
  };

  // 전체 초기화
  const clearAll = () => {
    setSymbolCounts({});
    setExcludedRegions([]);
    setExcludedChampions([]);
  };

  // 코스트별 챔피언 필터링
  const championsByCost = CHAMPIONS.filter(c => c.cost === activeTab && c.cost <= maxCost);

  return (
    <div className="space-y-6">
      {/* 레벨 선택 */}
      <div className="bg-background-card rounded-xl p-4 border border-accent-blue/20">
        <label className="block text-sm font-medium text-text-sub mb-2">
          타겟 레벨
        </label>
        <div className="flex gap-2">
          {LEVELS.map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${level === l
                  ? "bg-accent-worldrune text-background"
                  : "bg-background text-text-sub hover:bg-background-header"
                }
              `}
            >
              Lv.{l}
            </button>
          ))}
        </div>
      </div>

      {/* 최대 코스트 */}
      <div className="bg-background-card rounded-xl p-4 border border-accent-blue/20">
        <label className="block text-sm font-medium text-text-sub mb-2">
          최대 코스트
        </label>
        <div className="flex gap-2">
          {COSTS.map(c => (
            <button
              key={c}
              onClick={() => {
                setMaxCost(c);
                if (activeTab > c) setActiveTab(c);
              }}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${maxCost === c
                  ? "bg-accent-worldrune text-background"
                  : "bg-background text-text-sub hover:bg-background-header"
                }
              `}
            >
              {c}코
            </button>
          ))}
        </div>
        {maxCost < 5 && (
          <p className="mt-2 text-xs text-yellow-400">
            {maxCost}코 이하 챔피언만 사용합니다
          </p>
        )}
      </div>

      {/* 지역 상징 선택 */}
      <div className="bg-background-card rounded-xl p-4 border border-accent-blue/20">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-text-sub">
            보유 지역 상징 ({totalSymbolCount}/4)
          </label>
          {totalSymbolCount > 0 && (
            <button
              onClick={() => setSymbolCounts({})}
              className="text-xs text-accent-pink hover:underline"
            >
              전체 해제
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {REGIONS.map(region => {
            const count = symbolCounts[region] || 0;
            const isExcluded = excludedRegions.includes(region);
            const isMaxReached = totalSymbolCount >= 4;

            return (
              <div
                key={region}
                className={`
                  flex items-center justify-between rounded-lg text-sm transition-all px-2 py-1
                  ${isExcluded
                    ? "bg-red-500/10 border border-red-500/30 opacity-50"
                    : count > 0
                      ? "bg-accent-worldrune/20 border border-accent-worldrune/50"
                      : "bg-background border border-transparent"
                  }
                `}
              >
                <span className={`text-xs ${count > 0 ? "text-accent-worldrune font-medium" : "text-text-sub"}`}>
                  {region}
                  {count > 0 && <span className="ml-1">x{count}</span>}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => decrementSymbol(region)}
                    disabled={count === 0 || isExcluded}
                    className="w-5 h-5 text-xs rounded bg-background-header disabled:opacity-30"
                  >
                    -
                  </button>
                  <button
                    onClick={() => incrementSymbol(region)}
                    disabled={isMaxReached || isExcluded}
                    className="w-5 h-5 text-xs rounded bg-background-header disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 제외할 지역 */}
      <div className="bg-background-card rounded-xl p-4 border border-accent-blue/20">
        <label className="block text-sm font-medium text-text-sub mb-2">
          제외할 지역 (선택)
        </label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(region => {
            const isExcluded = excludedRegions.includes(region);
            return (
              <button
                key={region}
                onClick={() => toggleExcludeRegion(region)}
                className={`
                  px-3 py-1 rounded-lg text-xs transition-all
                  ${isExcluded
                    ? "bg-red-500/20 text-red-400 border border-red-500/50"
                    : "bg-background text-text-sub hover:bg-background-header border border-transparent"
                  }
                `}
              >
                {region}
              </button>
            );
          })}
        </div>
        {excludedRegions.length > 0 && (
          <p className="mt-2 text-xs text-red-400">
            {excludedRegions.length}개 지역 제외됨 (남은 지역: {REGIONS.length - excludedRegions.length}개)
          </p>
        )}
      </div>

      {/* 제외할 챔피언 */}
      <div className="bg-background-card rounded-xl p-4 border border-accent-blue/20">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-text-sub">
            제외할 챔피언 (선택)
          </label>
          {excludedChampions.length > 0 && (
            <button
              onClick={() => setExcludedChampions([])}
              className="text-xs text-accent-pink hover:underline"
            >
              전체 해제
            </button>
          )}
        </div>

        {/* 선택된 제외 챔피언 */}
        {excludedChampions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 p-2 bg-background rounded-lg">
            {excludedChampions.map(name => (
              <span
                key={name}
                onClick={() => toggleExcludeChampion(name)}
                className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs cursor-pointer hover:bg-red-500/30"
              >
                {name} ✕
              </span>
            ))}
          </div>
        )}

        {/* 코스트별 탭 */}
        <div className="flex gap-1 mb-2">
          {COSTS.filter(c => c <= maxCost).map(c => (
            <button
              key={c}
              onClick={() => setActiveTab(c)}
              className={`
                px-3 py-1 rounded-t-lg text-xs font-medium transition-all
                ${activeTab === c
                  ? "bg-background-header text-accent-worldrune"
                  : "bg-background text-text-muted hover:text-text-sub"
                }
              `}
            >
              {c}코
            </button>
          ))}
        </div>

        {/* 챔피언 목록 */}
        <div className="bg-background-header rounded-lg p-2 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {championsByCost.map(champion => {
              const isExcluded = excludedChampions.includes(champion.name);
              return (
                <button
                  key={champion.name}
                  onClick={() => toggleExcludeChampion(champion.name)}
                  className={`
                    px-2 py-1 rounded text-xs text-left transition-all
                    ${isExcluded
                      ? "bg-red-500/20 text-red-400"
                      : "bg-background text-text-sub hover:bg-background-card"
                    }
                  `}
                >
                  {champion.name}
                </button>
              );
            })}
          </div>
          {championsByCost.length === 0 && (
            <p className="text-center text-text-muted text-xs py-4">
              해당 코스트의 챔피언이 없습니다
            </p>
          )}
        </div>
      </div>

      {/* 계산 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={clearAll}
          className="px-4 py-3 rounded-lg font-medium bg-background-header text-text-sub hover:bg-background transition-all"
        >
          초기화
        </button>
        <button
          onClick={handleCalculate}
          disabled={isCalculating || excludedRegions.length > 10}
          className={`
            flex-1 py-3 rounded-lg font-bold text-lg transition-all
            ${isCalculating
              ? "bg-text-muted text-background cursor-not-allowed"
              : "bg-accent-pink text-background hover:opacity-90"
            }
          `}
        >
          {isCalculating ? "계산 중..." : "최적 조합 계산"}
        </button>
      </div>
    </div>
  );
}
