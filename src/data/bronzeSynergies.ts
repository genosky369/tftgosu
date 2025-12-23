// TFT Set 16 브론즈 시너지 데이터
// 원본: 데이터/tft_set16_bronze_synergies.json

import type { BronzeSynergy } from '@/types/simulator';

export const BRONZE_SYNERGIES: BronzeSynergy[] = [
  { synergy: "공허", count: 2, tier: "bronze" },
  { synergy: "공허", count: 3, tier: "bronze" },
  { synergy: "그림자 군도", count: 2, tier: "bronze" },
  { synergy: "기동타격대", count: 2, tier: "bronze" },
  { synergy: "기원자", count: 2, tier: "bronze" },
  { synergy: "난동꾼", count: 2, tier: "bronze" },
  { synergy: "난동꾼", count: 3, tier: "bronze" },
  { synergy: "녹서스", count: 3, tier: "bronze" },
  { synergy: "녹서스", count: 4, tier: "bronze" },
  { synergy: "다르킨", count: 1, tier: "bronze" },
  { synergy: "데마시아", count: 3, tier: "bronze" },
  { synergy: "데마시아", count: 4, tier: "bronze" },
  { synergy: "방해꾼", count: 2, tier: "bronze" },
  { synergy: "비전 마법사", count: 2, tier: "bronze" },
  { synergy: "비전 마법사", count: 3, tier: "bronze" },
  { synergy: "빌지워터", count: 3, tier: "bronze" },
  { synergy: "빌지워터", count: 4, tier: "bronze" },
  { synergy: "슈리마", count: 2, tier: "bronze" },
  { synergy: "아이오니아", count: 3, tier: "bronze" },
  { synergy: "아이오니아", count: 4, tier: "bronze" },
  { synergy: "엄호대", count: 2, tier: "bronze" },
  { synergy: "엄호대", count: 3, tier: "bronze" },
  { synergy: "요들", count: 2, tier: "bronze" },
  { synergy: "요들", count: 3, tier: "bronze" },
  { synergy: "원거리 사격", count: 2, tier: "bronze" },
  { synergy: "이쉬탈", count: 3, tier: "bronze" },
  { synergy: "이쉬탈", count: 4, tier: "bronze" },
  { synergy: "자운", count: 3, tier: "bronze" },
  { synergy: "자운", count: 4, tier: "bronze" },
  { synergy: "전쟁기계", count: 2, tier: "bronze" },
  { synergy: "전쟁기계", count: 3, tier: "bronze" },
  { synergy: "총잡이", count: 2, tier: "bronze" },
  { synergy: "토벌자", count: 2, tier: "bronze" },
  { synergy: "파수꾼", count: 2, tier: "bronze" },
  { synergy: "프렐요드", count: 3, tier: "bronze" },
  { synergy: "프렐요드", count: 4, tier: "bronze" },
  { synergy: "필트오버", count: 2, tier: "bronze" },
  { synergy: "필트오버", count: 3, tier: "bronze" },
  { synergy: "학살자", count: 2, tier: "bronze" },
  { synergy: "학살자", count: 3, tier: "bronze" },
];

// 시너지별 브론즈 달성에 필요한 최소 카운트 맵
// 예: "공허" -> 2 (2명이면 브론즈)
export const BRONZE_THRESHOLDS: Map<string, number> = new Map();

// 각 시너지의 최소 브론즈 달성 카운트 계산
BRONZE_SYNERGIES.forEach(bs => {
  const current = BRONZE_THRESHOLDS.get(bs.synergy);
  if (current === undefined || bs.count < current) {
    BRONZE_THRESHOLDS.set(bs.synergy, bs.count);
  }
});

// 시너지 이름 목록 (중복 제거)
export const SYNERGY_NAMES = [...new Set(BRONZE_SYNERGIES.map(bs => bs.synergy))];
