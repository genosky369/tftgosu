"use client";

import { useState } from "react";
import { SYMBOLS } from "@/data/symbols";

interface InputFormProps {
  onCalculate: (level: number, symbols: string[]) => void;
  isCalculating: boolean;
}

const LEVELS = [6, 7, 8, 9, 10];

export default function InputForm({ onCalculate, isCalculating }: InputFormProps) {
  const [level, setLevel] = useState(8);
  // 상징별 개수를 저장 (예: { "녹서스": 3, "빌지워터": 1 })
  const [symbolCounts, setSymbolCounts] = useState<Record<string, number>>({});

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

  // 계산 시 배열로 변환 (예: { "녹서스": 3 } → ["녹서스", "녹서스", "녹서스"])
  const handleCalculate = () => {
    const symbolsArray: string[] = [];
    for (const [symbol, count] of Object.entries(symbolCounts)) {
      for (let i = 0; i < count; i++) {
        symbolsArray.push(symbol);
      }
    }
    onCalculate(level, symbolsArray);
  };

  const clearSymbols = () => {
    setSymbolCounts({});
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
          <label className="block text-sm font-medium text-text-sub">
            보유 상징 ({totalSymbolCount}/7)
          </label>
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

      {/* 계산 버튼 */}
      <button
        onClick={handleCalculate}
        disabled={isCalculating}
        className={`
          w-full py-3 rounded-lg font-bold text-lg transition-all
          ${isCalculating
            ? "bg-text-muted text-background cursor-not-allowed"
            : "bg-accent-pink text-background hover:opacity-90"
          }
        `}
      >
        {isCalculating ? "계산 중..." : "최적 조합 계산"}
      </button>

      {/* 안내 메시지 */}
      {totalSymbolCount === 0 && (
        <p className="mt-3 text-xs text-text-muted text-center">
          상징 없이도 계산 가능합니다. +/- 버튼으로 같은 상징을 여러 개 추가할 수 있습니다.
        </p>
      )}
    </div>
  );
}
