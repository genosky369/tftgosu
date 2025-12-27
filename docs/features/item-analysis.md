# 아이템 조합 분석기

## 개요

1라운드에서 받은 조합 아이템으로 어떤 완성 아이템을 만드는 것이 승률이 높은지 통계로 분석

## 핵심 로직

### 입력
- 조합 아이템 선택 (최대 6개, 중복 가능)
- 예: 대검, 곡궁, 갑옷

### 처리 과정

#### 1단계: 가능한 완성 아이템 조합 계산

선택한 조합 아이템으로 만들 수 있는 완성 아이템의 **모든 경우의 수** 계산

```
입력: 대검, 곡궁, 갑옷

가능한 조합:
1. 거인학살자(대검+곡궁) + 갑옷 남음
2. 수호천사(대검+갑옷) + 곡궁 남음
3. 유령무희(곡궁+갑옷) + 대검 남음
```

- 남는 아이템으로 뭘 만드는지는 계산하지 않음
- 첫 번째 완성 아이템만 기준으로 분류

#### 2단계: 각 조합별 통계 계산

DB에서 해당 완성 아이템을 만든 게임들을 필터링하여 통계 계산

```
거인학살자(대검+곡궁) + 갑옷 남음:
- 해당 게임 수: 45게임
- 평균 등수: 3.2등
- 상위4 비율: 72%
```

#### 3단계: 상세 게임 정보 제공

각 조합별로 **최대 10게임**의 상세 정보 표시:
- 덱 구성 (챔피언 목록)
- 전체 아이템 조합
- 최종 순위

### 출력 형태

```
분석 결과 (총 120게임 분석)

#1 거인학살자(대검+곡궁) + 갑옷 남음
   평균 3.2등 | 상위4 72% | 45게임

   [상세 보기]
   ├─ 1등: 진, 자야, 트위치... | 거인학살자, 구인수, 피바라기
   ├─ 2등: 녹턴, 렝가... | 거인학살자, 무한의대검, 최속
   └─ ... (최대 10게임)

#2 수호천사(대검+갑옷) + 곡궁 남음
   평균 3.8등 | 상위4 65% | 38게임
   ...

#3 유령무희(곡궁+갑옷) + 대검 남음
   평균 4.1등 | 상위4 58% | 37게임
   ...
```

## 데이터 구조

### DB 테이블: tft_players

```sql
- placement: 최종 순위 (1~8)
- units: JSON 배열
  - character_id: 챔피언 ID
  - itemNames: 완성 아이템 API 이름 배열
  - tier: 성급
```

### 아이템 매핑

- 조합 아이템: "BFSword", "RecurveBow", "ChainVest" 등 (문자열)
- 완성 아이템: "TFT_Item_MadredsBloodrazor" 등 (API 이름)
- 조합 레시피: ITEM_RECIPES 객체에 정의

## API 설계

### POST /api/stats/item-analysis

**Request:**
```json
{
  "components": ["BFSword", "RecurveBow", "ChainVest"]
}
```

**Response:**
```json
{
  "totalGames": 120,
  "inputComponents": ["BFSword", "RecurveBow", "ChainVest"],
  "inputComponentNames": ["대검", "활", "갑옷"],
  "combinations": [
    {
      "mainItem": "TFT_Item_MadredsBloodrazor",
      "mainItemName": "거인학살자",
      "usedComponents": ["BFSword", "RecurveBow"],
      "remainingComponents": ["ChainVest"],
      "remainingComponentNames": ["갑옷"],
      "avgPlacement": 3.2,
      "gameCount": 45,
      "topFourRate": 72,
      "sampleGames": [
        {
          "placement": 1,
          "champions": ["TFT16_Jinx", "TFT16_Zaya", ...],
          "championNames": ["진", "자야", ...],
          "allItems": ["TFT_Item_MadredsBloodrazor", "TFT_Item_GuinsoosRageblade", ...],
          "allItemNames": ["거인학살자", "구인수의 격노검", ...]
        },
        ...
      ]
    },
    ...
  ]
}
```

## 파일 구조

```
src/
├── data/
│   └── item-components.ts     # 아이템 조합 레시피 데이터
├── app/
│   ├── api/stats/item-analysis/
│   │   └── route.ts           # 통계 계산 API
│   └── simulator/item-analysis/
│       └── page.tsx           # UI 페이지
└── scripts/
    └── collect-tft-data.js    # 데이터 수집 스크립트
```

## 구현 상태

- [x] 데이터 수집 (664개 게임)
- [x] 기본 UI
- [ ] 로직 수정 (경우의 수 기반)
- [ ] 상세 게임 정보 표시
- [ ] 덱 구성 표시

## 참고사항

- 챌린저 티어 데이터 기반
- Development API Key 사용 (24시간마다 재발급 필요)
- 패치마다 데이터 재수집 권장
