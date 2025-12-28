"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { COMPONENT_LIST } from "@/data/item-components";
import { getComponentImageUrl, getItemImageUrl } from "@/lib/itemImage";
import { getChampionImageUrl } from "@/lib/championImage";

interface ChampionUnit {
  apiName: string;
  name: string;
  items: string[];
  itemNames: string[];
}

interface TraitInfo {
  apiName: string;
  name: string;
  numUnits: number;
  style: number;
}

interface SampleGame {
  placement: number;
  units: ChampionUnit[];
  traits: TraitInfo[];
}

// v3: 결과 타입 (선택 개수에 따라 다름)
interface CombinationResult {
  type: "single_complete" | "complete_plus_component" | "double_complete";
  // 2개 선택: 완성 아이템 1개
  itemApiName?: string;
  itemName?: string;
  components?: string[];
  componentNames?: string[];
  // 3개 선택: 완성 + 남은 조합
  usedComponents?: string[];
  usedComponentNames?: string[];
  remainingComponent?: string;
  remainingComponentName?: string;
  // 4개 선택: 완성 + 완성
  item1ApiName?: string;
  item1Name?: string;
  item1Components?: string[];
  item1ComponentNames?: string[];
  item2ApiName?: string;
  item2Name?: string;
  item2Components?: string[];
  item2ComponentNames?: string[];
  // 공통 통계
  avgPlacement: number;
  normalizedScore: number; // 기준 대비 점수 (음수 = 좋음)
  gameCount: number;
  topFourRate: number;
  sampleGames: SampleGame[];
}

interface AnalysisResult {
  totalRecords: number;
  inputComponents: string[];
  inputComponentNames: string[];
  combinations: CombinationResult[];
  message?: string;
}

// 이미지 로드 실패 시 fallback 처리하는 컴포넌트
function ItemImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`bg-gray-600 flex items-center justify-center text-[8px] text-gray-400 ${className || ""}`}
        style={{ width, height }}
        title={alt}
      >
        ?
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      onError={() => setHasError(true)}
    />
  );
}

// 시너지 스타일 색상 (브론즈/실버/골드/크로마틱)
function getTraitStyleColor(style: number): string {
  switch (style) {
    case 1: return "text-amber-600"; // 브론즈
    case 2: return "text-gray-300"; // 실버
    case 3: return "text-yellow-400"; // 골드
    case 4: return "text-purple-400"; // 크로마틱
    default: return "text-gray-400";
  }
}

// 샘플 게임 표시 컴포넌트
function SampleGamesSection({
  sampleGames,
  targetItems
}: {
  sampleGames: SampleGame[];
  targetItems: string[];
}) {
  return (
    <div className="border-t border-gray-700 bg-background/50">
      <div className="p-3 space-y-2">
        {sampleGames.map((game, i) => (
          <div
            key={i}
            className="p-3 bg-background/50 rounded-lg border border-gray-700/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`
                px-2 py-0.5 rounded text-sm font-bold
                ${game.placement <= 4 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
              `}>
                {game.placement}등
              </span>
            </div>

            {/* 시너지 목록 */}
            {game.traits && game.traits.length > 0 && (
              <div className="mb-3">
                <span className="text-xs text-text-muted">시너지: </span>
                <span className="text-xs">
                  {game.traits.map((trait, idx) => (
                    <span key={idx}>
                      <span className={getTraitStyleColor(trait.style)}>
                        {trait.name} {trait.numUnits}
                      </span>
                      {idx < game.traits.length - 1 && <span className="text-gray-500">, </span>}
                    </span>
                  ))}
                </span>
              </div>
            )}

            <div>
              <span className="text-xs text-text-muted block mb-2">덱 구성:</span>
              <div className="flex flex-wrap gap-2">
                {game.units.slice(0, 10).map((unit, j) => {
                  const hasTargetItem = targetItems.some(ti => unit.items.includes(ti));

                  return (
                    <div
                      key={j}
                      className={`
                        flex flex-col items-center p-1 rounded
                        ${hasTargetItem ? "bg-yellow-400/20 ring-2 ring-yellow-400/50" : ""}
                      `}
                      title={unit.name}
                    >
                      <ItemImage
                        src={getChampionImageUrl(unit.apiName)}
                        alt={unit.name}
                        width={40}
                        height={40}
                        className={`rounded border ${hasTargetItem ? "border-yellow-400" : "border-gray-600"}`}
                      />
                      {unit.items.length > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          {unit.items.slice(0, 3).map((itemApiName, k) => {
                            const isTarget = targetItems.includes(itemApiName);
                            return (
                              <div
                                key={k}
                                className={`${isTarget ? "ring-1 ring-yellow-400 rounded" : ""}`}
                                title={unit.itemNames[k]}
                              >
                                <ItemImage
                                  src={getItemImageUrl(itemApiName)}
                                  alt={unit.itemNames[k]}
                                  width={16}
                                  height={16}
                                  className="rounded"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {game.units.length > 10 && (
                  <span className="text-xs text-text-muted flex items-center">
                    +{game.units.length - 10}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 결과 카드 컴포넌트 (v3: 타입별 다른 레이아웃)
function ResultCard({ item, rank }: { item: CombinationResult; rank: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 타겟 아이템 목록 (하이라이트용)
  const getTargetItems = (): string[] => {
    if (item.type === "single_complete" && item.itemApiName) {
      return [item.itemApiName];
    }
    if (item.type === "complete_plus_component" && item.itemApiName) {
      return [item.itemApiName];
    }
    if (item.type === "double_complete" && item.item1ApiName && item.item2ApiName) {
      return [item.item1ApiName, item.item2ApiName];
    }
    return [];
  };

  const targetItems = getTargetItems();

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
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* 순위 */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`
                text-lg font-bold
                ${rank === 1 ? "text-yellow-400" : "text-text-muted"}
              `}>
                #{rank}
              </span>
            </div>

            {/* 타입별 아이템 표시 */}
            {item.type === "single_complete" && (
              <>
                {/* 2개 선택: 완성 아이템 1개 */}
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded font-medium mb-2 w-fit">
                  <ItemImage
                    src={getItemImageUrl(item.itemApiName!)}
                    alt={item.itemName!}
                    width={32}
                    height={32}
                    className="rounded"
                  />
                  <span className="text-lg">{item.itemName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-sub">
                  <span className="text-text-muted">조합:</span>
                  <div className="flex gap-1 items-center">
                    {item.components?.map((compId, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <ItemImage
                          src={getComponentImageUrl(compId)}
                          alt={item.componentNames?.[i] || ""}
                          width={20}
                          height={20}
                          className="rounded opacity-80"
                        />
                        {i < (item.components?.length || 0) - 1 && <span className="text-gray-500">+</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {item.type === "complete_plus_component" && (
              <>
                {/* 3개 선택: 완성 + 남은 조합 */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded font-medium">
                    <ItemImage
                      src={getItemImageUrl(item.itemApiName!)}
                      alt={item.itemName!}
                      width={32}
                      height={32}
                      className="rounded"
                    />
                    <span>{item.itemName}</span>
                  </div>
                  <span className="text-gray-500 text-xl">+</span>
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 text-orange-400 rounded font-medium">
                    <ItemImage
                      src={getComponentImageUrl(item.remainingComponent!)}
                      alt={item.remainingComponentName!}
                      width={32}
                      height={32}
                      className="rounded"
                    />
                    <span>{item.remainingComponentName}</span>
                    <span className="text-xs opacity-70">(남음)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-sub">
                  <span className="text-text-muted">사용:</span>
                  <div className="flex gap-1 items-center">
                    {item.usedComponents?.map((compId, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <ItemImage
                          src={getComponentImageUrl(compId)}
                          alt={item.usedComponentNames?.[i] || ""}
                          width={18}
                          height={18}
                          className="rounded opacity-80"
                        />
                        {i < (item.usedComponents?.length || 0) - 1 && <span className="text-gray-500">+</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {item.type === "double_complete" && (
              <>
                {/* 4개 선택: 완성 + 완성 */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded font-medium">
                    <ItemImage
                      src={getItemImageUrl(item.item1ApiName!)}
                      alt={item.item1Name!}
                      width={32}
                      height={32}
                      className="rounded"
                    />
                    <span>{item.item1Name}</span>
                  </div>
                  <span className="text-gray-500 text-xl">+</span>
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-400 rounded font-medium">
                    <ItemImage
                      src={getItemImageUrl(item.item2ApiName!)}
                      alt={item.item2Name!}
                      width={32}
                      height={32}
                      className="rounded"
                    />
                    <span>{item.item2Name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-sub">
                  <div className="flex items-center gap-1">
                    <span className="text-text-muted">조합1:</span>
                    {item.item1Components?.map((compId, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <ItemImage
                          src={getComponentImageUrl(compId)}
                          alt={item.item1ComponentNames?.[i] || ""}
                          width={16}
                          height={16}
                          className="rounded opacity-80"
                        />
                        {i === 0 && <span className="text-gray-500">+</span>}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-text-muted">조합2:</span>
                    {item.item2Components?.map((compId, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <ItemImage
                          src={getComponentImageUrl(compId)}
                          alt={item.item2ComponentNames?.[i] || ""}
                          width={16}
                          height={16}
                          className="rounded opacity-80"
                        />
                        {i === 0 && <span className="text-gray-500">+</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>

          {/* 통계 */}
          <div className="text-right">
            {item.gameCount > 0 ? (
              <>
                <p className={`
                  text-2xl font-bold
                  ${item.avgPlacement < 4.5 ? "text-green-400" : "text-red-400"}
                `}>
                  {item.avgPlacement}등
                </p>
                <p className="text-sm text-text-sub">
                  상위4 {item.topFourRate}% · {item.gameCount}게임
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
        {item.gameCount > 0 && item.sampleGames.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-sm text-accent-blue hover:text-accent-blue/80 flex items-center gap-1"
          >
            {isExpanded ? "▼" : "▶"} 샘플 게임 {item.sampleGames.length}개 보기
          </button>
        )}
      </div>

      {/* 샘플 게임 목록 */}
      {isExpanded && item.sampleGames.length > 0 && (
        <SampleGamesSection sampleGames={item.sampleGames} targetItems={targetItems} />
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

  // 조합 아이템 추가 (같은 아이템 여러 개 가능, 최대 4개)
  const addComponent = (id: string) => {
    if (selectedComponents.length >= 4) return;
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
    if (selectedComponents.length < 2) {
      setError("조합 아이템을 2개 이상 선택해주세요");
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            아이템 조합 분석기
          </h1>
          <p className="text-text-sub">
            보유한 조합 아이템으로 어떤 완성 아이템 조합이 좋은지 분석합니다
          </p>
          {dataStatus && (
            <p className="text-xs text-text-muted mt-2">
              수집된 데이터: {dataStatus.totalRecords?.toLocaleString() || 0}개
              {dataStatus.status === "collecting" && " (수집 중...)"}
            </p>
          )}
        </div>

        {/* 조합 아이템 선택 */}
        <div className="bg-background-card rounded-xl p-6 border border-accent-blue/20 mb-6">
          <h2 className="text-lg font-bold mb-4">조합 아이템 선택 (최대 4개)</h2>
          <p className="text-sm text-text-sub mb-4">
            1라운드에서 받은 조합 아이템을 선택하세요. 같은 아이템 여러 개도 가능합니다.
          </p>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {COMPONENT_LIST.map(comp => (
              <button
                key={comp.id}
                onClick={() => addComponent(comp.id)}
                disabled={selectedComponents.length >= 4}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  flex flex-col items-center gap-2
                  border-gray-600 hover:border-yellow-400 hover:bg-yellow-400/10
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <ItemImage
                  src={getComponentImageUrl(comp.id)}
                  alt={comp.nameKo}
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span className="text-sm">{comp.nameKo}</span>
              </button>
            ))}
          </div>

          {/* 선택된 아이템 표시 */}
          {selectedComponents.length > 0 && (
            <div className="bg-background/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-text-sub mb-2">선택된 아이템 ({selectedComponents.length}/4):</p>
              <div className="flex flex-wrap gap-2">
                {selectedComponents.map((id, idx) => {
                  const comp = COMPONENT_LIST.find(c => c.id === id);
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-yellow-400/20 text-yellow-400 rounded-full text-sm flex items-center gap-2"
                    >
                      <ItemImage
                        src={getComponentImageUrl(id)}
                        alt={comp?.nameKo || id}
                        width={24}
                        height={24}
                        className="rounded"
                      />
                      {comp?.nameKo}
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

          {/* 최소 선택 안내 */}
          {selectedComponents.length > 0 && selectedComponents.length < 2 && (
            <p className="text-sm text-yellow-400 mb-2">
              조합 아이템을 2개 이상 선택해야 분석할 수 있습니다
            </p>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={analyze}
              disabled={isLoading || selectedComponents.length < 2}
              className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
            >
              {isLoading ? "분석 중..." : "분석하기"}
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
            <div className="mb-4">
              <h2 className="text-lg font-bold">
                분석 결과
                <span className="text-sm font-normal text-text-sub ml-2">
                  ({result.totalRecords.toLocaleString()}개 플레이어 데이터 기반)
                </span>
              </h2>
            </div>

            {result.combinations.length === 0 ? (
              <p className="text-text-sub text-center py-8">
                {result.message || "해당 조합의 데이터가 부족합니다"}
              </p>
            ) : (
              <div className="space-y-4">
                {result.combinations.map((item, idx) => (
                  <ResultCard key={idx} item={item} rank={idx + 1} />
                ))}
              </div>
            )}

            {/* 안내 문구 */}
            <p className="text-xs text-text-muted mt-4 text-center">
              ※ 최근 3일간 챌린저 상위 200명의 게임 데이터 기반 통계입니다.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
