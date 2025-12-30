# 메타 조합 티어리스트 기능 기획서

> 작성일: 2025-12-29
> 최종 수정: 2025-12-30
> 상태: 기획 확정 + UI 개선 예정

## 1. 기능 개요

챌린저 게임 데이터를 분석하여 현재 메타에서 강한 조합들을 티어리스트로 제공합니다.

### 핵심 차별화
- 단순 평균 등수가 아닌 **등수 편차(변동성)** 히스토그램 시각화
- 덱별 **아이템 우선순위** 통계 제공 (완성 아이템 + 재료 아이템)
- 실제 챌린저 데이터 기반

### 확정된 설정

| 항목 | 결정 |
|------|------|
| 아이템 분석 범위 | **완성 아이템 + 재료 아이템** (둘 다 표시) |
| 시각화 방식 | **히스토그램** (등수별 막대그래프) |
| 최소 표본 수 | **200게임** |
| 데이터 갱신 주기 | **1일 1회** |
| 비추천 아이템 | 별도 표시 없음, 우선순위 낮은 순으로만 표시 |
| 덱 이름 | 자동 생성 → 필요시 수동 수정 |

---

## 2. 덱 분류 방식 (K-means 클러스터링)

### 2.1 데이터 수집

```
Riot API → 챌린저 게임 수집 → 참가자별 데이터 추출

참가자 데이터:
├── placement: 최종 등수
├── units[]: 챔피언 목록 + 아이템 + 성급
├── traits[]: 활성 시너지
└── augments[]: 선택한 증강
```

### 2.2 벡터화

```
챔피언 목록 (Set 16 기준 약 60개)

게임 A 벡터: [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, ...]
              아리 바이 ...                    (1=보유, 0=미보유)
```

### 2.3 클러스터링

```
K-means 알고리즘
- K 값: 20~40 (메타 조합 수에 따라 조정)
- 거리 함수: 해밍 거리 (다른 챔피언 수)
- 최소 표본: 200게임 이상인 클러스터만 유효
```

### 2.4 클러스터 이름 부여 (자동 생성)

```typescript
function generateCompName(cluster: ClusterStats): string {
  // 1. 핵심 시너지 찾기 (가장 많이 활성화된 시너지)
  const mainTrait = cluster.traits
    .filter(t => t.avgTierCurrent >= 2)
    .sort((a, b) => b.frequency - a.frequency)[0];

  // 2. 메인 캐리 찾기 (아이템 장착률 + 등장률 높은 챔피언)
  const mainCarry = cluster.champions
    .filter(c => c.avgItemCount >= 2)
    .sort((a, b) => b.frequency * b.avgItemCount - a.frequency * a.avgItemCount)[0];

  // 3. 이름 조합
  // 예: "6필트오버 징크스", "4아르카나 제라스"
  return `${mainTrait.avgCount}${mainTrait.name} ${mainCarry.name}`;
}
```

**자동 생성 후 수동 수정**: 이상한 이름이 생성되면 관리자가 수정

---

## 3. 아이템 우선순위 분석

### 3.1 분석 대상

**완성 아이템 + 재료 아이템 모두 분석**

```typescript
interface ItemPriorityAnalysis {
  // 완성 아이템 우선순위
  completedItems: ItemStat[];

  // 재료 아이템 우선순위 (초반 아이템 가이드)
  componentItems: ItemStat[];
}

interface ItemStat {
  itemId: string;
  itemName: string;
  itemType: 'completed' | 'component';  // 완성 or 재료

  // 등장 통계
  appearanceRate: number;    // 이 덱에서 이 아이템 등장 비율
  gameCount: number;         // 표본 수

  // 성적 통계
  avgPlacement: number;      // 이 아이템 있을 때 평균 등수
  avgPlacementWithout: number; // 이 아이템 없을 때 평균 등수
  placementDelta: number;    // 차이 (음수 = 아이템이 좋음)

  // 우선순위 점수
  priorityScore: number;
  priorityRank: number;      // 1, 2, 3, ...
}
```

### 3.2 우선순위 계산 로직

```typescript
function calculateItemPriority(itemStats: ItemStat): number {
  // 등수 개선 효과 (40%)
  // placementDelta가 -1.0이면 → 1등 개선 → 점수 +40
  const deltaScore = -itemStats.placementDelta * 40;

  // 픽률 (30%)
  // 80% 픽률이면 → 점수 +24
  const popularityScore = itemStats.appearanceRate * 30;

  // 신뢰도 - 표본 크기 (30%)
  // 200게임 이상이면 만점
  const sampleScore = Math.min(itemStats.gameCount / 200, 1) * 30;

  return deltaScore + popularityScore + sampleScore;
}
```

### 3.3 예시 출력

```
┌─────────────────────────────────────────────────────────────┐
│  🗡️ 6필트오버 징크스 - 아이템 우선순위                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [완성 아이템]                                               │
│  1. 레이지블레이드    2.9등 (-0.8등) | 82% | 680게임        │
│  2. 자이언트슬레이어  3.0등 (-0.6등) | 75% | 620게임        │
│  3. 최후의 속삭임     3.1등 (-0.4등) | 58% | 480게임        │
│  4. 무한의 대검       3.2등 (-0.3등) | 45% | 370게임        │
│  5. 피바라기          3.4등 (-0.1등) | 32% | 260게임        │
│  ...                                                        │
│  15. 워모그           4.5등 (+1.4등) | 8%  | 65게임         │
│                                                             │
│  [재료 아이템] (초반 우선 확보)                               │
│  1. 활 (곡궁)         3.0등 (-0.5등) | 78%                   │
│  2. BF 대검           3.1등 (-0.4등) | 72%                   │
│  3. 연습용 장갑       3.2등 (-0.3등) | 65%                   │
│  4. 쓸데없이 큰 지팡이 3.4등 (-0.1등) | 40%                  │
│  ...                                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 해석 방법

```
"이 덱에서는 활(곡궁)을 우선 확보하고,
완성템으로는 레이지블레이드를 먼저 만들어라"

재료 아이템 우선순위 = "초반에 뭘 먼저 집어야 하는가"
완성 아이템 우선순위 = "어떤 템을 만들어야 하는가"
```

---

## 4. 등수 편차 (변동성) 시각화

### 4.1 시각화 방식: 히스토그램

```
6필트오버 징크스 (평균 3.2등)

등수 분포:
1등 ████████████████████ 18%
2등 ███████████████████ 17%
3등 █████████████████ 15%
4등 ██████████████ 12%
5등 ████████████ 10%
6등 ██████████ 9%
7등 ████████ 8%
8등 ██████████ 11%

→ 1~3등에 집중 = 안정적인 덱
```

```
리롤 바이퍼 (평균 4.0등)

등수 분포:
1등 ████████████████████████ 22%
2등 ██████ 6%
3등 ████ 4%
4등 ████ 4%
5등 ████ 4%
6등 ████ 4%
7등 ██████ 6%
8등 ██████████████████████████████ 50%

→ 1등 아니면 8등 = 도박성 덱
```

### 4.2 통계 지표

```typescript
interface PlacementDistribution {
  avgPlacement: number;      // 평균 등수
  stdDeviation: number;      // 표준편차

  // 등수별 비율 (1~8등)
  distribution: {
    1: number;  // 0.18 = 18%
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
  };

  // 집계 지표
  top4Rate: number;          // 1~4등 비율
  winRate: number;           // 1등 비율
  botRate: number;           // 7~8등 비율
}
```

### 4.3 표준편차 해석 가이드

| 표준편차 | 해석 | 특징 |
|----------|------|------|
| < 1.5 | 매우 안정 | 대부분 비슷한 등수 |
| 1.5 ~ 2.0 | 안정 | 일관된 성적 |
| 2.0 ~ 2.5 | 보통 | 평균적인 변동 |
| 2.5 ~ 3.0 | 변동 | 등수 차이 큼 |
| > 3.0 | 고변동 (도박) | 1등 or 꼴등 |

---

## 5. 데이터 구조 설계

### 5.1 메타 조합 데이터

```typescript
interface MetaComp {
  // 기본 정보
  id: string;
  name: string;                    // 자동생성 or 수동수정
  nameAutoGenerated: boolean;      // 자동생성 여부
  tier: 'S' | 'A' | 'B' | 'C';

  // 구성 정보
  coreChampions: ChampionInfo[];   // 80%+ 등장
  flexChampions: ChampionInfo[];   // 50~80% 등장
  mainTrait: TraitInfo;
  subTraits: TraitInfo[];
  mainCarry: string;

  // 성적 통계
  stats: {
    gameCount: number;
    avgPlacement: number;
    top4Rate: number;
    winRate: number;
    botRate: number;              // 7~8등 비율
    stdDeviation: number;

    // 등수 분포 (히스토그램용)
    placementDistribution: number[];  // [0, 0.18, 0.17, 0.15, 0.12, 0.10, 0.09, 0.08, 0.11]
  };

  // 아이템 분석
  itemAnalysis: {
    completedItems: ItemStat[];   // 완성 아이템 우선순위
    componentItems: ItemStat[];   // 재료 아이템 우선순위
  };
}
```

### 5.2 API 응답

```typescript
// GET /api/meta/comps
interface MetaCompsResponse {
  patch: string;
  updatedAt: string;           // 마지막 갱신 시간
  nextUpdateAt: string;        // 다음 갱신 예정 (1일 후)
  totalGames: number;
  comps: MetaComp[];
}
```

---

## 6. UI 목업 (확정)

### 6.1 티어리스트 메인

```
┌─────────────────────────────────────────────────────────────┐
│  📊 메타 조합 티어리스트                                     │
│  패치 14.24 | 챌린저 12,400게임 분석 | 업데이트: 2시간 전    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [정렬] 평균 등수 ▼ | 표본 200게임 이상                      │
│                                                             │
│  🏆 S티어                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ▼ 6필트오버 징크스                                      │ │
│  │   평균 3.2등 | Top4 72% | 1등 18% | 표준편차 1.8        │ │
│  │   [징크스][바이][직스][세라핀][자이라][+3]              │ │
│  │                                                        │ │
│  │   📊 등수 분포                                          │ │
│  │   1 ████████ 18%  5 ████ 10%                          │ │
│  │   2 ███████ 17%   6 ███ 9%                            │ │
│  │   3 ██████ 15%    7 ███ 8%                            │ │
│  │   4 █████ 12%     8 ████ 11%                          │ │
│  │                                                        │ │
│  │   🗡️ 완성 아이템 우선순위                               │ │
│  │   1. 레이지블레이드 (-0.8등)                           │ │
│  │   2. 자이언트슬레이어 (-0.6등)                         │ │
│  │   3. 최후의 속삭임 (-0.4등)                            │ │
│  │                                                        │ │
│  │   🧩 재료 아이템 우선순위 (초반 확보)                   │ │
│  │   1. 활 (곡궁) (-0.5등)                                │ │
│  │   2. BF 대검 (-0.4등)                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ⭐ A티어                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ▶ 4아르카나 제라스 (접기)                               │ │
│  │   평균 3.8등 | Top4 65% | 1등 14% | 표준편차 2.1        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 구현 단계

### Phase 1: 데이터 파이프라인
- [ ] Riot API 데이터 수집 (1일 1회 배치)
- [ ] 데이터 정제 및 Supabase 저장
- [ ] K-means 클러스터링 구현

### Phase 2: 분석 로직
- [ ] 클러스터 이름 자동 생성
- [ ] 완성 아이템 우선순위 계산
- [ ] 재료 아이템 우선순위 계산
- [ ] 등수 분포 및 표준편차 계산

### Phase 3: API
- [ ] GET /api/meta/comps

### Phase 4: UI
- [ ] 티어리스트 메인 페이지
- [ ] 히스토그램 컴포넌트
- [ ] 아이템 우선순위 컴포넌트

---

## 8. 참고 사항

- Riot API Rate Limit 고려 필요
- Set 변경 시 클러스터링 재실행 필요
- 패치 초반에는 표본 200게임 미달 가능 → "데이터 수집 중" 표시
- 덱 이름 자동 생성이 이상하면 관리자가 수정

---

## 9. UI 개선 사항 (2025-12-30 추가)

### 9.1 등수 분포 히스토그램 높이 개선

**문제점:**
- 현재 막대그래프가 너무 낮아서 시각적으로 등수별 차이가 잘 보이지 않음

**개선 방향:**
- 막대그래프 최대 높이를 증가 (현재 → 약 2배)
- 최고 비율 기준으로 상대적 높이 계산 (가장 높은 막대 = 100%)

**변경 전/후:**
```
변경 전:                          변경 후:
1등 ██ 18%                        1등 ████████████████████ 18%
2등 █ 17%                         2등 ██████████████████ 17%
3등 █ 15%                         3등 ████████████████ 15%
...                               ...
```

**구현 명세:**
- `PlacementHistogram.tsx` 컴포넌트 수정
- 막대 높이: `(비율 / 최대비율) * 100%` 로 계산
- 막대 최소 높이: 4px (0%가 아닌 경우)
- 막대 최대 높이: 80px (또는 컨테이너 높이의 80%)

---

### 9.2 챔피언/아이템 이미지 추가

**적용 대상:**
1. 핵심 챔피언 (coreChampions)
2. 유동 챔피언 (flexChampions)
3. 완성 아이템 우선순위 (completedItems)
4. 초반 확보 우선순위 - 재료 아이템 (componentItems)

**이미지 소스:**
- 챔피언: Community Dragon CDN
  ```
  https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft{version}_{apiName.toLowerCase()}/hud/tft{version}_{apiName.toLowerCase()}_square.tft_set{set}.png
  ```

- 아이템: Data Dragon CDN
  ```
  https://ddragon.leagueoflegends.com/cdn/{version}/img/tft-item/{itemApiName}.png
  ```

**이미지 스펙:**
| 대상 | 크기 | 테두리 |
|------|------|--------|
| 핵심 챔피언 | 48x48 | 코스트별 색상 (1코 회색 ~ 5코 금색) |
| 유동 챔피언 | 40x40 | 코스트별 색상 (투명도 50%) |
| 완성 아이템 | 32x32 | 없음 |
| 재료 아이템 | 28x28 | 없음 |

**코스트별 테두리 색상:**
```typescript
const COST_BORDER_COLORS = {
  1: '#9ca3af', // 회색 (gray-400)
  2: '#22c55e', // 초록 (green-500)
  3: '#3b82f6', // 파랑 (blue-500)
  4: '#a855f7', // 보라 (purple-500)
  5: '#fbbf24', // 금색 (yellow-400)
};
```

**UI 목업 (이미지 포함):**
```
┌────────────────────────────────────────────────────────────┐
│ 핵심 챔피언                                                │
│ [🖼️징크스][🖼️바이][🖼️직스][🖼️세라핀][🖼️자이라]            │
│  48x48    48x48   48x48   48x48    48x48                   │
│  금테     보테    파테    파테     초테                     │
├────────────────────────────────────────────────────────────┤
│ 유동 챔피언                                                │
│ [🖼️에코][🖼️케이틀린]                                       │
│  40x40   40x40 (반투명 테두리)                             │
├────────────────────────────────────────────────────────────┤
│ 🗡️ 완성 아이템 우선순위                                    │
│ 1. [🖼️] 레이지블레이드  평균 2.9등 (-0.8등)               │
│ 2. [🖼️] 자이언트슬레이어 평균 3.0등 (-0.6등)              │
│ 3. [🖼️] 최후의 속삭임   평균 3.1등 (-0.4등)               │
├────────────────────────────────────────────────────────────┤
│ 🧩 초반 확보 우선순위 (재료 아이템)                         │
│ 1. [🖼️] 곡궁 (활)       평균 3.0등 (-0.5등)               │
│ 2. [🖼️] BF 대검         평균 3.1등 (-0.4등)               │
│ 3. [🖼️] 연습용 장갑     평균 3.2등 (-0.3등)               │
└────────────────────────────────────────────────────────────┘
```

**Fallback 처리:**
- 이미지 로드 실패 시 → 회색 박스 + 첫 글자 표시
- 예: 징크스 이미지 실패 → 회색 배경에 "징" 표시

---

### 9.3 핵심 유물 아이템 분석 (신규 기능)

**기능 설명:**
- 각 메타 조합에서 **통계적으로 성적이 좋은 유물(Artifact) 아이템**을 분석
- 해당 조합을 사용할 때 어떤 유물을 들면 성적이 좋은지 가이드 제공

**분석 로직:**
```typescript
interface ArtifactAnalysis {
  // 이 조합에서 자주 사용되는 유물
  frequentArtifacts: ArtifactStat[];

  // 이 조합에서 성적이 좋은 유물 (평균 등수 개선)
  effectiveArtifacts: ArtifactStat[];
}

interface ArtifactStat {
  artifactApiName: string;    // 예: "TFT_Item_Artifact_InfinityForce"
  artifactName: string;       // 예: "무한의 힘"

  // 등장 통계
  appearanceRate: number;     // 이 조합에서 이 유물 등장 비율
  gameCount: number;          // 표본 수

  // 성적 통계
  avgPlacement: number;       // 이 유물 있을 때 평균 등수
  placementDelta: number;     // 조합 평균 대비 등수 차이 (음수 = 좋음)

  // 우선순위 점수
  priorityScore: number;
}
```

**우선순위 계산:**
```typescript
function calculateArtifactPriority(stat: ArtifactStat): number {
  // 등수 개선 효과 (50%) - 유물은 영향력이 크므로 가중치 높임
  const deltaScore = -stat.placementDelta * 50;

  // 픽률 (25%)
  const popularityScore = stat.appearanceRate * 25;

  // 신뢰도 (25%)
  const sampleScore = Math.min(stat.gameCount / 100, 1) * 25;

  return deltaScore + popularityScore + sampleScore;
}
```

**표시 조건:**
- 최소 표본: 50게임 이상
- 표시 개수: 상위 3~5개
- 정렬: 우선순위 점수 내림차순

**UI 목업:**
```
┌────────────────────────────────────────────────────────────┐
│ 🏆 핵심 유물 아이템                                         │
│                                                            │
│ [🖼️무한의힘] [🖼️죽음의검] [🖼️저격총]                        │
│   -0.8등      -0.6등       -0.5등                          │
│   65%         58%          52%                             │
│                                                            │
│ * 이 조합에서 통계적으로 성적이 좋은 유물                    │
└────────────────────────────────────────────────────────────┘
```

**상세 표시 (카드 펼쳤을 때):**
```
┌────────────────────────────────────────────────────────────┐
│ 🏆 핵심 유물 아이템                                         │
├────────────────────────────────────────────────────────────┤
│ 1. [🖼️] 무한의 힘                                          │
│    평균 2.4등 (-0.8등) | 65% | 320게임                     │
│                                                            │
│ 2. [🖼️] 죽음의 검                                          │
│    평균 2.6등 (-0.6등) | 58% | 285게임                     │
│                                                            │
│ 3. [🖼️] 저격총                                             │
│    평균 2.7등 (-0.5등) | 52% | 256게임                     │
└────────────────────────────────────────────────────────────┘
```

**데이터 구조 확장:**
```typescript
// MetaComp 인터페이스에 추가
interface MetaComp {
  // ... 기존 필드들 ...

  // 유물 분석 (신규)
  artifactAnalysis: {
    effectiveArtifacts: ArtifactStat[];  // 성적 좋은 유물
  };
}
```

**이미지 소스:**
- 유물 아이템: Data Dragon CDN
  ```
  https://ddragon.leagueoflegends.com/cdn/{version}/img/tft-item/{artifactApiName}.png
  ```

**이미지 스펙:**
| 표시 위치 | 크기 | 테두리 |
|-----------|------|--------|
| 카드 접힌 상태 | 36x36 | 금색 테두리 (유물 표시) |
| 카드 펼친 상태 | 32x32 | 금색 테두리 |

---

## 10. 개선 구현 체크리스트

### Phase 1: 히스토그램 개선
- [ ] `PlacementHistogram.tsx` 막대 높이 증가
- [ ] 상대적 높이 계산 로직 적용
- [ ] 최소/최대 높이 설정

### Phase 2: 이미지 추가
- [ ] 챔피언 이미지 컴포넌트 생성/수정
- [ ] 아이템 이미지 컴포넌트 생성/수정
- [ ] 코스트별 테두리 색상 적용
- [ ] Fallback UI 구현
- [ ] `MetaCompCard.tsx`에 이미지 통합

### Phase 3: 유물 아이템 분석
- [x] `scripts/analyze-meta-comps.js`에 유물 분석 로직 추가
- [x] `src/types/meta.ts`에 ArtifactStat 타입 추가
- [x] `ArtifactPriorityList.tsx` 컴포넌트 생성
- [x] `MetaCompCard.tsx`에 유물 섹션 추가
- [x] 유물 이미지 연동
- [x] 장착 챔피언 정보 추가 (상위 3명)

### Phase 4: 테스트 및 검증
- [ ] 히스토그램 시각적 확인
- [ ] 이미지 로드 테스트 (성공/실패 케이스)
- [ ] 유물 데이터 정확성 확인
- [ ] 모바일 반응형 확인

---

## 11. 유물 아이템 분석 상세

### 11.1 유물 분석 로직

**유물 아이템 필터링:**
```javascript
// TFT_Item_Artifact_* 패턴으로 필터링
if (itemName.includes('Artifact')) {
  // 유물 아이템 처리
}
```

**최소 등장률:** 1% (일반 아이템 5%보다 완화 - 유물은 희귀함)

### 11.2 장착 챔피언 추적

각 유물 아이템별로 어떤 챔피언이 장착했는지 추적:

```javascript
// 장착 챔피언 상위 3명 추출
const topHolders = Object.entries(holders)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([champId, count]) => ({
    apiName: champId,
    name: CHAMPION_NAMES[champId],
    count: count,
    percentage: Math.round((count / item.count) * 100)
  }));
```

### 11.3 데이터 구조

```typescript
interface ArtifactStat {
  itemApiName: string;       // "TFT_Item_Artifact_Mittens"
  itemName: string;          // "마력 쥐방울"
  appearanceRate: number;    // 등장률 (0-100)
  avgPlacement: number;      // 평균 등수
  placementDelta: number;    // 조합 대비 등수 차이
  gameCount: number;         // 표본 수
  priorityScore: number;     // 우선순위 점수
  holders: ArtifactHolder[]; // 장착 챔피언 상위 3명
}

interface ArtifactHolder {
  apiName: string;           // 챔피언 API 이름
  name: string;              // 한글 이름
  count: number;             // 장착 횟수
  percentage: number;        // 장착 비율 (0-100)
}
```

### 11.4 UI 표시

```
┌─────────────────────────────────────────────────────┐
│ 핵심 유물 아이템                                     │
├─────────────────────────────────────────────────────┤
│ 1. [금테두리] 공허 건틀릿 (-1.61등)                  │
│    평균 1.47등 | 3% 등장 | 32게임                   │
│    장착: 오른(75%), 브라움(9%), 타릭(6%)            │
├─────────────────────────────────────────────────────┤
│ 2. [금테두리] 지평선의 초점 (-1.49등)               │
│    평균 1.74등 | 2% 등장 | 23게임                   │
│    장착: T-헥스(80%), 럭스(10%), 세라핀(5%)         │
└─────────────────────────────────────────────────────┘
```

### 11.5 유물 이름 매핑 (23개)

| API 이름 | 한글 이름 |
|----------|-----------|
| TFT_Item_Artifact_Mittens | 마력 쥐방울 |
| TFT_Item_Artifact_NavoriFlickerblades | 나보리 단검 |
| TFT_Item_Artifact_AegisOfDawn | 새벽의 방패 |
| TFT_Item_Artifact_SeekersArmguard | 탐색자의 아대 |
| TFT_Item_Artifact_Dawncore | 새벽의 핵 |
| TFT_Item_Artifact_LightshieldCrest | 광휘의 문장 |
| TFT_Item_Artifact_HorizonFocus | 지평선의 초점 |
| TFT_Item_Artifact_Fishbones | 피쉬본즈 |
| TFT_Item_Artifact_VoidGauntlet | 공허 건틀릿 |
| TFT_Item_Artifact_SilvermereDawn | 은빛새벽 |
| TFT_Item_Artifact_WitsEnd | 재치의 종말 |
| TFT_Item_Artifact_AegisOfDusk | 황혼의 방패 |
| TFT_Item_Artifact_BlightingJewel | 역병의 보석 |
| TFT_Item_Artifact_TheIndomitable | 불굴의 유물 |
| TFT_Item_Artifact_RapidFirecannon | 쾌속 기관포 |
| TFT_Item_Artifact_StatikkShiv | 스태틱의 단검 |
| TFT_Item_Artifact_TalismanOfAscension | 승천의 부적 |
| TFT_Item_Artifact_LichBane | 리치베인 |
| TFT_Item_Artifact_LudensTempest | 루덴의 폭풍 |
| TFT_Item_Artifact_ProwlersClaw | 포식자의 발톱 |
| TFT_Item_Artifact_HellfireHatchet | 지옥불 손도끼 |
| TFT_Item_Artifact_EternalPact | 영원의 서약 |
| TFT_Item_Artifact_TitanicHydra | 거인의 히드라 |
