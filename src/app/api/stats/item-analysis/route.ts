import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  ITEM_RECIPES,
  getItemNameKo,
  getComponentNameKo,
} from "@/data/item-components";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Unit {
  character_id: string;
  itemNames: string[];
  tier: number;
  rarity: number;
}

interface RawTrait {
  name: string;
  num_units: number;
  style: number;
  tier_current: number;
  tier_total: number;
}

interface PlayerData {
  placement: number;
  units: Unit[];
  traits: RawTrait[];
}

// 시너지 API 이름 → 한글 이름 매핑
const TRAIT_NAME_KO: Record<string, string> = {
  // 지역 (TFT16_ 접두사)
  "TFT16_Bilgewater": "빌지워터",
  "TFT16_Demacia": "데마시아",
  "TFT16_Freljord": "프렐요드",
  "TFT16_Ionia": "아이오니아",
  "TFT16_Ixtal": "이쉬탈",
  "TFT16_Noxus": "녹서스",
  "TFT16_Piltover": "필트오버",
  "TFT16_ShadowIsles": "그림자 군도",
  "TFT16_Shurima": "슈리마",
  "TFT16_Targon": "타곤",
  "TFT16_Void": "공허",
  "TFT16_Zaun": "자운",
  "TFT16_Yordle": "요들",
  // 직업/특성 (TFT16_ 접두사)
  "TFT16_Brawler": "난동꾼",
  "TFT16_Artillery": "원거리 사격",
  "TFT16_Bastion": "파수꾼",
  "TFT16_BatQueen": "학살자",
  "TFT16_Bruiser": "엄호대",
  "TFT16_Conqueror": "토벌자",
  "TFT16_Disruptor": "방해꾼",
  "TFT16_Invoker": "기원자",
  "TFT16_Mage": "비전 마법사",
  "TFT16_Sorcerer": "비전 마법사",
  "TFT16_Marksman": "총잡이",
  "TFT16_Striker": "기동타격대",
  "TFT16_Warbot": "전쟁기계",
  "TFT16_Slayer": "학살자",
  "TFT16_Defender": "파수꾼",
  "TFT16_Explorer": "기동타격대",
  "TFT16_Rapidfire": "원거리 사격",
  // 특수 (TFT16_ 접두사)
  "TFT16_Darkin": "다르킨",
  "TFT16_HexTech": "마법공학기계",
  "TFT16_Dragon": "용족",
  // 유니크 특성 (TFT16_ 접두사)
  "TFT16_Caretaker": "관리인",
  "TFT16_Soulbound": "영혼결속자",
  "TFT16_SoulBond": "영혼결속자",
  "TFT16_DarkChild": "어둠의 아이",
  "TFT16_Runewright": "룬 마법사",
  "TFT16_WorldEnder": "세계의 종결자",
  "TFT16_VoidRiftHerald": "균열의 재앙",
  "TFT16_Emperor": "황제",
  "TFT16_Transcended": "초월체",
  "TFT16_Glutton": "대식가",
  "TFT16_Hero": "영웅",
  "TFT16_Absorber": "흡수자",
  "TFT16_Immortal": "불멸자",
  "TFT16_Eternal": "영겁",
  "TFT16_Huntress": "여사냥꾼",
  "TFT16_Kingpin": "우두머리",
  "TFT16_ChainBreaker": "사슬파괴자",
  "TFT16_Smith": "대장장이",
  "TFT16_StarForger": "별의 창조자",
  "TFT16_TimeGuardian": "시간의 수호자",
  // 추가 시너지 (Set16_ 접두사 또는 다른 형식)
  "Set16_Juggernaut": "난동꾼",
  "TFT16_Juggernaut": "난동꾼",
  "Set16_Heroic": "영웅",
  "TFT16_Heroic": "영웅",
  "Set16_Longshot": "원거리 사격",
  "TFT16_Longshot": "원거리 사격",
  "Set16_Gunslinger": "총잡이",
  "TFT16_Gunslinger": "총잡이",
  "Set16_KindredUnique": "영겁",
  "TFT16_KindredUnique": "영겁",
  "Set16_TheBoss": "우두머리",
  "TFT16_TheBoss": "우두머리",
  "Set16_Blacksmith": "대장장이",
  "TFT16_Blacksmith": "대장장이",
  "Set16_Harvester": "학살자",
  "TFT16_Harvester": "학살자",
  "Set16_ShyvanaUnique": "용족",
  "TFT16_ShyvanaUnique": "용족",
  "Set16_Warden": "파수꾼",
  "TFT16_Warden": "파수꾼",
  "Set16_Magus": "비전 마법사",
  "TFT16_Magus": "비전 마법사",
  "Set16_SylasTrait": "사슬파괴자",
  "TFT16_SylasTrait": "사슬파괴자",
  "Set16_HexMech": "마법공학기계",
  "TFT16_HexMech": "마법공학기계",
  "Set16_Vanquisher": "토벌자",
  "TFT16_Vanquisher": "토벌자",
  "Set16_AurelionSolUnique": "별의 창조자",
  "TFT16_AurelionSolUnique": "별의 창조자",
  "Set16_Chronokeeper": "시간의 수호자",
  "TFT16_Chronokeeper": "시간의 수호자",
  "Set16_RuneMage": "룬 마법사",
  "TFT16_RuneMage": "룬 마법사",
  "Set16_XerathUnique": "초월체",
  "TFT16_XerathUnique": "초월체",
  "Set16_KaisaUnique": "흡수자",
  "TFT16_KaisaUnique": "흡수자",
  "Set16_DarkinWeapon": "다르킨",
  "TFT16_DarkinWeapon": "다르킨",
  "Set16_BaronUnique": "균열의 재앙",
  "TFT16_BaronUnique": "균열의 재앙",
};

function getTraitNameKo(apiName: string): string {
  return TRAIT_NAME_KO[apiName] || apiName.replace("TFT16_", "").replace("Set16_", "");
}

interface ChampionUnit {
  apiName: string;
  name: string;
  items: string[];
  itemNames: string[];
}

interface TraitInfo {
  apiName: string;
  name: string;
  numUnits: number;
  style: number;
}

interface SampleGame {
  placement: number;
  units: ChampionUnit[];
  traits: TraitInfo[];
}

// v3: 결과 타입 (선택 개수에 따라 다름)
interface CombinationResult {
  type: "single_complete" | "complete_plus_component" | "double_complete";
  // 2개 선택: 완성 아이템 1개
  itemApiName?: string;
  itemName?: string;
  components?: string[];
  componentNames?: string[];
  // 3개 선택: 완성 + 남은 조합
  usedComponents?: string[];
  usedComponentNames?: string[];
  remainingComponent?: string;
  remainingComponentName?: string;
  // 4개 선택: 완성 + 완성
  item1ApiName?: string;
  item1Name?: string;
  item1Components?: string[];
  item1ComponentNames?: string[];
  item2ApiName?: string;
  item2Name?: string;
  item2Components?: string[];
  item2ComponentNames?: string[];
  // 공통 통계
  avgPlacement: number;
  gameCount: number;
  topFourRate: number;
  sampleGames: SampleGame[];
}

// 챔피언 ID에서 이름 추출
function getChampionName(characterId: string): string {
  return characterId.replace("TFT16_", "").replace("TFT_", "");
}

// 두 조합 아이템으로 만들 수 있는 완성 아이템 찾기
function findItemFromComponents(comp1: string, comp2: string): string | null {
  for (const [itemApiName, recipe] of Object.entries(ITEM_RECIPES)) {
    const [r1, r2] = recipe.components;
    if ((r1 === comp1 && r2 === comp2) || (r1 === comp2 && r2 === comp1)) {
      return itemApiName;
    }
  }
  return null;
}

// 플레이어가 특정 완성 아이템을 가지고 있는지 확인
function hasItem(units: Unit[], itemApiName: string): boolean {
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    if (unit.itemNames.includes(itemApiName)) return true;
  }
  return false;
}

// 플레이어의 완성 아이템 개수 (가중치 계산용)
function countCompletedItems(units: Unit[]): number {
  let count = 0;
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    count += unit.itemNames.filter(name => name.startsWith("TFT_Item_") || name.startsWith("TFT16_Item_")).length;
  }
  return Math.max(count, 1);
}

// 페이지네이션으로 전체 데이터 가져오기
async function fetchAllPlayers(): Promise<PlayerData[]> {
  const PAGE_SIZE = 1000;
  const allPlayers: PlayerData[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("tft_players")
      .select("placement, units, traits")
      .not("units", "is", null)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("DB 페이지 조회 오류:", error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allPlayers.push(...data.map(p => ({
        placement: p.placement,
        units: p.units as Unit[],
        traits: (p.traits || []) as RawTrait[]
      })));
      offset += PAGE_SIZE;

      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    }
  }

  return allPlayers;
}

// 메모리 캐시 (5분)
let cachedPlayers: PlayerData[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000;

async function getPlayersWithCache(): Promise<PlayerData[]> {
  const now = Date.now();

  if (cachedPlayers && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedPlayers;
  }

  cachedPlayers = await fetchAllPlayers();
  cacheTimestamp = now;
  return cachedPlayers;
}

// 샘플 게임 생성
function createSampleGames(matchingPlayers: { player: PlayerData; weight: number }[], targetItems: string[]): SampleGame[] {
  const latestGames = [...matchingPlayers].reverse().slice(0, 10);
  return latestGames.map(m => {
    const units: ChampionUnit[] = m.player.units
      .filter(u => u.character_id)
      .map(u => ({
        apiName: u.character_id,
        name: getChampionName(u.character_id),
        items: u.itemNames || [],
        itemNames: (u.itemNames || []).map(getItemNameKo),
      }));

    // 활성화된 시너지만 필터링 (style > 0), num_units 내림차순 정렬
    const traits: TraitInfo[] = (m.player.traits || [])
      .filter(t => t.style > 0)
      .sort((a, b) => b.num_units - a.num_units)
      .map(t => ({
        apiName: t.name,
        name: getTraitNameKo(t.name),
        numUnits: t.num_units,
        style: t.style,
      }));

    return {
      placement: m.player.placement,
      units,
      traits,
    };
  });
}

// 통계 계산 (가중 평균)
function calculateStats(matchingPlayers: { player: PlayerData; weight: number }[], targetItems: string[]): {
  avgPlacement: number;
  topFourRate: number;
  sampleGames: SampleGame[];
} {
  if (matchingPlayers.length === 0) {
    return { avgPlacement: 0, topFourRate: 0, sampleGames: [] };
  }

  const totalWeight = matchingPlayers.reduce((sum, m) => sum + m.weight, 0);
  const weightedSum = matchingPlayers.reduce((sum, m) => sum + m.player.placement * m.weight, 0);
  const avgPlacement = weightedSum / totalWeight;

  const topFourWeight = matchingPlayers.filter(m => m.player.placement <= 4).reduce((sum, m) => sum + m.weight, 0);
  const topFourRate = Math.round((topFourWeight / totalWeight) * 100);

  const sampleGames = createSampleGames(matchingPlayers, targetItems);

  return {
    avgPlacement: Math.round(avgPlacement * 100) / 100,
    topFourRate,
    sampleGames,
  };
}

// ============ 2개 선택: 완성 아이템 1개 ============
function processTwo(components: string[], players: PlayerData[]): CombinationResult[] {
  const results: CombinationResult[] = [];
  const itemApiName = findItemFromComponents(components[0], components[1]);

  if (!itemApiName) return results;

  const matchingPlayers: { player: PlayerData; weight: number }[] = [];
  for (const p of players) {
    if (!p.units) continue;
    if (!hasItem(p.units, itemApiName)) continue;
    const itemCount = countCompletedItems(p.units);
    matchingPlayers.push({ player: p, weight: 1 / itemCount });
  }

  const stats = calculateStats(matchingPlayers, [itemApiName]);

  results.push({
    type: "single_complete",
    itemApiName,
    itemName: getItemNameKo(itemApiName),
    components: [...components],
    componentNames: components.map(getComponentNameKo),
    avgPlacement: stats.avgPlacement,
    gameCount: matchingPlayers.length,
    topFourRate: stats.topFourRate,
    sampleGames: stats.sampleGames,
  });

  return results;
}

// ============ 3개 선택: 완성 + 남은 조합 ============
function processThree(components: string[], players: PlayerData[]): CombinationResult[] {
  const results: CombinationResult[] = [];
  const addedKeys = new Set<string>();

  // 3개 중 2개를 선택하는 모든 조합
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const comp1 = components[i];
      const comp2 = components[j];
      const remaining = components.filter((_, idx) => idx !== i && idx !== j)[0];

      const itemApiName = findItemFromComponents(comp1, comp2);
      if (!itemApiName) continue;

      // 중복 방지 (아이템 + 남은조합 키)
      const key = `${itemApiName}|${remaining}`;
      if (addedKeys.has(key)) continue;
      addedKeys.add(key);

      // 해당 아이템 보유 플레이어 필터링
      const matchingPlayers: { player: PlayerData; weight: number }[] = [];
      for (const p of players) {
        if (!p.units) continue;
        if (!hasItem(p.units, itemApiName)) continue;
        const itemCount = countCompletedItems(p.units);
        matchingPlayers.push({ player: p, weight: 1 / itemCount });
      }

      const stats = calculateStats(matchingPlayers, [itemApiName]);

      results.push({
        type: "complete_plus_component",
        itemApiName,
        itemName: getItemNameKo(itemApiName),
        usedComponents: [comp1, comp2],
        usedComponentNames: [getComponentNameKo(comp1), getComponentNameKo(comp2)],
        remainingComponent: remaining,
        remainingComponentName: getComponentNameKo(remaining),
        avgPlacement: stats.avgPlacement,
        gameCount: matchingPlayers.length,
        topFourRate: stats.topFourRate,
        sampleGames: stats.sampleGames,
      });
    }
  }

  return results;
}

// ============ 4개 선택: 완성 + 완성 ============
function processFour(components: string[], players: PlayerData[]): CombinationResult[] {
  const results: CombinationResult[] = [];
  const addedKeys = new Set<string>();

  // 4개를 2개씩 나누는 모든 조합
  // (0,1)+(2,3), (0,2)+(1,3), (0,3)+(1,2)
  const partitions = [
    [[0, 1], [2, 3]],
    [[0, 2], [1, 3]],
    [[0, 3], [1, 2]],
  ];

  for (const partition of partitions) {
    const [pair1, pair2] = partition;
    const comp1a = components[pair1[0]];
    const comp1b = components[pair1[1]];
    const comp2a = components[pair2[0]];
    const comp2b = components[pair2[1]];

    const item1 = findItemFromComponents(comp1a, comp1b);
    const item2 = findItemFromComponents(comp2a, comp2b);

    if (!item1 || !item2) continue;

    // 중복 방지 (A+B와 B+A는 같음)
    const sortedKey = [item1, item2].sort().join("|");
    if (addedKeys.has(sortedKey)) continue;
    addedKeys.add(sortedKey);

    // 두 아이템 모두 보유한 플레이어 필터링
    const matchingPlayers: { player: PlayerData; weight: number }[] = [];
    for (const p of players) {
      if (!p.units) continue;
      if (!hasItem(p.units, item1)) continue;
      if (!hasItem(p.units, item2)) continue;
      const itemCount = countCompletedItems(p.units);
      matchingPlayers.push({ player: p, weight: 1 / itemCount });
    }

    const stats = calculateStats(matchingPlayers, [item1, item2]);

    results.push({
      type: "double_complete",
      item1ApiName: item1,
      item1Name: getItemNameKo(item1),
      item1Components: [comp1a, comp1b],
      item1ComponentNames: [getComponentNameKo(comp1a), getComponentNameKo(comp1b)],
      item2ApiName: item2,
      item2Name: getItemNameKo(item2),
      item2Components: [comp2a, comp2b],
      item2ComponentNames: [getComponentNameKo(comp2a), getComponentNameKo(comp2b)],
      avgPlacement: stats.avgPlacement,
      gameCount: matchingPlayers.length,
      topFourRate: stats.topFourRate,
      sampleGames: stats.sampleGames,
    });
  }

  return results;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { components } = body as { components: string[] };

    if (!components || !Array.isArray(components) || components.length === 0) {
      return NextResponse.json(
        { error: "조합 아이템을 선택해주세요" },
        { status: 400 }
      );
    }

    if (components.length < 2) {
      return NextResponse.json(
        { error: "조합 아이템을 2개 이상 선택해주세요" },
        { status: 400 }
      );
    }
    if (components.length > 4) {
      return NextResponse.json(
        { error: "조합 아이템은 최대 4개까지 선택 가능합니다" },
        { status: 400 }
      );
    }

    const players = await getPlayersWithCache();

    if (players.length === 0) {
      return NextResponse.json(
        { error: "수집된 데이터가 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 404 }
      );
    }

    let results: CombinationResult[] = [];

    // 선택 개수에 따라 다른 로직 적용
    if (components.length === 2) {
      results = processTwo(components, players);
    } else if (components.length === 3) {
      results = processThree(components, players);
    } else if (components.length === 4) {
      results = processFour(components, players);
    }

    if (results.length === 0) {
      return NextResponse.json({
        totalRecords: players.length,
        inputComponents: components,
        inputComponentNames: components.map(getComponentNameKo),
        combinations: [],
        message: "선택한 조합 아이템으로 만들 수 있는 완성 아이템이 없습니다",
      });
    }

    // 평균 순위로 정렬 (낮을수록 좋음)
    results.sort((a, b) => {
      if (a.gameCount === 0 && b.gameCount === 0) return 0;
      if (a.gameCount === 0) return 1;
      if (b.gameCount === 0) return -1;
      return a.avgPlacement - b.avgPlacement;
    });

    return NextResponse.json({
      totalRecords: players.length,
      inputComponents: components,
      inputComponentNames: components.map(getComponentNameKo),
      combinations: results,
    });

  } catch (error) {
    console.error("API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// GET: 현재 데이터 상태 확인
export async function GET() {
  try {
    const { count, error } = await supabase
      .from("tft_players")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      totalRecords: count,
      status: count && count > 0 ? "ready" : "collecting",
      cacheAge: cachedPlayers ? Math.floor((Date.now() - cacheTimestamp) / 1000) : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}
