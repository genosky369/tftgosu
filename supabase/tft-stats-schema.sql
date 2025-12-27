-- TFT 통계 데이터 테이블
-- 실행: Supabase SQL Editor에서 실행

-- 1. 매치 정보 테이블
CREATE TABLE IF NOT EXISTS tft_matches (
  id TEXT PRIMARY KEY,                    -- 매치 ID (KR_xxxxxxx)
  game_version TEXT,                      -- 게임 버전 (패치)
  game_datetime BIGINT,                   -- 게임 시작 시간 (Unix timestamp)
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 플레이어별 게임 데이터
CREATE TABLE IF NOT EXISTS tft_players (
  id SERIAL PRIMARY KEY,
  match_id TEXT REFERENCES tft_matches(id) ON DELETE CASCADE,
  puuid TEXT,                             -- 플레이어 고유 ID
  placement INT,                          -- 최종 순위 (1~8)
  level INT,                              -- 최종 레벨
  total_damage_to_players INT,            -- 총 데미지

  -- 아이템 정보 (JSON 배열)
  -- 예: [{"champion": "TFT16_Jinx", "items": [8, 12, 33]}, ...]
  units JSONB,

  -- 시너지 정보 (JSON)
  traits JSONB,

  -- 증강 정보 (JSON 배열)
  augments JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_tft_players_match_id ON tft_players(match_id);
CREATE INDEX IF NOT EXISTS idx_tft_players_placement ON tft_players(placement);
CREATE INDEX IF NOT EXISTS idx_tft_matches_game_version ON tft_matches(game_version);
CREATE INDEX IF NOT EXISTS idx_tft_matches_game_datetime ON tft_matches(game_datetime);

-- RLS 정책 (읽기만 허용)
ALTER TABLE tft_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tft_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tft_matches_read" ON tft_matches FOR SELECT USING (true);
CREATE POLICY "tft_players_read" ON tft_players FOR SELECT USING (true);

-- 데이터 삽입은 서버에서만 (anon key로는 불가)
-- 삽입 권한은 service_role key 사용
