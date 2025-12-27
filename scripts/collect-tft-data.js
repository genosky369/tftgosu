/**
 * TFT 매치 데이터 수집 스크립트
 *
 * 실행: node scripts/collect-tft-data.js
 *
 * 챌린저 플레이어들의 최근 매치 데이터를 수집하여 Supabase에 저장
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 환경 변수
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase 클라이언트 (service role)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Rate Limit 관리
const RATE_LIMIT_DELAY = 1300; // 1.3초 (안전 마진)
let requestCount = 0;

// API 호출 함수 (Rate Limit 적용)
async function fetchWithRateLimit(url) {
  requestCount++;

  // 매 요청마다 딜레이
  await sleep(RATE_LIMIT_DELAY);

  const response = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY }
  });

  if (response.status === 429) {
    console.log('⚠️ Rate Limit 도달, 2분 대기...');
    await sleep(120000);
    return fetchWithRateLimit(url);
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. 챌린저 플레이어 목록 가져오기
async function getChallengerPlayers() {
  console.log('📊 챌린저 플레이어 목록 가져오는 중...');

  const data = await fetchWithRateLimit(
    'https://kr.api.riotgames.com/tft/league/v1/challenger'
  );

  console.log(`✅ 챌린저 ${data.entries.length}명 발견`);
  return data.entries;
}

// 2. (삭제됨 - 챌린저 응답에 puuid 포함)

// 3. 플레이어의 최근 매치 ID 가져오기
async function getMatchIds(puuid, count = 20) {
  const data = await fetchWithRateLimit(
    `https://asia.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`
  );
  return data;
}

// 4. 매치 상세 정보 가져오기
async function getMatchDetail(matchId) {
  const data = await fetchWithRateLimit(
    `https://asia.api.riotgames.com/tft/match/v1/matches/${matchId}`
  );
  return data;
}

// 5. 매치 데이터 DB에 저장
async function saveMatch(matchData) {
  const { metadata, info } = matchData;
  const matchId = metadata.match_id;

  // 이미 존재하는지 확인
  const { data: existing } = await supabase
    .from('tft_matches')
    .select('id')
    .eq('id', matchId)
    .single();

  if (existing) {
    return false; // 이미 존재
  }

  // 매치 정보 저장
  const { error: matchError } = await supabase
    .from('tft_matches')
    .insert({
      id: matchId,
      game_version: info.game_version,
      game_datetime: info.game_datetime
    });

  if (matchError) {
    console.error('매치 저장 오류:', matchError);
    return false;
  }

  // 플레이어 정보 저장
  const players = info.participants.map(p => ({
    match_id: matchId,
    puuid: p.puuid,
    placement: p.placement,
    level: p.level,
    total_damage_to_players: p.total_damage_to_players,
    units: p.units,
    traits: p.traits,
    augments: p.augments
  }));

  const { error: playersError } = await supabase
    .from('tft_players')
    .insert(players);

  if (playersError) {
    console.error('플레이어 저장 오류:', playersError);
    return false;
  }

  return true;
}

// 메인 수집 함수
async function collectData() {
  console.log('🚀 TFT 데이터 수집 시작\n');
  console.log(`Riot API Key: ${RIOT_API_KEY ? '✅ 설정됨' : '❌ 없음'}`);
  console.log(`Supabase URL: ${SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}`);
  console.log(`Supabase Key: ${SUPABASE_SERVICE_KEY ? '✅ 설정됨' : '❌ 없음'}`);
  console.log('');

  if (!RIOT_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const startTime = Date.now();
  let totalMatches = 0;
  let newMatches = 0;
  let processedPlayers = 0;

  try {
    // 1. 챌린저 플레이어 목록
    const challengers = await getChallengerPlayers();

    // 상위 50명만 먼저 테스트 (전체는 시간이 오래 걸림)
    const targetPlayers = challengers
      .sort((a, b) => b.leaguePoints - a.leaguePoints) // LP 높은 순
      .slice(0, 50);

    console.log(`\n🎯 상위 ${targetPlayers.length}명 수집 시작\n`);

    for (const player of targetPlayers) {
      processedPlayers++;
      console.log(`\n[${processedPlayers}/${targetPlayers.length}] ${player.summonerName || 'Player'} (${player.leaguePoints} LP)`);

      try {
        // PUUID는 챌린저 응답에 이미 포함됨
        const puuid = player.puuid;

        // 최근 매치 ID
        const matchIds = await getMatchIds(puuid, 20);
        console.log(`  └ 매치 ${matchIds.length}개 발견`);

        // 각 매치 상세 정보
        for (const matchId of matchIds) {
          totalMatches++;

          try {
            const matchDetail = await getMatchDetail(matchId);
            const saved = await saveMatch(matchDetail);

            if (saved) {
              newMatches++;
              process.stdout.write('.');
            } else {
              process.stdout.write('s'); // skip (이미 존재)
            }
          } catch (err) {
            process.stdout.write('x'); // error
          }
        }
        console.log('');

      } catch (err) {
        console.log(`  └ ❌ 오류: ${err.message}`);
      }

      // 진행상황 출력
      const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60);
      console.log(`  └ 진행: ${newMatches}개 저장 / ${totalMatches}개 처리 (${elapsed}분 경과)`);
    }

  } catch (err) {
    console.error('\n❌ 수집 중 오류:', err);
  }

  // 결과 요약
  const totalTime = Math.floor((Date.now() - startTime) / 1000 / 60);
  console.log('\n========================================');
  console.log('📊 수집 완료!');
  console.log(`  - 처리 플레이어: ${processedPlayers}명`);
  console.log(`  - 총 매치 수: ${totalMatches}개`);
  console.log(`  - 신규 저장: ${newMatches}개`);
  console.log(`  - API 요청 수: ${requestCount}회`);
  console.log(`  - 소요 시간: ${totalTime}분`);
  console.log('========================================');
}

// 실행
collectData();
