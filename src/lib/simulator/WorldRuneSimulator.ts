// 월드룬 시뮬레이터 핵심 로직

import type {
  Champion,
  WorldRuneInput,
  WorldRuneResult,
  WorldRuneValidationResult,
  RegionCoverage
} from '@/types/simulator';
import { CHAMPIONS } from '@/data/champions';
import { REGION_SYMBOLS, CALCULABLE_REGIONS, REGION_THRESHOLDS, normalizeRegionName, isRegion, getRegionThreshold } from '@/data/regions';

/** 입력 검증 */
export function validateInput(input: WorldRuneInput): WorldRuneValidationResult {
  if (input.level < 6 || input.level > 10) {
    return { valid: false, error: '레벨은 6~10 사이여야 합니다.' };
  }
  if (input.regionSymbols.length > 4) {
    return { valid: false, error: '지역 상징은 최대 4개까지 선택 가능합니다.' };
  }
  if (input.maxCost < 1 || input.maxCost > 5) {
    return { valid: false, error: '최대 코스트는 1~5 사이여야 합니다.' };
  }

  // 제외 후 남은 지역이 4개 이상인지 확인
  const availableRegions = CALCULABLE_REGIONS.filter(r => !input.excludedRegions.includes(r));
  if (availableRegions.length < 4) {
    return { valid: false, error: '제외 후 남은 지역이 4개 미만입니다.' };
  }

  return { valid: true };
}

/** 챔피언의 지역 특성만 추출 */
function getChampionRegions(champion: Champion): string[] {
  return champion.traits.filter(t => isRegion(t));
}

/** n개 중 r개 조합 생성 */
function* generateCombinations<T>(arr: T[], r: number): Generator<T[]> {
  function* combine(start: number, current: T[]): Generator<T[]> {
    if (current.length === r) {
      yield [...current];
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      yield* combine(i + 1, current);
      current.pop();
    }
  }
  yield* combine(0, []);
}

/** 상징 카운트 계산 (지역별) */
function countSymbolsByRegion(symbols: string[], targetRegions: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const symbol of symbols) {
    const normalized = normalizeRegionName(symbol);
    // 대상 지역에 포함되는 상징만 카운트
    for (const region of targetRegions) {
      if (normalizeRegionName(region) === normalized) {
        counts.set(region, (counts.get(region) || 0) + 1);
        break;
      }
    }
  }

  return counts;
}

/** 지역별 필요 카운트 계산 (상징 적용 후) */
function calculateRequiredCounts(
  targetRegions: string[],
  symbolCounts: Map<string, number>
): Map<string, number> {
  const required = new Map<string, number>();

  for (const region of targetRegions) {
    const threshold = getRegionThreshold(region);
    const symbolCount = symbolCounts.get(region) || 0;
    const needed = Math.max(0, threshold - symbolCount);
    required.set(region, needed);
  }

  return required;
}

/** 챔피언 조합으로 지역 커버 가능 여부 확인 및 커버리지 계산 */
function calculateCoverage(
  champions: Champion[],
  targetRegions: string[],
  symbolCounts: Map<string, number>
): { coverages: RegionCoverage[]; allCovered: boolean } {
  const coverages: RegionCoverage[] = [];
  let allCovered = true;

  for (const region of targetRegions) {
    const threshold = getRegionThreshold(region);
    const contributors: RegionCoverage['contributors'] = [];

    // 상징 기여
    const symbolCount = symbolCounts.get(region) || 0;
    for (let i = 0; i < symbolCount; i++) {
      contributors.push({ type: 'symbol', name: region });
    }

    // 챔피언 기여
    for (const champion of champions) {
      const championRegions = getChampionRegions(champion);
      if (championRegions.some(r => normalizeRegionName(r) === normalizeRegionName(region))) {
        contributors.push({ type: 'champion', name: champion.name });
      }
    }

    const current = contributors.length;
    const isActive = current >= threshold;

    if (!isActive) {
      allCovered = false;
    }

    coverages.push({
      region,
      required: threshold,
      current,
      isActive,
      contributors
    });
  }

  return { coverages, allCovered };
}

/** 순수 Greedy로 최소 챔피언 찾기 (빠름) */
function findMinimalChampionsGreedy(
  targetRegions: string[],
  symbolCounts: Map<string, number>,
  availableChampions: Champion[],
  maxChampions: number
): { champions: Champion[]; coverages: RegionCoverage[] } | null {
  // 남은 필요 카운트 계산
  const requiredCounts = calculateRequiredCounts(targetRegions, symbolCounts);

  // 상징만으로 이미 모든 지역 활성화 가능
  const totalRequired = Array.from(requiredCounts.values()).reduce((a, b) => a + b, 0);
  if (totalRequired === 0) {
    const { coverages } = calculateCoverage([], targetRegions, symbolCounts);
    return { champions: [], coverages };
  }

  // 현재 지역별 카운트 (상징 포함)
  const currentCounts = new Map<string, number>();
  for (const region of targetRegions) {
    currentCounts.set(region, symbolCounts.get(region) || 0);
  }

  const selected: Champion[] = [];

  // Greedy: 가장 많은 "부족한 지역"을 채우는 챔피언 선택
  while (selected.length < maxChampions) {
    // 아직 활성화 안 된 지역 확인
    const unactivatedRegions = targetRegions.filter(r => {
      const current = currentCounts.get(r) || 0;
      const threshold = getRegionThreshold(r);
      return current < threshold;
    });

    if (unactivatedRegions.length === 0) break; // 모든 지역 활성화됨

    // 가장 좋은 챔피언 찾기
    let bestChampion: Champion | null = null;
    let bestScore = 0;

    for (const champion of availableChampions) {
      if (selected.some(s => s.name === champion.name)) continue;

      const championRegions = getChampionRegions(champion);
      let score = 0;

      for (const region of unactivatedRegions) {
        if (championRegions.some(cr => normalizeRegionName(cr) === normalizeRegionName(region))) {
          const current = currentCounts.get(region) || 0;
          const threshold = getRegionThreshold(region);
          // 활성화에 가까울수록 높은 점수
          score += (threshold - current <= 1) ? 10 : 5;
        }
      }

      // 같은 점수면 코스트 높은 것 선호
      if (score > bestScore || (score === bestScore && bestChampion && champion.cost > bestChampion.cost)) {
        bestChampion = champion;
        bestScore = score;
      }
    }

    if (!bestChampion || bestScore === 0) break; // 더 이상 진전 불가

    selected.push(bestChampion);

    // 카운트 업데이트
    const championRegions = getChampionRegions(bestChampion);
    for (const region of targetRegions) {
      if (championRegions.some(cr => normalizeRegionName(cr) === normalizeRegionName(region))) {
        currentCounts.set(region, (currentCounts.get(region) || 0) + 1);
      }
    }
  }

  // 결과 검증
  const { coverages, allCovered } = calculateCoverage(selected, targetRegions, symbolCounts);

  if (allCovered) {
    return { champions: selected, coverages };
  }

  return null;
}

/** 메인 계산 함수 */
export function calculate(input: WorldRuneInput): WorldRuneResult[] {
  const { level, regionSymbols, excludedRegions, excludedChampions, maxCost } = input;
  const results: WorldRuneResult[] = [];

  // 1. 필터링 적용
  const availableRegions = CALCULABLE_REGIONS.filter(r => !excludedRegions.includes(r));
  const availableChampions = CHAMPIONS.filter(c =>
    c.cost <= maxCost &&
    !excludedChampions.includes(c.name)
  );

  // 2. 모든 4개 지역 조합 생성
  const regionCombinations = Array.from(generateCombinations(availableRegions, 4));

  // 3. 각 조합에 대해 최소 챔피언 찾기 (Greedy 알고리즘)
  for (const targetRegions of regionCombinations) {
    // 상징 카운트 계산
    const symbolCounts = countSymbolsByRegion(regionSymbols, targetRegions);

    // Greedy 알고리즘으로 최소 챔피언 조합 찾기
    const result = findMinimalChampionsGreedy(
      targetRegions,
      symbolCounts,
      availableChampions,
      level
    );

    if (result) {
      const { champions, coverages } = result;
      const totalCost = champions.reduce((sum, c) => sum + c.cost, 0);

      results.push({
        targetRegions,
        champions,
        championCount: champions.length,
        totalCost,
        regionCoverages: coverages,
        remainingSlots: level - champions.length
      });
    }
  }

  // 4. 결과 정렬: 기물 수 오름차순, 코스트 내림차순
  results.sort((a, b) => {
    if (a.championCount !== b.championCount) {
      return a.championCount - b.championCount;
    }
    return b.totalCost - a.totalCost;
  });

  // 5. 중복 제거 및 상위 결과 반환
  return deduplicateResults(results).slice(0, 50);
}

/** 결과 중복 제거 */
function deduplicateResults(results: WorldRuneResult[]): WorldRuneResult[] {
  const seen = new Set<string>();

  return results.filter(r => {
    // 지역 조합 + 챔피언 조합으로 키 생성
    const regionKey = r.targetRegions.sort().join(',');
    const championKey = r.champions.map(c => c.name).sort().join(',');
    const key = `${regionKey}|${championKey}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
