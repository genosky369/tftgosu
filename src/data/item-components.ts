/**
 * TFT Set 16 아이템 조합 데이터
 *
 * 출처: Community Dragon (https://raw.communitydragon.org/latest/cdragon/tft/ko_kr.json)
 * 업데이트: 2024-12-27
 */

// 조합 아이템 (컴포넌트)
export const COMPONENT_ITEMS: Record<string, { name: string; nameKo: string }> = {
  "BFSword": { name: "B.F. Sword", nameKo: "대검" },
  "RecurveBow": { name: "Recurve Bow", nameKo: "활" },
  "ChainVest": { name: "Chain Vest", nameKo: "갑옷" },
  "NegatronCloak": { name: "Negatron Cloak", nameKo: "망토" },
  "NeedlesslyLargeRod": { name: "Needlessly Large Rod", nameKo: "지팡이" },
  "TearOfTheGoddess": { name: "Tear of the Goddess", nameKo: "눈물" },
  "GiantsBelt": { name: "Giant's Belt", nameKo: "벨트" },
  "SparringGloves": { name: "Sparring Gloves", nameKo: "장갑" },
  "Spatula": { name: "Spatula", nameKo: "뒤집개" },
};

// 조합 아이템 목록 (UI 선택용)
export const COMPONENT_LIST = [
  { id: "BFSword", nameKo: "대검", icon: "⚔️" },
  { id: "RecurveBow", nameKo: "활", icon: "🏹" },
  { id: "ChainVest", nameKo: "갑옷", icon: "🛡️" },
  { id: "NegatronCloak", nameKo: "망토", icon: "🧥" },
  { id: "NeedlesslyLargeRod", nameKo: "지팡이", icon: "🪄" },
  { id: "TearOfTheGoddess", nameKo: "눈물", icon: "💧" },
  { id: "GiantsBelt", nameKo: "벨트", icon: "🎗️" },
  { id: "SparringGloves", nameKo: "장갑", icon: "🧤" },
];

// 완성 아이템 조합 레시피 (Set 16 기준)
// API 이름 -> { 한글명, 조합 재료 }
export const ITEM_RECIPES: Record<string, { nameKo: string; components: [string, string] }> = {
  // === 대검 (BFSword) 조합 ===
  "TFT_Item_Deathblade": { nameKo: "죽음의 검", components: ["BFSword", "BFSword"] },
  "TFT_Item_MadredsBloodrazor": { nameKo: "거인 학살자", components: ["BFSword", "RecurveBow"] },
  "TFT_Item_GuardianAngel": { nameKo: "밤의 끝자락", components: ["BFSword", "ChainVest"] },
  "TFT_Item_Bloodthirster": { nameKo: "피바라기", components: ["BFSword", "NegatronCloak"] },
  "TFT_Item_HextechGunblade": { nameKo: "마법공학 총검", components: ["BFSword", "NeedlesslyLargeRod"] },
  "TFT_Item_SpearOfShojin": { nameKo: "쇼진의 창", components: ["BFSword", "TearOfTheGoddess"] },
  "TFT_Item_SteraksGage": { nameKo: "스테락의 도전", components: ["BFSword", "GiantsBelt"] },
  "TFT_Item_InfinityEdge": { nameKo: "무한의 대검", components: ["BFSword", "SparringGloves"] },

  // === 활 (RecurveBow) 조합 ===
  "TFT_Item_RapidFireCannon": { nameKo: "붉은 덩굴정령", components: ["RecurveBow", "RecurveBow"] },
  "TFT_Item_TitansResolve": { nameKo: "거인의 결의", components: ["RecurveBow", "ChainVest"] },
  "TFT_Item_RunaansHurricane": { nameKo: "크라켄의 분노", components: ["RecurveBow", "NegatronCloak"] },
  "TFT_Item_GuinsoosRageblade": { nameKo: "구인수의 격노검", components: ["RecurveBow", "NeedlesslyLargeRod"] },
  "TFT_Item_StatikkShiv": { nameKo: "공허의 지팡이", components: ["RecurveBow", "TearOfTheGoddess"] },
  "TFT_Item_Leviathan": { nameKo: "내셔의 이빨", components: ["RecurveBow", "GiantsBelt"] },
  "TFT_Item_LastWhisper": { nameKo: "최후의 속삭임", components: ["RecurveBow", "SparringGloves"] },

  // === 갑옷 (ChainVest) 조합 ===
  "TFT_Item_BrambleVest": { nameKo: "덤불 조끼", components: ["ChainVest", "ChainVest"] },
  "TFT_Item_GargoyleStoneplate": { nameKo: "가고일 돌갑옷", components: ["ChainVest", "NegatronCloak"] },
  "TFT_Item_Crownguard": { nameKo: "크라운가드", components: ["ChainVest", "NeedlesslyLargeRod"] },
  "TFT_Item_FrozenHeart": { nameKo: "수호자의 맹세", components: ["ChainVest", "TearOfTheGoddess"] },
  "TFT_Item_RedBuff": { nameKo: "태양불꽃 망토", components: ["ChainVest", "GiantsBelt"] },
  "TFT_Item_NightHarvester": { nameKo: "굳건한 심장", components: ["ChainVest", "SparringGloves"] },

  // === 망토 (NegatronCloak) 조합 ===
  "TFT_Item_DragonsClaw": { nameKo: "용의 발톱", components: ["NegatronCloak", "NegatronCloak"] },
  "TFT_Item_IonicSpark": { nameKo: "이온 충격기", components: ["NegatronCloak", "NeedlesslyLargeRod"] },
  "TFT_Item_AdaptiveHelm": { nameKo: "적응형 투구", components: ["NegatronCloak", "TearOfTheGoddess"] },
  "TFT_Item_SpectralGauntlet": { nameKo: "저녁갑주", components: ["NegatronCloak", "GiantsBelt"] },
  "TFT_Item_Quicksilver": { nameKo: "수은", components: ["NegatronCloak", "SparringGloves"] },

  // === 지팡이 (NeedlesslyLargeRod) 조합 ===
  "TFT_Item_RabadonsDeathcap": { nameKo: "라바돈의 죽음모자", components: ["NeedlesslyLargeRod", "NeedlesslyLargeRod"] },
  "TFT_Item_ArchangelsStaff": { nameKo: "대천사의 지팡이", components: ["NeedlesslyLargeRod", "TearOfTheGoddess"] },
  "TFT_Item_Morellonomicon": { nameKo: "모렐로노미콘", components: ["NeedlesslyLargeRod", "GiantsBelt"] },
  "TFT_Item_JeweledGauntlet": { nameKo: "보석 건틀릿", components: ["NeedlesslyLargeRod", "SparringGloves"] },

  // === 눈물 (TearOfTheGoddess) 조합 ===
  "TFT_Item_BlueBuff": { nameKo: "푸른 파수꾼", components: ["TearOfTheGoddess", "TearOfTheGoddess"] },
  "TFT_Item_Redemption": { nameKo: "정령의 형상", components: ["TearOfTheGoddess", "GiantsBelt"] },
  "TFT_Item_UnstableConcoction": { nameKo: "정의의 손길", components: ["TearOfTheGoddess", "SparringGloves"] },

  // === 벨트 (GiantsBelt) 조합 ===
  "TFT_Item_WarmogsArmor": { nameKo: "워모그의 갑옷", components: ["GiantsBelt", "GiantsBelt"] },
  "TFT_Item_PowerGauntlet": { nameKo: "타격대의 철퇴", components: ["GiantsBelt", "SparringGloves"] },

  // === 장갑 (SparringGloves) 조합 ===
  "TFT_Item_ThiefsGloves": { nameKo: "도적의 장갑", components: ["SparringGloves", "SparringGloves"] },
};

// 완성 아이템 API 이름 -> 조합 아이템 분해
export function decomposeItem(itemApiName: string): string[] {
  const recipe = ITEM_RECIPES[itemApiName];
  if (recipe) {
    return [...recipe.components];
  }
  // 조합 아이템이면 그대로 반환
  const componentKey = itemApiName.replace("TFT_Item_", "").replace("TFTTutorial_Item_", "");
  if (COMPONENT_ITEMS[componentKey]) {
    return [componentKey];
  }
  return [];
}

// 완성 아이템 한글 이름 가져오기
export function getItemNameKo(itemApiName: string): string {
  const recipe = ITEM_RECIPES[itemApiName];
  if (recipe) {
    return recipe.nameKo;
  }
  // 조합 아이템인 경우
  const componentKey = itemApiName.replace("TFT_Item_", "").replace("TFTTutorial_Item_", "");
  if (COMPONENT_ITEMS[componentKey]) {
    return COMPONENT_ITEMS[componentKey].nameKo;
  }
  return itemApiName;
}

// 조합 아이템 ID -> 한글 이름
export function getComponentNameKo(componentId: string): string {
  return COMPONENT_ITEMS[componentId]?.nameKo || componentId;
}

// 플레이어의 모든 아이템에서 조합 아이템 추출
export function extractAllComponents(itemNames: string[]): string[] {
  const components: string[] = [];
  for (const itemName of itemNames) {
    const decomposed = decomposeItem(itemName);
    components.push(...decomposed);
  }
  return components;
}

// 특정 조합 아이템들이 모두 포함되어 있는지 확인
export function containsAllComponents(
  playerComponents: string[],
  targetComponents: string[]
): boolean {
  const playerCopy = [...playerComponents];

  for (const comp of targetComponents) {
    const idx = playerCopy.indexOf(comp);
    if (idx === -1) return false;
    playerCopy.splice(idx, 1);
  }

  return true;
}

// 특정 조합 아이템이 포함된 완성 아이템 목록 반환
export function getItemsFromComponent(componentId: string): string[] {
  const items: string[] = [];
  for (const [itemApiName, recipe] of Object.entries(ITEM_RECIPES)) {
    if (recipe.components.includes(componentId)) {
      items.push(itemApiName);
    }
  }
  return items;
}

// 남은 조합 아이템들로 만들 수 있는 모든 완성 아이템 목록 반환
export function getItemsFromComponents(componentIds: string[]): string[] {
  const itemSet = new Set<string>();
  for (const compId of componentIds) {
    const items = getItemsFromComponent(compId);
    items.forEach(item => itemSet.add(item));
  }
  return Array.from(itemSet);
}
