/**
 * 같은 메인 아이템 기준 비교 분석
 *
 * 목적: 같은 메인 아이템에서 완성+완성 vs 각각활용 비교
 * 예: 무한의 대검 + 내셔의 이빨 vs 무한의 대검 + [벨트로 만든 템] + [활로 만든 템]
 *
 * 사용법: node scripts/analyze-same-main-item.js
 */

const BASE_URL = 'http://localhost:3000';

// 8개 조합 아이템
const COMPONENTS = [
  'BFSword', 'RecurveBow', 'ChainVest', 'NegatronCloak',
  'NeedlesslyLargeRod', 'TearOfTheGoddess', 'GiantsBelt', 'SparringGloves',
];

const COMPONENT_NAMES = {
  'BFSword': '대검',
  'RecurveBow': '활',
  'ChainVest': '갑옷',
  'NegatronCloak': '망토',
  'NeedlesslyLargeRod': '지팡이',
  'TearOfTheGoddess': '눈물',
  'GiantsBelt': '벨트',
  'SparringGloves': '장갑',
};

// 4개 조합 생성 (중복 허용)
function generate4Combinations(components) {
  const combinations = [];
  const n = components.length;

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      for (let k = j; k < n; k++) {
        for (let l = k; l < n; l++) {
          combinations.push([
            components[i],
            components[j],
            components[k],
            components[l]
          ]);
        }
      }
    }
  }

  return combinations;
}

// API 호출
async function fetchAnalysis(components) {
  const response = await fetch(`${BASE_URL}/api/stats/item-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ components }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// 메인 분석 함수
async function runAnalysis() {
  console.log('========================================');
  console.log('같은 메인 아이템 기준 비교 분석');
  console.log('========================================\n');

  const all4Combos = generate4Combinations(COMPONENTS);
  console.log(`총 ${all4Combos.length}개의 4조합 케이스 분석\n`);

  // 메인 아이템별로 결과 그룹화
  // key: mainItemName
  // value: { pair: [...], single: [...] }
  const byMainItem = {};

  let processed = 0;

  for (const combo of all4Combos) {
    try {
      const result = await fetchAnalysis(combo);

      if (result.combinations) {
        for (const comb of result.combinations) {
          if (comb.gameCount === 0) continue;

          const mainItem = comb.mainItemName;
          const type = comb.debug?.comparisonType;

          if (!byMainItem[mainItem]) {
            byMainItem[mainItem] = { pair: [], single: [] };
          }

          const entry = {
            combo: combo.map(c => COMPONENT_NAMES[c]).join('+'),
            secondItem: comb.secondItemName || null,
            remainingComponents: comb.remainingComponentNames?.join('+') || '',
            avgPlacement: comb.avgPlacement,
            topFourRate: comb.topFourRate,
            gameCount: comb.gameCount,
          };

          if (type === 'pair') {
            byMainItem[mainItem].pair.push(entry);
          } else if (type === 'single') {
            byMainItem[mainItem].single.push(entry);
          }
        }
      }

      processed++;
      if (processed % 50 === 0) {
        console.log(`진행: ${processed}/${all4Combos.length}`);
      }
    } catch (err) {
      // 에러 무시
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n========================================');
  console.log('메인 아이템별 비교');
  console.log('========================================\n');

  // 각 메인 아이템별로 pair vs single 평균 비교
  const comparisons = [];

  for (const [mainItem, data] of Object.entries(byMainItem)) {
    if (data.pair.length === 0 || data.single.length === 0) continue;

    // pair 평균
    const pairTotalGames = data.pair.reduce((sum, r) => sum + r.gameCount, 0);
    const pairWeightedSum = data.pair.reduce((sum, r) => sum + r.avgPlacement * r.gameCount, 0);
    const pairAvg = pairWeightedSum / pairTotalGames;

    // single 평균
    const singleTotalGames = data.single.reduce((sum, r) => sum + r.gameCount, 0);
    const singleWeightedSum = data.single.reduce((sum, r) => sum + r.avgPlacement * r.gameCount, 0);
    const singleAvg = singleWeightedSum / singleTotalGames;

    const diff = pairAvg - singleAvg;

    comparisons.push({
      mainItem,
      pairAvg: pairAvg.toFixed(2),
      pairGames: pairTotalGames,
      pairCases: data.pair.length,
      singleAvg: singleAvg.toFixed(2),
      singleGames: singleTotalGames,
      singleCases: data.single.length,
      diff: diff.toFixed(2),
      winner: diff < 0 ? '완성+완성' : '각각활용',
    });
  }

  // diff 기준 정렬 (완성+완성이 더 좋은 순)
  comparisons.sort((a, b) => parseFloat(a.diff) - parseFloat(b.diff));

  // 결과 출력
  console.log('메인아이템 | 완성+완성 | 각각활용 | 차이 | 승자');
  console.log('---------|----------|---------|------|-----');

  for (const c of comparisons) {
    console.log(
      `${c.mainItem.padEnd(12)} | ${c.pairAvg}등 (${c.pairGames}) | ${c.singleAvg}등 (${c.singleGames}) | ${c.diff}등 | ${c.winner}`
    );
  }

  // 통계 요약
  const pairWins = comparisons.filter(c => c.winner === '완성+완성').length;
  const singleWins = comparisons.filter(c => c.winner === '각각활용').length;

  console.log('\n========================================');
  console.log('요약');
  console.log('========================================\n');

  console.log(`비교 가능한 메인 아이템: ${comparisons.length}개`);
  console.log(`완성+완성 승리: ${pairWins}개 (${(pairWins/comparisons.length*100).toFixed(1)}%)`);
  console.log(`각각활용 승리: ${singleWins}개 (${(singleWins/comparisons.length*100).toFixed(1)}%)`);

  // 전체 가중 평균
  const totalPairGames = comparisons.reduce((sum, c) => sum + c.pairGames, 0);
  const totalPairWeighted = comparisons.reduce((sum, c) => sum + parseFloat(c.pairAvg) * c.pairGames, 0);
  const overallPairAvg = totalPairWeighted / totalPairGames;

  const totalSingleGames = comparisons.reduce((sum, c) => sum + c.singleGames, 0);
  const totalSingleWeighted = comparisons.reduce((sum, c) => sum + parseFloat(c.singleAvg) * c.singleGames, 0);
  const overallSingleAvg = totalSingleWeighted / totalSingleGames;

  console.log(`\n전체 가중 평균:`);
  console.log(`  완성+완성: ${overallPairAvg.toFixed(3)}등 (${totalPairGames.toLocaleString()}게임)`);
  console.log(`  각각활용: ${overallSingleAvg.toFixed(3)}등 (${totalSingleGames.toLocaleString()}게임)`);
  console.log(`  차이: ${(overallPairAvg - overallSingleAvg).toFixed(3)}등`);

  // 가장 차이가 큰 케이스
  console.log('\n========================================');
  console.log('완성+완성이 압도적으로 좋은 아이템 (Top 5)');
  console.log('========================================\n');

  for (let i = 0; i < Math.min(5, comparisons.length); i++) {
    const c = comparisons[i];
    console.log(`${i+1}. ${c.mainItem}: 완성+완성 ${c.pairAvg}등 vs 각각활용 ${c.singleAvg}등 (차이: ${c.diff}등)`);
  }

  console.log('\n========================================');
  console.log('각각활용이 압도적으로 좋은 아이템 (Top 5)');
  console.log('========================================\n');

  const reversed = [...comparisons].reverse();
  for (let i = 0; i < Math.min(5, reversed.length); i++) {
    const c = reversed[i];
    console.log(`${i+1}. ${c.mainItem}: 완성+완성 ${c.pairAvg}등 vs 각각활용 ${c.singleAvg}등 (차이: ${c.diff}등)`);
  }
}

runAnalysis().catch(console.error);
