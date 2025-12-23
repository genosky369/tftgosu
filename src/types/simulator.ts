// 브론즈 시뮬레이터 타입 정의

/** 챔피언 정보 */
export interface Champion {
  name: string;
  cost: number;
  traits: string[];   // 지역 특성 (데마시아, 필트오버 등)
  classes: string[];  // 직업 특성 (총잡이, 엄호대 등)
}

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
