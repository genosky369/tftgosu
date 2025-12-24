# 팀 코드 생성 기능 (보류)

> **상태: 보류** - 실제 TFT 게임 팀 코드 포맷과 불일치하여 개발 중단

## 개요

브론즈 시뮬레이터와 세계룬 시뮬레이터의 결과에서 **TFT 인게임 팀 코드**를 생성하는 기능.

생성된 코드를 복사하여 게임 내 팀 플래너에 붙여넣으면 해당 조합이 자동으로 구성됨.

## 보류 사유

- GitHub Gist 문서 기반으로 구현했으나, 실제 게임 팀 코드와 포맷이 다름
- 실제 코드: 32자리 이상, 범위 벗어난 hex 값 (`b0`, `6a` 등) 포함
- 예상 포맷: `01` + 20자리 + `TFTSet16` (31자)
- 추후 실제 포맷 파악 시 재시도 예정

---

## 팀 코드 포맷 (TFT 공식)

### 구조

```
[헤더][챔피언1][챔피언2]...[챔피언10][세트ID]
  01    XX       XX    ...    XX     TFTSet16
```

| 구성 요소 | 형식 | 설명 |
|-----------|------|------|
| 헤더 | `01` | 고정값 |
| 챔피언 슬롯 | 2자리 16진수 × 10개 | 최대 10개 챔피언 |
| 세트 ID | 문자열 | 현재 세트: `TFTSet16` |

### 챔피언 ID 생성 규칙

1. Community Dragon JSON에서 해당 세트의 챔피언 목록 가져오기
2. `character_id` (예: `TFT13_Garen`) 기준 **알파벳순 정렬**
3. 순서대로 **1부터 번호 부여** (16진수 2자리)
4. 빈 슬롯은 `00`으로 표시, 뒤쪽으로 배치

### 예시

```
010A0B0C0D0E0F10111200TFTSet16
│ └─────────────────┴── 챔피언 10개 (0A~12는 16진수)
└────────────────────── 헤더
```

### 포함되지 않는 정보

- 아이템 장착
- 배치 위치 (좌표)
- 챔피언 성급 (1/2/3성)

---

## 구현 요구사항

### 1단계: 챔피언 ID 매핑 테이블 생성

**필요한 작업:**

1. Community Dragon에서 Set 16 챔피언 데이터 가져오기
   - URL: `https://raw.communitydragon.org/latest/cdragon/tft/en_us.json`

2. `character_id` 추출 및 알파벳순 정렬

3. 한글 이름 ↔ character_id ↔ 16진수 ID 매핑 테이블 생성

**예시 매핑:**

| 한글 이름 | character_id | Hex ID |
|-----------|--------------|--------|
| 가렌 | TFT13_Garen | 0A |
| 갈리오 | TFT13_Galio | 09 |
| ... | ... | ... |

### 2단계: 코드 생성 유틸리티 함수

```typescript
// src/lib/teamCode.ts

interface TeamCodeConfig {
  setId: string;  // "TFTSet13"
}

// 챔피언 이름 배열 → 팀 코드 생성
function generateTeamCode(championNames: string[]): string {
  // 1. 한글 이름 → Hex ID 변환
  // 2. 10개 슬롯 채우기 (부족하면 00)
  // 3. 헤더 + 챔피언들 + 세트ID 조합
  return code;
}
```

### 3단계: UI 통합

**브론즈 시뮬레이터 (`ResultCard.tsx`):**
- 각 결과 카드에 "팀 코드 복사" 버튼 추가
- 클릭 시 클립보드에 복사 + 토스트 메시지

**세계룬 시뮬레이터 (`ResultCard.tsx`):**
- 동일하게 적용

---

## 데이터 준비 작업

### Community Dragon 데이터 구조

```json
{
  "TFTSet16": [
    {
      "character_id": "TFT16_Garen",
      "name": "Garen",
      ...
    }
  ]
}
```

### 매핑 테이블 생성 방법

1. Community Dragon JSON 파싱 (`tftchampions-teamplanner.json`)
2. TFTSet16 챔피언 배열을 character_id 기준 알파벳순 정렬
3. 순서대로 1부터 16진수로 번호 부여 (01, 02, ... 0A, 0B, ... 64)
4. 한글 이름과 매칭 (프로젝트 `src/data/champions.ts` 참조)
5. `src/data/championTeamCodeMap.ts`로 출력

---

## UI 설계

### 결과 카드 내 버튼 위치

```
┌─────────────────────────────────────┐
│  브론즈 15개 조합                    │
│  ┌─────┬─────┬─────┬─────┬─────┐   │
│  │ 챔1 │ 챔2 │ 챔3 │ ... │ 챔8 │   │
│  └─────┴─────┴─────┴─────┴─────┘   │
│                                     │
│  [📋 팀 코드 복사]                   │
└─────────────────────────────────────┘
```

### 복사 성공 피드백

- 버튼 텍스트 변경: "복사 완료!" (2초 후 원복)
- 또는 토스트 메시지

---

## 주의사항

1. **세트 변경 시 업데이트 필요**
   - 새 세트 출시 시 챔피언 ID 매핑 테이블 재생성

2. **한글-영문 이름 매칭**
   - 번역 차이로 수동 확인 필요할 수 있음

3. **7코스트 챔피언**
   - 라이즈, 내셔 남작 등 특수 챔피언도 포함되는지 확인

---

## 참고 자료

- [TFT Team Planner Codes - GitHub Gist](https://gist.github.com/bangingheads/243e396f78be1a4d49dc0577abf57a0b)
- [Community Dragon TFT Data](https://raw.communitydragon.org/latest/cdragon/tft/en_us.json)
- [TFT Patch 14.22 Notes](https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/teamfight-tactics-patch-14-22-notes/)

---

## 구현 순서

1. [x] Community Dragon에서 Set 16 챔피언 데이터 확인
2. [x] 한글 ↔ character_id ↔ hex ID 매핑 테이블 생성
3. [x] `generateTeamCode()` 유틸리티 함수 구현
4. [x] 브론즈 시뮬레이터 ResultCard에 복사 버튼 추가
5. [x] 세계룬 시뮬레이터 ResultCard에 복사 버튼 추가
6. [ ] 테스트 및 검증 (실제 게임에서 붙여넣기 확인)

## 구현된 파일

| 파일 | 설명 |
|------|------|
| `src/data/championTeamCodeMap.ts` | 챔피언 hex ID 매핑 테이블 + generateTeamCode() 함수 |
| `src/app/simulator/bronze/components/ResultCard.tsx` | "팀 코드 복사" 버튼 추가 |
| `src/app/simulator/worldrune/components/ResultCard.tsx` | "팀 코드 복사" 버튼 추가 |
