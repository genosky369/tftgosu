// 브론즈 시뮬레이터 핵심 로직

import type { Champion, SimulatorInput, SimulatorResult, ActiveSynergy, ValidationResult } from '@/types/simulator';
import { CHAMPIONS, getAllSynergies } from '@/data/champions';
import { BRONZE_THRESHOLDS, SYNERGY_NAMES } from '@/data/bronzeSynergies';
import { normalizeSymbolName } from '@/data/symbols';

/** 입력 검증 */
export function validateInput(input: SimulatorInput): ValidationResult {
  if (input.level < 6 || input.level > 10) {
    return { valid: false, error: '레벨은 6~10 사이여야 합니다.' };
  }
  if (input.symbols.length > 7) {
    return { valid: false, error: '상징은 최대 7개까지 선택 가능합니다.' };
  }
  return { valid: true };
}

/** 시너지 이름 정규화 (띄어쓰기 무시 비교용) */
function normalizeTraitName(name: string): string {
  return name.replace(/\s/g, '').toLowerCase();
}

/** 챔피언 조합의 시너지 카운트 계산 */
function countSynergies(champions: Champion[], symbols: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  // 챔피언들의 시너지 카운트
  for (const champion of champions) {
    const synergies = getAllSynergies(champion);
    for (const synergy of synergies) {
      const normalized = normalizeTraitName(synergy);
      const current = counts.get(normalized) || 0;
      counts.set(normalized, current + 1);
    }
  }

  // 상징 추가
  for (const symbol of symbols) {
    const normalized = normalizeSymbolName(symbol);
    const current = counts.get(normalized) || 0;
    counts.set(normalized, current + 1);
  }

  return counts;
}

/** 브론즈 시너지 활성화 여부 체크 */
function getActiveBronzeSynergies(synergyCounts: Map<string, number>): ActiveSynergy[] {
  const activeSynergies: ActiveSynergy[] = [];

  for (const synergyName of SYNERGY_NAMES) {
    const normalized = normalizeTraitName(synergyName);
    const current = synergyCounts.get(normalized) || 0;
    const required = BRONZE_THRESHOLDS.get(synergyName) || 999;

    if (current > 0) {
      activeSynergies.push({
        name: synergyName,
        current,
        required,
        isActive: current >= required,
      });
    }
  }

  return activeSynergies;
}

/** 브론즈 시너지 개수 계산 */
function countBronzeSynergies(synergyCounts: Map<string, number>): number {
  let count = 0;

  for (const synergyName of SYNERGY_NAMES) {
    const normalized = normalizeTraitName(synergyName);
    const current = synergyCounts.get(normalized) || 0;
    const required = BRONZE_THRESHOLDS.get(synergyName) || 999;

    if (current >= required) {
      count++;
    }
  }

  return count;
}

/** 총 코스트 계산 */
function calculateTotalCost(champions: Champion[]): number {
  return champions.reduce((sum, c) => sum + c.cost, 0);
}

/** 챔피언별 브론즈 기여도 점수 계산 */
function calculateChampionScore(champion: Champion): number {
  const synergies = getAllSynergies(champion);
  let score = 0;

  for (const synergy of synergies) {
    // 브론즈 시너지에 포함되는지 확인
    if (SYNERGY_NAMES.some(s => normalizeTraitName(s) === normalizeTraitName(synergy))) {
      const threshold = BRONZE_THRESHOLDS.get(synergy) || 999;
      // 낮은 threshold일수록 높은 점수 (달성하기 쉬움)
      score += 10 / threshold;
    }
  }

  // 시너지 개수 보너스
  score += synergies.length * 0.5;

  // 높은 코스트 보너스 (같은 브론즈면 비싼 챔피언 선호)
  score += champion.cost * 0.1;

  return score;
}

/** 조합 생성 (Greedy 알고리즘) */
function* generateCombinations(
  candidates: Champion[],
  size: number
): Generator<Champion[]> {
  // 재귀적 조합 생성
  function* combine(
    start: number,
    current: Champion[]
  ): Generator<Champion[]> {
    if (current.length === size) {
      yield [...current];
      return;
    }

    for (let i = start; i < candidates.length; i++) {
      current.push(candidates[i]);
      yield* combine(i + 1, current);
      current.pop();
    }
  }

  yield* combine(0, []);
}

/** 메인 계산 함수 */
export function calculate(input: SimulatorInput): SimulatorResult[] {
  const { level, symbols, excludedChampions = [] } = input;
  const results: SimulatorResult[] = [];

  // 1. 챔피언별 점수 계산 및 정렬 (제외된 챔피언 필터링)
  const scoredChampions = CHAMPIONS
    .filter(c => c.cost <= 5) // 7코스트 제외 (특수 유닛)
    .filter(c => !excludedChampions.includes(c.name)) // 제외된 챔피언 필터링
    .map(c => ({ champion: c, score: calculateChampionScore(c) }))
    .sort((a, b) => b.score - a.score);

  // 2. 상위 후보군 선택 (성능을 위해 제한)
  const candidateCount = Math.min(35, scoredChampions.length);
  const candidates = scoredChampions.slice(0, candidateCount).map(s => s.champion);

  // 3. 조합 생성 및 평가
  let evaluatedCount = 0;
  const maxEvaluations = 50000; // 최대 평가 횟수

  for (const combination of generateCombinations(candidates, level)) {
    if (evaluatedCount >= maxEvaluations) break;
    evaluatedCount++;

    const synergyCounts = countSynergies(combination, symbols);
    const bronzeCount = countBronzeSynergies(synergyCounts);
    const totalCost = calculateTotalCost(combination);

    results.push({
      champions: combination,
      activeSynergies: getActiveBronzeSynergies(synergyCounts),
      bronzeCount,
      totalCost,
    });
  }

  // 4. 결과 정렬: 브론즈 개수 내림차순, 동일 시 코스트 내림차순
  results.sort((a, b) => {
    if (b.bronzeCount !== a.bronzeCount) {
      return b.bronzeCount - a.bronzeCount;
    }
    return b.totalCost - a.totalCost;
  });

  // 5. 상위 결과만 반환 (중복 제거)
  const uniqueResults = deduplicateResults(results);
  return uniqueResults.slice(0, 50);
}

/** 결과 중복 제거 (같은 챔피언 구성 제거) */
function deduplicateResults(results: SimulatorResult[]): SimulatorResult[] {
  const seen = new Set<string>();

  return results.filter(r => {
    const key = r.champions.map(c => c.name).sort().join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
