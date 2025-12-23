-- TFT고수 게시판 시스템 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. posts (게시글) 테이블
CREATE TABLE IF NOT EXISTS posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(100) NOT NULL,
  content       TEXT NOT NULL,
  author        VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin      BOOLEAN DEFAULT FALSE,
  view_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. comments (댓글) 테이블
CREATE TABLE IF NOT EXISTS comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID REFERENCES posts(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  author        VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. visitors (방문자 통계) 테이블
CREATE TABLE IF NOT EXISTS visitors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) NOT NULL,
  visit_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(ip_address, visit_date)
);

-- 4. admins (관리자) 테이블
CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(30) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_visitors_visit_date ON visitors(visit_date);

-- RLS (Row Level Security) 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 읽기 가능, 쓰기는 API를 통해
CREATE POLICY "posts_read" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (true);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (true);

CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (true);

CREATE POLICY "visitors_read" ON visitors FOR SELECT USING (true);
CREATE POLICY "visitors_insert" ON visitors FOR INSERT WITH CHECK (true);

CREATE POLICY "admins_read" ON admins FOR SELECT USING (true);

-- 초기 관리자 계정 (비밀번호: admin123 → bcrypt 해시)
-- 실제 배포 시에는 반드시 변경하세요!
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u')
ON CONFLICT (username) DO NOTHING;

-- 확인용 쿼리
SELECT 'Schema created successfully!' as status;
