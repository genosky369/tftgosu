// 메타 조합 티어리스트 타입 정의

/** 챔피언 정보 (메타 조합용) */
export interface MetaChampionInfo {
  apiName: string;       // API 이름 (예: TFT16_Jinx)
  name: string;          // 한글 이름 (예: "징크스")
  frequency: number;     // 등장 빈도 (0-100%)
  avgItems: number;      // 평균 아이템 개수
}

/** 시너지 정보 (메타 조합용) */
export interface MetaTraitInfo {
  apiName: string;       // API 이름 (예: TFT16_Piltover)
  name: string;          // 한글 이름 (예: "필트오버")
  avgUnits: number;      // 평균 유닛 수
  avgTier: number;       // 평균 티어
}

/** 완성 아이템 통계 */
export interface CompletedItemStat {
  itemApiName: string;   // API 이름 (예: TFT_Item_GuinsoosRageblade)
  itemName: string;      // 한글 이름 (예: "구인수의 격노검")
  appearanceRate: number;   // 등장률 (0-100)
  avgPlacement: number;     // 이 아이템 있을 때 평균 등수
  placementDelta: number;   // 등수 차이 (음수 = 좋음)
  gameCount: number;        // 표본 수
  priorityScore: number;    // 우선순위 점수 (높을수록 좋음)
}

/** 조합 아이템 통계 */
export interface ComponentItemStat {
  componentId: string;   // 조합 아이템 ID (예: "RecurveBow")
  componentName: string; // 한글 이름 (예: "활")
  avgDelta: number;      // 평균 등수 차이 (음수 = 좋음)
  usageCount: number;    // 사용 횟수
  itemsUsing: string[];  // 이 조합템을 사용하는 완성템 목록
}

/** 아이템 분석 결과 */
export interface ItemAnalysis {
  completedItems: CompletedItemStat[];   // 완성 아이템 우선순위 (상위 15개)
  componentItems: ComponentItemStat[];   // 조합 아이템 우선순위 (상위 8개)
}

/** 덱 통계 */
export interface CompStats {
  gameCount: number;                  // 표본 수
  avgPlacement: number;               // 평균 등수
  stdDeviation: number;               // 표준편차
  placementDistribution: number[];    // 등수 분포 [0, 1등%, 2등%, ..., 8등%]
  top4Rate: number;                   // 상위 4등 비율 (0-100)
  winRate: number;                    // 1등 비율 (0-100)
}

/** 메타 조합 */
export interface MetaComp {
  id: string;                         // 고유 ID (예: "comp_0")
  name: string;                       // 조합 이름 (예: "6필트오버 징크스")
  tier: 'S' | 'A' | 'B' | 'C';       // 티어

  // 구성 정보
  coreChampions: MetaChampionInfo[];  // 핵심 챔피언 (80%+ 등장)
  flexChampions: MetaChampionInfo[];  // 유동 챔피언 (50-80% 등장)
  mainTrait: MetaTraitInfo | null;    // 메인 시너지
  mainCarry: string | null;           // 메인 캐리 (한글 이름)

  // 통계 정보
  stats: CompStats;

  // 아이템 분석
  itemAnalysis: ItemAnalysis;
}

/** API 응답 */
export interface MetaCompsResponse {
  patch: string;                      // 패치 버전 (예: "14.24")
  updatedAt: string;                  // 마지막 업데이트 (ISO 8601)
  totalGames: number;                 // 총 분석 게임 수
  comps: MetaComp[];                  // 메타 조합 목록
}

/** 정렬 옵션 */
export type SortOption = 'avgPlacement' | 'winRate' | 'top4Rate' | 'gameCount' | 'stdDeviation';

/** 티어 필터 */
export type TierFilter = 'all' | 'S' | 'A' | 'B' | 'C';
