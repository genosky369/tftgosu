/**
 * 거인 학살자 상세 분석
 *
 * 왜 거인 학살자는 각각활용이 더 좋은가?
 * - 완성+완성: 거인 학살자 + 가고일 돌갑옷
 * - 각각활용: 거인 학살자 + (갑옷템) + (망토템)
 *
 * 사용법: node scripts/analyze-giant-slayer-detail.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 아이템 레시피
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

function getItemNameKo(itemApiName) {
  return ITEM_RECIPES[itemApiName]?.nameKo || itemApiName;
}

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
      if (recipe && recipe.components.includes(componentId)) {
        return true;
      }
    }
  }
  return false;
}

function hasItemsFromAllComponents(units, componentIds) {
  for (const compId of componentIds) {
    if (!hasItemFromComponent(units, compId)) {
      return false;
    }
  }
  return true;
}

// 플레이어가 특정 조합으로 만든 아이템 목록 반환
function getItemsFromComponent(units, componentId) {
  const items = [];
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    for (const itemName of unit.itemNames) {
      const recipe = ITEM_RECIPES[itemName];
      if (recipe && recipe.components.includes(componentId)) {
        items.push(itemName);
      }
    }
  }
  return items;
}

// 플레이어의 모든 완성 아이템 목록
function getAllCompletedItems(units) {
  const items = [];
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    for (const itemName of unit.itemNames) {
      if (ITEM_RECIPES[itemName]) {
        items.push(itemName);
      }
    }
  }
  return items;
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
  console.log('거인 학살자 상세 분석');
  console.log('========================================\n');

  const allPlayers = await fetchAllPlayers();
  console.log(`총 ${allPlayers.length}명 플레이어\n`);

  const mainItem = 'TFT_Item_MadredsBloodrazor'; // 거인 학살자
  const secondItem = 'TFT_Item_GargoyleStoneplate'; // 가고일 돌갑옷
  const remainingComponents = ['ChainVest', 'NegatronCloak'];

  // 그룹 분류
  const pairPlayers = [];
  const singlePlayers = [];

  for (const player of allPlayers) {
    if (!hasItem(player.units, mainItem)) continue;

    if (hasItem(player.units, secondItem)) {
      pairPlayers.push(player);
    } else if (hasItemsFromAllComponents(player.units, remainingComponents)) {
      singlePlayers.push(player);
    }
  }

  console.log('========================================');
  console.log('기본 통계');
  console.log('========================================\n');

  const pairAvg = pairPlayers.reduce((s, p) => s + p.placement, 0) / pairPlayers.length;
  const singleAvg = singlePlayers.reduce((s, p) => s + p.placement, 0) / singlePlayers.length;

  console.log(`완성+완성 (거인 학살자 + 가고일 돌갑옷):`);
  console.log(`  게임 수: ${pairPlayers.length}`);
  console.log(`  평균 등수: ${pairAvg.toFixed(2)}등\n`);

  console.log(`각각활용 (거인 학살자 + 갑옷템 + 망토템):`);
  console.log(`  게임 수: ${singlePlayers.length}`);
  console.log(`  평균 등수: ${singleAvg.toFixed(2)}등\n`);

  console.log(`차이: ${(pairAvg - singleAvg).toFixed(2)}등 (${singleAvg < pairAvg ? '각각활용' : '완성+완성'} 승리)\n`);

  // === 각각활용 플레이어들이 실제로 만든 아이템 분석 ===
  console.log('========================================');
  console.log('각각활용 플레이어들이 만든 아이템 분석');
  console.log('========================================\n');

  // 갑옷으로 만든 아이템 통계
  const chainVestItems = {};
  // 망토로 만든 아이템 통계
  const negatronItems = {};
  // 조합 통계
  const combos = {};

  for (const player of singlePlayers) {
    const chainItems = getItemsFromComponent(player.units, 'ChainVest');
    const negatronItemsList = getItemsFromComponent(player.units, 'NegatronCloak');

    // 가고일 제외
    const chainFiltered = chainItems.filter(i => i !== secondItem);
    const negatronFiltered = negatronItemsList.filter(i => i !== secondItem);

    for (const item of chainFiltered) {
      chainVestItems[item] = (chainVestItems[item] || 0) + 1;
    }
    for (const item of negatronFiltered) {
      negatronItems[item] = (negatronItems[item] || 0) + 1;
    }

    // 조합 기록
    if (chainFiltered.length > 0 && negatronFiltered.length > 0) {
      const comboKey = `${getItemNameKo(chainFiltered[0])} + ${getItemNameKo(negatronFiltered[0])}`;
      if (!combos[comboKey]) {
        combos[comboKey] = { count: 0, placements: [] };
      }
      combos[comboKey].count++;
      combos[comboKey].placements.push(player.placement);
    }
  }

  console.log('[갑옷으로 만든 아이템 TOP 10]');
  const chainSorted = Object.entries(chainVestItems).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [item, count] of chainSorted) {
    console.log(`  ${getItemNameKo(item)}: ${count}회 (${(count/singlePlayers.length*100).toFixed(1)}%)`);
  }

  console.log('\n[망토로 만든 아이템 TOP 10]');
  const negatronSorted = Object.entries(negatronItems).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [item, count] of negatronSorted) {
    console.log(`  ${getItemNameKo(item)}: ${count}회 (${(count/singlePlayers.length*100).toFixed(1)}%)`);
  }

  // === 인기 조합별 평균 등수 ===
  console.log('\n========================================');
  console.log('각각활용 인기 조합별 평균 등수');
  console.log('========================================\n');

  const comboStats = Object.entries(combos)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avg: data.placements.reduce((s, p) => s + p, 0) / data.placements.length,
    }))
    .filter(c => c.count >= 30) // 최소 30게임
    .sort((a, b) => a.avg - b.avg);

  console.log('조합 | 평균등수 | 게임수');
  console.log('-----|---------|-------');
  for (const combo of comboStats.slice(0, 15)) {
    console.log(`${combo.name} | ${combo.avg.toFixed(2)}등 | ${combo.count}게임`);
  }

  // === 가고일 vs 각각활용 상위 조합 비교 ===
  console.log('\n========================================');
  console.log('핵심 비교: 가고일 vs 상위 각각활용 조합');
  console.log('========================================\n');

  console.log(`가고일 돌갑옷 조합: ${pairAvg.toFixed(2)}등 (${pairPlayers.length}게임)`);
  console.log('');
  console.log('각각활용 상위 조합:');
  for (const combo of comboStats.slice(0, 5)) {
    const diff = combo.avg - pairAvg;
    const better = diff < 0 ? '더 좋음' : '더 나쁨';
    console.log(`  ${combo.name}: ${combo.avg.toFixed(2)}등 (${combo.count}게임) → 가고일보다 ${Math.abs(diff).toFixed(2)}등 ${better}`);
  }

  // === 완성+완성 그룹의 다른 아이템 분석 ===
  console.log('\n========================================');
  console.log('완성+완성 그룹의 전체 아이템 구성');
  console.log('========================================\n');

  const pairOtherItems = {};
  for (const player of pairPlayers) {
    const allItems = getAllCompletedItems(player.units);
    for (const item of allItems) {
      if (item === mainItem || item === secondItem) continue;
      pairOtherItems[item] = (pairOtherItems[item] || 0) + 1;
    }
  }

  console.log('[거인학살자+가고일 플레이어들이 추가로 보유한 아이템 TOP 10]');
  const pairOtherSorted = Object.entries(pairOtherItems).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [item, count] of pairOtherSorted) {
    console.log(`  ${getItemNameKo(item)}: ${count}회 (${(count/pairPlayers.length*100).toFixed(1)}%)`);
  }

  // === 각각활용 그룹의 다른 아이템 분석 ===
  console.log('\n[각각활용 플레이어들이 추가로 보유한 아이템 TOP 10]');
  const singleOtherItems = {};
  for (const player of singlePlayers) {
    const allItems = getAllCompletedItems(player.units);
    for (const item of allItems) {
      if (item === mainItem) continue;
      singleOtherItems[item] = (singleOtherItems[item] || 0) + 1;
    }
  }

  const singleOtherSorted = Object.entries(singleOtherItems).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [item, count] of singleOtherSorted) {
    console.log(`  ${getItemNameKo(item)}: ${count}회 (${(count/singlePlayers.length*100).toFixed(1)}%)`);
  }

  // === 가설 검증: 공격템 vs 방어템 ===
  console.log('\n========================================');
  console.log('가설: 공격템 비율 차이');
  console.log('========================================\n');

  const offensiveItems = [
    'TFT_Item_Deathblade', 'TFT_Item_MadredsBloodrazor', 'TFT_Item_InfinityEdge',
    'TFT_Item_LastWhisper', 'TFT_Item_GuinsoosRageblade', 'TFT_Item_RapidFireCannon',
    'TFT_Item_Bloodthirster', 'TFT_Item_HextechGunblade', 'TFT_Item_JeweledGauntlet',
    'TFT_Item_RabadonsDeathcap', 'TFT_Item_IonicSpark', 'TFT_Item_Morellonomicon',
    'TFT_Item_StatikkShiv', 'TFT_Item_RunaansHurricane',
  ];

  let pairOffensiveCount = 0;
  let pairTotalItems = 0;
  for (const player of pairPlayers) {
    const items = getAllCompletedItems(player.units);
    pairTotalItems += items.length;
    pairOffensiveCount += items.filter(i => offensiveItems.includes(i)).length;
  }

  let singleOffensiveCount = 0;
  let singleTotalItems = 0;
  for (const player of singlePlayers) {
    const items = getAllCompletedItems(player.units);
    singleTotalItems += items.length;
    singleOffensiveCount += items.filter(i => offensiveItems.includes(i)).length;
  }

  console.log(`완성+완성 그룹 공격템 비율: ${(pairOffensiveCount/pairTotalItems*100).toFixed(1)}%`);
  console.log(`각각활용 그룹 공격템 비율: ${(singleOffensiveCount/singleTotalItems*100).toFixed(1)}%`);
}

runAnalysis().catch(console.error);
