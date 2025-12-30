'use client';

import { useState, useEffect, useMemo } from 'react';
import { MetaCompCard } from '@/components/meta';
import type { MetaCompsResponse, MetaComp, SortOption, TierFilter } from '@/types/meta';

export default function MetaTierlistPage() {
  const [data, setData] = useState<MetaCompsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터 및 정렬
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('avgPlacement');

  // 데이터 로드
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/meta/comps');
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || '데이터 로드 실패');
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 필터링 및 정렬된 조합 목록
  const filteredComps = useMemo(() => {
    if (!data) return [];

    let comps = [...data.comps];

    // 티어 필터
    if (tierFilter !== 'all') {
      comps = comps.filter(c => c.tier === tierFilter);
    }

    // 정렬
    comps.sort((a, b) => {
      switch (sortBy) {
        case 'avgPlacement':
          return a.stats.avgPlacement - b.stats.avgPlacement;
        case 'winRate':
          return b.stats.winRate - a.stats.winRate;
        case 'top4Rate':
          return b.stats.top4Rate - a.stats.top4Rate;
        case 'gameCount':
          return b.stats.gameCount - a.stats.gameCount;
        case 'stdDeviation':
          return a.stats.stdDeviation - b.stats.stdDeviation;
        default:
          return 0;
      }
    });

    return comps;
  }, [data, tierFilter, sortBy]);

  // 티어별 그룹핑
  const compsByTier = useMemo(() => {
    const grouped: Record<string, MetaComp[]> = {
      S: [],
      A: [],
      B: [],
      C: [],
    };

    for (const comp of filteredComps) {
      grouped[comp.tier].push(comp);
    }

    return grouped;
  }, [filteredComps]);

  // 업데이트 시간 포맷
  const formatUpdatedAt = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    return '방금 전';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">데이터 로딩 중...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error || '데이터를 불러올 수 없습니다'}</p>
          <p className="text-gray-500 text-sm">
            scripts/analyze-meta-comps.js 를 먼저 실행해주세요.
          </p>
        </div>
      </div>
    );
  }

  if (data.comps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-yellow-400 mb-2">메타 조합 데이터가 아직 없습니다</p>
          <p className="text-gray-500 text-sm">
            1. node scripts/collect-tft-data.js 로 데이터 수집
          </p>
          <p className="text-gray-500 text-sm">
            2. node scripts/analyze-meta-comps.js 로 분석 실행
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">메타 조합 티어리스트</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span>패치 {data.patch}</span>
            <span>|</span>
            <span>챌린저 {data.totalGames.toLocaleString()}게임 분석</span>
            <span>|</span>
            <span>업데이트: {formatUpdatedAt(data.updatedAt)}</span>
          </div>
        </div>

        {/* 필터 및 정렬 */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* 티어 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">티어:</span>
            <div className="flex gap-1">
              {(['all', 'S', 'A', 'B', 'C'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    tierFilter === tier
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {tier === 'all' ? '전체' : tier}
                </button>
              ))}
            </div>
          </div>

          {/* 정렬 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-gray-800 text-gray-200 text-sm rounded px-3 py-1 border border-gray-700 focus:outline-none focus:border-blue-500"
            >
              <option value="avgPlacement">평균 등수</option>
              <option value="winRate">1등률</option>
              <option value="top4Rate">Top4률</option>
              <option value="gameCount">표본 수</option>
              <option value="stdDeviation">안정성</option>
            </select>
          </div>
        </div>

        {/* 티어별 조합 목록 */}
        {tierFilter === 'all' ? (
          // 티어별 그룹핑 표시
          <div className="space-y-8">
            {(['S', 'A', 'B', 'C'] as const).map((tier) => {
              const comps = compsByTier[tier];
              if (comps.length === 0) return null;

              const tierLabels = {
                S: { label: 'S 티어', desc: '최상위 메타 조합', color: 'text-yellow-400' },
                A: { label: 'A 티어', desc: '강력한 조합', color: 'text-blue-400' },
                B: { label: 'B 티어', desc: '평균 이상', color: 'text-purple-400' },
                C: { label: 'C 티어', desc: '상황적 선택', color: 'text-gray-400' },
              };

              const info = tierLabels[tier];

              return (
                <div key={tier}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className={`text-xl font-bold ${info.color}`}>{info.label}</h2>
                    <span className="text-sm text-gray-500">{info.desc}</span>
                    <span className="text-sm text-gray-600">({comps.length}개)</span>
                  </div>
                  <div className="space-y-3">
                    {comps.map((comp, idx) => (
                      <MetaCompCard
                        key={comp.id}
                        comp={comp}
                        rank={filteredComps.indexOf(comp) + 1}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // 필터링된 목록 표시
          <div className="space-y-3">
            {filteredComps.map((comp, idx) => (
              <MetaCompCard
                key={comp.id}
                comp={comp}
                rank={idx + 1}
              />
            ))}
          </div>
        )}

        {/* 하단 안내 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>* 최소 200게임 이상의 표본이 있는 조합만 표시됩니다</p>
          <p>* 카드를 클릭하면 상세 정보를 확인할 수 있습니다</p>
        </div>
      </div>
    </div>
  );
}
