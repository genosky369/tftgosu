/**
 * TFT 오래된 데이터 삭제 스크립트
 *
 * 실행: npm run cleanup-tft
 *
 * 3일 이전의 매치 데이터를 삭제합니다.
 * tft_matches 삭제 시 tft_players도 CASCADE로 자동 삭제됩니다.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 보관 기간 (일)
const RETENTION_DAYS = 3;

async function cleanup() {
  console.log('🧹 TFT 데이터 정리 시작\n');
  console.log(`Supabase URL: ${SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}`);
  console.log(`Supabase Key: ${SUPABASE_SERVICE_KEY ? '✅ 설정됨' : '❌ 없음'}`);
  console.log('');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    // 삭제 기준 시간 계산 (3일 전)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    const cutoffTimestamp = cutoffDate.getTime(); // Unix timestamp (ms)

    console.log(`📅 삭제 기준: ${cutoffDate.toISOString()} 이전`);
    console.log(`   (${RETENTION_DAYS}일 이전 데이터 삭제)\n`);

    // 삭제 전 통계
    const { count: beforeMatches } = await supabase
      .from('tft_matches')
      .select('*', { count: 'exact', head: true });

    const { count: beforePlayers } = await supabase
      .from('tft_players')
      .select('*', { count: 'exact', head: true });

    console.log('📊 삭제 전 현황:');
    console.log(`   - 매치: ${beforeMatches}개`);
    console.log(`   - 플레이어: ${beforePlayers}개\n`);

    // 삭제 대상 확인
    const { count: toDelete } = await supabase
      .from('tft_matches')
      .select('*', { count: 'exact', head: true })
      .lt('game_datetime', cutoffTimestamp);

    console.log(`🗑️  삭제 대상: ${toDelete}개 매치\n`);

    if (toDelete === 0) {
      console.log('✅ 삭제할 데이터가 없습니다.');
      return;
    }

    // 삭제 실행
    const { error } = await supabase
      .from('tft_matches')
      .delete()
      .lt('game_datetime', cutoffTimestamp);

    if (error) {
      console.error('❌ 삭제 오류:', error);
      return;
    }

    // 삭제 후 통계
    const { count: afterMatches } = await supabase
      .from('tft_matches')
      .select('*', { count: 'exact', head: true });

    const { count: afterPlayers } = await supabase
      .from('tft_players')
      .select('*', { count: 'exact', head: true });

    console.log('📊 삭제 후 현황:');
    console.log(`   - 매치: ${afterMatches}개 (${beforeMatches - afterMatches}개 삭제)`);
    console.log(`   - 플레이어: ${afterPlayers}개 (${beforePlayers - afterPlayers}개 삭제)\n`);

    console.log('✅ 정리 완료!');

  } catch (err) {
    console.error('❌ 오류 발생:', err);
  }
}

cleanup();
