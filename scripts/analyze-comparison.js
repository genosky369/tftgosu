/**
 * 아이템 분석 로직 검증 스크립트
 *
 * 목적: 모든 4개 조합 케이스에서 "완성+완성" vs "각각활용"의 평균 등수 비교
 *
 * 사용법: node scripts/analyze-comparison.js
 */

const BASE_URL = 'http://localhost:3000';

// 8개 조합 아이템 (뒤집개 제외)
const COMPONENTS = [
  'BFSword',        // 대검
  'RecurveBow',     // 활
  'ChainVest',      // 갑옷
  'NegatronCloak',  // 망토
  'NeedlesslyLargeRod', // 지팡이
  'TearOfTheGoddess',   // 눈물
  'GiantsBelt',     // 벨트
  'SparringGloves', // 장갑
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

  // 중복 조합 (4개 중 중복 허용)
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
  console.log('아이템 분석 로직 검증');
  console.log('========================================\n');

  const all4Combos = generate4Combinations(COMPONENTS);
  console.log(`총 ${all4Combos.length}개의 4조합 케이스 분석 예정\n`);

  // 결과 수집
  const pairResults = [];    // 완성+완성
  const singleResults = [];  // 각각활용

  let processed = 0;
  let errors = 0;

  for (const combo of all4Combos) {
    try {
      const result = await fetchAnalysis(combo);

      if (result.combinations) {
        for (const comb of result.combinations) {
          if (comb.gameCount === 0) continue;

          const entry = {
            combo: combo.map(c => COMPONENT_NAMES[c]).join('+'),
            mainItem: comb.mainItemName,
            secondItem: comb.secondItemName || null,
            avgPlacement: comb.avgPlacement,
            topFourRate: comb.topFourRate,
            gameCount: comb.gameCount,
            comparisonType: comb.debug?.comparisonType || 'unknown',
          };

          if (comb.debug?.comparisonType === 'pair') {
            pairResults.push(entry);
          } else if (comb.debug?.comparisonType === 'single') {
            singleResults.push(entry);
          }
        }
      }

      processed++;
      if (processed % 50 === 0) {
        console.log(`진행: ${processed}/${all4Combos.length} (${Math.round(processed/all4Combos.length*100)}%)`);
      }
    } catch (err) {
      errors++;
      console.error(`오류 (${combo.join(',')}): ${err.message}`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n========================================');
  console.log('분석 완료');
  console.log('========================================\n');

  // 통계 계산
  console.log(`처리된 조합: ${processed}/${all4Combos.length}`);
  console.log(`오류: ${errors}`);
  console.log(`완성+완성 케이스: ${pairResults.length}개`);
  console.log(`각각활용 케이스: ${singleResults.length}개`);

  // 가중 평균 계산 (게임 수로 가중)
  function calcWeightedAvg(results) {
    if (results.length === 0) return { avgPlacement: 0, totalGames: 0 };

    const totalGames = results.reduce((sum, r) => sum + r.gameCount, 0);
    const weightedSum = results.reduce((sum, r) => sum + r.avgPlacement * r.gameCount, 0);

    return {
      avgPlacement: weightedSum / totalGames,
      totalGames,
    };
  }

  // 단순 평균 계산
  function calcSimpleAvg(results) {
    if (results.length === 0) return 0;
    return results.reduce((sum, r) => sum + r.avgPlacement, 0) / results.length;
  }

  const pairStats = calcWeightedAvg(pairResults);
  const singleStats = calcWeightedAvg(singleResults);

  console.log('\n========================================');
  console.log('결과 비교');
  console.log('========================================\n');

  console.log('[ 완성+완성 (pair) ]');
  console.log(`  케이스 수: ${pairResults.length}`);
  console.log(`  총 게임 수: ${pairStats.totalGames}`);
  console.log(`  가중 평균 등수: ${pairStats.avgPlacement.toFixed(3)}등`);
  console.log(`  단순 평균 등수: ${calcSimpleAvg(pairResults).toFixed(3)}등`);

  console.log('\n[ 각각활용 (single) ]');
  console.log(`  케이스 수: ${singleResults.length}`);
  console.log(`  총 게임 수: ${singleStats.totalGames}`);
  console.log(`  가중 평균 등수: ${singleStats.avgPlacement.toFixed(3)}등`);
  console.log(`  단순 평균 등수: ${calcSimpleAvg(singleResults).toFixed(3)}등`);

  console.log('\n[ 차이 ]');
  const diff = pairStats.avgPlacement - singleStats.avgPlacement;
  console.log(`  가중 평균 차이: ${diff > 0 ? '+' : ''}${diff.toFixed(3)}등`);
  console.log(`  (양수 = 각각활용이 더 좋음, 음수 = 완성+완성이 더 좋음)`);

  // 분포 분석
  console.log('\n========================================');
  console.log('등수 분포');
  console.log('========================================\n');

  function getDistribution(results) {
    const dist = {
      '3.5등 미만': 0,
      '3.5~4.0등': 0,
      '4.0~4.5등': 0,
      '4.5~5.0등': 0,
      '5.0등 이상': 0,
    };

    for (const r of results) {
      if (r.avgPlacement < 3.5) dist['3.5등 미만']++;
      else if (r.avgPlacement < 4.0) dist['3.5~4.0등']++;
      else if (r.avgPlacement < 4.5) dist['4.0~4.5등']++;
      else if (r.avgPlacement < 5.0) dist['4.5~5.0등']++;
      else dist['5.0등 이상']++;
    }

    return dist;
  }

  console.log('완성+완성 분포:');
  const pairDist = getDistribution(pairResults);
  for (const [range, count] of Object.entries(pairDist)) {
    const pct = (count / pairResults.length * 100).toFixed(1);
    console.log(`  ${range}: ${count}개 (${pct}%)`);
  }

  console.log('\n각각활용 분포:');
  const singleDist = getDistribution(singleResults);
  for (const [range, count] of Object.entries(singleDist)) {
    const pct = (count / singleResults.length * 100).toFixed(1);
    console.log(`  ${range}: ${count}개 (${pct}%)`);
  }

  // Top 10 / Bottom 10
  console.log('\n========================================');
  console.log('상위/하위 케이스');
  console.log('========================================\n');

  const allResults = [...pairResults, ...singleResults].sort((a, b) => a.avgPlacement - b.avgPlacement);

  console.log('전체 상위 10개:');
  for (let i = 0; i < Math.min(10, allResults.length); i++) {
    const r = allResults[i];
    const type = r.comparisonType === 'pair' ? '완성+완성' : '각각활용';
    const items = r.secondItem ? `${r.mainItem} + ${r.secondItem}` : `${r.mainItem} + 조합`;
    console.log(`  ${i + 1}. [${type}] ${items} | ${r.avgPlacement}등 | ${r.gameCount}게임`);
  }

  console.log('\n전체 하위 10개:');
  for (let i = allResults.length - 10; i < allResults.length; i++) {
    if (i < 0) continue;
    const r = allResults[i];
    const type = r.comparisonType === 'pair' ? '완성+완성' : '각각활용';
    const items = r.secondItem ? `${r.mainItem} + ${r.secondItem}` : `${r.mainItem} + 조합`;
    console.log(`  ${allResults.length - i}. [${type}] ${items} | ${r.avgPlacement}등 | ${r.gameCount}게임`);
  }

  // 결론
  console.log('\n========================================');
  console.log('결론');
  console.log('========================================\n');

  if (Math.abs(diff) < 0.1) {
    console.log('두 유형의 평균 등수 차이가 0.1등 이내입니다.');
    console.log('→ 로직에 체계적인 편향이 없음을 확인했습니다.');
  } else if (diff > 0) {
    console.log(`각각활용이 평균 ${diff.toFixed(2)}등 더 좋습니다.`);
    console.log('→ 조합 아이템을 분산 활용하는 것이 유리한 경향이 있습니다.');
  } else {
    console.log(`완성+완성이 평균 ${Math.abs(diff).toFixed(2)}등 더 좋습니다.`);
    console.log('→ 완성 아이템 시너지가 유리한 경향이 있습니다.');
  }
}

// 실행
runAnalysis().catch(console.error);
