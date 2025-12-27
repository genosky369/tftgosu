import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  ITEM_RECIPES,
  getItemNameKo,
  getComponentNameKo,
  getItemsFromComponents,
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

interface PlayerData {
  placement: number;
  units: Unit[];
}

interface ChampionUnit {
  apiName: string;
  name: string;
  items: string[];
  itemNames: string[];
}

interface SampleGame {
  placement: number;
  units: ChampionUnit[];
}

interface CombinationResult {
  mainItem: string;
  mainItemName: string;
  secondItem?: string;           // 두 번째 완성 아이템 (4개 선택 시)
  secondItemName?: string;
  usedComponents: string[];
  remainingComponents: string[];
  remainingComponentNames: string[];
  avgPlacement: number;
  gameCount: number;
  topFourRate: number;
  sampleGames: SampleGame[];
}

// 챔피언 ID에서 이름 추출
function getChampionName(characterId: string): string {
  return characterId.replace("TFT16_", "").replace("TFT_", "");
}

// 선택한 조합 아이템으로 만들 수 있는 모든 완성 아이템 찾기
function findPossibleItems(components: string[]): { itemApiName: string; usedComponents: [string, string] }[] {
  const possible: { itemApiName: string; usedComponents: [string, string] }[] = [];

  for (const [itemApiName, recipe] of Object.entries(ITEM_RECIPES)) {
    const [comp1, comp2] = recipe.components;
    const componentsCopy = [...components];

    const idx1 = componentsCopy.indexOf(comp1);
    if (idx1 === -1) continue;
    componentsCopy.splice(idx1, 1);

    const idx2 = componentsCopy.indexOf(comp2);
    if (idx2 === -1) continue;

    possible.push({
      itemApiName,
      usedComponents: [comp1, comp2],
    });
  }

  return possible;
}

// 정확히 2개의 조합 아이템으로 만들 수 있는 완성 아이템 찾기
function findItemFromTwoComponents(comp1: string, comp2: string): string | null {
  for (const [itemApiName, recipe] of Object.entries(ITEM_RECIPES)) {
    const [r1, r2] = recipe.components;
    // 두 조합이 일치하는지 확인 (순서 무관)
    if ((r1 === comp1 && r2 === comp2) || (r1 === comp2 && r2 === comp1)) {
      return itemApiName;
    }
  }
  return null;
}

// 남은 조합 아이템 계산
function getRemainingComponents(allComponents: string[], usedComponents: string[]): string[] {
  const remaining = [...allComponents];
  for (const used of usedComponents) {
    const idx = remaining.indexOf(used);
    if (idx !== -1) {
      remaining.splice(idx, 1);
    }
  }
  return remaining;
}

// 플레이어가 특정 완성 아이템을 가지고 있는지 확인
function hasItem(units: Unit[], itemApiName: string): boolean {
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    if (unit.itemNames.includes(itemApiName)) return true;
  }
  return false;
}

// 플레이어가 특정 아이템 목록 중 하나라도 가지고 있는지 확인
function hasAnyItem(units: Unit[], itemApiNames: string[]): boolean {
  if (itemApiNames.length === 0) return true; // 확인할 아이템 없으면 통과
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    for (const itemName of unit.itemNames) {
      if (itemApiNames.includes(itemName)) return true;
    }
  }
  return false;
}

// 플레이어의 모든 아이템 가져오기
function getAllItems(units: Unit[]): string[] {
  const items: string[] = [];
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    items.push(...unit.itemNames);
  }
  return items;
}

// 플레이어의 완성 아이템 개수 (가중치 계산용)
function countCompletedItems(units: Unit[]): number {
  let count = 0;
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    // TFT_Item_ 으로 시작하는 완성 아이템만 카운트
    count += unit.itemNames.filter(name => name.startsWith("TFT_Item_")).length;
  }
  return Math.max(count, 1); // 0 방지
}

// 플레이어의 모든 챔피언 가져오기
function getAllChampions(units: Unit[]): string[] {
  return units.map(u => u.character_id).filter(Boolean);
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
      .select("placement, units")
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
        units: p.units as Unit[]
      })));
      offset += PAGE_SIZE;

      // 마지막 페이지면 종료
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
const CACHE_DURATION = 5 * 60 * 1000; // 5분

async function getPlayersWithCache(): Promise<PlayerData[]> {
  const now = Date.now();

  if (cachedPlayers && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedPlayers;
  }

  cachedPlayers = await fetchAllPlayers();
  cacheTimestamp = now;
  return cachedPlayers;
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

    // 최소 2개, 최대 4개 제한
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

    // 1. 선택한 조합 아이템으로 만들 수 있는 완성 아이템 경우의 수 계산
    const possibleItems = findPossibleItems(components);

    if (possibleItems.length === 0) {
      return NextResponse.json({
        totalGames: 0,
        combinations: [],
        message: "선택한 조합 아이템으로 만들 수 있는 완성 아이템이 없습니다",
      });
    }

    // 2. DB에서 플레이어 데이터 가져오기 (캐시 사용)
    const players = await getPlayersWithCache();

    if (players.length === 0) {
      return NextResponse.json(
        { error: "수집된 데이터가 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 404 }
      );
    }

    // 3. 각 경우의 수별로 통계 계산
    const results: CombinationResult[] = [];
    let totalMatchingGames = 0;

    // 중복 2개 아이템 조합 추적 (A+B와 B+A는 같은 것)
    const addedTwoItemCombos = new Set<string>();

    for (const possible of possibleItems) {
      const { itemApiName, usedComponents } = possible;
      const remainingComponents = getRemainingComponents(components, usedComponents);

      // 해당 아이템을 가진 게임 필터링 (가중치 포함)
      const matchingGames: { player: PlayerData; weight: number }[] = [];

      // 남은 조합 아이템으로 만들 수 있는 완성 아이템 목록
      const possibleItemsFromRemaining = getItemsFromComponents(remainingComponents);

      for (const player of players) {
        if (!player.units) continue;

        // 조건 1: 메인 완성 아이템 보유
        if (!hasItem(player.units, itemApiName)) continue;

        // 조건 2: 남은 조합 아이템으로 만들 수 있는 아이템 중 하나 보유 (남은 템이 있는 경우에만)
        if (remainingComponents.length > 0 && !hasAnyItem(player.units, possibleItemsFromRemaining)) {
          continue;
        }

        // 아이템 개수에 반비례하는 가중치 (많은 아이템 = 낮은 가중치)
        const itemCount = countCompletedItems(player.units);
        const weight = 1 / itemCount;
        matchingGames.push({ player, weight });
      }

      totalMatchingGames += matchingGames.length;

      // 통계 계산 (가중 평균)
      let avgPlacement = 0;
      let topFourRate = 0;
      let sampleGames: SampleGame[] = [];

      if (matchingGames.length > 0) {
        // 가중 평균 등수 계산
        const totalWeight = matchingGames.reduce((sum, g) => sum + g.weight, 0);
        const weightedSum = matchingGames.reduce((sum, g) => sum + g.player.placement * g.weight, 0);
        avgPlacement = weightedSum / totalWeight;

        // 상위4 비율 (가중치 적용)
        const topFourWeight = matchingGames
          .filter(g => g.player.placement <= 4)
          .reduce((sum, g) => sum + g.weight, 0);
        topFourRate = Math.round((topFourWeight / totalWeight) * 100);

        // 샘플 게임 (최대 10개, 최신순 - DB 삽입 역순)
        // matchingGames는 DB에서 id순으로 가져옴, 뒤에서부터 10개 = 최신 데이터
        const latestGames = [...matchingGames].reverse().slice(0, 10);
        sampleGames = latestGames.map(g => {
          const units: ChampionUnit[] = g.player.units
            .filter(u => u.character_id)
            .map(u => ({
              apiName: u.character_id,
              name: getChampionName(u.character_id),
              items: u.itemNames || [],
              itemNames: (u.itemNames || []).map(getItemNameKo),
            }));

          return {
            placement: g.player.placement,
            units,
          };
        });
      }

      results.push({
        mainItem: itemApiName,
        mainItemName: getItemNameKo(itemApiName),
        usedComponents,
        remainingComponents,
        remainingComponentNames: remainingComponents.map(getComponentNameKo),
        avgPlacement: Math.round(avgPlacement * 100) / 100,
        gameCount: matchingGames.length,
        topFourRate,
        sampleGames,
      });

      // === 2개 아이템 조합 통계 추가 ===
      // 남은 조합 아이템이 정확히 2개인 경우, 두 번째 완성 아이템 가능 여부 확인
      if (remainingComponents.length === 2) {
        const secondItemApiName = findItemFromTwoComponents(remainingComponents[0], remainingComponents[1]);

        if (secondItemApiName) {
          // 중복 체크: [A, B]와 [B, A]를 같은 것으로 처리
          const comboKey = [itemApiName, secondItemApiName].sort().join("|");
          if (addedTwoItemCombos.has(comboKey)) {
            // 이미 추가된 조합이면 건너뛰기
            continue;
          }
          addedTwoItemCombos.add(comboKey);
          // 두 아이템 모두 보유한 게임 필터링
          const twoItemMatchingGames: { player: PlayerData; weight: number }[] = [];

          for (const player of players) {
            if (!player.units) continue;

            // 두 완성 아이템 모두 보유
            if (!hasItem(player.units, itemApiName)) continue;
            if (!hasItem(player.units, secondItemApiName)) continue;

            const itemCount = countCompletedItems(player.units);
            const weight = 1 / itemCount;
            twoItemMatchingGames.push({ player, weight });
          }

          if (twoItemMatchingGames.length > 0) {
            const totalWeight2 = twoItemMatchingGames.reduce((sum, g) => sum + g.weight, 0);
            const weightedSum2 = twoItemMatchingGames.reduce((sum, g) => sum + g.player.placement * g.weight, 0);
            const avgPlacement2 = weightedSum2 / totalWeight2;

            const topFourWeight2 = twoItemMatchingGames
              .filter(g => g.player.placement <= 4)
              .reduce((sum, g) => sum + g.weight, 0);
            const topFourRate2 = Math.round((topFourWeight2 / totalWeight2) * 100);

            const latestGames2 = [...twoItemMatchingGames].reverse().slice(0, 10);
            const sampleGames2 = latestGames2.map(g => {
              const units: ChampionUnit[] = g.player.units
                .filter(u => u.character_id)
                .map(u => ({
                  apiName: u.character_id,
                  name: getChampionName(u.character_id),
                  items: u.itemNames || [],
                  itemNames: (u.itemNames || []).map(getItemNameKo),
                }));

              return {
                placement: g.player.placement,
                units,
              };
            });

            results.push({
              mainItem: itemApiName,
              mainItemName: getItemNameKo(itemApiName),
              secondItem: secondItemApiName,
              secondItemName: getItemNameKo(secondItemApiName),
              usedComponents: [...usedComponents, remainingComponents[0], remainingComponents[1]],
              remainingComponents: [],
              remainingComponentNames: [],
              avgPlacement: Math.round(avgPlacement2 * 100) / 100,
              gameCount: twoItemMatchingGames.length,
              topFourRate: topFourRate2,
              sampleGames: sampleGames2,
            });

            totalMatchingGames += twoItemMatchingGames.length;
          }
        }
      }
    }

    // 평균 순위로 정렬 (낮을수록 좋음)
    results.sort((a, b) => {
      if (a.gameCount === 0 && b.gameCount === 0) return 0;
      if (a.gameCount === 0) return 1;
      if (b.gameCount === 0) return -1;
      return a.avgPlacement - b.avgPlacement;
    });

    const componentNames = components.map(getComponentNameKo);

    return NextResponse.json({
      totalRecords: players.length,
      inputComponents: components,
      inputComponentNames: componentNames,
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
