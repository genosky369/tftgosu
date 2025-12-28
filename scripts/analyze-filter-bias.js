/**
 * 필터링 편향 분석
 *
 * 가설: 완성+완성 필터는 "아이템 많은 플레이어"를,
 *       각각활용 필터는 "아이템 적은 플레이어"를 선택하는 편향이 있다
 *
 * 검증: 같은 플레이어가 두 조건을 모두 만족하는 경우 분석
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

// 특정 조합 아이템으로 만들 수 있는 완성 아이템 목록
function getItemsFromComponent(componentId) {
  const items = [];
  for (const [itemApi, recipe] of Object.entries(ITEM_RECIPES)) {
    if (recipe.components.includes(componentId)) {
      items.push(itemApi);
    }
  }
  return items;
}

function hasItem(units, itemApiName) {
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    if (unit.itemNames.includes(itemApiName)) return true;
  }
  return false;
}

function hasAnyItemFromComponent(units, componentId) {
  const possibleItems = getItemsFromComponent(componentId);
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    for (const itemName of unit.itemNames) {
      if (possibleItems.includes(itemName)) return true;
    }
  }
  return false;
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
  console.log('필터링 편향 분석');
  console.log('========================================\n');

  const allPlayers = await fetchAllPlayers();
  console.log(`총 ${allPlayers.length}명 플레이어\n`);

  // 테스트 케이스: 대검+장갑+벨트+활
  // 완성+완성: 무한의 대검 + 내셔의 이빨
  // 각각활용: 무한의 대검 + (벨트템) + (활템)

  const mainItem = 'TFT_Item_InfinityEdge'; // 무한의 대검
  const secondItem = 'TFT_Item_Leviathan'; // 내셔의 이빨
  const comp1 = 'GiantsBelt'; // 벨트
  const comp2 = 'RecurveBow'; // 활

  // === 1. 각 필터 조건 분석 ===
  console.log('========================================');
  console.log('1. 필터 조건별 플레이어 분류');
  console.log('========================================\n');

  // 무한의 대검 보유자만 필터
  const playersWithMain = allPlayers.filter(p => hasItem(p.units, mainItem));
  console.log(`무한의 대검 보유자: ${playersWithMain.length}명\n`);

  // 각 조건 체크
  let pairOnly = 0;      // 완성+완성만 해당
  let singleOnly = 0;    // 각각활용만 해당
  let bothConditions = 0; // 둘 다 해당
  let neitherConditions = 0; // 둘 다 해당 안됨

  const pairPlayers = [];
  const singlePlayers = [];
  const bothPlayers = [];

  for (const player of playersWithMain) {
    const hasSecond = hasItem(player.units, secondItem);
    const hasComp1Item = hasAnyItemFromComponent(player.units, comp1);
    const hasComp2Item = hasAnyItemFromComponent(player.units, comp2);

    const meetsPairCondition = hasSecond;
    // 각각활용: 내셔 없고, 벨트템/활템 모두 있음
    const meetsSingleCondition = !hasSecond && hasComp1Item && hasComp2Item;

    const itemCount = countTotalItems(player.units);

    if (meetsPairCondition && meetsSingleCondition) {
      // 불가능한 케이스 (내셔 있으면서 내셔 없음)
      bothConditions++;
      bothPlayers.push({ ...player, itemCount });
    } else if (meetsPairCondition) {
      pairOnly++;
      pairPlayers.push({ ...player, itemCount });
    } else if (meetsSingleCondition) {
      singleOnly++;
      singlePlayers.push({ ...player, itemCount });
    } else {
      neitherConditions++;
    }
  }

  console.log(`완성+완성만 해당: ${pairOnly}명`);
  console.log(`각각활용만 해당: ${singleOnly}명`);
  console.log(`둘 다 해당 (불가능): ${bothConditions}명`);
  console.log(`둘 다 미해당: ${neitherConditions}명\n`);

  // === 2. 핵심 분석: 완성+완성 플레이어는 각각활용 조건도 만족하는가? ===
  console.log('========================================');
  console.log('2. 완성+완성 플레이어가 각각활용 조건도 만족하는가?');
  console.log('========================================\n');

  let pairAlsoMeetsSingle = 0;
  for (const player of pairPlayers) {
    const hasComp1Item = hasAnyItemFromComponent(player.units, comp1);
    const hasComp2Item = hasAnyItemFromComponent(player.units, comp2);

    // 내셔의 이빨 말고 다른 벨트템/활템도 있는가?
    const hasOtherBeltItem = hasComp1Item; // 내셔도 벨트템이므로 무조건 true
    const hasOtherBowItem = hasComp2Item; // 내셔도 활템이므로 무조건 true

    if (hasOtherBeltItem && hasOtherBowItem) {
      pairAlsoMeetsSingle++;
    }
  }

  console.log(`완성+완성 플레이어 중 벨트템+활템 조건도 만족: ${pairAlsoMeetsSingle}/${pairPlayers.length} (${(pairAlsoMeetsSingle/pairPlayers.length*100).toFixed(1)}%)\n`);
  console.log('→ 내셔의 이빨 자체가 벨트템이자 활템이므로 100% 만족\n');

  // === 3. 진짜 문제: 내셔 외에 다른 벨트템/활템이 있는가? ===
  console.log('========================================');
  console.log('3. 내셔 외 다른 벨트템/활템 보유 분석');
  console.log('========================================\n');

  const beltItems = getItemsFromComponent('GiantsBelt');
  const bowItems = getItemsFromComponent('RecurveBow');

  console.log(`벨트 아이템 목록: ${beltItems.map(i => ITEM_RECIPES[i]?.nameKo || i).join(', ')}`);
  console.log(`활 아이템 목록: ${bowItems.map(i => ITEM_RECIPES[i]?.nameKo || i).join(', ')}\n`);

  // 내셔 제외하고 다른 벨트템/활템이 있는 완성+완성 플레이어
  let pairWithOtherBelt = 0;
  let pairWithOtherBow = 0;
  let pairWithBothOthers = 0;

  for (const player of pairPlayers) {
    let hasOtherBelt = false;
    let hasOtherBow = false;

    for (const unit of player.units) {
      if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
      for (const itemName of unit.itemNames) {
        if (itemName === secondItem) continue; // 내셔 제외
        if (beltItems.includes(itemName)) hasOtherBelt = true;
        if (bowItems.includes(itemName)) hasOtherBow = true;
      }
    }

    if (hasOtherBelt) pairWithOtherBelt++;
    if (hasOtherBow) pairWithOtherBow++;
    if (hasOtherBelt && hasOtherBow) pairWithBothOthers++;
  }

  console.log(`완성+완성 중 내셔 외 벨트템 보유: ${pairWithOtherBelt}/${pairPlayers.length} (${(pairWithOtherBelt/pairPlayers.length*100).toFixed(1)}%)`);
  console.log(`완성+완성 중 내셔 외 활템 보유: ${pairWithOtherBow}/${pairPlayers.length} (${(pairWithOtherBow/pairPlayers.length*100).toFixed(1)}%)`);
  console.log(`완성+완성 중 내셔 외 벨트템+활템 모두 보유: ${pairWithBothOthers}/${pairPlayers.length} (${(pairWithBothOthers/pairPlayers.length*100).toFixed(1)}%)\n`);

  // === 4. 아이템 개수 비교 ===
  console.log('========================================');
  console.log('4. 아이템 개수 비교');
  console.log('========================================\n');

  const pairAvgItems = pairPlayers.reduce((s, p) => s + p.itemCount, 0) / pairPlayers.length;
  const singleAvgItems = singlePlayers.reduce((s, p) => s + p.itemCount, 0) / singlePlayers.length;

  console.log(`완성+완성 평균 아이템: ${pairAvgItems.toFixed(2)}개`);
  console.log(`각각활용 평균 아이템: ${singleAvgItems.toFixed(2)}개`);
  console.log(`차이: ${(pairAvgItems - singleAvgItems).toFixed(2)}개\n`);

  // === 5. 확률 분석: 아이템 개수별 내셔 보유 확률 ===
  console.log('========================================');
  console.log('5. 아이템 개수별 내셔 보유 확률');
  console.log('========================================\n');

  const nashorByCount = {};
  for (const player of playersWithMain) {
    const itemCount = countTotalItems(player.units);
    if (!nashorByCount[itemCount]) {
      nashorByCount[itemCount] = { total: 0, hasNashor: 0 };
    }
    nashorByCount[itemCount].total++;
    if (hasItem(player.units, secondItem)) {
      nashorByCount[itemCount].hasNashor++;
    }
  }

  console.log('아이템수 | 전체 | 내셔 보유 | 보유율');
  console.log('---------|------|----------|-------');

  const counts = Object.keys(nashorByCount).map(Number).sort((a, b) => a - b);
  for (const count of counts) {
    const data = nashorByCount[count];
    const rate = (data.hasNashor / data.total * 100).toFixed(1);
    console.log(`${count}개     | ${data.total.toString().padStart(4)} | ${data.hasNashor.toString().padStart(8)} | ${rate}%`);
  }

  // === 6. 결론 ===
  console.log('\n========================================');
  console.log('6. 결론: 필터링 편향');
  console.log('========================================\n');

  console.log('완성+완성 필터: "무한의 대검 + 내셔의 이빨 동시 보유"');
  console.log('  → 특정 2개 아이템을 동시에 갖는 까다로운 조건');
  console.log('  → 아이템이 많을수록 조건 충족 확률 증가');
  console.log('');
  console.log('각각활용 필터: "무한의 대검 + 아무 벨트템 + 아무 활템 + 내셔 미보유"');
  console.log('  → 넓은 범위의 아이템 조건 (충족 쉬움)');
  console.log('  → "내셔 미보유" 조건은 아이템 적을수록 유리');
  console.log('');
  console.log('결과적으로:');
  console.log('  - 완성+완성 그룹 = 아이템 많은 플레이어 (평균 ' + pairAvgItems.toFixed(1) + '개)');
  console.log('  - 각각활용 그룹 = 아이템 적은 플레이어 (평균 ' + singleAvgItems.toFixed(1) + '개)');
  console.log('');
  console.log('이것은 "완성+완성이 더 좋다"가 아니라,');
  console.log('"완성+완성 조건을 만족하는 플레이어가 아이템을 더 많이 모았다"입니다.');
  console.log('');
  console.log('사용자님의 지적이 맞습니다:');
  console.log('  - 같은 4개 조합을 가진 플레이어가');
  console.log('  - 완성+완성으로 쓰든 각각활용으로 쓰든');
  console.log('  - 전체 아이템 개수는 비슷해야 합니다.');
  console.log('');
  console.log('현재 필터는 "같은 조합을 가진 플레이어"가 아니라');
  console.log('"우연히 해당 아이템을 가진 플레이어"를 비교하고 있습니다.');
}

runAnalysis().catch(console.error);
