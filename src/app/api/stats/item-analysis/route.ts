import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  COMPONENT_ITEMS,
  ITEM_RECIPES,
  decomposeItem,
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

interface PlayerData {
  placement: number;
  units: Unit[];
}

interface SampleGame {
  placement: number;
  champions: string[];
  championNames: string[];
  allItems: string[];
  allItemNames: string[];
}

interface CombinationResult {
  mainItem: string;
  mainItemName: string;
  usedComponents: string[];
  remainingComponents: string[];
  remainingComponentNames: string[];
  avgPlacement: number;
  gameCount: number;
  topFourRate: number;
  sampleGames: SampleGame[];
}

// 챔피언 ID에서 한글 이름 추출 (간단 버전)
function getChampionName(characterId: string): string {
  // TFT16_Jinx -> Jinx
  return characterId.replace("TFT16_", "").replace("TFT_", "");
}

// 선택한 조합 아이템으로 만들 수 있는 모든 완성 아이템 찾기
function findPossibleItems(components: string[]): { itemApiName: string; usedComponents: [string, string] }[] {
  const possible: { itemApiName: string; usedComponents: [string, string] }[] = [];

  for (const [itemApiName, recipe] of Object.entries(ITEM_RECIPES)) {
    const [comp1, comp2] = recipe.components;

    // 조합 아이템이 모두 있는지 확인
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

// 플레이어의 모든 아이템 가져오기
function getAllItems(units: Unit[]): string[] {
  const items: string[] = [];
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    items.push(...unit.itemNames);
  }
  return items;
}

// 플레이어의 모든 챔피언 가져오기
function getAllChampions(units: Unit[]): string[] {
  return units.map(u => u.character_id).filter(Boolean);
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

    // 1. 선택한 조합 아이템으로 만들 수 있는 완성 아이템 경우의 수 계산
    const possibleItems = findPossibleItems(components);

    if (possibleItems.length === 0) {
      return NextResponse.json({
        totalGames: 0,
        combinations: [],
        message: "선택한 조합 아이템으로 만들 수 있는 완성 아이템이 없습니다",
      });
    }

    // 2. DB에서 모든 플레이어 데이터 가져오기
    const { data: players, error } = await supabase
      .from("tft_players")
      .select("placement, units")
      .not("units", "is", null);

    if (error) {
      console.error("DB 오류:", error);
      return NextResponse.json(
        { error: "데이터베이스 오류" },
        { status: 500 }
      );
    }

    if (!players || players.length === 0) {
      return NextResponse.json(
        { error: "수집된 데이터가 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 404 }
      );
    }

    // 3. 각 경우의 수별로 통계 계산
    const results: CombinationResult[] = [];
    let totalMatchingGames = 0;

    for (const possible of possibleItems) {
      const { itemApiName, usedComponents } = possible;
      const remainingComponents = getRemainingComponents(components, usedComponents);

      // 해당 아이템을 가진 게임 필터링
      const matchingGames: PlayerData[] = [];

      for (const player of players) {
        const units = player.units as Unit[];
        if (!units) continue;

        if (hasItem(units, itemApiName)) {
          matchingGames.push({
            placement: player.placement,
            units,
          });
        }
      }

      totalMatchingGames += matchingGames.length;

      // 통계 계산 (데이터가 없어도 결과에 포함)
      let avgPlacement = 0;
      let topFourRate = 0;
      let sampleGames: SampleGame[] = [];

      if (matchingGames.length > 0) {
        const placements = matchingGames.map(g => g.placement);
        avgPlacement = placements.reduce((a, b) => a + b, 0) / placements.length;
        const topFourCount = placements.filter(p => p <= 4).length;
        topFourRate = Math.round((topFourCount / matchingGames.length) * 100);

        // 샘플 게임 (최대 10개, 순위 좋은 순)
        const sortedGames = [...matchingGames].sort((a, b) => a.placement - b.placement);
        sampleGames = sortedGames.slice(0, 10).map(game => {
          const champions = getAllChampions(game.units);
          const allItems = getAllItems(game.units);

          return {
            placement: game.placement,
            champions,
            championNames: champions.map(getChampionName),
            allItems,
            allItemNames: allItems.map(getItemNameKo),
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
    }

    // 평균 순위로 정렬 (낮을수록 좋음, 데이터 없는 항목은 맨 뒤로)
    results.sort((a, b) => {
      // 데이터 없는 항목은 맨 뒤로
      if (a.gameCount === 0 && b.gameCount === 0) return 0;
      if (a.gameCount === 0) return 1;
      if (b.gameCount === 0) return -1;
      return a.avgPlacement - b.avgPlacement;
    });

    // 조합 아이템 이름 반환용
    const componentNames = components.map(getComponentNameKo);

    return NextResponse.json({
      totalGames: totalMatchingGames,
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
    });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}
