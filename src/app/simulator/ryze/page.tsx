"use client";

import { useState } from "react";
import Link from "next/link";
import type { RyzeSimulatorResult } from "@/types/simulator";
import { calculate, validateInput } from "@/lib/simulator/RyzeSimulator";
import InputForm from "./components/InputForm";
import ResultList from "./components/ResultList";

export default function RyzeSimulatorPage() {
  const [results, setResults] = useState<RyzeSimulatorResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (
    regionSymbols: string[],
    ownedChampions: string[],
    excludedRegions: string[],
    excludedChampions: string[]
  ) => {
    setError(null);

    // 입력 검증
    const validation = validateInput({
      regionSymbols,
      ownedChampions,
      excludedRegions,
      excludedChampions
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
          regionSymbols,
          ownedChampions,
          excludedRegions,
          excludedChampions
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
        <h1 className="text-3xl font-bold mb-2">라이즈 시뮬레이터</h1>
        <p className="text-text-sub">
          라이즈의 지역 시너지를 최대한 활성화하는 덱을 찾습니다.
        </p>
      </div>

      {/* 라이즈 정보 */}
      <div className="bg-background-card rounded-xl p-4 mb-6 border border-orange-500/30">
        <h3 className="font-bold text-orange-400 mb-2">라이즈 (7코스트 룬 마법사)</h3>
        <ul className="text-sm text-text-sub space-y-1">
          <li>• <span className="text-orange-300">해금 조건</span>: 4개 지역 특성 활성화 + 레벨 9</li>
          <li>• <span className="text-orange-300">특수 능력</span>: 활성화된 지역마다 스킬이 강화됨</li>
          <li>• <span className="text-orange-300">최대 지역</span>: 13개 (다르킨 제외)</li>
        </ul>
      </div>

      {/* 지역별 효과 요약 */}
      <details className="bg-background-card rounded-xl mb-6 border border-accent-blue/20">
        <summary className="p-4 cursor-pointer text-sm font-medium text-text-sub hover:text-text">
          지역별 라이즈 강화 효과 보기 ▼
        </summary>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-background rounded"><span className="text-blue-400">빌지워터(3)</span>: 폭발 물리 데미지 25%</div>
            <div className="p-2 bg-background rounded"><span className="text-yellow-400">데마시아(3)</span>: 12% 이하 처형</div>
            <div className="p-2 bg-background rounded"><span className="text-cyan-400">프렐요드(3)</span>: 냉기 4초 + 고정 6%</div>
            <div className="p-2 bg-background rounded"><span className="text-pink-400">아이오니아(3)</span>: 추가 분열 50%</div>
            <div className="p-2 bg-background rounded"><span className="text-green-400">이쉬탈(3)</span>: 10초마다 랜덤 효과</div>
            <div className="p-2 bg-background rounded"><span className="text-red-400">녹서스(3)</span>: 관통 (60% 감소)</div>
            <div className="p-2 bg-background rounded"><span className="text-lime-400">자운(3)</span>: 독 DoT</div>
            <div className="p-2 bg-background rounded"><span className="text-amber-400">필트오버(2)</span>: 3번째 +40%</div>
            <div className="p-2 bg-background rounded"><span className="text-purple-400">공허(2)</span>: 방마저 30% 무시</div>
            <div className="p-2 bg-background rounded"><span className="text-orange-400">슈리마(2)</span>: 넉업 + 보물</div>
            <div className="p-2 bg-background rounded"><span className="text-fuchsia-400">요들(2)</span>: 적 데미지 12%↓</div>
            <div className="p-2 bg-background rounded"><span className="text-emerald-400">그림자군도(2)</span>: 영혼 비례 증가</div>
            <div className="p-2 bg-background rounded"><span className="text-sky-400">타곤(1)</span>: 치유 10%</div>
          </div>
        </div>
      </details>

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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-text-sub">최적 조합을 찾고 있습니다...</p>
        </div>
      )}

      {/* 결과 목록 */}
      {!isCalculating && <ResultList results={results} />}
    </div>
  );
}
