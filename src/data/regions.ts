// TFT Set 16 지역 데이터
// 원본: 데이터/area.txt, 데이터/area_activate.txt

// 지역 목록 (14개)
export const REGIONS: string[] = [
  "공허",
  "그림자군도",
  "녹서스",
  "다르킨",
  "데마시아",
  "빌지워터",
  "슈리마",
  "아이오니아",
  "요들",
  "이쉬탈",
  "자운",
  "타곤",
  "프렐요드",
  "필트오버",
];

// 지역별 활성화 임계값 (최소 유닛 수)
export const REGION_THRESHOLDS: Record<string, number> = {
  "공허": 2,
  "그림자군도": 2,
  "녹서스": 3,
  "다르킨": 1,
  "데마시아": 3,
  "빌지워터": 3,
  "슈리마": 2,
  "아이오니아": 3,
  "요들": 2,
  "이쉬탈": 3,
  "자운": 3,
  "타곤": 1,
  "프렐요드": 3,
  "필트오버": 2,
};

// 지역 이름 정규화 (띄어쓰기 제거)
export function normalizeRegionName(name: string): string {
  return name.replace(/\s/g, '').toLowerCase();
}

// 지역인지 확인
export function isRegion(trait: string): boolean {
  const normalized = normalizeRegionName(trait);
  return REGIONS.some(r => normalizeRegionName(r) === normalized);
}

// 정규화된 지역 이름으로 원본 지역 이름 찾기
export function findRegionName(normalizedName: string): string | undefined {
  return REGIONS.find(r => normalizeRegionName(r) === normalizedName);
}

// 지역 활성화 임계값 가져오기
export function getRegionThreshold(region: string): number {
  // 정규화된 이름으로 찾기
  const normalized = normalizeRegionName(region);
  for (const [key, value] of Object.entries(REGION_THRESHOLDS)) {
    if (normalizeRegionName(key) === normalized) {
      return value;
    }
  }
  return 999; // 찾지 못한 경우
}
