// 시뮬레이터 타입 정의

/** 챔피언 정보 */
export interface Champion {
  name: string;
  cost: number;
  traits: string[];   // 지역 특성 (데마시아, 필트오버 등)
  classes: string[];  // 직업 특성 (총잡이, 엄호대 등)
}

// ============================================
// 월드룬 시뮬레이터 타입
// ============================================

/** 월드룬 시뮬레이터 입력 */
export interface WorldRuneInput {
  level: number;                  // 6~10
  regionSymbols: string[];        // 보유 지역 상징 (최대 4개, 중복 허용)
  excludedRegions: string[];      // 제외할 지역
  excludedChampions: string[];    // 제외할 챔피언
  maxCost: number;                // 최대 코스트 (1~5)
}

/** 지역 커버 정보 */
export interface RegionCoverage {
  region: string;                 // 지역 이름
  required: number;               // 활성화 필요 수
  current: number;                // 현재 수 (챔피언 + 상징)
  isActive: boolean;              // 활성화 여부
  contributors: {                 // 기여자 목록
    type: 'champion' | 'symbol';
    name: string;
  }[];
}

/** 월드룬 시뮬레이터 결과 */
export interface WorldRuneResult {
  targetRegions: string[];        // 목표 지역 4개
  champions: Champion[];          // 필요한 챔피언 목록
  championCount: number;          // 필요 기물 수
  totalCost: number;              // 덱 총 코스트
  regionCoverages: RegionCoverage[];  // 지역별 커버 정보
  remainingSlots: number;         // 남은 슬롯 (level - championCount)
}

/** 월드룬 입력 검증 결과 */
export interface WorldRuneValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================
// 브론즈 시뮬레이터 타입
// ============================================

/** 브론즈 시너지 정보 */
export interface BronzeSynergy {
  synergy: string;
  count: number;
  tier: 'bronze';
}

/** 시뮬레이터 입력 */
export interface SimulatorInput {
  level: number;        // 6~10
  symbols: string[];    // 보유 상징 (최대 7개)
}

/** 활성화된 시너지 */
export interface ActiveSynergy {
  name: string;
  current: number;      // 현재 활성화 수
  required: number;     // 브론즈 달성 필요 수
  isActive: boolean;    // 브론즈 달성 여부
}

/** 시뮬레이터 결과 */
export interface SimulatorResult {
  champions: Champion[];
  activeSynergies: ActiveSynergy[];
  bronzeCount: number;
  totalCost: number;
}

/** 입력 검증 결과 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}
