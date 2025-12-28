# TFT 데이터 수집 및 갱신 가이드

## 개요

챌린저 플레이어들의 매치 데이터를 수집하여 통계 분석에 활용합니다.

## 데이터 유지 정책

| 항목 | 값 |
|------|-----|
| 데이터 보관 기간 | **3일** |
| 수집 대상 | 챌린저 상위 200명 |
| 수집 범위 | 플레이어당 최근 20게임 |
| 예상 데이터량 | 약 2,000~4,000 매치 / 16,000~32,000 플레이어 레코드 |

## DB 구조

```
tft_matches (매치 정보)
├── id: TEXT (매치 ID, PK)
├── game_version: TEXT
├── game_datetime: BIGINT (Unix timestamp, ms)
└── created_at: TIMESTAMPTZ

tft_players (플레이어별 게임 데이터)
├── id: SERIAL (PK)
├── match_id: TEXT (FK → tft_matches.id, CASCADE)
├── puuid: TEXT
├── placement: INT (1~8)
├── units: JSONB
├── traits: JSONB
└── augments: JSONB
```

## 데이터 수집 프로세스

### 1. 환경 준비

```bash
# .env.local에 필요한 환경변수
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. API 키 갱신 (Development Key 사용 시)

```
1. https://developer.riotgames.com 로그인
2. "Regenerate API Key" 클릭
3. .env.local의 RIOT_API_KEY 업데이트
```

### 3. 데이터 수집 실행

```bash
npm run collect-tft
```

**예상 소요 시간:** 약 2시간 (Rate Limit 적용)

### 4. 수집 스크립트 동작

```
┌─────────────────────────────────────────────────────┐
│  수집 흐름                                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. 챌린저 리그 조회 → 상위 200명 추출              │
│                    ↓                                │
│  2. 각 플레이어의 최근 20게임 매치 ID 조회          │
│                    ↓                                │
│  3. 매치 상세 정보 조회                             │
│     └─ 이미 DB에 있으면 스킵 (중복 방지)            │
│                    ↓                                │
│  4. tft_matches + tft_players 저장                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 데이터 갱신 전략

### 새 데이터 추가 (증분 수집)

**방법:** 수집 스크립트 재실행

```bash
npm run collect-tft
```

- 기존 매치는 자동으로 스킵됨 (매치 ID로 중복 체크)
- 새로운 매치만 추가됨
- 매일 실행해도 안전함

### 오래된 데이터 삭제 (3일 이전)

**방법:** cleanup 스크립트 실행

```bash
npm run cleanup-tft
```

- `game_datetime` 기준 3일 이전 데이터 삭제
- `tft_matches` 삭제 시 `tft_players`도 자동 삭제 (CASCADE)

## 일일 갱신 워크플로우

```
┌─────────────────────────────────────────────────────┐
│  매일 실행할 작업 (수동)                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Riot Developer Portal에서 API 키 갱신           │
│     (Development Key는 24시간 만료)                 │
│                                                     │
│  2. .env.local에 새 키 붙여넣기                     │
│                                                     │
│  3. 오래된 데이터 삭제                              │
│     $ npm run cleanup-tft                           │
│                                                     │
│  4. 새 데이터 수집                                  │
│     $ npm run collect-tft                           │
│                                                     │
│  5. (선택) 수집 결과 확인                           │
│     $ npm run stats-tft                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 스크립트 목록

| 명령어 | 파일 | 설명 |
|--------|------|------|
| `npm run collect-tft` | `scripts/collect-tft-data.js` | 데이터 수집 |
| `npm run cleanup-tft` | `scripts/cleanup-tft-data.js` | 3일 이전 데이터 삭제 |
| `npm run stats-tft` | `scripts/stats-tft-data.js` | 현재 데이터 통계 확인 |

## Production Key 전환 후

Production Key를 발급받으면:

1. 키 갱신이 불필요해짐 (영구 키)
2. Vercel Cron 등으로 자동화 가능
3. Rate Limit 상향으로 수집 시간 단축 가능

```typescript
// vercel.json 예시
{
  "crons": [{
    "path": "/api/cron/collect-tft",
    "schedule": "0 */6 * * *"  // 6시간마다
  }]
}
```

## 주의사항

1. **Rate Limit**: Development Key는 20 req/sec, 100 req/2min 제한
2. **API 키 보안**: `.env.local`은 절대 커밋하지 않음
3. **CASCADE 삭제**: `tft_matches` 삭제 시 연결된 `tft_players` 자동 삭제됨
4. **game_datetime**: Unix timestamp (밀리초 단위)
