/**
 * 아이템 개수 필터 검증 스크립트
 * 동일 모집단 필터(10~14개)가 적용되었는지 확인
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MIN_ITEM_COUNT = 10;
const MAX_ITEM_COUNT = 14;

// 완성 아이템 개수 계산
function countCompletedItems(units) {
  let count = 0;
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    count += unit.itemNames.filter(name => name.startsWith("TFT_Item_")).length;
  }
  return Math.max(count, 1);
}

// 아이템 보유 확인
function hasItem(units, itemApiName) {
  for (const unit of units) {
    if (!unit.itemNames || !Array.isArray(unit.itemNames)) continue;
    if (unit.itemNames.includes(itemApiName)) return true;
  }
  return false;
}

async function analyze() {
  console.log("=== 아이템 개수 필터 검증 ===\n");

  // 전체 데이터 로드
  const { data: allPlayers, error } = await supabase
    .from("tft_players")
    .select("placement, units")
    .not("units", "is", null);

  if (error) {
    console.error("DB 오류:", error);
    return;
  }

  console.log(`전체 플레이어: ${allPlayers.length}명\n`);

  // 아이템 개수별 분포
  const itemCountDist = {};
  for (const p of allPlayers) {
    const count = countCompletedItems(p.units);
    itemCountDist[count] = (itemCountDist[count] || 0) + 1;
  }

  console.log("=== 아이템 개수 분포 ===");
  const counts = Object.keys(itemCountDist).map(Number).sort((a, b) => a - b);
  for (const count of counts) {
    const inRange = count >= MIN_ITEM_COUNT && count <= MAX_ITEM_COUNT;
    const marker = inRange ? " ◀ 필터 범위" : "";
    console.log(`  ${count}개: ${itemCountDist[count]}명 (${(itemCountDist[count] / allPlayers.length * 100).toFixed(1)}%)${marker}`);
  }

  // 필터링된 플레이어
  const filteredPlayers = allPlayers.filter(p => {
    const count = countCompletedItems(p.units);
    return count >= MIN_ITEM_COUNT && count <= MAX_ITEM_COUNT;
  });

  console.log(`\n필터링 후: ${filteredPlayers.length}명 (${(filteredPlayers.length / allPlayers.length * 100).toFixed(1)}%)\n`);

  // 테스트: 무한의 대검 보유자 비교
  const testItem = "TFT_Item_InfinityEdge";

  // 필터 전 (전체)
  const beforeFilter = allPlayers.filter(p => hasItem(p.units, testItem));
  const beforeAvgItems = beforeFilter.reduce((sum, p) => sum + countCompletedItems(p.units), 0) / beforeFilter.length;
  const beforeAvgPlacement = beforeFilter.reduce((sum, p) => sum + p.placement, 0) / beforeFilter.length;

  // 필터 후 (10~14개)
  const afterFilter = filteredPlayers.filter(p => hasItem(p.units, testItem));
  const afterAvgItems = afterFilter.reduce((sum, p) => sum + countCompletedItems(p.units), 0) / afterFilter.length;
  const afterAvgPlacement = afterFilter.reduce((sum, p) => sum + p.placement, 0) / afterFilter.length;

  console.log("=== 무한의 대검 보유자 비교 ===");
  console.log(`필터 전: ${beforeFilter.length}명, 평균 ${beforeAvgItems.toFixed(1)}개 아이템, ${beforeAvgPlacement.toFixed(2)}등`);
  console.log(`필터 후: ${afterFilter.length}명, 평균 ${afterAvgItems.toFixed(1)}개 아이템, ${afterAvgPlacement.toFixed(2)}등`);

  // 완성+완성 vs 각각활용 비교 (무한의 대검 + 내셔의 이빨 조합)
  console.log("\n=== 완성+완성 vs 각각활용 비교 ===");
  const mainItem = "TFT_Item_InfinityEdge"; // 대검+장갑
  const secondItem = "TFT_Item_NashorsTooth"; // 벨트+활

  // 완성+완성 (둘 다 보유)
  const bothItems_before = allPlayers.filter(p => hasItem(p.units, mainItem) && hasItem(p.units, secondItem));
  const bothItems_after = filteredPlayers.filter(p => hasItem(p.units, mainItem) && hasItem(p.units, secondItem));

  // 각각활용 (무한의 대검 보유 + 내셔 미보유)
  const mainOnly_before = allPlayers.filter(p => hasItem(p.units, mainItem) && !hasItem(p.units, secondItem));
  const mainOnly_after = filteredPlayers.filter(p => hasItem(p.units, mainItem) && !hasItem(p.units, secondItem));

  console.log("\n[필터 전]");
  if (bothItems_before.length > 0) {
    const avgItems1 = bothItems_before.reduce((sum, p) => sum + countCompletedItems(p.units), 0) / bothItems_before.length;
    const avgPlace1 = bothItems_before.reduce((sum, p) => sum + p.placement, 0) / bothItems_before.length;
    console.log(`  완성+완성: ${bothItems_before.length}명, 평균 ${avgItems1.toFixed(1)}개 아이템, ${avgPlace1.toFixed(2)}등`);
  }
  if (mainOnly_before.length > 0) {
    const avgItems2 = mainOnly_before.reduce((sum, p) => sum + countCompletedItems(p.units), 0) / mainOnly_before.length;
    const avgPlace2 = mainOnly_before.reduce((sum, p) => sum + p.placement, 0) / mainOnly_before.length;
    console.log(`  각각활용: ${mainOnly_before.length}명, 평균 ${avgItems2.toFixed(1)}개 아이템, ${avgPlace2.toFixed(2)}등`);
  }

  console.log("\n[필터 후 (10~14개)]");
  if (bothItems_after.length > 0) {
    const avgItems1 = bothItems_after.reduce((sum, p) => sum + countCompletedItems(p.units), 0) / bothItems_after.length;
    const avgPlace1 = bothItems_after.reduce((sum, p) => sum + p.placement, 0) / bothItems_after.length;
    console.log(`  완성+완성: ${bothItems_after.length}명, 평균 ${avgItems1.toFixed(1)}개 아이템, ${avgPlace1.toFixed(2)}등`);
  }
  if (mainOnly_after.length > 0) {
    const avgItems2 = mainOnly_after.reduce((sum, p) => sum + countCompletedItems(p.units), 0) / mainOnly_after.length;
    const avgPlace2 = mainOnly_after.reduce((sum, p) => sum + p.placement, 0) / mainOnly_after.length;
    console.log(`  각각활용: ${mainOnly_after.length}명, 평균 ${avgItems2.toFixed(1)}개 아이템, ${avgPlace2.toFixed(2)}등`);
  }

  console.log("\n=== 검증 완료 ===");
}

analyze();
