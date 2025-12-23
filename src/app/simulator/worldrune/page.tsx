"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { WorldRuneResult } from "@/types/simulator";
import { calculate, validateInput } from "@/lib/simulator/WorldRuneSimulator";
import InputForm from "./components/InputForm";
import ResultList from "./components/ResultList";

export default function WorldRuneSimulatorPage() {
  const [results, setResults] = useState<WorldRuneResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (
    level: number,
    regionSymbols: string[],
    excludedRegions: string[],
    excludedChampions: string[],
    maxCost: number
  ) => {
    setError(null);

    // 입력 검증
    const validation = validateInput({
      level,
      regionSymbols,
      excludedRegions,
      excludedChampions,
      maxCost
    });

    if (!validation.valid) {
      setError(validation.error || "입력 오류");
      return;
    }

    setIsCalculating(true);

    // 비동기로 계산 (UI 블로킹 방지)
    setTimeout(() => {
      try {
        const calculatedResults = calculate({
          level,
          regionSymbols,
          excludedRegions,
          excludedChampions,
          maxCost
        });

        if (calculatedResults.length === 0) {
          setError("조건에 맞는 조합이 없습니다. 필터 조건을 완화해보세요.");
        }

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
          <Image
            src="/images/simulators/worldrune.jpg"
            alt="세계룬 시뮬레이터"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <h1 className="text-3xl font-bold">세계룬 시뮬레이터</h1>
        </div>
        <p className="text-text-sub">
          &quot;세계룬&quot; 증강 선택 시, 지역 4개를 가장 빠르게 활성화하는 조합을 찾습니다.
        </p>
      </div>

      {/* 증강 효과 설명 */}
      <div className="bg-background-card rounded-xl p-4 mb-6 border border-accent-worldrune/30">
        <h3 className="font-bold text-accent-worldrune mb-2">세계룬 증강 효과</h3>
        <ul className="text-sm text-text-sub space-y-1">
          <li>• 무작위 지역 특성 상징 <span className="text-yellow-400">2개</span> 획득</li>
          <li>• 지역 특성 <span className="text-accent-worldrune">4개</span> 활성화 상태로 플레이어 대전 4회 → 강력한 보상</li>
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent-worldrune border-t-transparent mb-4"></div>
          <p className="text-text-sub">최적 조합을 찾고 있습니다...</p>
        </div>
      )}

      {/* 결과 목록 */}
      {!isCalculating && <ResultList results={results} />}
    </div>
  );
}
