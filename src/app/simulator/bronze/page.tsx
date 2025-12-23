"use client";

import { useState } from "react";
import Link from "next/link";
import type { SimulatorResult } from "@/types/simulator";
import { calculate, validateInput } from "@/lib/simulator/BronzeSimulator";
import InputForm from "./components/InputForm";
import ResultList from "./components/ResultList";

export default function BronzeSimulatorPage() {
  const [results, setResults] = useState<SimulatorResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (level: number, symbols: string[], excludedChampions: string[]) => {
    setError(null);

    // 입력 검증
    const validation = validateInput({ level, symbols, excludedChampions });
    if (!validation.valid) {
      setError(validation.error || "입력 오류");
      return;
    }

    setIsCalculating(true);

    // 비동기로 계산 (UI 블로킹 방지)
    setTimeout(() => {
      try {
        const calculatedResults = calculate({ level, symbols, excludedChampions });
        setResults(calculatedResults);
      } catch (e) {
        setError("계산 중 오류가 발생했습니다.");
        console.error(e);
      } finally {
        setIsCalculating(false);
      }
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-text-sub hover:text-text mb-6"
      >
        <span>←</span>
        <span>홈으로</span>
      </Link>

      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🥉</span>
          <h1 className="text-3xl font-bold">브론즈 시뮬레이터</h1>
        </div>
        <p className="text-text-sub">
          &quot;영원한 브론즈&quot; 증강 선택 시, 브론즈 등급 시너지를 최대한 많이 활성화하는 조합을 찾습니다.
        </p>
      </div>

      {/* 증강 효과 설명 */}
      <div className="bg-background-card rounded-xl p-4 mb-6 border border-accent-bronze/30">
        <h3 className="font-bold text-accent-bronze mb-2">영원한 브론즈 증강 효과</h3>
        <ul className="text-sm text-text-sub space-y-1">
          <li>• <span className="text-yellow-400">골드</span>: 브론즈 등급 특성당 피해 증폭 2.5%</li>
          <li>• <span className="text-purple-400">프리즘</span>: 브론즈 등급 특성당 피해 증폭 2.5% + 내구력 2%</li>
        </ul>
      </div>

      {/* 입력 폼 */}
      <div className="mb-8">
        <InputForm onCalculate={handleCalculate} isCalculating={isCalculating} />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* 로딩 상태 */}
      {isCalculating && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent-bronze border-t-transparent mb-4"></div>
          <p className="text-text-sub">최적 조합을 찾고 있습니다...</p>
        </div>
      )}

      {/* 결과 목록 */}
      {!isCalculating && <ResultList results={results} />}
    </div>
  );
}
