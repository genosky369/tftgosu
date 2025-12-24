"use client";

import { useState } from "react";
import { SYMBOLS } from "@/data/symbols";
import { CHAMPIONS } from "@/data/champions";
import { UNLOCK_CHAMPIONS } from "@/data/unlockChampions";

interface InputFormProps {
  onCalculate: (level: number, symbols: string[], excludedChampions: string[]) => void;
  isCalculating: boolean;
}

const LEVELS = [6, 7, 8, 9, 10];
const COSTS = [1, 2, 3, 4, 5];

export default function InputForm({ onCalculate, isCalculating }: InputFormProps) {
  const [level, setLevel] = useState(8);
  // 상징별 개수를 저장 (예: { "녹서스": 3, "빌지워터": 1 })
  const [symbolCounts, setSymbolCounts] = useState<Record<string, number>>({});
  // 제외할 챔피언
  const [excludedChampions, setExcludedChampions] = useState<string[]>([]);
  const [excludeUnlockChampions, setExcludeUnlockChampions] = useState(false);
  const [activeTab, setActiveTab] = useState(5); // 코스트별 탭

  // 총 상징 개수 계산
  const totalSymbolCount = Object.values(symbolCounts).reduce((sum, count) => sum + count, 0);

  // 상징 개수 증가
  const incrementSymbol = (symbol: string) => {
    if (totalSymbolCount >= 7) return;
    setSymbolCounts(prev => ({
      ...prev,
      [symbol]: (prev[symbol] || 0) + 1
    }));
  };

  // 상징 개수 감소
  const decrementSymbol = (symbol: string) => {
    setSymbolCounts(prev => {
      const current = prev[symbol] || 0;
      if (current <= 0) return prev;
      if (current === 1) {
        const { [symbol]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [symbol]: current - 1 };
    });
  };

  // 챔피언 제외 토글
  const toggleExcludeChampion = (championName: string) => {
    setExcludedChampions(prev =>
      prev.includes(championName)
        ? prev.filter(c => c !== championName)
        : [...prev, championName]
    );
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

  // 코스트별 챔피언 필터링
  const championsByCost = CHAMPIONS.filter(c => c.cost === activeTab);

  // 계산 시 배열로 변환 (예: { "녹서스": 3 } → ["녹서스", "녹서스", "녹서스"])
  const handleCalculate = () => {
    const symbolsArray: string[] = [];
    for (const [symbol, count] of Object.entries(symbolCounts)) {
      for (let i = 0; i < count; i++) {
        symbolsArray.push(symbol);
      }
    }
    onCalculate(level, symbolsArray, excludedChampions);
  };

  const clearSymbols = () => {
    setSymbolCounts({});
  };

  const clearAll = () => {
    setSymbolCounts({});
    setExcludedChampions([]);
    setExcludeUnlockChampions(false);
  };

  return (
    <div className="bg-background-card rounded-xl p-6 border border-accent-blue/20">
      {/* 레벨 선택 */}
      <div className="mb-6">
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
                  ? "bg-accent-bronze text-background"
                  : "bg-background text-text-sub hover:bg-background-header"
                }
              `}
            >
              Lv.{l}
            </button>
          ))}
        </div>
      </div>

      {/* 상징 선택 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <label className="block text-sm font-medium text-text-sub">
              보유 상징 ({totalSymbolCount}/7)
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              상징 없이도 계산 가능합니다. +/- 버튼으로 같은 상징을 여러 개 추가할 수 있습니다.
            </p>
          </div>
          {totalSymbolCount > 0 && (
            <button
              onClick={clearSymbols}
              className="text-xs text-accent-pink hover:underline"
            >
              전체 해제
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {SYMBOLS.map(symbol => {
            const count = symbolCounts[symbol] || 0;
            const isMaxReached = totalSymbolCount >= 7;

            return (
              <div
                key={symbol}
                className={`
                  flex items-center gap-1 rounded-lg text-sm transition-all
                  ${count > 0
                    ? "bg-accent-bronze/20 border border-accent-bronze/50"
                    : "bg-background border border-transparent"
                  }
                `}
              >
                {/* 감소 버튼 */}
                <button
                  onClick={() => decrementSymbol(symbol)}
                  disabled={count === 0}
                  className={`
                    w-7 h-8 rounded-l-lg font-bold transition-colors
                    ${count > 0
                      ? "text-accent-bronze hover:bg-accent-bronze/30"
                      : "text-text-muted cursor-not-allowed"
                    }
                  `}
                >
                  -
                </button>

                {/* 상징 이름 + 개수 */}
                <span
                  className={`
                    px-1 py-1.5 min-w-[60px] text-center
                    ${count > 0 ? "text-accent-bronze font-medium" : "text-text-sub"}
                  `}
                >
                  {symbol}
                  {count > 0 && (
                    <span className="ml-1 text-xs opacity-80">x{count}</span>
                  )}
                </span>

                {/* 증가 버튼 */}
                <button
                  onClick={() => incrementSymbol(symbol)}
                  disabled={isMaxReached}
                  className={`
                    w-7 h-8 rounded-r-lg font-bold transition-colors
                    ${isMaxReached
                      ? "text-text-muted cursor-not-allowed"
                      : "text-accent-bronze hover:bg-accent-bronze/30"
                    }
                  `}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 선택된 상징 표시 */}
      {totalSymbolCount > 0 && (
        <div className="mb-6 p-3 bg-background rounded-lg">
          <p className="text-xs text-text-sub mb-2">선택된 상징:</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(symbolCounts).map(([symbol, count]) => (
              <span
                key={symbol}
                className="px-2 py-1 bg-accent-bronze/20 text-accent-bronze rounded text-xs"
              >
                {symbol} x{count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 제외할 챔피언 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-text-sub">
            제외할 챔피언 (선택)
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

        {/* 해금 챔피언 제외 체크박스 */}
        <label className="flex items-start gap-3 p-3 bg-background rounded-lg mb-3 cursor-pointer hover:bg-background-header transition-colors">
          <input
            type="checkbox"
            checked={excludeUnlockChampions}
            onChange={(e) => handleExcludeUnlockChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-accent-bronze"
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
                  ? "bg-background-header text-accent-bronze"
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
              const isUnlock = isUnlockChampion(champion.name);
              return (
                <button
                  key={champion.name}
                  onClick={() => toggleExcludeChampion(champion.name)}
                  className={`
                    px-2 py-1 rounded text-xs text-left transition-all flex items-center gap-1
                    ${isExcluded
                      ? "bg-red-500/20 text-red-400"
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
          {championsByCost.length === 0 && (
            <p className="text-center text-text-muted text-xs py-4">
              해당 코스트의 챔피언이 없습니다
            </p>
          )}
          {/* 범례 */}
          <p className="text-[10px] text-text-muted mt-2 text-right">
            🔒 = 해금 챔피언
          </p>
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
          disabled={isCalculating}
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
