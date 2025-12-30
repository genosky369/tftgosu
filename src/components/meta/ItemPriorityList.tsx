'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { CompletedItemStat, ComponentItemStat } from '@/types/meta';
import { getItemImageUrl, getComponentImageUrl } from '@/lib/itemImage';

// 아이템 이미지 컴포넌트
function ItemImage({
  apiName,
  name,
  size = 32,
  isComponent = false,
}: {
  apiName: string;
  name: string;
  size?: number;
  isComponent?: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Fallback: 회색 박스 + 첫 글자
    return (
      <div
        className="flex items-center justify-center bg-gray-700 rounded text-white text-xs font-bold shrink-0"
        style={{ width: size, height: size }}
      >
        {name.charAt(0)}
      </div>
    );
  }

  const imageUrl = isComponent
    ? getComponentImageUrl(apiName)
    : getItemImageUrl(apiName);

  return (
    <div
      className="relative rounded overflow-hidden shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl}
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

interface ItemPriorityListProps {
  completedItems: CompletedItemStat[];
  componentItems: ComponentItemStat[];
}

export function ItemPriorityList({ completedItems, componentItems }: ItemPriorityListProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 완성 아이템 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <span>완성 아이템 우선순위</span>
        </h4>

        <div className="space-y-2">
          {completedItems.slice(0, 8).map((item, idx) => (
            <div
              key={item.itemApiName}
              className="flex items-center gap-2 text-sm"
            >
              <span className="w-5 text-gray-500 text-xs">{idx + 1}.</span>
              <ItemImage
                apiName={item.itemApiName}
                name={item.itemName}
                size={28}
              />
              <span className="flex-1 text-gray-200 truncate">{item.itemName}</span>
              <span className={`text-xs ${getDeltaColor(item.placementDelta)}`}>
                ({formatDelta(item.placementDelta)})
              </span>
              <span className="text-xs text-gray-500 w-12 text-right">
                {item.appearanceRate}%
              </span>
            </div>
          ))}

          {completedItems.length === 0 && (
            <p className="text-gray-500 text-sm">데이터 부족</p>
          )}
        </div>
      </div>

      {/* 조합 아이템 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <span>초반 확보 우선순위</span>
          <span className="text-xs text-gray-500">(재료 아이템)</span>
        </h4>

        <div className="space-y-2">
          {componentItems.slice(0, 8).map((item, idx) => (
            <div
              key={item.componentId}
              className="flex items-center gap-2 text-sm"
            >
              <span className="w-5 text-gray-500 text-xs">{idx + 1}.</span>
              <ItemImage
                apiName={item.componentId}
                name={item.componentName}
                size={24}
                isComponent
              />
              <span className="flex-1 text-gray-200">{item.componentName}</span>
              <span className={`text-xs ${getDeltaColor(item.avgDelta)}`}>
                ({formatDelta(item.avgDelta)})
              </span>
            </div>
          ))}

          {componentItems.length === 0 && (
            <p className="text-gray-500 text-sm">데이터 부족</p>
          )}
        </div>
      </div>
    </div>
  );
}
