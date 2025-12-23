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
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  const toggleSymbol = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      setSelectedSymbols(selectedSymbols.filter(s => s !== symbol));
    } else if (selectedSymbols.length < 7) {
      setSelectedSymbols([...selectedSymbols, symbol]);
    }
  };

  const handleCalculate = () => {
    onCalculate(level, selectedSymbols);
  };

  const clearSymbols = () => {
    setSelectedSymbols([]);
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
            보유 상징 ({selectedSymbols.length}/7)
          </label>
          {selectedSymbols.length > 0 && (
            <button
              onClick={clearSymbols}
              className="text-xs text-accent-pink hover:underline"
            >
              전체 해제
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {SYMBOLS.map(symbol => (
            <button
              key={symbol}
              onClick={() => toggleSymbol(symbol)}
              disabled={!selectedSymbols.includes(symbol) && selectedSymbols.length >= 7}
              className={`
                px-3 py-1.5 rounded-lg text-sm transition-all
                ${selectedSymbols.includes(symbol)
                  ? "bg-accent-bronze text-background font-medium"
                  : "bg-background text-text-sub hover:bg-background-header"
                }
                ${!selectedSymbols.includes(symbol) && selectedSymbols.length >= 7
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                }
              `}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 상징 표시 */}
      {selectedSymbols.length > 0 && (
        <div className="mb-6 p-3 bg-background rounded-lg">
          <p className="text-xs text-text-sub mb-2">선택된 상징:</p>
          <div className="flex flex-wrap gap-1">
            {selectedSymbols.map(symbol => (
              <span
                key={symbol}
                className="px-2 py-1 bg-accent-bronze/20 text-accent-bronze rounded text-xs"
              >
                {symbol}
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
      {selectedSymbols.length === 0 && (
        <p className="mt-3 text-xs text-text-muted text-center">
          상징 없이도 계산 가능합니다. 상징을 추가하면 더 많은 브론즈 시너지를 활성화할 수 있습니다.
        </p>
      )}
    </div>
  );
}
