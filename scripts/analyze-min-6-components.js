/**
 * 최소 6개 조합아이템 보유 플레이어 기준 분석
 *
 * 목적: 완성+완성 vs 각각활용을 공정하게 비교
 * 조건: 플레이어가 최소 6개 조합아이템(=3개 완성템)을 보유해야 함
 *
 * 사용법: node scripts/analyze-min-6-components.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 아이템 레시피 (route.ts에서 복사)
const ITEM_RECIPES = {
  "TFT_Item_Deathblade": { nameKo: "죽음의 검", components: ["BFSword", "BFSword"] },
  "TFT_Item_MadredsBloodrazor": { nameKo: "거인 학살자", components: ["BFSword", "RecurveBow"] },
  "TFT_Item_GuardianAngel": { nameKo: "밤의 끝자락", components: ["BFSword", "ChainVest"] },
  "TFT_Item_Bloodthirster": { nameKo: "피바라기", components: ["BFSword", "NegatronCloak"] },
  "TFT_Item_HextechGunblade": { nameKo: "마법공학 총검", components: ["BFSword", "NeedlesslyLargeRod"] },
  "TFT_Item_SpearOfShojin": { nameKo: "쇼진의 창", components: ["BFSword", "TearOfTheGoddess"] },
  "TFT_Item_SteraksGage": { nameKo: "스테락의 도전", components: ["BFSword", "GiantsBelt"] },
  "TFT_Item_InfinityEdge": { nameKo: "무한의 대검", components: ["BFSword", "SparringGloves"] },
  "TFT_Item_RapidFireCannon": { nameKo: "붉은 덩굴정령", components: ["RecurveBow", "RecurveBow"] },
  "TFT_Item_TitansResolve": { nameKo: "거인의 결의", components: ["RecurveBow", "ChainVest"] },
  "TFT_Item_RunaansHurricane": { nameKo: "크라켄의 분노", components: ["RecurveBow", "NegatronCloak"] },
  "TFT_Item_GuinsoosRageblade": { nameKo: "구인수의 격노검", components: ["RecurveBow", "NeedlesslyLargeRod"] },
  "TFT_Item_StatikkShiv": { nameKo: "공허의 지팡이", components: ["RecurveBow", "TearOfTheGoddess"] },
  "TFT_Item_Leviathan": { nameKo: "내셔의 이빨", components: ["RecurveBow", "GiantsBelt"] },
  "TFT_Item_LastWhisper": { nameKo: "최후의 속삭임", components: ["RecurveBow", "SparringGloves"] },
  "TFT_Item_BrambleVest": { nameKo: "덤불 조끼", components: ["ChainVest", "ChainVest"] },
  "TFT_Item_GargoyleStoneplate": { nameKo: "가고일 돌갑옷", components: ["ChainVest", "NegatronCloak"] },
  "TFT_Item_Crownguard": { nameKo: "크라운가드", components: ["ChainVest", "NeedlesslyLargeRod"] },
  "TFT_Item_FrozenHeart": { nameKo: "수호자의 맹세", components: ["ChainVest", "TearOfTheGoddess"] },
  "TFT_Item_RedBuff": { nameKo: "태양불꽃 망토", components: ["ChainVest", "GiantsBelt"] },
  "TFT_Item_NightHarvester": { nameKo: "굳건한 심장", components: ["ChainVest", "SparringGloves"] },
  "TFT_Item_DragonsClaw": { nameKo: "용의 발톱", components: ["NegatronCloak", "NegatronCloak"] },
  "TFT_Item_IonicSpark": { nameKo: "이온 충격기", components: ["NegatronCloak", "NeedlesslyLargeRod"] },
  "TFT_Item_AdaptiveHelm": { nameKo: "적응형 투구", components: ["NegatronCloak", "TearOfTheGoddess"] },
  "TFT_Item_SpectralGauntlet": { nameKo: "저녁갑주", components: ["NegatronCloak", "GiantsBelt"] },
  "TFT_Item_Quicksilver": { nameKo: "수은", components: ["NegatronCloak", "SparringGloves"] },
  "TFT_Item_RabadonsDeathcap": { nameKo: "라바돈의 죽음모자", components: ["NeedlesslyLargeRod", "NeedlesslyLargeRod"] },
  "TFT_Item_ArchangelsStaff": { nameKo: "대천사의 지팡이", components: ["NeedlesslyLargeRod", "TearOfTheGoddess"] },
  "TFT_Item_Morellonomicon": { nameKo: "모렐로노미콘", components: ["NeedlesslyLargeRod", "GiantsBelt"] },
  "TFT_Item_JeweledGauntlet": { nameKo: "보석 건틀릿", components: ["NeedlesslyLargeRod", "SparringGloves"] },
  "TFT_Item_BlueBuff": { nameKo: "푸른 파수꾼", components: ["TearOfTheGoddess", "TearOfTheGoddess"] },
  "TFT_Item_Redemption": { nameKo: "정령의 형상", components: ["TearOfTheGoddess", "GiantsBelt"] },
  "TFT_Item_UnstableConcoction": { nameKo: "정의의 손길", components: ["TearOfTheGoddess", "SparringGloves"] },
  "TFT_Item_WarmogsArmor": { nameKo: "워모그의 갑옷", components: ["GiantsBelt", "GiantsBelt"] },
  "TFT_Item_PowerGauntlet": { nameKo: "타격대의 철퇴", components: ["GiantsBelt", "SparringGloves"] },
  "TFT_Item_ThiefsGloves": { nameKo: "도적의 장갑", components: ["SparringGloves", "SparringGloves"] },
};

// 완성 아이템 → 조합 아이템 분해
function decomposeItem(itemApiName) {
  const recipe = ITEM_RECIPES[itemApiName];
  if (recipe) {
    return [...recipe.components];
  }
  return [];
}

// 플레이어의 총 조합 아이템 개수 계산
function countTotalComponents(units) {
  let total = 0;
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    for (const itemName of unit.itemNames) {
      const components = decomposeItem(itemName);
      total += components.length;
    }
  }
  return total;
}

// 플레이어가 특정 아이템 보유 확인
function hasItem(units, itemApiName) {
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    if (unit.itemNames.includes(itemApiName)) return true;
  }
  return false;
}

// 플레이어가 특정 조합으로 만든 아이템 보유 확인
function hasItemFromComponent(units, componentId) {
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    for (const itemName of unit.itemNames) {
      const recipe = ITEM_RECIPES[itemName];
      if (recipe && recipe.components.includes(componentId)) {
        return true;
      }
    }
  }
  return false;
}

// 모든 조합에서 아이템 보유 확인 (AND 로직)
function hasItemsFromAllComponents(units, componentIds) {
  for (const compId of componentIds) {
    if (!hasItemFromComponent(units, compId)) {
      return false;
    }
  }
  return true;
}

// 2개 조합으로 만들 수 있는 아이템 찾기
function findItemFromTwoComponents(comp1, comp2) {
  for (const [itemApiName, recipe] of Object.entries(ITEM_RECIPES)) {
    const [r1, r2] = recipe.components;
    if ((r1 === comp1 && r2 === comp2) || (r1 === comp2 && r2 === comp1)) {
      return itemApiName;
    }
  }
  return null;
}

// 아이템 한글명
function getItemNameKo(itemApiName) {
  return ITEM_RECIPES[itemApiName]?.nameKo || itemApiName;
}

// DB에서 모든 플레이어 가져오기
async function fetchAllPlayers() {
  const PAGE_SIZE = 1000;
  const allPlayers = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("tft_players")
      .select("placement, units")
      .not("units", "is", null)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("DB 오류:", error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allPlayers.push(...data);
      offset += PAGE_SIZE;
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    }
  }

  return allPlayers;
}

// 메인 분석
async function runAnalysis() {
  console.log('========================================');
  console.log('최소 6개 조합아이템 보유 플레이어 기준 분석');
  console.log('========================================\n');

  // DB에서 플레이어 데이터 가져오기
  console.log('데이터 로딩 중...');
  const allPlayers = await fetchAllPlayers();
  console.log(`총 ${allPlayers.length}명 플레이어 로드\n`);

  // 최소 6개 조합 보유 플레이어 필터링
  const playersWithMin6 = allPlayers.filter(p => {
    const total = countTotalComponents(p.units);
    return total >= 6;
  });

  console.log(`6개 이상 조합 보유: ${playersWithMin6.length}명 (${(playersWithMin6.length/allPlayers.length*100).toFixed(1)}%)\n`);

  // 테스트 케이스: 대검+장갑+벨트+활
  const testComponents = ['BFSword', 'SparringGloves', 'GiantsBelt', 'RecurveBow'];
  console.log(`테스트 조합: ${testComponents.join(' + ')}`);
  console.log('(무한의 대검 + 내셔의 이빨 vs 무한의 대검 + 벨트템 + 활템)\n');

  // 메인 아이템: 무한의 대검 (대검+장갑)
  const mainItem = 'TFT_Item_InfinityEdge';
  const mainItemName = getItemNameKo(mainItem);

  // 두 번째 완성 아이템: 내셔의 이빨 (벨트+활)
  const secondItem = findItemFromTwoComponents('GiantsBelt', 'RecurveBow');
  const secondItemName = getItemNameKo(secondItem);

  // 남은 조합: 벨트, 활
  const remainingComponents = ['GiantsBelt', 'RecurveBow'];

  // === 기존 로직 (모든 플레이어) ===
  console.log('========================================');
  console.log('기존 로직 (모든 플레이어)');
  console.log('========================================\n');

  let pairGamesOld = [];
  let singleGamesOld = [];

  for (const player of allPlayers) {
    if (!hasItem(player.units, mainItem)) continue;

    if (hasItem(player.units, secondItem)) {
      pairGamesOld.push(player);
    } else if (hasItemsFromAllComponents(player.units, remainingComponents)) {
      singleGamesOld.push(player);
    }
  }

  const pairAvgOld = pairGamesOld.reduce((s, p) => s + p.placement, 0) / pairGamesOld.length;
  const singleAvgOld = singleGamesOld.reduce((s, p) => s + p.placement, 0) / singleGamesOld.length;

  console.log(`완성+완성 (${mainItemName} + ${secondItemName}):`);
  console.log(`  게임 수: ${pairGamesOld.length}`);
  console.log(`  평균 등수: ${pairAvgOld.toFixed(2)}등\n`);

  console.log(`각각활용 (${mainItemName} + 벨트템 + 활템):`);
  console.log(`  게임 수: ${singleGamesOld.length}`);
  console.log(`  평균 등수: ${singleAvgOld.toFixed(2)}등\n`);

  console.log(`차이: ${(pairAvgOld - singleAvgOld).toFixed(2)}등\n`);

  // === 새 로직 (6개 이상 조합 보유 플레이어만) ===
  console.log('========================================');
  console.log('새 로직 (6개 이상 조합 보유 플레이어만)');
  console.log('========================================\n');

  let pairGamesNew = [];
  let singleGamesNew = [];

  for (const player of playersWithMin6) {
    if (!hasItem(player.units, mainItem)) continue;

    if (hasItem(player.units, secondItem)) {
      pairGamesNew.push(player);
    } else if (hasItemsFromAllComponents(player.units, remainingComponents)) {
      singleGamesNew.push(player);
    }
  }

  const pairAvgNew = pairGamesNew.reduce((s, p) => s + p.placement, 0) / pairGamesNew.length;
  const singleAvgNew = singleGamesNew.reduce((s, p) => s + p.placement, 0) / singleGamesNew.length;

  console.log(`완성+완성 (${mainItemName} + ${secondItemName}):`);
  console.log(`  게임 수: ${pairGamesNew.length}`);
  console.log(`  평균 등수: ${pairAvgNew.toFixed(2)}등\n`);

  console.log(`각각활용 (${mainItemName} + 벨트템 + 활템):`);
  console.log(`  게임 수: ${singleGamesNew.length}`);
  console.log(`  평균 등수: ${singleAvgNew.toFixed(2)}등\n`);

  console.log(`차이: ${(pairAvgNew - singleAvgNew).toFixed(2)}등\n`);

  // === 비교 ===
  console.log('========================================');
  console.log('비교 결과');
  console.log('========================================\n');

  console.log('| 로직 | 완성+완성 | 각각활용 | 차이 |');
  console.log('|------|----------|---------|------|');
  console.log(`| 기존 (전체) | ${pairAvgOld.toFixed(2)}등 (${pairGamesOld.length}) | ${singleAvgOld.toFixed(2)}등 (${singleGamesOld.length}) | ${(pairAvgOld - singleAvgOld).toFixed(2)}등 |`);
  console.log(`| 새 로직 (6+) | ${pairAvgNew.toFixed(2)}등 (${pairGamesNew.length}) | ${singleAvgNew.toFixed(2)}등 (${singleGamesNew.length}) | ${(pairAvgNew - singleAvgNew).toFixed(2)}등 |`);

  // === 추가 분석: 여러 조합 테스트 ===
  console.log('\n========================================');
  console.log('여러 조합 테스트 (6개 이상 조합 보유 기준)');
  console.log('========================================\n');

  const testCases = [
    { main: 'TFT_Item_InfinityEdge', remaining: ['GiantsBelt', 'RecurveBow'] },
    { main: 'TFT_Item_Bloodthirster', remaining: ['SparringGloves', 'ChainVest'] },
    { main: 'TFT_Item_MadredsBloodrazor', remaining: ['ChainVest', 'NegatronCloak'] },
    { main: 'TFT_Item_GuardianAngel', remaining: ['RecurveBow', 'NegatronCloak'] },
    { main: 'TFT_Item_SpearOfShojin', remaining: ['GiantsBelt', 'SparringGloves'] },
  ];

  let totalPairWins = 0;
  let totalSingleWins = 0;

  for (const testCase of testCases) {
    const mainName = getItemNameKo(testCase.main);
    const secondItemTest = findItemFromTwoComponents(testCase.remaining[0], testCase.remaining[1]);
    const secondNameTest = secondItemTest ? getItemNameKo(secondItemTest) : 'N/A';

    let pairTest = [];
    let singleTest = [];

    for (const player of playersWithMin6) {
      if (!hasItem(player.units, testCase.main)) continue;

      if (secondItemTest && hasItem(player.units, secondItemTest)) {
        pairTest.push(player);
      } else if (hasItemsFromAllComponents(player.units, testCase.remaining)) {
        singleTest.push(player);
      }
    }

    if (pairTest.length > 0 && singleTest.length > 0) {
      const pairAvg = pairTest.reduce((s, p) => s + p.placement, 0) / pairTest.length;
      const singleAvg = singleTest.reduce((s, p) => s + p.placement, 0) / singleTest.length;
      const diff = pairAvg - singleAvg;
      const winner = diff < 0 ? '완성+완성' : '각각활용';

      if (diff < 0) totalPairWins++;
      else totalSingleWins++;

      console.log(`${mainName}:`);
      console.log(`  완성+완성 (${secondNameTest}): ${pairAvg.toFixed(2)}등 (${pairTest.length}게임)`);
      console.log(`  각각활용: ${singleAvg.toFixed(2)}등 (${singleTest.length}게임)`);
      console.log(`  차이: ${diff.toFixed(2)}등 → ${winner} 승리\n`);
    }
  }

  console.log('========================================');
  console.log('최종 요약');
  console.log('========================================\n');
  console.log(`완성+완성 승리: ${totalPairWins}개`);
  console.log(`각각활용 승리: ${totalSingleWins}개`);
}

runAnalysis().catch(console.error);
