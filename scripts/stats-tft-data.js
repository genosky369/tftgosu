/**
 * TFT 데이터 통계 확인 스크립트
 *
 * 실행: npm run stats-tft
 *
 * 현재 DB에 저장된 데이터 현황을 출력합니다.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function showStats() {
  console.log('📊 TFT 데이터 통계\n');
  console.log('========================================\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    // 전체 통계
    const { count: totalMatches } = await supabase
      .from('tft_matches')
      .select('*', { count: 'exact', head: true });

    const { count: totalPlayers } = await supabase
      .from('tft_players')
      .select('*', { count: 'exact', head: true });

    console.log('📦 전체 데이터:');
    console.log(`   - 매치: ${totalMatches}개`);
    console.log(`   - 플레이어 레코드: ${totalPlayers}개`);
    console.log('');

    // 날짜별 통계
    const { data: dateStats } = await supabase
      .from('tft_matches')
      .select('game_datetime')
      .order('game_datetime', { ascending: false });

    if (dateStats && dateStats.length > 0) {
      // 날짜별로 그룹화
      const byDate = {};
      dateStats.forEach(match => {
        const date = new Date(match.game_datetime).toISOString().split('T')[0];
        byDate[date] = (byDate[date] || 0) + 1;
      });

      console.log('📅 날짜별 매치 수:');
      Object.entries(byDate)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 7) // 최근 7일만
        .forEach(([date, count]) => {
          console.log(`   ${date}: ${count}개`);
        });
      console.log('');

      // 가장 오래된/최신 매치
      const oldest = new Date(dateStats[dateStats.length - 1].game_datetime);
      const newest = new Date(dateStats[0].game_datetime);
      const daysDiff = Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24));

      console.log('⏰ 데이터 기간:');
      console.log(`   - 가장 오래된 매치: ${oldest.toISOString()}`);
      console.log(`   - 가장 최신 매치: ${newest.toISOString()}`);
      console.log(`   - 기간: ${daysDiff}일`);
      console.log('');
    }

    // 평균 등수 (데이터 품질 확인)
    const { data: avgData } = await supabase
      .from('tft_players')
      .select('placement');

    if (avgData && avgData.length > 0) {
      const avgPlacement = avgData.reduce((sum, p) => sum + p.placement, 0) / avgData.length;
      console.log('📈 데이터 품질:');
      console.log(`   - 평균 등수: ${avgPlacement.toFixed(2)}등 (정상: ~4.5)`);
    }

    console.log('\n========================================');

  } catch (err) {
    console.error('❌ 오류 발생:', err);
  }
}

showStats();
