'use client';

interface PlacementHistogramProps {
  distribution: number[];  // [0, 1등%, 2등%, ..., 8등%]
  avgPlacement: number;
  stdDeviation: number;
}

export function PlacementHistogram({ distribution, avgPlacement, stdDeviation }: PlacementHistogramProps) {
  // 최대값 계산 (막대 높이 비율용)
  const maxPercent = Math.max(...distribution.slice(1));

  // 표준편차 해석
  const getStdDevLabel = (std: number) => {
    if (std < 1.5) return { label: '매우 안정', color: 'text-green-400' };
    if (std < 2.0) return { label: '안정', color: 'text-green-300' };
    if (std < 2.5) return { label: '보통', color: 'text-yellow-400' };
    if (std < 3.0) return { label: '변동', color: 'text-orange-400' };
    return { label: '도박', color: 'text-red-400' };
  };

  const stdDevInfo = getStdDevLabel(stdDeviation);

  // 등수별 색상
  const getPlacementColor = (placement: number) => {
    if (placement === 1) return 'bg-yellow-500';
    if (placement <= 4) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-300">등수 분포</h4>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">표준편차</span>
          <span className={stdDevInfo.color}>{stdDeviation.toFixed(2)} ({stdDevInfo.label})</span>
        </div>
      </div>

      {/* 히스토그램 - 높이 증가 */}
      <div className="flex items-end justify-between gap-2 h-40 mb-2">
        {distribution.slice(1).map((percent, idx) => {
          const placement = idx + 1;
          // 상대적 높이 계산 (최대값 = 100%)
          const heightPercent = maxPercent > 0 ? (percent / maxPercent) * 100 : 0;

          return (
            <div key={placement} className="flex-1 flex flex-col items-center justify-end h-full">
              {/* 퍼센트 표시 */}
              <span className="text-xs text-gray-400 mb-1 font-medium">
                {Math.round(percent * 100)}%
              </span>
              {/* 막대 - 최대 120px */}
              <div
                className={`w-full max-w-[32px] rounded-t transition-all ${getPlacementColor(placement)}`}
                style={{
                  height: `${heightPercent}%`,
                  minHeight: percent > 0 ? '8px' : '0',
                  maxHeight: '120px'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 등수 라벨 */}
      <div className="flex justify-between gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((placement) => (
          <div key={placement} className="flex-1 text-center">
            <span className={`text-xs ${placement <= 4 ? 'text-gray-300' : 'text-gray-500'}`}>
              {placement}등
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
