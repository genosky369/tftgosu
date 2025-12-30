'use client';

import { useState } from 'react';
import type { MetaComp } from '@/types/meta';
import { PlacementHistogram } from './PlacementHistogram';
import { ItemPriorityList } from './ItemPriorityList';

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
            <h4 className="text-sm font-medium text-gray-300 mb-2">핵심 챔피언</h4>
            <div className="flex flex-wrap gap-2">
              {comp.coreChampions.map((champ) => (
                <div
                  key={champ.apiName}
                  className="bg-gray-800 rounded px-2 py-1 text-sm"
                  title={`${champ.frequency}% 등장, 평균 ${champ.avgItems}개 아이템`}
                >
                  <span className="text-gray-200">{champ.name}</span>
                  <span className="text-gray-500 text-xs ml-1">({champ.frequency}%)</span>
                </div>
              ))}
            </div>

            {comp.flexChampions.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-gray-400 mt-3 mb-2">유동 챔피언</h4>
                <div className="flex flex-wrap gap-2">
                  {comp.flexChampions.slice(0, 6).map((champ) => (
                    <div
                      key={champ.apiName}
                      className="bg-gray-800/50 rounded px-2 py-1 text-sm"
                    >
                      <span className="text-gray-400">{champ.name}</span>
                      <span className="text-gray-600 text-xs ml-1">({champ.frequency}%)</span>
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
        </div>
      )}
    </div>
  );
}
