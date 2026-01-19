"use client";

import { useState } from "react";
import { REGION_SYMBOLS } from "@/data/regions";
import { CHAMPIONS } from "@/data/champions";
import { UNLOCK_CHAMPIONS } from "@/data/unlockChampions";
import ChampionSearch from "./ChampionSearch";

interface InputFormProps {
  onCalculate: (
    regionSymbols: string[],
    ownedChampions: string[],
    excludedRegions: string[],
    excludedChampions: string[]
  ) => void;
  isCalculating: boolean;
}

const COSTS = [1, 2, 3, 4, 5];
const MAX_SLOTS = 8; // 라이즈 제외

export default function InputForm({ onCalculate, isCalculating }: InputFormProps) {
  const [symbolCounts, setSymbolCounts] = useState<Record<string, number>>({});
  const [ownedChampions, setOwnedChampions] = useState<string[]>([]);
  const [excludedRegions, setExcludedRegions] = useState<string[]>([]);
  const [excludedChampions, setExcludedChampions] = useState<string[]>([]);
  const [excludeUnlockChampions, setExcludeUnlockChampions] = useState(false);
  const [activeTab, setActiveTab] = useState(5);
  const [showExcludeSection, setShowExcludeSection] = useState(false);

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
    if (ownedChampions.includes(championName)) return;
    setExcludedChampions(prev =>
      prev.includes(championName)
        ? prev.filter(c => c !== championName)
        : [...prev, championName]
    );
  };

  // 보유 챔피언 추가
  const addOwnedChampion = (championName: string) => {
    if (ownedChampions.length >= MAX_SLOTS) return;
    if (excludedChampions.includes(championName)) return;
    setOwnedChampions(prev => [...prev, championName]);
  };

  // 보유 챔피언 제거
  const removeOwnedChampion = (championName: string) => {
    setOwnedChampions(prev => prev.filter(c => c !== championName));
  };

  // 해금 챔피언 제외 토글
  const handleExcludeUnlockChange = (checked: boolean) => {
    setExcludeUnlockChampions(checked);
    if (checked) {
      setExcludedChampions(prev => [...new Set([...prev, ...UNLOCK_CHAMPIONS])]);
    } else {
      setExcludedChampions(prev => prev.filter(c => !UNLOCK_CHAMPIONS.includes(c)));
    }
  };

  // 해금 챔피언인지 확인
  const isUnlockChampion = (name: string) => UNLOCK_CHAMPIONS.includes(name);

  // 계산 실행
  const handleCalculate = () => {
    const symbolsArray: string[] = [];
    for (const [region, count] of Object.entries(symbolCounts)) {
      for (let i = 0; i < count; i++) {
        symbolsArray.push(region);
      }
    }
    onCalculate(symbolsArray, ownedChampions, excludedRegions, excludedChampions);
  };

  // 전체 초기화
  const clearAll = () => {
    setSymbolCounts({});
    setOwnedChampions([]);
    setExcludedRegions([]);
    setExcludedChampions([]);
    setExcludeUnlockChampions(false);
  };

  // 코스트별 챔피언 필터링
  const championsByCost = CHAMPIONS.filter(c => c.cost === activeTab && c.cost <= 5 && c.name !== "라이즈");

  return (
    <div className="space-y-6">
      {/* 배치 정보 */}
      <div className="bg-background-card rounded-xl p-4 border border-accent-ryze/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-text">배치 정보</h3>
            <p className="text-sm text-text-muted">레벨 9 기준, 라이즈 1칸 + 나머지 8칸</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-accent-ryze">9칸</p>
            <p className="text-xs text-text-muted">라이즈 포함</p>
          </div>
        </div>
      </div>

      {/* 지역 상징 선택 */}
      <div className="bg-background-card rounded-xl p-4 border border-accent-blue/20">
        <div className="flex justify-between items-center mb-2">
          <div>
            <label className="block text-sm font-medium text-text-sub">
              보유 지역 상징 ({totalSymbolCount}/4)
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              +/- 버튼으로 같은 상징을 여러 개 추가할 수 있습니다
            </p>
          </div>
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
          {REGION_SYMBOLS.map(region => {
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
                      ? "bg-accent-ryze/20 border border-accent-ryze/50"
                      : "bg-background border border-transparent"
                  }
                `}
              >
                <span className={`text-xs ${count > 0 ? "text-accent-ryze font-medium" : "text-text-sub"}`}>
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
        <p className="text-xs text-text-muted mt-2">
          * 타곤은 상징이 없습니다 (챔피언으로만 활성화 가능)
        </p>
      </div>

      {/* 보유 중인 챔피언 (검색) */}
      <div className="bg-background-card rounded-xl p-4 border border-accent-ryze/30">
        <div className="mb-3">
          <label className="block text-sm font-medium text-accent-ryze">
            보유 중인 챔피언 ({ownedChampions.length}/{MAX_SLOTS})
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            선택한 챔피언은 결과에 무조건 포함됩니다
          </p>
        </div>

        <ChampionSearch
          selectedChampions={ownedChampions}
          excludedChampions={excludedChampions}
          maxSelections={MAX_SLOTS}
          onSelect={addOwnedChampion}
          onRemove={removeOwnedChampion}
        />
      </div>

      {/* 제외 설정 (접을 수 있음) */}
      <div className="bg-background-card rounded-xl border border-accent-blue/20 overflow-hidden">
        <button
          onClick={() => setShowExcludeSection(!showExcludeSection)}
          className="w-full p-4 flex items-center justify-between hover:bg-background-header transition-colors"
        >
          <span className="text-sm font-medium text-text-sub">
            제외 설정
            {(excludedRegions.length > 0 || excludedChampions.length > 0) && (
              <span className="ml-2 text-xs text-red-400">
                (지역 {excludedRegions.length}개, 챔피언 {excludedChampions.length}개 제외중)
              </span>
            )}
          </span>
          <span className="text-text-muted">{showExcludeSection ? "▲" : "▼"}</span>
        </button>

        {showExcludeSection && (
          <div className="p-4 pt-0 space-y-4">
            {/* 제외할 지역 */}
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">
                제외할 지역
              </label>
              <div className="flex flex-wrap gap-2">
                {REGION_SYMBOLS.map(region => {
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
            </div>

            {/* 제외할 챔피언 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-text-sub">
                  제외할 챔피언
                </label>
                {excludedChampions.length > 0 && (
                  <button
                    onClick={() => {
                      setExcludedChampions([]);
                      setExcludeUnlockChampions(false);
                    }}
                    className="text-xs text-accent-pink hover:underline"
                  >
                    전체 해제
                  </button>
                )}
              </div>

              {/* 해금 챔피언 제외 */}
              <label className="flex items-start gap-3 p-3 bg-background rounded-lg mb-3 cursor-pointer hover:bg-background-header transition-colors">
                <input
                  type="checkbox"
                  checked={excludeUnlockChampions}
                  onChange={(e) => handleExcludeUnlockChange(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-accent-ryze"
                />
                <div>
                  <div className="text-sm font-medium text-text flex items-center gap-2">
                    해금 챔피언 제외
                    <span className="text-xs text-text-muted">({UNLOCK_CHAMPIONS.length}개)</span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    퀘스트로 해금해야 하는 챔피언들을 일괄 제외합니다
                  </p>
                </div>
              </label>

              {/* 선택된 제외 챔피언 */}
              {excludedChampions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-text-muted mb-1">
                    선택된 제외 챔피언 ({excludedChampions.length}개)
                  </p>
                  <div className="flex flex-wrap gap-1 p-2 bg-background rounded-lg max-h-20 overflow-y-auto">
                    {excludedChampions.slice(0, 10).map(name => (
                      <span
                        key={name}
                        onClick={() => toggleExcludeChampion(name)}
                        className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs cursor-pointer hover:bg-red-500/30 flex items-center gap-1"
                      >
                        {isUnlockChampion(name) && <span>🔒</span>}
                        {name} ✕
                      </span>
                    ))}
                    {excludedChampions.length > 10 && (
                      <span className="px-2 py-1 text-text-muted text-xs">
                        +{excludedChampions.length - 10}개
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 코스트별 탭 */}
              <div className="flex gap-1 mb-2">
                {COSTS.map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveTab(c)}
                    className={`
                      px-3 py-1 rounded-t-lg text-xs font-medium transition-all
                      ${activeTab === c
                        ? "bg-background-header text-accent-ryze"
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
                    const isOwned = ownedChampions.includes(champion.name);
                    const isUnlock = isUnlockChampion(champion.name);
                    return (
                      <button
                        key={champion.name}
                        onClick={() => toggleExcludeChampion(champion.name)}
                        disabled={isOwned}
                        className={`
                          px-2 py-1 rounded text-xs text-left transition-all flex items-center gap-1
                          ${isExcluded
                            ? "bg-red-500/20 text-red-400"
                            : isOwned
                              ? "bg-accent-ryze/20 text-accent-ryze opacity-50 cursor-not-allowed"
                              : "bg-background text-text-sub hover:bg-background-card"
                          }
                        `}
                      >
                        {isUnlock && <span className="text-yellow-500">🔒</span>}
                        {champion.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
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
          disabled={isCalculating}
          className={`
            flex-1 py-3 rounded-lg font-bold text-lg transition-all
            ${isCalculating
              ? "bg-text-muted text-background cursor-not-allowed"
              : "bg-accent-ryze text-background hover:opacity-90"
            }
          `}
        >
          {isCalculating ? "계산 중..." : "최적 조합 계산"}
        </button>
      </div>
    </div>
  );
}
