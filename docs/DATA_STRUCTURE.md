# TFT 데이터 구조 정의

이 문서는 TFT 시뮬레이터에서 사용하는 모든 데이터 타입을 정의합니다.

---

## 챔피언 (Champion)

```typescript
// src/types/champion.ts

interface Champion {
  id: string;              // 고유 식별자 (예: "jinx", "zed")
  name: string;            // 표시 이름 (예: "징크스", "제드")
  cost: 1 | 2 | 3 | 4 | 5; // 챔피언 코스트 (1~5)
  traits: string[];        // 시너지 목록 (예: ["Rebel", "Blaster"])
  stats: ChampionStats;    // 기본 스탯
  ability: Ability;        // 스킬 정보
  imageUrl: string;        // 이미지 경로
}

interface ChampionStats {
  health: number;          // 체력
  mana: number;            // 최대 마나
  startingMana: number;    // 시작 마나
  armor: number;           // 방어력
  magicResist: number;     // 마법 저항력
  attackDamage: number;    // 공격력
  attackSpeed: number;     // 공격 속도 (0.6 ~ 1.2)
  attackRange: number;     // 사거리 (칸 수)
  critChance: number;      // 치명타 확률 (0.25 = 25%)
  critDamage: number;      // 치명타 데미지 (1.4 = 140%)
}

interface Ability {
  name: string;            // 스킬 이름
  description: string;     // 스킬 설명
  type: 'active' | 'passive';
  damageType: 'physical' | 'magic' | 'true';
  scaling: AbilityScaling[];  // 스킬 스케일링
}

interface AbilityScaling {
  stat: 'ap' | 'ad' | 'health' | 'armor' | 'maxMana';
  ratio: number;           // 스케일링 비율 (0.8 = 80%)
  base: number[];          // 스킬 레벨별 기본 데미지 [1성, 2성, 3성]
}
```

### 예시 데이터

```typescript
// src/data/champions.ts

export const champions: Champion[] = [
  {
    id: "jinx",
    name: "징크스",
    cost: 3,
    traits: ["Rebel", "Blaster"],
    stats: {
      health: 700,
      mana: 50,
      startingMana: 0,
      armor: 20,
      magicResist: 20,
      attackDamage: 75,
      attackSpeed: 0.75,
      attackRange: 4,
      critChance: 0.25,
      critDamage: 1.4,
    },
    ability: {
      name: "피숄 앤 파워!",
      description: "거대한 로켓을 발사하여 범위 데미지를 입힙니다.",
      type: "active",
      damageType: "magic",
      scaling: [
        {
          stat: "ap",
          ratio: 1.5,
          base: [300, 450, 750],
        },
      ],
    },
    imageUrl: "/images/champions/jinx.png",
  },
];
```

---

## 아이템 (Item)

```typescript
// src/types/item.ts

interface Item {
  id: string;              // 고유 식별자 (예: "bf_sword", "infinity_edge")
  name: string;            // 표시 이름
  description: string;     // 아이템 설명
  type: 'basic' | 'combined';  // 기본 아이템 / 조합 아이템
  components?: string[];   // 조합 재료 (combined일 경우)
  stats: ItemStats;        // 스탯 보너스
  passive?: ItemPassive;   // 패시브 효과
  imageUrl: string;
}

interface ItemStats {
  attackDamage?: number;      // 공격력 보너스
  abilityPower?: number;      // 주문력 보너스
  attackSpeed?: number;       // 공격 속도 보너스 (0.2 = 20%)
  armor?: number;             // 방어력 보너스
  magicResist?: number;       // 마법 저항력 보너스
  health?: number;            // 체력 보너스
  mana?: number;              // 마나 보너스
  critChance?: number;        // 치명타 확률 보너스
  critDamage?: number;        // 치명타 데미지 보너스
  omnivamp?: number;          // 모든 피해 흡혈
  armorPen?: number;          // 방어구 관통력
  magicPen?: number;          // 마법 관통력
}

interface ItemPassive {
  name: string;               // 패시브 이름
  description: string;        // 패시브 설명
  trigger: 'onHit' | 'onCrit' | 'onAbility' | 'always' | 'onKill';
  effect: PassiveEffect;
}

type PassiveEffect =
  | { type: 'damage'; value: number; damageType: 'physical' | 'magic' | 'true' }
  | { type: 'heal'; value: number }
  | { type: 'shield'; value: number }
  | { type: 'statBoost'; stat: keyof ItemStats; value: number };
```

### 예시 데이터

```typescript
// src/data/items.ts

// 기본 아이템
export const basicItems: Item[] = [
  {
    id: "bf_sword",
    name: "B.F. 대검",
    description: "공격력을 증가시킵니다.",
    type: "basic",
    stats: { attackDamage: 10 },
    imageUrl: "/images/items/bf_sword.png",
  },
  {
    id: "recurve_bow",
    name: "곡궁",
    description: "공격 속도를 증가시킵니다.",
    type: "basic",
    stats: { attackSpeed: 0.1 },
    imageUrl: "/images/items/recurve_bow.png",
  },
];

// 조합 아이템
export const combinedItems: Item[] = [
  {
    id: "infinity_edge",
    name: "무한의 대검",
    description: "치명타 확률과 치명타 데미지를 증가시킵니다.",
    type: "combined",
    components: ["bf_sword", "glove"],
    stats: {
      attackDamage: 35,
      critChance: 0.35,
      critDamage: 0.1,
    },
    passive: {
      name: "무한",
      description: "치명타 데미지가 10% 증가합니다.",
      trigger: "always",
      effect: { type: "statBoost", stat: "critDamage", value: 0.1 },
    },
    imageUrl: "/images/items/infinity_edge.png",
  },
];
```

---

## 시너지 (Trait)

```typescript
// src/types/trait.ts

interface Trait {
  id: string;              // 고유 식별자
  name: string;            // 표시 이름
  description: string;     // 시너지 설명
  breakpoints: TraitBreakpoint[];  // 활성화 단계
}

interface TraitBreakpoint {
  count: number;           // 필요 챔피언 수
  effect: TraitEffect;     // 효과
}

interface TraitEffect {
  description: string;     // 효과 설명
  statBonus?: Partial<ItemStats>;  // 스탯 보너스
  special?: string;        // 특수 효과 설명
}
```

### 예시 데이터

```typescript
// src/data/traits.ts

export const traits: Trait[] = [
  {
    id: "blaster",
    name: "총잡이",
    description: "총잡이는 기본 공격 시 추가 대상에게도 피해를 입힙니다.",
    breakpoints: [
      {
        count: 2,
        effect: {
          description: "기본 공격이 1명의 추가 적에게 50% 피해",
          special: "multiTarget:1:0.5",
        },
      },
      {
        count: 4,
        effect: {
          description: "기본 공격이 2명의 추가 적에게 75% 피해",
          special: "multiTarget:2:0.75",
        },
      },
    ],
  },
];
```

---

## 시뮬레이션 결과 (SimulationResult)

```typescript
// src/types/simulation.ts

interface SimulationInput {
  champion: Champion;
  items: Item[];           // 최대 3개
  starLevel: 1 | 2 | 3;    // 챔피언 성급
  activeTraits?: ActiveTrait[];  // 활성화된 시너지
  targetDummy?: TargetDummy;     // 대상 더미 설정
}

interface ActiveTrait {
  traitId: string;
  activeCount: number;     // 활성화된 챔피언 수
}

interface TargetDummy {
  armor: number;
  magicResist: number;
  health: number;
}

interface SimulationResult {
  totalStats: CalculatedStats;     // 최종 스탯
  dps: DPSBreakdown;               // DPS 분석
  comparison?: ComparisonResult[]; // 다른 아이템 조합과 비교
}

interface CalculatedStats {
  health: number;
  attackDamage: number;
  abilityPower: number;
  attackSpeed: number;
  armor: number;
  magicResist: number;
  critChance: number;
  critDamage: number;
  effectiveHealth: number;  // 유효 체력 (방어력 고려)
}

interface DPSBreakdown {
  basicAttackDPS: number;   // 기본 공격 DPS
  abilityDPS: number;       // 스킬 DPS
  totalDPS: number;         // 총 DPS
  timeToKill?: number;      // 대상 처치 예상 시간 (초)
}

interface ComparisonResult {
  items: Item[];
  dps: number;
  dpsChange: number;        // 기준 대비 변화량
  dpsChangePercent: number; // 기준 대비 변화율
}
```

---

## 데이터 업데이트 가이드

### 새 챔피언 추가 시

1. `src/data/champions.ts`에 챔피언 데이터 추가
2. `public/images/champions/`에 이미지 추가
3. 이 문서에 특이사항 있으면 기록

### 새 아이템 추가 시

1. `src/data/items.ts`에 아이템 데이터 추가
2. `public/images/items/`에 이미지 추가
3. 패시브 효과가 복잡하면 `docs/SIMULATION_LOGIC.md`에 계산 방식 기록

### 시즌 업데이트 시

TFT 시즌 업데이트 시 다음 파일들을 확인:
- 챔피언 스탯 변경
- 아이템 효과 변경
- 새로운 시너지 추가
