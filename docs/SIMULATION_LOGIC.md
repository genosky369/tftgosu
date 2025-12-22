# TFT 시뮬레이션 계산 로직

이 문서는 시뮬레이터의 핵심 계산 로직을 설명합니다.

---

## 기본 공식

### 1. 최종 스탯 계산

챔피언의 최종 스탯 = 기본 스탯 + 아이템 스탯 + 시너지 스탯

```typescript
// src/lib/calculator/statCalculator.ts

/**
 * 챔피언의 최종 스탯을 계산합니다.
 */
function calculateFinalStats(
  champion: Champion,
  items: Item[],
  starLevel: 1 | 2 | 3,
  activeTraits?: ActiveTrait[]
): CalculatedStats {
  // 1. 성급에 따른 기본 스탯 조정
  const baseStats = applyStarLevel(champion.stats, starLevel);

  // 2. 아이템 스탯 합산
  const itemStats = sumItemStats(items);

  // 3. 시너지 스탯 적용
  const traitStats = calculateTraitBonus(activeTraits);

  // 4. 최종 합산
  return mergeStats(baseStats, itemStats, traitStats);
}
```

### 2. 성급 스탯 배율

| 성급 | 체력 배율 | 공격력 배율 | 스킬 배율 |
|------|----------|------------|----------|
| 1성 | 1.0x | 1.0x | 기본값 |
| 2성 | 1.8x | 1.5x | 스킬 레벨 2 |
| 3성 | 3.24x | 2.25x | 스킬 레벨 3 |

```typescript
function applyStarLevel(stats: ChampionStats, starLevel: 1 | 2 | 3): ChampionStats {
  const healthMultiplier = [1.0, 1.8, 3.24][starLevel - 1];
  const adMultiplier = [1.0, 1.5, 2.25][starLevel - 1];

  return {
    ...stats,
    health: Math.floor(stats.health * healthMultiplier),
    attackDamage: Math.floor(stats.attackDamage * adMultiplier),
  };
}
```

---

## 데미지 계산

### 1. 기본 공격 데미지

```
기본 공격 데미지 = 공격력 × (1 + 치명타 보정)
치명타 보정 = 치명타 확률 × (치명타 데미지 - 1)
```

```typescript
// src/lib/calculator/damageCalculator.ts

/**
 * 평균 기본 공격 데미지를 계산합니다 (치명타 확률 고려).
 */
function calculateAverageBasicDamage(stats: CalculatedStats): number {
  const { attackDamage, critChance, critDamage } = stats;

  // 크리티컬이 뜰 확률을 고려한 평균 데미지
  // 일반: (1 - critChance) × AD
  // 크리티컬: critChance × AD × critDamage
  const normalDamage = (1 - critChance) * attackDamage;
  const criticalDamage = critChance * attackDamage * critDamage;

  return normalDamage + criticalDamage;
}
```

### 2. 데미지 감소 (방어력/마저)

```
실제 데미지 = 원본 데미지 × 100 / (100 + 방어력)
```

```typescript
/**
 * 방어력에 의한 데미지 감소를 계산합니다.
 */
function applyArmorReduction(damage: number, armor: number): number {
  // 방어력이 음수일 수 있음 (방어구 관통 적용 시)
  const effectiveArmor = Math.max(armor, 0);
  const reduction = 100 / (100 + effectiveArmor);
  return damage * reduction;
}

/**
 * 마법 저항력에 의한 데미지 감소를 계산합니다.
 */
function applyMagicResistReduction(damage: number, magicResist: number): number {
  const effectiveMR = Math.max(magicResist, 0);
  const reduction = 100 / (100 + effectiveMR);
  return damage * reduction;
}
```

### 3. 관통력 적용

```
유효 방어력 = 방어력 × (1 - % 관통) - 고정 관통
```

```typescript
/**
 * 관통력을 적용한 유효 방어력을 계산합니다.
 */
function calculateEffectiveArmor(
  targetArmor: number,
  percentPen: number,    // 0.3 = 30% 관통
  flatPen: number        // 고정 관통
): number {
  // 1. % 관통 먼저 적용
  const afterPercentPen = targetArmor * (1 - percentPen);
  // 2. 고정 관통 적용
  const afterFlatPen = afterPercentPen - flatPen;

  return Math.max(afterFlatPen, 0);
}
```

---

## DPS 계산

### 1. 기본 공격 DPS

```
기본 공격 DPS = 평균 기본 공격 데미지 × 공격 속도
```

```typescript
/**
 * 기본 공격 DPS를 계산합니다.
 */
function calculateBasicAttackDPS(
  stats: CalculatedStats,
  targetArmor: number = 50  // 기본 대상 방어력
): number {
  const avgDamage = calculateAverageBasicDamage(stats);
  const effectiveArmor = calculateEffectiveArmor(targetArmor, stats.armorPen ?? 0, 0);
  const actualDamage = applyArmorReduction(avgDamage, effectiveArmor);

  return actualDamage * stats.attackSpeed;
}
```

### 2. 스킬 DPS

```
스킬 DPS = (기본 데미지 + 스케일링) × 시전 횟수 / 전투 시간
시전 횟수 = 전투 시간 / 스킬 쿨타임
스킬 쿨타임 = 마나 / 초당 마나 획득량
```

```typescript
/**
 * 스킬 DPS를 계산합니다.
 */
function calculateAbilityDPS(
  champion: Champion,
  stats: CalculatedStats,
  starLevel: 1 | 2 | 3,
  fightDuration: number = 15  // 기본 전투 시간 15초
): number {
  const ability = champion.ability;
  const scalingIndex = starLevel - 1;

  // 1. 스킬 데미지 계산
  let abilityDamage = 0;
  for (const scaling of ability.scaling) {
    const baseDamage = scaling.base[scalingIndex];
    const bonusDamage = getScalingStat(stats, scaling.stat) * scaling.ratio;
    abilityDamage += baseDamage + bonusDamage;
  }

  // 2. 마나 회복 계산 (기본 공격당 10 마나)
  const manaPerSecond = stats.attackSpeed * 10;
  const castTime = champion.stats.mana / manaPerSecond;

  // 3. 전투 중 스킬 시전 횟수
  const castCount = Math.floor(fightDuration / castTime);

  // 4. DPS 계산
  return (abilityDamage * castCount) / fightDuration;
}

function getScalingStat(stats: CalculatedStats, stat: string): number {
  switch (stat) {
    case 'ap': return stats.abilityPower ?? 0;
    case 'ad': return stats.attackDamage;
    case 'health': return stats.health;
    default: return 0;
  }
}
```

### 3. 총 DPS

```typescript
/**
 * 총 DPS를 계산합니다.
 */
function calculateTotalDPS(
  champion: Champion,
  items: Item[],
  starLevel: 1 | 2 | 3,
  options?: {
    targetArmor?: number;
    targetMR?: number;
    fightDuration?: number;
  }
): DPSBreakdown {
  const stats = calculateFinalStats(champion, items, starLevel);

  const basicDPS = calculateBasicAttackDPS(stats, options?.targetArmor);
  const abilityDPS = calculateAbilityDPS(
    champion,
    stats,
    starLevel,
    options?.fightDuration
  );

  return {
    basicAttackDPS: basicDPS,
    abilityDPS: abilityDPS,
    totalDPS: basicDPS + abilityDPS,
  };
}
```

---

## 아이템 최적화 알고리즘

### 1. 브루트 포스 방식

모든 가능한 3아이템 조합을 계산하고 DPS가 가장 높은 조합 선택.

```typescript
// src/lib/simulator/optimizer.ts

/**
 * 주어진 챔피언에게 최적의 아이템 조합을 찾습니다.
 */
function findOptimalItems(
  champion: Champion,
  availableItems: Item[],
  starLevel: 1 | 2 | 3,
  maxItems: number = 3
): OptimizationResult {
  const combinations = generateCombinations(availableItems, maxItems);
  let bestResult: OptimizationResult | null = null;

  for (const items of combinations) {
    const dps = calculateTotalDPS(champion, items, starLevel);

    if (!bestResult || dps.totalDPS > bestResult.dps.totalDPS) {
      bestResult = {
        items,
        dps,
        stats: calculateFinalStats(champion, items, starLevel),
      };
    }
  }

  return bestResult!;
}

/**
 * n개를 선택하는 조합을 생성합니다.
 */
function generateCombinations<T>(arr: T[], n: number): T[][] {
  if (n === 0) return [[]];
  if (arr.length === 0) return [];

  const [first, ...rest] = arr;
  const withFirst = generateCombinations(rest, n - 1).map(c => [first, ...c]);
  const withoutFirst = generateCombinations(rest, n);

  return [...withFirst, ...withoutFirst];
}
```

### 2. 상위 N개 조합 반환

```typescript
/**
 * 상위 N개의 최적 아이템 조합을 반환합니다.
 */
function findTopNItemCombinations(
  champion: Champion,
  availableItems: Item[],
  starLevel: 1 | 2 | 3,
  topN: number = 5
): OptimizationResult[] {
  const combinations = generateCombinations(availableItems, 3);
  const results: OptimizationResult[] = [];

  for (const items of combinations) {
    const dps = calculateTotalDPS(champion, items, starLevel);
    results.push({
      items,
      dps,
      stats: calculateFinalStats(champion, items, starLevel),
    });
  }

  // DPS 내림차순 정렬
  results.sort((a, b) => b.dps.totalDPS - a.dps.totalDPS);

  return results.slice(0, topN);
}
```

---

## 특수 아이템 효과 처리

일부 아이템은 단순 스탯 증가가 아닌 특수 효과를 가집니다.

### 구현된 특수 효과

| 아이템 | 효과 | 구현 방식 |
|--------|------|----------|
| 거인의 결의 | 피격 시 체력 증가 | 전투 시작 시 예상 스택 적용 |
| 쇼진의 창 | 기본 공격 시 마나 추가 획득 | 마나 회복량에 반영 |
| 죽음의 검 | 킬/어시스트 시 공격력 증가 | 평균 스택으로 계산 |

```typescript
// src/lib/simulator/passiveEffects.ts

/**
 * 아이템 패시브 효과를 적용합니다.
 */
function applyPassiveEffects(
  stats: CalculatedStats,
  items: Item[],
  context: SimulationContext
): CalculatedStats {
  let modifiedStats = { ...stats };

  for (const item of items) {
    if (!item.passive) continue;

    switch (item.id) {
      case 'shojin':
        // 쇼진: 기본 공격당 추가 마나 5
        context.manaPerAttack += 5;
        break;

      case 'titans_resolve':
        // 거인의 결의: 예상 스택 25 (50% 전투)
        modifiedStats.attackDamage += 25 * 2;  // 2 AD per stack
        modifiedStats.armor += 25 * 2;
        break;

      case 'deathblade':
        // 죽음의 검: 예상 킬 2회
        modifiedStats.attackDamage += 2 * 15;
        break;
    }
  }

  return modifiedStats;
}
```

---

## 계산 정확도 참고

이 시뮬레이터의 계산은 다음과 같은 **가정**을 기반으로 합니다:

1. **전투 시간**: 기본 15초 (조정 가능)
2. **타겟 스탯**: 방어력 50, 마저 50 (조정 가능)
3. **스택형 아이템**: 평균값 사용
4. **CC 및 이동 시간**: 미반영
5. **시너지 효과**: 일부만 구현

실제 게임과 차이가 있을 수 있으며, 상대적 비교 용도로 사용하는 것을 권장합니다.

---

## 새로운 계산 로직 추가 시

1. 이 문서에 공식과 설명 추가
2. `src/lib/calculator/` 또는 `src/lib/simulator/`에 구현
3. 테스트 케이스 작성
4. `claude.md`의 구현 상태 업데이트
