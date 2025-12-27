"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { COMPONENT_LIST } from "@/data/item-components";

interface SampleGame {
  placement: number;
  champions: string[];
  championNames: string[];
  allItems: string[];
  allItemNames: string[];
}

interface CombinationResult {
  mainItem: string;
  mainItemName: string;
  usedComponents: string[];
  remainingComponents: string[];
  remainingComponentNames: string[];
  avgPlacement: number;
  gameCount: number;
  topFourRate: number;
  sampleGames: SampleGame[];
}

interface AnalysisResult {
  totalGames: number;
  inputComponents: string[];
  inputComponentNames: string[];
  combinations: CombinationResult[];
  message?: string;
}

// 조합 결과 카드 컴포넌트
function CombinationCard({ combo, rank }: { combo: CombinationResult; rank: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`
        rounded-lg border overflow-hidden
        ${rank === 1
          ? "border-yellow-400/50 bg-yellow-400/5"
          : "border-gray-700 bg-background/30"
        }
      `}
    >
      {/* 메인 정보 */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`
                text-lg font-bold
                ${rank === 1 ? "text-yellow-400" : "text-text-muted"}
              `}>
                #{rank}
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded font-medium">
                {combo.mainItemName}
              </span>
            </div>

            {/* 남은 조합 아이템 */}
            {combo.remainingComponentNames.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-text-sub">
                <span>+</span>
                <div className="flex flex-wrap gap-1">
                  {combo.remainingComponentNames.map((name, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-600/50 text-gray-300 rounded text-xs"
                    >
                      {name}
                    </span>
                  ))}
                </div>
                <span className="text-text-muted">남음</span>
              </div>
            )}

            <p className="text-xs text-text-sub mt-2">
              {combo.gameCount}게임 데이터
            </p>
          </div>

          <div className="text-right">
            {combo.gameCount > 0 ? (
              <>
                <p className={`
                  text-2xl font-bold
                  ${combo.avgPlacement <= 4 ? "text-green-400" : "text-red-400"}
                `}>
                  {combo.avgPlacement}등
                </p>
                <p className="text-sm text-text-sub">
                  상위4 {combo.topFourRate}%
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-text-muted">
                데이터 없음
              </p>
            )}
          </div>
        </div>

        {/* 상세 보기 버튼 */}
        {combo.gameCount > 0 && combo.sampleGames.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-sm text-accent-blue hover:text-accent-blue/80 flex items-center gap-1"
          >
            {isExpanded ? "▼" : "▶"} 샘플 게임 {combo.sampleGames.length}개 보기
          </button>
        )}
      </div>

      {/* 샘플 게임 목록 */}
      {isExpanded && combo.sampleGames.length > 0 && (
        <div className="border-t border-gray-700 bg-background/50">
          <div className="p-3 space-y-2">
            {combo.sampleGames.map((game, i) => (
              <div
                key={i}
                className="p-3 bg-background/50 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`
                    px-2 py-0.5 rounded text-sm font-bold
                    ${game.placement <= 4 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                  `}>
                    {game.placement}등
                  </span>
                </div>

                {/* 챔피언 구성 */}
                <div className="mb-2">
                  <span className="text-xs text-text-muted">덱 구성: </span>
                  <span className="text-sm text-text-sub">
                    {game.championNames.slice(0, 8).join(", ")}
                    {game.championNames.length > 8 && ` 외 ${game.championNames.length - 8}명`}
                  </span>
                </div>

                {/* 아이템 구성 */}
                <div>
                  <span className="text-xs text-text-muted">아이템: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {game.allItemNames.slice(0, 9).map((itemName, j) => (
                      <span
                        key={j}
                        className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs"
                      >
                        {itemName}
                      </span>
                    ))}
                    {game.allItemNames.length > 9 && (
                      <span className="text-xs text-text-muted">
                        +{game.allItemNames.length - 9}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ItemAnalysisPage() {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<{ totalRecords: number; status: string } | null>(null);

  // 데이터 상태 확인
  useEffect(() => {
    fetch("/api/stats/item-analysis")
      .then(res => res.json())
      .then(setDataStatus)
      .catch(() => setDataStatus(null));
  }, []);

  // 조합 아이템 추가 (같은 아이템 여러 개 가능)
  const addComponent = (id: string) => {
    if (selectedComponents.length >= 6) return;
    setSelectedComponents(prev => [...prev, id]);
  };

  // 조합 아이템 제거 (특정 인덱스)
  const removeComponent = (index: number) => {
    setSelectedComponents(prev => {
      const newArr = [...prev];
      newArr.splice(index, 1);
      return newArr;
    });
  };

  // 분석 실행
  const analyze = async () => {
    if (selectedComponents.length === 0) {
      setError("조합 아이템을 1개 이상 선택해주세요");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/stats/item-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ components: selectedComponents }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "분석 중 오류가 발생했습니다");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  };

  // 초기화
  const reset = () => {
    setSelectedComponents([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-text">
      {/* 헤더 */}
      <header className="bg-background-card border-b border-accent-blue/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-accent-blue hover:text-accent-blue/80">
              TFT GOSU
            </Link>
            <nav className="flex gap-4">
              <Link href="/simulator" className="text-text-sub hover:text-text">
                시뮬레이터
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-yellow-400">🎰</span> 아이템 조합 분석기
          </h1>
          <p className="text-text-sub">
            보유한 조합 아이템으로 어떤 완성 아이템을 만드는 것이 좋은지 분석합니다
          </p>
          {dataStatus && (
            <p className="text-xs text-text-muted mt-2">
              📊 수집된 데이터: {dataStatus.totalRecords?.toLocaleString() || 0}개
              {dataStatus.status === "collecting" && " (수집 중...)"}
            </p>
          )}
        </div>

        {/* 조합 아이템 선택 */}
        <div className="bg-background-card rounded-xl p-6 border border-accent-blue/20 mb-6">
          <h2 className="text-lg font-bold mb-4">조합 아이템 선택 (최대 6개)</h2>
          <p className="text-sm text-text-sub mb-4">
            1라운드에서 받은 조합 아이템을 선택하세요. 같은 아이템 여러 개도 가능합니다.
          </p>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {COMPONENT_LIST.map(comp => (
              <button
                key={comp.id}
                onClick={() => addComponent(comp.id)}
                disabled={selectedComponents.length >= 6}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  flex flex-col items-center gap-2
                  border-gray-600 hover:border-yellow-400 hover:bg-yellow-400/10
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <span className="text-2xl">{comp.icon}</span>
                <span className="text-sm">{comp.nameKo}</span>
              </button>
            ))}
          </div>

          {/* 선택된 아이템 표시 */}
          {selectedComponents.length > 0 && (
            <div className="bg-background/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-text-sub mb-2">선택된 아이템 ({selectedComponents.length}/6):</p>
              <div className="flex flex-wrap gap-2">
                {selectedComponents.map((id, idx) => {
                  const comp = COMPONENT_LIST.find(c => c.id === id);
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm flex items-center gap-1"
                    >
                      {comp?.icon} {comp?.nameKo}
                      <button
                        onClick={() => removeComponent(idx)}
                        className="ml-1 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={analyze}
              disabled={isLoading || selectedComponents.length === 0}
              className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
            >
              {isLoading ? "분석 중..." : "🔍 분석하기"}
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              초기화
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="bg-background-card rounded-xl p-6 border border-accent-blue/20">
            <h2 className="text-lg font-bold mb-4">
              분석 결과
              <span className="text-sm font-normal text-text-sub ml-2">
                (총 {result.totalGames}게임 분석)
              </span>
            </h2>

            {result.combinations.length === 0 ? (
              <p className="text-text-sub text-center py-8">
                {result.message || "해당 조합의 데이터가 부족합니다"}
              </p>
            ) : (
              <div className="space-y-4">
                {result.combinations.map((combo, idx) => (
                  <CombinationCard key={idx} combo={combo} rank={idx + 1} />
                ))}
              </div>
            )}

            {/* 안내 문구 */}
            <p className="text-xs text-text-muted mt-4 text-center">
              ※ 챌린저 티어 데이터 기반 통계입니다. 표본 수가 적을 수 있습니다.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
