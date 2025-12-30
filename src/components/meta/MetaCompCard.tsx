'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { MetaComp, MetaChampionInfo } from '@/types/meta';
import { PlacementHistogram } from './PlacementHistogram';
import { ItemPriorityList } from './ItemPriorityList';
import { ArtifactPriorityList } from './ArtifactPriorityList';
import { getChampionImageUrl } from '@/lib/championImage';

// 코스트별 테두리 색상
const COST_BORDER_COLORS: Record<number, string> = {
  1: '#9ca3af', // 회색 (gray-400)
  2: '#22c55e', // 초록 (green-500)
  3: '#3b82f6', // 파랑 (blue-500)
  4: '#a855f7', // 보라 (purple-500)
  5: '#fbbf24', // 금색 (yellow-400)
};

// 챔피언 이미지 컴포넌트
function ChampionImage({
  champion,
  size = 48,
  opacity = 1,
}: {
  champion: MetaChampionInfo;
  size?: number;
  opacity?: number;
}) {
  const [imageError, setImageError] = useState(false);
  const borderColor = champion.cost ? COST_BORDER_COLORS[champion.cost] : COST_BORDER_COLORS[1];

  if (imageError) {
    // Fallback: 회색 박스 + 첫 글자
    return (
      <div
        className="flex items-center justify-center bg-gray-700 rounded text-white font-bold"
        style={{
          width: size,
          height: size,
          border: `2px solid ${borderColor}`,
          opacity,
        }}
      >
        {champion.name.charAt(0)}
      </div>
    );
  }

  return (
    <div
      className="relative rounded overflow-hidden"
      style={{
        width: size,
        height: size,
        border: `2px solid ${borderColor}`,
        opacity,
      }}
    >
      <Image
        src={getChampionImageUrl(champion.apiName)}
        alt={champion.name}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setImageError(true)}
        unoptimized
      />
    </div>
  );
}

interface MetaCompCardProps {
  comp: MetaComp;
  rank: number;
}

export function MetaCompCard({ comp, rank }: MetaCompCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 티어별 스타일
  const tierStyles = {
    S: { bg: 'border-yellow-500/50', badge: 'bg-yellow-500 text-black', icon: '' },
    A: { bg: 'border-blue-500/50', badge: 'bg-blue-500 text-white', icon: '' },
    B: { bg: 'border-purple-500/50', badge: 'bg-purple-500 text-white', icon: '' },
    C: { bg: 'border-gray-500/50', badge: 'bg-gray-500 text-white', icon: '' },
  };

  const style = tierStyles[comp.tier];

  // 평균 등수 색상
  const getPlacementColor = (avg: number) => {
    if (avg <= 3.5) return 'text-yellow-400';
    if (avg <= 4.0) return 'text-blue-400';
    if (avg <= 4.5) return 'text-purple-400';
    return 'text-gray-400';
  };

  return (
    <div className={`bg-gray-900 rounded-lg border ${style.bg} overflow-hidden transition-all`}>
      {/* 헤더 (클릭 가능) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-gray-800/50 transition-colors text-left"
      >
        {/* 순위 */}
        <div className="w-8 text-center">
          <span className="text-lg font-bold text-gray-500">#{rank}</span>
        </div>

        {/* 티어 배지 */}
        <div className={`w-8 h-8 rounded flex items-center justify-center font-bold ${style.badge}`}>
          {comp.tier}
        </div>

        {/* 조합 이름 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{comp.name}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            {comp.mainTrait && (
              <span>{comp.mainTrait.avgUnits}{comp.mainTrait.name}</span>
            )}
          </div>
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <div className={`font-bold ${getPlacementColor(comp.stats.avgPlacement)}`}>
              {comp.stats.avgPlacement}등
            </div>
            <div className="text-xs text-gray-500">평균</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-300">{comp.stats.top4Rate}%</div>
            <div className="text-xs text-gray-500">Top4</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-300">{comp.stats.winRate}%</div>
            <div className="text-xs text-gray-500">1등</div>
          </div>
          <div className="text-center hidden sm:block">
            <div className="font-bold text-gray-400">{comp.stats.gameCount}</div>
            <div className="text-xs text-gray-500">게임</div>
          </div>
        </div>

        {/* 펼치기 아이콘 */}
        <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* 상세 정보 (펼쳐졌을 때) */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-800">
          {/* 핵심 챔피언 */}
          <div className="pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">핵심 챔피언</h4>
            <div className="flex flex-wrap gap-2">
              {comp.coreChampions.map((champ) => (
                <div
                  key={champ.apiName}
                  className="flex flex-col items-center gap-1"
                  title={`${champ.name} (${champ.frequency}% 등장, 평균 ${champ.avgItems}개 아이템)`}
                >
                  <ChampionImage champion={champ} size={48} />
                  <span className="text-xs text-gray-400">{champ.name}</span>
                </div>
              ))}
            </div>

            {comp.flexChampions.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-gray-400 mt-4 mb-3">유동 챔피언</h4>
                <div className="flex flex-wrap gap-2">
                  {comp.flexChampions.slice(0, 6).map((champ) => (
                    <div
                      key={champ.apiName}
                      className="flex flex-col items-center gap-1"
                      title={`${champ.name} (${champ.frequency}% 등장)`}
                    >
                      <ChampionImage champion={champ} size={40} opacity={0.7} />
                      <span className="text-xs text-gray-500">{champ.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 등수 분포 히스토그램 */}
          <PlacementHistogram
            distribution={comp.stats.placementDistribution}
            avgPlacement={comp.stats.avgPlacement}
            stdDeviation={comp.stats.stdDeviation}
          />

          {/* 아이템 우선순위 */}
          <ItemPriorityList
            completedItems={comp.itemAnalysis.completedItems}
            componentItems={comp.itemAnalysis.componentItems}
          />

          {/* 유물 아이템 분석 */}
          {comp.artifactAnalysis && comp.artifactAnalysis.artifacts && comp.artifactAnalysis.artifacts.length > 0 && (
            <ArtifactPriorityList artifacts={comp.artifactAnalysis.artifacts} />
          )}
        </div>
      )}
    </div>
  );
}
