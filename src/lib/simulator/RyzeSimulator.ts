// 라이즈 시뮬레이터 핵심 로직
// 목표: 라이즈의 지역 시너지를 최대한 많이 활성화하는 덱 찾기

import type {
  Champion,
  RyzeSimulatorInput,
  RyzeSimulatorResult,
  RyzeValidationResult,
  ActiveRegion
} from '@/types/simulator';
import { CHAMPIONS } from '@/data/champions';
import { CALCULABLE_REGIONS, REGION_THRESHOLDS, normalizeRegionName, isRegion, getRegionThreshold } from '@/data/regions';
import { UNLOCK_CHAMPIONS } from '@/data/unlockChampions';

// 라이즈를 제외한 최대 배치 칸수 (레벨 9 기준)
const MAX_SLOTS = 8;

/** 입력 검증 */
export function validateInput(input: RyzeSimulatorInput): RyzeValidationResult {
  if (input.regionSymbols.length > 4) {
    return { valid: false, error: '지역 상징은 최대 4개까지 선택 가능합니다.' };
  }

  if (input.ownedChampions.length > MAX_SLOTS) {
    return { valid: false, error: `보유 챔피언은 최대 ${MAX_SLOTS}명까지 선택 가능합니다.` };
  }

  // 라이즈 해금 조건: 최소 4지역 필요
  const availableRegions = CALCULABLE_REGIONS.filter(r => !input.excludedRegions.includes(r));
  if (availableRegions.length < 4) {
    return { valid: false, error: '제외 후 남은 지역이 4개 미만입니다. 라이즈 해금이 불가능합니다.' };
  }

  return { valid: true };
}

/** 챔피언의 지역 특성만 추출 */
function getChampionRegions(champion: Champion): string[] {
  return champion.traits.filter(t => isRegion(t));
}

/** 지역별 상징 카운트 계산 */
function countSymbolsByRegion(symbols: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const symbol of symbols) {
    const normalized = normalizeRegionName(symbol);
    for (const region of CALCULABLE_REGIONS) {
      if (normalizeRegionName(region) === normalized) {
        counts.set(region, (counts.get(region) || 0) + 1);
        break;
      }
    }
  }

  return counts;
}

/** 챔피언 목록 + 상징으로 지역별 카운트 계산 */
function calculateRegionCounts(
  champions: Champion[],
  symbolCounts: Map<string, number>
): Map<string, number> {
  const counts = new Map<string, number>();

  // 상징 카운트 복사
  for (const [region, count] of symbolCounts) {
    counts.set(region, count);
  }

  // 챔피언 지역 카운트
  for (const champion of champions) {
    const regions = getChampionRegions(champion);
    for (const region of regions) {
      const normalized = normalizeRegionName(region);
      for (const calcRegion of CALCULABLE_REGIONS) {
        if (normalizeRegionName(calcRegion) === normalized) {
          counts.set(calcRegion, (counts.get(calcRegion) || 0) + 1);
          break;
        }
      }
    }
  }

  return counts;
}

/** 활성화된 지역 목록 계산 */
function calculateActiveRegions(
  regionCounts: Map<string, number>,
  excludedRegions: string[]
): ActiveRegion[] {
  const activeRegions: ActiveRegion[] = [];

  for (const region of CALCULABLE_REGIONS) {
    if (excludedRegions.includes(region)) continue;

    const count = regionCounts.get(region) || 0;
    const threshold = getRegionThreshold(region);
    const isActive = count >= threshold;

    if (count > 0 || isActive) {
      activeRegions.push({
        name: region,
        count,
        threshold,
        isActive
      });
    }
  }

  // 활성화된 지역 먼저, 그 다음 카운트 높은 순
  activeRegions.sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return b.count - a.count;
  });

  return activeRegions;
}

/** 해금 필요 챔피언 추출 */
function getUnlockRequired(champions: Champion[]): string[] {
  return champions
    .filter(c => UNLOCK_CHAMPIONS.includes(c.name))
    .map(c => c.name);
}

/** 챔피언 점수 계산 (지역 기여도) */
function calculateChampionScore(
  champion: Champion,
  currentCounts: Map<string, number>,
  excludedRegions: string[]
): number {
  const regions = getChampionRegions(champion);
  let score = 0;

  for (const region of regions) {
    if (excludedRegions.includes(region)) continue;

    const normalized = normalizeRegionName(region);
    for (const calcRegion of CALCULABLE_REGIONS) {
      if (normalizeRegionName(calcRegion) === normalized) {
        const current = currentCounts.get(calcRegion) || 0;
        const threshold = getRegionThreshold(calcRegion);

        if (current < threshold) {
          // 활성화에 가까울수록 높은 점수
          if (current + 1 >= threshold) {
            score += 100; // 활성화 달성
          } else {
            score += 10; // 진전
          }
        } else {
          // 이미 활성화된 지역에 기여 (낮은 점수)
          score += 1;
        }
        break;
      }
    }
  }

  return score;
}

/** Greedy 알고리즘으로 최적 조합 찾기 */
function findOptimalCombination(
  symbolCounts: Map<string, number>,
  availableChampions: Champion[],
  ownedChampionObjects: Champion[],
  excludedRegions: string[]
): { champions: Champion[]; regionCounts: Map<string, number> } {
  const selected: Champion[] = [...ownedChampionObjects];
  let currentCounts = calculateRegionCounts(selected, symbolCounts);

  const remainingSlots = MAX_SLOTS - ownedChampionObjects.length;

  // Greedy: 가장 높은 점수의 챔피언 선택
  for (let i = 0; i < remainingSlots; i++) {
    let bestChampion: Champion | null = null;
    let bestScore = -1;

    for (const champion of availableChampions) {
      if (selected.some(s => s.name === champion.name)) continue;

      const score = calculateChampionScore(champion, currentCounts, excludedRegions);

      // 같은 점수면 코스트 높은 것 선호
      if (score > bestScore || (score === bestScore && bestChampion && champion.cost > bestChampion.cost)) {
        bestChampion = champion;
        bestScore = score;
      }
    }

    if (!bestChampion || bestScore <= 0) break;

    selected.push(bestChampion);
    currentCounts = calculateRegionCounts(selected, symbolCounts);
  }

  return { champions: selected, regionCounts: currentCounts };
}

/** 다양한 조합 탐색 (상위 N개) */
function exploreVariations(
  symbolCounts: Map<string, number>,
  availableChampions: Champion[],
  ownedChampionObjects: Champion[],
  excludedRegions: string[],
  maxResults: number = 10
): RyzeSimulatorResult[] {
  const results: RyzeSimulatorResult[] = [];
  const seen = new Set<string>();

  // 1. 기본 Greedy 결과
  const baseResult = findOptimalCombination(
    symbolCounts,
    availableChampions,
    ownedChampionObjects,
    excludedRegions
  );

  const addResult = (champions: Champion[], regionCounts: Map<string, number>) => {
    const key = champions.map(c => c.name).sort().join(',');
    if (seen.has(key)) return;
    seen.add(key);

    const activeRegions = calculateActiveRegions(regionCounts, excludedRegions);
    const regionCount = activeRegions.filter(r => r.isActive).length;

    // 최소 4지역 (라이즈 해금 조건)
    if (regionCount < 4) return;

    results.push({
      champions,
      activeRegions,
      regionCount,
      totalCost: champions.reduce((sum, c) => sum + c.cost, 0),
      championCount: champions.length,
      unlockRequired: getUnlockRequired(champions),
      ownedChampionNames: ownedChampionObjects.map(c => c.name)
    });
  };

  addResult(baseResult.champions, baseResult.regionCounts);

  // 2. 다양한 시작점으로 변형 탐색
  // 지역별로 핵심 챔피언 그룹화
  const regionGroups = new Map<string, Champion[]>();
  for (const region of CALCULABLE_REGIONS) {
    if (excludedRegions.includes(region)) continue;
    const champs = availableChampions.filter(c => {
      const regions = getChampionRegions(c);
      return regions.some(r => normalizeRegionName(r) === normalizeRegionName(region));
    });
    regionGroups.set(region, champs);
  }

  // 각 지역의 핵심 챔피언을 시작점으로 탐색
  for (const [region, champs] of regionGroups) {
    for (const startChamp of champs.slice(0, 3)) { // 각 지역 상위 3개만
      if (ownedChampionObjects.some(o => o.name === startChamp.name)) continue;

      const startSelected = [...ownedChampionObjects, startChamp];
      let currentCounts = calculateRegionCounts(startSelected, symbolCounts);
      const selected = [...startSelected];

      const remainingSlots = MAX_SLOTS - selected.length;

      for (let i = 0; i < remainingSlots; i++) {
        let bestChampion: Champion | null = null;
        let bestScore = -1;

        for (const champion of availableChampions) {
          if (selected.some(s => s.name === champion.name)) continue;

          const score = calculateChampionScore(champion, currentCounts, excludedRegions);

          if (score > bestScore || (score === bestScore && bestChampion && champion.cost > bestChampion.cost)) {
            bestChampion = champion;
            bestScore = score;
          }
        }

        if (!bestChampion || bestScore <= 0) break;

        selected.push(bestChampion);
        currentCounts = calculateRegionCounts(selected, symbolCounts);
      }

      addResult(selected, currentCounts);

      if (results.length >= maxResults * 3) break;
    }

    if (results.length >= maxResults * 3) break;
  }

  // 3. 정렬: 지역 수 ↓ → 챔피언 수 ↑ → 코스트 ↓
  results.sort((a, b) => {
    if (a.regionCount !== b.regionCount) return b.regionCount - a.regionCount;
    if (a.championCount !== b.championCount) return a.championCount - b.championCount;
    return b.totalCost - a.totalCost;
  });

  return results.slice(0, maxResults);
}

/** 메인 계산 함수 */
export function calculate(input: RyzeSimulatorInput): RyzeSimulatorResult[] {
  const { regionSymbols, ownedChampions, excludedRegions, excludedChampions } = input;

  // 1. 상징 카운트 계산
  const symbolCounts = countSymbolsByRegion(regionSymbols);

  // 2. 사용 가능한 챔피언 필터링
  // 라이즈(7코), 내셔 남작(7코), 브록(7코), 사일러스(7코), 자헨(7코), 아우렐리온 솔(7코) 등 7코 제외
  const availableChampions = CHAMPIONS.filter(c =>
    c.cost <= 5 &&
    c.name !== '라이즈' &&
    !excludedChampions.includes(c.name) &&
    !ownedChampions.includes(c.name)
  );

  // 3. 보유 챔피언 객체 배열 생성
  const ownedChampionObjects = ownedChampions
    .map(name => CHAMPIONS.find(c => c.name === name))
    .filter((c): c is Champion => c !== undefined);

  // 4. 다양한 조합 탐색
  const results = exploreVariations(
    symbolCounts,
    availableChampions,
    ownedChampionObjects,
    excludedRegions,
    10
  );

  return results;
}
