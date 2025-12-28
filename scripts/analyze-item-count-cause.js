/**
 * 아이템 개수 차이 원인 분석
 *
 * 가설: 완성+완성 필터가 아이템이 많은 플레이어를 선택하는 편향이 있다
 *
 * 검증 방법:
 * 1. 아이템 개수별 완성+완성/각각활용 비율 확인
 * 2. 같은 아이템 개수에서 등수 비교
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

function hasItem(units, itemApiName) {
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    if (unit.itemNames.includes(itemApiName)) return true;
  }
  return false;
}

function hasItemFromComponent(units, componentId) {
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    for (const itemName of unit.itemNames) {
      const recipe = ITEM_RECIPES[itemName];
      if (recipe && recipe.components.includes(componentId)) return true;
    }
  }
  return false;
}

function hasItemsFromAllComponents(units, componentIds) {
  for (const compId of componentIds) {
    if (!hasItemFromComponent(units, compId)) return false;
  }
  return true;
}

function countTotalItems(units) {
  let count = 0;
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    count += unit.itemNames.filter(i => ITEM_RECIPES[i]).length;
  }
  return count;
}

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

    if (error) break;
    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allPlayers.push(...data);
      offset += PAGE_SIZE;
      if (data.length < PAGE_SIZE) hasMore = false;
    }
  }
  return allPlayers;
}

async function runAnalysis() {
  console.log('========================================');
  console.log('아이템 개수 차이 원인 분석');
  console.log('========================================\n');

  const allPlayers = await fetchAllPlayers();
  console.log(`총 ${allPlayers.length}명 플레이어\n`);

  // 무한의 대검 케이스 분석
  const mainItem = 'TFT_Item_InfinityEdge';
  const secondItem = 'TFT_Item_Leviathan'; // 내셔의 이빨
  const remainingComponents = ['GiantsBelt', 'RecurveBow'];

  // 무한의 대검을 가진 모든 플레이어
  const playersWithMain = allPlayers.filter(p => hasItem(p.units, mainItem));

  console.log(`무한의 대검 보유 플레이어: ${playersWithMain.length}명\n`);

  // === 1. 아이템 개수별 분포 분석 ===
  console.log('========================================');
  console.log('1. 아이템 개수별 완성+완성 / 각각활용 분포');
  console.log('========================================\n');

  // 아이템 개수별 그룹화
  const byItemCount = {};

  for (const player of playersWithMain) {
    const itemCount = countTotalItems(player.units);
    if (!byItemCount[itemCount]) {
      byItemCount[itemCount] = { total: 0, pair: 0, single: 0, neither: 0 };
    }

    byItemCount[itemCount].total++;

    const hasPair = hasItem(player.units, secondItem);
    const hasSingle = !hasPair && hasItemsFromAllComponents(player.units, remainingComponents);

    if (hasPair) {
      byItemCount[itemCount].pair++;
    } else if (hasSingle) {
      byItemCount[itemCount].single++;
    } else {
      byItemCount[itemCount].neither++;
    }
  }

  console.log('아이템수 | 전체 | 완성+완성 | 각각활용 | 완성+완성 비율');
  console.log('---------|------|----------|---------|---------------');

  const sortedCounts = Object.keys(byItemCount).map(Number).sort((a, b) => a - b);
  for (const count of sortedCounts) {
    const data = byItemCount[count];
    const pairPct = (data.pair / data.total * 100).toFixed(1);
    console.log(`${count}개     | ${data.total.toString().padStart(4)} | ${data.pair.toString().padStart(8)} | ${data.single.toString().padStart(7)} | ${pairPct}%`);
  }

  // === 2. 가설 검증: 아이템이 많을수록 완성+완성 비율이 높은가? ===
  console.log('\n========================================');
  console.log('2. 가설: 아이템이 많을수록 완성+완성 비율 증가?');
  console.log('========================================\n');

  // 8개 이하 vs 12개 이상 비교
  let lowItemPair = 0, lowItemTotal = 0;
  let highItemPair = 0, highItemTotal = 0;

  for (const count of sortedCounts) {
    const data = byItemCount[count];
    if (count <= 8) {
      lowItemPair += data.pair;
      lowItemTotal += data.total;
    } else if (count >= 12) {
      highItemPair += data.pair;
      highItemTotal += data.total;
    }
  }

  console.log(`아이템 8개 이하: 완성+완성 비율 = ${(lowItemPair/lowItemTotal*100).toFixed(1)}% (${lowItemPair}/${lowItemTotal})`);
  console.log(`아이템 12개 이상: 완성+완성 비율 = ${(highItemPair/highItemTotal*100).toFixed(1)}% (${highItemPair}/${highItemTotal})`);

  // === 3. 확률 계산: 특정 아이템 보유 확률 ===
  console.log('\n========================================');
  console.log('3. 내셔의 이빨 보유 확률 (아이템 개수별)');
  console.log('========================================\n');

  // 전체 플레이어 중 내셔의 이빨 보유 비율
  const allWithNashor = allPlayers.filter(p => hasItem(p.units, secondItem)).length;
  const nashorRate = allWithNashor / allPlayers.length;

  console.log(`전체 플레이어 중 내셔의 이빨 보유율: ${(nashorRate*100).toFixed(2)}%\n`);

  // 아이템 개수별 내셔의 이빨 보유율
  const nashorByCount = {};
  for (const player of allPlayers) {
    const itemCount = countTotalItems(player.units);
    if (!nashorByCount[itemCount]) {
      nashorByCount[itemCount] = { total: 0, hasNashor: 0 };
    }
    nashorByCount[itemCount].total++;
    if (hasItem(player.units, secondItem)) {
      nashorByCount[itemCount].hasNashor++;
    }
  }

  console.log('아이템수 | 전체 | 내셔의 이빨 보유 | 보유율');
  console.log('---------|------|----------------|-------');

  const nashorCounts = Object.keys(nashorByCount).map(Number).sort((a, b) => a - b);
  for (const count of nashorCounts) {
    const data = nashorByCount[count];
    const rate = (data.hasNashor / data.total * 100).toFixed(1);
    console.log(`${count}개     | ${data.total.toString().padStart(4)} | ${data.hasNashor.toString().padStart(14)} | ${rate}%`);
  }

  // === 4. 같은 아이템 개수에서 등수 비교 ===
  console.log('\n========================================');
  console.log('4. 같은 아이템 개수에서 등수 비교');
  console.log('========================================\n');

  const pairPlayers = [];
  const singlePlayers = [];

  for (const player of playersWithMain) {
    const hasPair = hasItem(player.units, secondItem);
    const hasSingle = !hasPair && hasItemsFromAllComponents(player.units, remainingComponents);

    if (hasPair) {
      pairPlayers.push({ ...player, itemCount: countTotalItems(player.units) });
    } else if (hasSingle) {
      singlePlayers.push({ ...player, itemCount: countTotalItems(player.units) });
    }
  }

  console.log('아이템수 | 완성+완성 등수 (게임수) | 각각활용 등수 (게임수) | 차이');
  console.log('---------|----------------------|---------------------|------');

  for (let itemCount = 6; itemCount <= 16; itemCount++) {
    const pairGroup = pairPlayers.filter(p => p.itemCount === itemCount);
    const singleGroup = singlePlayers.filter(p => p.itemCount === itemCount);

    if (pairGroup.length >= 10 && singleGroup.length >= 10) {
      const pairAvg = pairGroup.reduce((s, p) => s + p.placement, 0) / pairGroup.length;
      const singleAvg = singleGroup.reduce((s, p) => s + p.placement, 0) / singleGroup.length;
      const diff = pairAvg - singleAvg;

      console.log(`${itemCount}개     | ${pairAvg.toFixed(2)}등 (${pairGroup.length.toString().padStart(3)}) | ${singleAvg.toFixed(2)}등 (${singleGroup.length.toString().padStart(4)}) | ${diff > 0 ? '+' : ''}${diff.toFixed(2)}등`);
    }
  }

  // === 5. 결론 ===
  console.log('\n========================================');
  console.log('5. 결론');
  console.log('========================================\n');

  // 전체 비교 (원래 방식)
  const pairAvgAll = pairPlayers.reduce((s, p) => s + p.placement, 0) / pairPlayers.length;
  const singleAvgAll = singlePlayers.reduce((s, p) => s + p.placement, 0) / singlePlayers.length;
  const pairAvgItems = pairPlayers.reduce((s, p) => s + p.itemCount, 0) / pairPlayers.length;
  const singleAvgItems = singlePlayers.reduce((s, p) => s + p.itemCount, 0) / singlePlayers.length;

  console.log('[원래 방식 비교]');
  console.log(`완성+완성: ${pairAvgAll.toFixed(2)}등, 평균 아이템 ${pairAvgItems.toFixed(1)}개`);
  console.log(`각각활용: ${singleAvgAll.toFixed(2)}등, 평균 아이템 ${singleAvgItems.toFixed(1)}개`);
  console.log(`차이: ${(pairAvgAll - singleAvgAll).toFixed(2)}등\n`);

  // 아이템 10~12개로 맞춰서 비교
  const pairMatched = pairPlayers.filter(p => p.itemCount >= 10 && p.itemCount <= 12);
  const singleMatched = singlePlayers.filter(p => p.itemCount >= 10 && p.itemCount <= 12);

  if (pairMatched.length > 0 && singleMatched.length > 0) {
    const pairAvgMatched = pairMatched.reduce((s, p) => s + p.placement, 0) / pairMatched.length;
    const singleAvgMatched = singleMatched.reduce((s, p) => s + p.placement, 0) / singleMatched.length;

    console.log('[아이템 10~12개로 맞춘 비교]');
    console.log(`완성+완성: ${pairAvgMatched.toFixed(2)}등 (${pairMatched.length}게임)`);
    console.log(`각각활용: ${singleAvgMatched.toFixed(2)}등 (${singleMatched.length}게임)`);
    console.log(`차이: ${(pairAvgMatched - singleAvgMatched).toFixed(2)}등`);
  }
}

runAnalysis().catch(console.error);
