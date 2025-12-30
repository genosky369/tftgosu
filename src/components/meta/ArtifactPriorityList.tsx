'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ArtifactStat } from '@/types/meta';
import { getItemImageUrl } from '@/lib/itemImage';

// 유물 이미지 컴포넌트
function ArtifactImage({
  apiName,
  name,
  size = 36,
}: {
  apiName: string;
  name: string;
  size?: number;
}) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Fallback: 금색 테두리 박스 + 첫 글자
    return (
      <div
        className="flex items-center justify-center bg-gray-700 rounded text-white text-xs font-bold shrink-0"
        style={{
          width: size,
          height: size,
          border: '2px solid #fbbf24',
        }}
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <div
      className="relative rounded overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        border: '2px solid #fbbf24', // 금색 테두리 (유물 표시)
      }}
    >
      <Image
        src={getItemImageUrl(apiName)}
        alt={name}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setImageError(true)}
        unoptimized
      />
    </div>
  );
}

interface ArtifactPriorityListProps {
  artifacts: ArtifactStat[];
}

export function ArtifactPriorityList({ artifacts }: ArtifactPriorityListProps) {
  // delta 색상 (음수 = 좋음 = 초록색)
  const getDeltaColor = (delta: number) => {
    if (delta <= -0.5) return 'text-green-400';
    if (delta <= -0.2) return 'text-green-300';
    if (delta <= 0.2) return 'text-gray-400';
    if (delta <= 0.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const formatDelta = (delta: number) => {
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(2)}등`;
  };

  if (!artifacts || artifacts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
        <span>핵심 유물 아이템</span>
        <span className="text-xs text-gray-500">(통계적으로 성적이 좋은 유물)</span>
      </h4>

      <div className="space-y-3">
        {artifacts.slice(0, 5).map((artifact, idx) => (
          <div
            key={artifact.artifactApiName}
            className="flex items-center gap-3"
          >
            <span className="w-5 text-gray-500 text-sm">{idx + 1}.</span>
            <ArtifactImage
              apiName={artifact.artifactApiName}
              name={artifact.artifactName}
              size={36}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-gray-200 font-medium truncate">
                  {artifact.artifactName}
                </span>
                <span className={`text-sm ${getDeltaColor(artifact.placementDelta)}`}>
                  ({formatDelta(artifact.placementDelta)})
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span>평균 {artifact.avgPlacement.toFixed(2)}등</span>
                <span>|</span>
                <span>{artifact.appearanceRate}% 등장</span>
                <span>|</span>
                <span>{artifact.gameCount}게임</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
