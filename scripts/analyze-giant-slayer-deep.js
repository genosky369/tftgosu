/**
 * 거인 학살자 심층 분석
 *
 * 시너지가 아닌 다른 원인 탐색:
 * 1. 아이템이 같은 챔피언에 있는지?
 * 2. 총 아이템 개수 차이?
 * 3. 등수 분포 차이?
 * 4. 특정 챔피언 차이?
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

function getItemNameKo(itemApiName) {
  return ITEM_RECIPES[itemApiName]?.nameKo || itemApiName;
}

function getChampionName(characterId) {
  return characterId?.replace("TFT16_", "").replace("TFT_", "") || "Unknown";
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

// 특정 아이템을 가진 챔피언 찾기
function findChampionWithItem(units, itemApiName) {
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    if (unit.itemNames.includes(itemApiName)) {
      return {
        name: getChampionName(unit.character_id),
        apiName: unit.character_id,
        items: unit.itemNames,
        tier: unit.tier,
      };
    }
  }
  return null;
}

// 총 완성 아이템 개수
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
  console.log('거인 학살자 심층 분석');
  console.log('========================================\n');

  const allPlayers = await fetchAllPlayers();
  console.log(`총 ${allPlayers.length}명 플레이어\n`);

  const mainItem = 'TFT_Item_MadredsBloodrazor';
  const secondItem = 'TFT_Item_GargoyleStoneplate';
  const remainingComponents = ['ChainVest', 'NegatronCloak'];

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

  // === 1. 총 아이템 개수 비교 ===
  console.log('========================================');
  console.log('1. 총 완성 아이템 개수 비교');
  console.log('========================================\n');

  const pairItemCounts = pairPlayers.map(p => countTotalItems(p.units));
  const singleItemCounts = singlePlayers.map(p => countTotalItems(p.units));

  const pairAvgItems = pairItemCounts.reduce((a, b) => a + b, 0) / pairItemCounts.length;
  const singleAvgItems = singleItemCounts.reduce((a, b) => a + b, 0) / singleItemCounts.length;

  console.log(`완성+완성 평균 아이템 개수: ${pairAvgItems.toFixed(2)}개`);
  console.log(`각각활용 평균 아이템 개수: ${singleAvgItems.toFixed(2)}개`);
  console.log(`차이: ${(singleAvgItems - pairAvgItems).toFixed(2)}개\n`);

  // === 2. 등수 분포 비교 ===
  console.log('========================================');
  console.log('2. 등수 분포 비교');
  console.log('========================================\n');

  function getPlacementDist(players) {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    for (const p of players) {
      dist[p.placement] = (dist[p.placement] || 0) + 1;
    }
    return dist;
  }

  const pairDist = getPlacementDist(pairPlayers);
  const singleDist = getPlacementDist(singlePlayers);

  console.log('등수 | 완성+완성 | 각각활용');
  console.log('-----|----------|----------');
  for (let i = 1; i <= 8; i++) {
    const pairPct = (pairDist[i] / pairPlayers.length * 100).toFixed(1);
    const singlePct = (singleDist[i] / singlePlayers.length * 100).toFixed(1);
    console.log(`${i}등  | ${pairPct}% (${pairDist[i]}) | ${singlePct}% (${singleDist[i]})`);
  }

  // 상위4 비율
  const pairTop4 = (pairDist[1] + pairDist[2] + pairDist[3] + pairDist[4]) / pairPlayers.length * 100;
  const singleTop4 = (singleDist[1] + singleDist[2] + singleDist[3] + singleDist[4]) / singlePlayers.length * 100;
  console.log(`\n상위4 비율: 완성+완성 ${pairTop4.toFixed(1)}% vs 각각활용 ${singleTop4.toFixed(1)}%`);

  // === 3. 거인 학살자 보유 챔피언 분석 ===
  console.log('\n========================================');
  console.log('3. 거인 학살자 보유 챔피언 비교');
  console.log('========================================\n');

  const pairChampions = {};
  const singleChampions = {};

  for (const player of pairPlayers) {
    const champ = findChampionWithItem(player.units, mainItem);
    if (champ) {
      pairChampions[champ.name] = (pairChampions[champ.name] || 0) + 1;
    }
  }

  for (const player of singlePlayers) {
    const champ = findChampionWithItem(player.units, mainItem);
    if (champ) {
      singleChampions[champ.name] = (singleChampions[champ.name] || 0) + 1;
    }
  }

  console.log('[완성+완성] 거인 학살자 보유 챔피언 TOP 10:');
  const pairChampSorted = Object.entries(pairChampions).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [name, count] of pairChampSorted) {
    console.log(`  ${name}: ${count}회 (${(count/pairPlayers.length*100).toFixed(1)}%)`);
  }

  console.log('\n[각각활용] 거인 학살자 보유 챔피언 TOP 10:');
  const singleChampSorted = Object.entries(singleChampions).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [name, count] of singleChampSorted) {
    console.log(`  ${name}: ${count}회 (${(count/singlePlayers.length*100).toFixed(1)}%)`);
  }

  // === 4. 거인 학살자와 같은 챔피언에 있는 아이템 ===
  console.log('\n========================================');
  console.log('4. 거인 학살자와 같은 챔피언의 다른 아이템');
  console.log('========================================\n');

  const pairSameChampItems = {};
  const singleSameChampItems = {};

  for (const player of pairPlayers) {
    const champ = findChampionWithItem(player.units, mainItem);
    if (champ) {
      for (const item of champ.items) {
        if (item === mainItem) continue;
        if (ITEM_RECIPES[item]) {
          pairSameChampItems[item] = (pairSameChampItems[item] || 0) + 1;
        }
      }
    }
  }

  for (const player of singlePlayers) {
    const champ = findChampionWithItem(player.units, mainItem);
    if (champ) {
      for (const item of champ.items) {
        if (item === mainItem) continue;
        if (ITEM_RECIPES[item]) {
          singleSameChampItems[item] = (singleSameChampItems[item] || 0) + 1;
        }
      }
    }
  }

  console.log('[완성+완성] 거인 학살자와 같은 챔피언의 아이템 TOP 10:');
  const pairSameItemSorted = Object.entries(pairSameChampItems).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [item, count] of pairSameItemSorted) {
    console.log(`  ${getItemNameKo(item)}: ${count}회 (${(count/pairPlayers.length*100).toFixed(1)}%)`);
  }

  console.log('\n[각각활용] 거인 학살자와 같은 챔피언의 아이템 TOP 10:');
  const singleSameItemSorted = Object.entries(singleSameChampItems).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [item, count] of singleSameItemSorted) {
    console.log(`  ${getItemNameKo(item)}: ${count}회 (${(count/singlePlayers.length*100).toFixed(1)}%)`);
  }

  // === 5. 가고일 돌갑옷은 누가 들고 있나? ===
  console.log('\n========================================');
  console.log('5. 가고일 돌갑옷 보유 챔피언 (완성+완성 그룹)');
  console.log('========================================\n');

  const gargoyleChampions = {};
  let gargoyleSameAsMain = 0;

  for (const player of pairPlayers) {
    const mainChamp = findChampionWithItem(player.units, mainItem);
    const gargoyleChamp = findChampionWithItem(player.units, secondItem);

    if (gargoyleChamp) {
      gargoyleChampions[gargoyleChamp.name] = (gargoyleChampions[gargoyleChamp.name] || 0) + 1;

      if (mainChamp && gargoyleChamp.apiName === mainChamp.apiName) {
        gargoyleSameAsMain++;
      }
    }
  }

  console.log(`가고일 돌갑옷이 거인 학살자와 같은 챔피언: ${gargoyleSameAsMain}회 (${(gargoyleSameAsMain/pairPlayers.length*100).toFixed(1)}%)`);
  console.log(`가고일 돌갑옷이 다른 챔피언: ${pairPlayers.length - gargoyleSameAsMain}회 (${((pairPlayers.length - gargoyleSameAsMain)/pairPlayers.length*100).toFixed(1)}%)\n`);

  console.log('가고일 돌갑옷 보유 챔피언 TOP 10:');
  const gargoyleSorted = Object.entries(gargoyleChampions).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [name, count] of gargoyleSorted) {
    console.log(`  ${name}: ${count}회 (${(count/pairPlayers.length*100).toFixed(1)}%)`);
  }

  // === 6. 같은 아이템 개수로 필터링해서 비교 ===
  console.log('\n========================================');
  console.log('6. 같은 아이템 개수(8개)로 필터링 후 비교');
  console.log('========================================\n');

  const pairWith8Items = pairPlayers.filter(p => countTotalItems(p.units) === 8);
  const singleWith8Items = singlePlayers.filter(p => countTotalItems(p.units) === 8);

  if (pairWith8Items.length > 0 && singleWith8Items.length > 0) {
    const pairAvg8 = pairWith8Items.reduce((s, p) => s + p.placement, 0) / pairWith8Items.length;
    const singleAvg8 = singleWith8Items.reduce((s, p) => s + p.placement, 0) / singleWith8Items.length;

    console.log(`완성+완성 (8개 아이템): ${pairAvg8.toFixed(2)}등 (${pairWith8Items.length}게임)`);
    console.log(`각각활용 (8개 아이템): ${singleAvg8.toFixed(2)}등 (${singleWith8Items.length}게임)`);
    console.log(`차이: ${(pairAvg8 - singleAvg8).toFixed(2)}등`);
  }

  // === 7. 다른 메인 아이템으로 검증 ===
  console.log('\n========================================');
  console.log('7. 무한의 대검으로 같은 분석');
  console.log('========================================\n');

  const ieMain = 'TFT_Item_InfinityEdge';
  const ieSecond = 'TFT_Item_Leviathan'; // 내셔의 이빨
  const ieRemaining = ['GiantsBelt', 'RecurveBow'];

  const iePair = [];
  const ieSingle = [];

  for (const player of allPlayers) {
    if (!hasItem(player.units, ieMain)) continue;

    if (hasItem(player.units, ieSecond)) {
      iePair.push(player);
    } else if (hasItemsFromAllComponents(player.units, ieRemaining)) {
      ieSingle.push(player);
    }
  }

  const iePairItems = iePair.map(p => countTotalItems(p.units));
  const ieSingleItems = ieSingle.map(p => countTotalItems(p.units));

  const iePairAvgItems = iePairItems.reduce((a, b) => a + b, 0) / iePairItems.length;
  const ieSingleAvgItems = ieSingleItems.reduce((a, b) => a + b, 0) / ieSingleItems.length;

  console.log(`무한의 대검 + 내셔의 이빨:`);
  console.log(`  평균 등수: ${(iePair.reduce((s, p) => s + p.placement, 0) / iePair.length).toFixed(2)}등 (${iePair.length}게임)`);
  console.log(`  평균 아이템: ${iePairAvgItems.toFixed(2)}개\n`);

  console.log(`무한의 대검 + 각각활용:`);
  console.log(`  평균 등수: ${(ieSingle.reduce((s, p) => s + p.placement, 0) / ieSingle.length).toFixed(2)}등 (${ieSingle.length}게임)`);
  console.log(`  평균 아이템: ${ieSingleAvgItems.toFixed(2)}개\n`);

  console.log(`아이템 개수 차이: ${(ieSingleAvgItems - iePairAvgItems).toFixed(2)}개`);
}

runAnalysis().catch(console.error);
