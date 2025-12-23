// 월드룬 시뮬레이터 핵심 로직

import type {
  Champion,
  WorldRuneInput,
  WorldRuneResult,
  WorldRuneValidationResult,
  RegionCoverage
} from '@/types/simulator';
import { CHAMPIONS } from '@/data/champions';
import { REGIONS, REGION_THRESHOLDS, normalizeRegionName, isRegion, getRegionThreshold } from '@/data/regions';

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
  const availableRegions = REGIONS.filter(r => !input.excludedRegions.includes(r));
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

/** 최소 챔피언으로 지역 커버하기 (Greedy + 완전탐색 조합) */
function findMinimalChampions(
  targetRegions: string[],
  symbolCounts: Map<string, number>,
  availableChampions: Champion[],
  maxChampions: number
): { champions: Champion[]; coverages: RegionCoverage[] }[] {
  const results: { champions: Champion[]; coverages: RegionCoverage[] }[] = [];

  // 남은 필요 카운트 계산
  const requiredCounts = calculateRequiredCounts(targetRegions, symbolCounts);
  const totalRequired = Array.from(requiredCounts.values()).reduce((a, b) => a + b, 0);

  // 상징만으로 이미 모든 지역 활성화 가능
  if (totalRequired === 0) {
    const { coverages } = calculateCoverage([], targetRegions, symbolCounts);
    return [{ champions: [], coverages }];
  }

  // 대상 지역을 커버할 수 있는 챔피언만 필터링
  const relevantChampions = availableChampions.filter(c => {
    const regions = getChampionRegions(c);
    return regions.some(r =>
      targetRegions.some(tr => normalizeRegionName(tr) === normalizeRegionName(r))
    );
  });

  // 멀티 지역 챔피언 우선 정렬 (더 많은 지역 커버 + 높은 코스트)
  const sortedChampions = [...relevantChampions].sort((a, b) => {
    const aRegions = getChampionRegions(a).filter(r =>
      targetRegions.some(tr => normalizeRegionName(tr) === normalizeRegionName(r))
    ).length;
    const bRegions = getChampionRegions(b).filter(r =>
      targetRegions.some(tr => normalizeRegionName(tr) === normalizeRegionName(r))
    ).length;

    if (bRegions !== aRegions) return bRegions - aRegions;
    return b.cost - a.cost;
  });

  // 최소 필요 챔피언 수 추정 (하한)
  const minPossible = Math.max(1, Math.ceil(totalRequired / 2)); // 멀티지역 고려

  // 챔피언 수를 늘려가며 탐색
  for (let count = minPossible; count <= Math.min(maxChampions, sortedChampions.length); count++) {
    const candidates = sortedChampions.slice(0, Math.min(20, sortedChampions.length)); // 상위 20개만

    for (const combination of generateCombinations(candidates, count)) {
      const { coverages, allCovered } = calculateCoverage(
        combination,
        targetRegions,
        symbolCounts
      );

      if (allCovered) {
        results.push({ champions: combination, coverages });

        // 같은 챔피언 수에서 충분히 찾으면 다음 수로
        if (results.length >= 10) break;
      }
    }

    // 결과를 찾았으면 더 큰 조합은 탐색하지 않음
    if (results.length > 0) break;
  }

  return results;
}

/** 메인 계산 함수 */
export function calculate(input: WorldRuneInput): WorldRuneResult[] {
  const { level, regionSymbols, excludedRegions, excludedChampions, maxCost } = input;
  const results: WorldRuneResult[] = [];

  // 1. 필터링 적용
  const availableRegions = REGIONS.filter(r => !excludedRegions.includes(r));
  const availableChampions = CHAMPIONS.filter(c =>
    c.cost <= maxCost &&
    !excludedChampions.includes(c.name)
  );

  // 2. 모든 4개 지역 조합 생성
  const regionCombinations = Array.from(generateCombinations(availableRegions, 4));

  // 3. 각 조합에 대해 최소 챔피언 찾기
  for (const targetRegions of regionCombinations) {
    // 상징 카운트 계산
    const symbolCounts = countSymbolsByRegion(regionSymbols, targetRegions);

    // 최소 챔피언 조합 찾기
    const minResults = findMinimalChampions(
      targetRegions,
      symbolCounts,
      availableChampions,
      level
    );

    for (const { champions, coverages } of minResults) {
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
