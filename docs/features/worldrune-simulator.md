# 월드룬 시뮬레이터 설계 문서

> 최종 업데이트: 2024-12-23

---

## 1. 개요

### 목적
"지역 룬" 증강 선택 시, 주어진 레벨과 지역 상징으로 **지역 4개를 가장 빠르게(적은 기물로) 활성화**하는 챔피언 조합을 찾는다.

### 증강 효과
```
무작위 지역 특성 상징 2개를 획득합니다.
지역 특성 4개가 활성화된 상태로 플레이어 대상 전투를 4회 진행하면 강력한 보상을 획득합니다.
```

### 핵심 가치
- **지역 4개 활성화에 필요한 기물 수 최소화** (빠른 활성화)
- **같은 기물 수라면 덱 코스트가 높은 것** (더 강한 챔피언 구성)

### 브론즈 시뮬레이터와의 차이점

| 항목 | 브론즈 시뮬레이터 | 월드룬 시뮬레이터 |
|------|------------------|------------------|
| **목표** | 브론즈 시너지 개수 최대화 | 지역 4개 활성화 + 기물 수 최소화 |
| **대상 시너지** | 40개 (지역 + 직업) | 14개 (지역만) |
| **활성화 조건** | 시너지별 threshold 달성 | 지역당 1명 이상 |
| **상징** | 25개 (최대 7개) | 14개 지역 상징 (최대 4개) |
| **정렬 기준** | 브론즈 개수 ↓, 코스트 ↓ | 기물 수 ↑, 코스트 ↓ |

---

## 2. 데이터 구조

### 2.1 입력 데이터

#### 지역 목록 (14개)
```typescript
const REGIONS: string[] = [
  "공허", "그림자군도", "녹서스", "다르킨", "데마시아",
  "빌지워터", "슈리마", "아이오니아", "요들", "이쉬탈",
  "자운", "타곤", "프렐요드", "필트오버"
];
```

#### Champion (챔피언) - 기존과 동일
```typescript
interface Champion {
  name: string;           // 챔피언 이름
  cost: number;           // 코스트 (1~5)
  traits: string[];       // 지역 특성 (데마시아, 필트오버 등)
  classes: string[];      // 직업 특성 (총잡이, 엄호대 등)
}
```

### 2.2 지역 활성화 임계값

> 각 지역별로 활성화에 필요한 최소 유닛 수가 다름

```typescript
const REGION_THRESHOLDS: Record<string, number> = {
  "공허": 2,
  "그림자군도": 2,
  "녹서스": 3,
  "다르킨": 1,      // 가장 쉬움
  "데마시아": 3,
  "빌지워터": 3,
  "슈리마": 2,
  "아이오니아": 3,
  "요들": 2,
  "이쉬탈": 3,
  "자운": 3,
  "타곤": 1,        // 가장 쉬움
  "프렐요드": 3,
  "필트오버": 2,
};
```

| 임계값 | 지역 |
|--------|------|
| 1 | 다르킨, 타곤 |
| 2 | 공허, 그림자군도, 슈리마, 요들, 필트오버 |
| 3 | 녹서스, 데마시아, 빌지워터, 아이오니아, 이쉬탈, 자운, 프렐요드 |

### 2.3 사용자 입력

```typescript
interface WorldRuneInput {
  level: 6 | 7 | 8 | 9 | 10;    // 타겟 레벨 (배치 가능 유닛 수)
  regionSymbols: string[];       // 보유 지역 상징 (최대 4개, 중복 허용)

  // 필터링 옵션 (신규)
  excludedRegions: string[];     // 제외할 지역 (예: ["슈리마"])
  excludedChampions: string[];   // 제외할 챔피언 (예: ["아트록스"])
  maxCost: number;               // 최대 코스트 (1~5, 기본값 5)
}
```

---

## 3. 필터링 기능 (신규)

> **목적**: 현실적인 게임 상황을 반영하여 더 실용적인 조합 제안

### 3.1 지역 제외 기능

#### 사용 시나리오
```
상황: 슈리마 지역을 활성화하기 어려운 상황
이유: 슈리마 챔피언이 없거나, 슈리마 상징이 없음

→ 슈리마를 제외하고 나머지 13개 지역 중에서 4개 조합 탐색
```

#### 구현
```typescript
// 제외된 지역은 조합 생성에서 제외
const availableRegions = REGIONS.filter(r => !input.excludedRegions.includes(r));
const regionCombinations = generateCombinations(availableRegions, 4);
```

#### UI
```
┌─────────────────────────────────────────────────────────────┐
│  제외할 지역 (선택)                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [ ] 공허      [ ] 그림자군도   [✓] 슈리마           │   │
│  │ [ ] 다르킨    [ ] 데마시아     [ ] 빌지워터         │   │
│  │ ...                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 챔피언 제외 기능

#### 사용 시나리오
```
상황: 아트록스(5코스트)를 보유하기 어려운 상황
이유: 레벨이 낮거나, 골드가 부족하거나, 이미 다른 사람이 가져감

→ 아트록스를 제외한 나머지 챔피언으로 조합 탐색
```

#### 구현
```typescript
// 제외된 챔피언은 조합 생성에서 제외
const availableChampions = CHAMPIONS.filter(c =>
  !input.excludedChampions.includes(c.name)
);
```

#### UI
```
┌─────────────────────────────────────────────────────────────┐
│  제외할 챔피언 (선택)                                        │
│                                                             │
│  선택된 제외 챔피언:                                         │
│  [아트록스 ✕] [제라스 ✕]                      [전체 해제]   │
│                                                             │
│  코스트별 보기:  [1코] [2코] [3코] [4코] [5코]  ← 탭 전환    │
│  ─────────────────────────────────────────────────────────  │
│  │ 현재: 5코스트 챔피언                                  │  │
│  │                                                       │  │
│  │ [ ] T-헥스      [ ] 갈리오      [✓] 아트록스         │  │
│  │ [ ] 루시안과세나 [ ] 멜         [ ] 볼리베어         │  │
│  │ [ ] 세트        [ ] 쉬바나      [ ] 쓰레쉬           │  │
│  │ [ ] 아지르      [ ] 애니        [ ] 오른             │  │
│  │ [✓] 제라스      [ ] 질리언      [ ] 직스             │  │
│  │ [ ] 킨드레드    [ ] 탐 켄치     [ ] 피들스틱         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### 코스트별 탭 UI 동작
- 탭 클릭 시 해당 코스트의 챔피언 목록만 표시
- 체크박스로 제외할 챔피언 선택
- 선택된 챔피언은 상단에 태그로 표시
- "최대 코스트" 설정과 연동: 설정된 코스트 이하만 탭 활성화

### 3.3 코스트 제한 기능

#### 사용 시나리오
```
상황: 레벨 5인데 5코스트 기물은 비현실적
이유: 낮은 레벨에서는 높은 코스트 챔피언 등장 확률이 매우 낮음

→ 최대 코스트를 3으로 설정하여 1~3코스트 챔피언만으로 조합 탐색
```

#### TFT 코스트별 등장 확률 참고
| 레벨 | 1코 | 2코 | 3코 | 4코 | 5코 |
|------|-----|-----|-----|-----|-----|
| 5 | 45% | 33% | 20% | 2% | 0% |
| 6 | 30% | 40% | 25% | 5% | 0% |
| 7 | 19% | 35% | 32% | 13% | 1% |
| 8 | 18% | 27% | 32% | 20% | 3% |
| 9 | 10% | 20% | 25% | 30% | 15% |
| 10 | 5% | 10% | 20% | 35% | 30% |

#### 구현
```typescript
// 최대 코스트 이하 챔피언만 필터링
const availableChampions = CHAMPIONS.filter(c =>
  c.cost <= input.maxCost &&
  !input.excludedChampions.includes(c.name)
);
```

#### UI
```
┌─────────────────────────────────────────────────────────────┐
│  최대 코스트                                                 │
│  [1코] [2코] [3코] [4코] [5코(기본)]                        │
│                                                             │
│  ⚠️ 3코 이하 선택 시 일부 지역 조합이 불가능할 수 있습니다   │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 필터링 조합 로직

```typescript
function calculate(input: WorldRuneInput): WorldRuneResult[] {
  // 1. 필터링 적용
  const availableRegions = REGIONS.filter(r =>
    !input.excludedRegions.includes(r)
  );

  const availableChampions = CHAMPIONS.filter(c =>
    c.cost <= input.maxCost &&
    !input.excludedChampions.includes(c.name)
  );

  // 2. 필터링된 데이터로 조합 탐색
  const regionCombinations = generateCombinations(availableRegions, 4);

  for (const targetRegions of regionCombinations) {
    // ... 기존 로직 (availableChampions 사용)
  }
}
```

### 3.5 필터링 관련 엣지 케이스

| 상황 | 처리 |
|------|------|
| 제외 후 지역이 4개 미만 | "4개 지역 조합 불가" 에러 메시지 |
| 필터링 후 특정 지역 챔피언 0명 | 해당 지역 포함 조합 결과 없음 |
| 모든 조합이 불가능 | "조건에 맞는 조합이 없습니다" 메시지 |

---

### 2.4 출력 데이터

```typescript
interface WorldRuneResult {
  targetRegions: string[];       // 목표 지역 4개
  champions: Champion[];         // 필요한 챔피언 목록
  championCount: number;         // 필요 기물 수
  totalCost: number;             // 덱 총 코스트
  regionCoverage: RegionCoverage[];  // 지역별 커버 방식
  remainingSlots: number;        // 남은 슬롯 (level - championCount)
}

interface RegionCoverage {
  region: string;               // 지역 이름
  coveredBy: 'symbol' | 'champion';  // 커버 방식
  championName?: string;        // 챔피언으로 커버 시 챔피언 이름
}
```

---

## 3. 핵심 객체 설계

### 3.1 클래스 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                    WorldRuneSimulator                       │
├─────────────────────────────────────────────────────────────┤
│ - champions: Champion[]                                     │
│ - regions: string[]                                         │
├─────────────────────────────────────────────────────────────┤
│ + calculate(input: WorldRuneInput): WorldRuneResult[]       │
│ - generateRegionCombinations(): string[][]                  │
│ - findMinimalChampions(regions: string[]): Champion[]       │
│ - getChampionsByRegion(region: string): Champion[]          │
│ - sortResults(results: WorldRuneResult[]): WorldRuneResult[]│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RegionAnalyzer                           │
├─────────────────────────────────────────────────────────────┤
│ + getChampionRegions(champion: Champion): string[]          │
│ + isMultiRegion(champion: Champion): boolean                │
│ + getMultiRegionChampions(): Champion[]                     │
│ + findCoveringChampions(regions: string[]): Champion[][]    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 멀티 지역 챔피언 분석

> **핵심**: 멀티 지역 챔피언은 1명으로 2개 지역을 커버할 수 있어 매우 중요

| 챔피언 | 지역 1 | 지역 2 | 코스트 |
|--------|--------|--------|--------|
| 바이 | 필트오버 | 자운 | 2 |
| 뽀삐 | 데마시아 | 요들 | 2 |
| 신 짜오 | 데마시아 | 아이오니아 | 2 |
| 직스 | 요들 | 자운 | 5 |
| 케넨 | 아이오니아 | 요들 | 3 |
| 피즈 | 빌지워터 | 요들 | 4 |

### 3.3 핵심 모듈 구조

```
src/
├── lib/
│   └── simulator/
│       ├── BronzeSimulator.ts      # 기존
│       ├── WorldRuneSimulator.ts   # 신규 - 메인 시뮬레이터
│       └── RegionAnalyzer.ts       # 신규 - 지역 분석
├── data/
│   ├── champions.ts                # 기존
│   └── regions.ts                  # 신규 - 지역 목록
└── app/
    └── simulator/
        └── worldrune/
            ├── page.tsx            # UI 페이지
            └── components/
                ├── InputForm.tsx   # 입력 폼
                └── ResultList.tsx  # 결과 목록
```

---

## 4. 알고리즘

### 4.1 기본 알고리즘

```
1. 입력 받기: level, regionSymbols

2. 모든 가능한 4개 지역 조합 생성 (14C4 = 1,001개)

3. 각 4개 지역 조합에 대해:
   a. 상징으로 이미 커버된 지역 제거
   b. 남은 지역 = 4개 지역 - 상징 커버 지역
   c. 남은 지역을 커버하는 최소 챔피언 조합 찾기
      - 멀티 지역 챔피언 우선 고려
      - Set Cover 문제로 접근
   d. 결과: [챔피언 목록, 필요 기물 수, 총 코스트]

4. 결과 정렬:
   - 1차: 필요 기물 수 (오름차순) - 적을수록 좋음
   - 2차: 총 코스트 (내림차순) - 높을수록 좋음

5. 상위 N개 결과 반환
```

### 4.2 조합 수 분석

| 단계 | 조합 수 | 설명 |
|------|---------|------|
| 4개 지역 선택 | 1,001 | 14C4 |
| 지역당 챔피언 | 평균 7~8명 | 지역별로 다름 |
| 최악의 경우 | ~수만 | 관리 가능한 수준 |

> ✅ **결론**: 브론즈 시뮬레이터(17조 조합)에 비해 훨씬 관리 가능한 수준

### 4.3 Set Cover 알고리즘

```
문제: 주어진 지역 집합을 최소 챔피언으로 커버하기

예시:
- 목표 지역: {데마시아, 아이오니아, 요들, 자운}
- 상징 커버: {자운}
- 남은 지역: {데마시아, 아이오니아, 요들}

해결:
1. 멀티 지역 챔피언 체크
   - 신 짜오: {데마시아, 아이오니아} → 2개 커버!
   - 케넨: {아이오니아, 요들} → 2개 커버!

2. Greedy 선택
   - 신 짜오 선택 → 남은 지역: {요들}
   - 요들 지역 챔피언 1명 선택 (럼블, 룰루 등)

3. 결과: 2명으로 3개 지역 커버 (상징 1개 포함 시 총 4개)
```

### 4.4 의사 코드

```typescript
function calculate(input: WorldRuneInput): WorldRuneResult[] {
  const { level, regionSymbols } = input;
  const results: WorldRuneResult[] = [];

  // 1. 모든 4개 지역 조합 생성
  const regionCombinations = generateCombinations(REGIONS, 4);

  // 2. 각 조합에 대해 최소 챔피언 찾기
  for (const targetRegions of regionCombinations) {
    // 상징으로 커버되는 지역 제외
    const symbolCoveredRegions = regionSymbols.filter(s =>
      targetRegions.includes(s)
    );
    const remainingRegions = targetRegions.filter(r =>
      !symbolCoveredRegions.includes(r)
    );

    // 남은 지역이 없으면 챔피언 불필요
    if (remainingRegions.length === 0) {
      results.push({
        targetRegions,
        champions: [],
        championCount: 0,
        totalCost: 0,
        regionCoverage: createCoverage(targetRegions, symbolCoveredRegions, []),
        remainingSlots: level
      });
      continue;
    }

    // 최소 챔피언 조합 찾기 (Set Cover)
    const minChampions = findMinimalCoveringChampions(
      remainingRegions,
      level - symbolCoveredRegions.length // 상징은 슬롯 차지 안함? 확인 필요
    );

    if (minChampions) {
      results.push({
        targetRegions,
        champions: minChampions,
        championCount: minChampions.length,
        totalCost: minChampions.reduce((sum, c) => sum + c.cost, 0),
        regionCoverage: createCoverage(targetRegions, symbolCoveredRegions, minChampions),
        remainingSlots: level - minChampions.length
      });
    }
  }

  // 3. 정렬: 기물 수 오름차순, 코스트 내림차순
  return results
    .sort((a, b) => {
      if (a.championCount !== b.championCount) {
        return a.championCount - b.championCount;
      }
      return b.totalCost - a.totalCost;
    })
    .slice(0, 50);
}

function findMinimalCoveringChampions(
  regions: string[],
  maxChampions: number
): Champion[] | null {
  // Greedy Set Cover
  const uncovered = new Set(regions);
  const selected: Champion[] = [];

  while (uncovered.size > 0 && selected.length < maxChampions) {
    // 가장 많은 미커버 지역을 커버하는 챔피언 찾기
    let bestChampion: Champion | null = null;
    let bestCoverage = 0;
    let bestCost = 0;

    for (const champion of CHAMPIONS) {
      if (selected.includes(champion)) continue;

      const championRegions = champion.traits.filter(t => REGIONS.includes(t));
      const coverage = championRegions.filter(r => uncovered.has(r)).length;

      if (coverage > bestCoverage ||
          (coverage === bestCoverage && champion.cost > bestCost)) {
        bestChampion = champion;
        bestCoverage = coverage;
        bestCost = champion.cost;
      }
    }

    if (!bestChampion || bestCoverage === 0) {
      return null; // 커버 불가능
    }

    selected.push(bestChampion);
    bestChampion.traits
      .filter(t => REGIONS.includes(t))
      .forEach(r => uncovered.delete(r));
  }

  return uncovered.size === 0 ? selected : null;
}
```

---

## 5. 악마의 변호사: 잠재적 문제점

### 5.1 알고리즘 문제

#### [심각도: 중간] Greedy가 최적해를 보장하지 않음

| 문제 | 설명 |
|------|------|
| 발생 조건 | 특정 지역 조합에서 Greedy 선택이 비최적 |
| 예상 영향 | 실제 최소 기물보다 1~2명 더 필요할 수 있음 |
| 예시 | 2코 멀티지역 2명 vs 4코 멀티지역 1명 선택 오류 |

**해결책**:
```typescript
// 1. 작은 조합은 완전 탐색
if (remainingRegions.length <= 3) {
  return findOptimalCoveringChampions(remainingRegions); // 브루트포스
}

// 2. 큰 조합은 Greedy + 검증
const greedyResult = greedySetCover(remainingRegions);
const optimizedResult = localOptimization(greedyResult);
return optimizedResult;
```

#### [심각도: 낮음] 1,001개 지역 조합 전체 탐색

| 문제 | 설명 |
|------|------|
| 발생 조건 | 모든 지역 조합을 탐색 |
| 예상 영향 | 약간의 계산 시간 소요 (수백ms) |

**해결책**:
```typescript
// 상징 기반 조합 필터링 (선택적)
const relevantCombinations = regionCombinations.filter(combo =>
  regionSymbols.every(s => combo.includes(s))
);
```

### 5.2 데이터 정합성 문제

#### [심각도: 높음] traits에서 지역만 필터링

| 문제 | 설명 |
|------|------|
| 발생 조건 | traits에 지역과 비지역이 혼합 |
| 예상 영향 | 잘못된 지역 카운트 |
| 예시 | T-헥스의 traits: ["필트오버", "마법공학기계"] - "마법공학기계"는 지역 아님 |

**해결책**:
```typescript
// 지역 목록으로 필터링 필수
function getChampionRegions(champion: Champion): string[] {
  return champion.traits.filter(t => REGIONS.includes(normalizeRegionName(t)));
}

// 정규화 (띄어쓰기 처리)
function normalizeRegionName(name: string): string {
  return name.replace(/\s/g, '');
}
```

#### [심각도: 중간] "그림자 군도" vs "그림자군도" 불일치

| 문제 | 설명 |
|------|------|
| 발생 조건 | 데이터 간 띄어쓰기 불일치 |
| 예상 영향 | 지역 매칭 실패 |

**해결책**:
```typescript
// 모든 비교 시 정규화 적용
const normalizedRegions = REGIONS.map(normalizeRegionName);
const normalizedTraits = champion.traits.map(normalizeRegionName);
```

### 5.3 상징 처리 문제

#### [심각도: 중간] 상징 중복 선택의 의미

| 문제 | 설명 |
|------|------|
| 발생 조건 | 같은 지역 상징을 여러 개 선택 |
| 예상 영향 | 지역은 1명만 있어도 활성화되므로 중복 상징은 의미 없음 |

**해결책**:
```typescript
// UI에서 경고 메시지
if (hasDuplicateRegionSymbols(regionSymbols)) {
  showWarning('같은 지역 상징을 여러 개 가져도 추가 효과가 없습니다.');
}

// 또는 중복 허용하지 않도록 UI 제한
// 브론즈와 달리 월드룬은 중복이 무의미
```

#### [심각도: 높음] 상징이 4개 이상인 경우 - 이미 완성?

| 문제 | 설명 |
|------|------|
| 발생 조건 | 서로 다른 4개 지역 상징 보유 |
| 예상 영향 | 챔피언 없이도 4개 지역 활성화 가능 |

**해결책**:
```typescript
// 상징만으로 4개 지역 완성 시 특별 결과
const uniqueRegionSymbols = [...new Set(regionSymbols)];
if (uniqueRegionSymbols.length >= 4) {
  // "상징만으로 이미 4개 지역 활성화 가능!" 메시지
  // 또는 5개+ 지역 조합 제안
}
```

### 5.4 UI/UX 문제

#### [심각도: 중간] 결과 해석의 어려움

| 문제 | 설명 |
|------|------|
| 발생 조건 | 여러 결과 중 선택 시 |
| 예상 영향 | 어떤 조합이 더 나은지 판단 어려움 |

**해결책**:
```typescript
// 결과에 추가 정보 표시
interface WorldRuneResult {
  // ... 기존 필드
  recommendation: string;  // "멀티지역 챔피언 활용", "최소 기물" 등
  flexibleSlots: number;   // 다른 챔피언 넣을 수 있는 여유 슬롯
}

// UI에서 "추천" 배지 표시
{result.championCount === minChampionCount && (
  <Badge color="green">최소 기물</Badge>
)}
```

#### [심각도: 낮음] 레벨 대비 과도한 기물 필요

| 문제 | 설명 |
|------|------|
| 발생 조건 | 특정 지역 조합이 레벨보다 많은 기물 필요 |
| 예상 영향 | 불가능한 조합 표시 |

**해결책**:
```typescript
// 불가능한 조합 필터링
if (championCount > level) {
  // 결과에서 제외 또는 "레벨 부족" 표시
  result.impossible = true;
  result.requiredLevel = championCount;
}
```

### 5.5 엣지 케이스

#### [심각도: 중간] 존재하지 않는 지역 상징 입력

| 문제 | 설명 |
|------|------|
| 발생 조건 | 잘못된 지역 이름 입력 |
| 예상 영향 | 상징 효과 무시됨 |

**해결책**:
```typescript
function validateInput(input: WorldRuneInput): ValidationResult {
  // 지역 상징 검증
  for (const symbol of input.regionSymbols) {
    if (!REGIONS.includes(normalizeRegionName(symbol))) {
      return { valid: false, error: `"${symbol}"은(는) 유효한 지역이 아닙니다.` };
    }
  }
  return { valid: true };
}
```

#### [심각도: 낮음] 레벨 6에서 4개 지역 불가능한 조합

| 문제 | 설명 |
|------|------|
| 발생 조건 | 멀티지역 챔피언이 없는 4개 지역 조합 |
| 예상 영향 | 최소 4명 필요 → 레벨 6에서 2명 여유만 남음 |

**해결책**:
```typescript
// 결과에 "여유 슬롯" 정보 표시
const remainingSlots = level - championCount;
// UI에서 강조
{remainingSlots >= 4 && <Badge>여유 슬롯 {remainingSlots}개</Badge>}
```

---

## 6. 구현 우선순위

| 순서 | 항목 | 중요도 | 난이도 |
|------|------|--------|--------|
| 1 | 지역 데이터 파일 (`regions.ts`) | 높음 | 낮음 |
| 2 | 타입 정의 추가 | 높음 | 낮음 |
| 3 | RegionAnalyzer 구현 | 높음 | 중간 |
| 4 | WorldRuneSimulator 기본 버전 | 높음 | 중간 |
| 5 | 입력 폼 UI | 중간 | 낮음 |
| 6 | 결과 목록 UI | 중간 | 중간 |
| 7 | 성능 최적화 (필요 시) | 낮음 | 중간 |

---

## 7. 테스트 시나리오

### 기본 테스트
```typescript
// 상징 없이 레벨 6
const result1 = simulator.calculate({ level: 6, regionSymbols: [] });
expect(result1[0].championCount).toBeLessThanOrEqual(6);

// 상징 2개 (증강 기본 제공)
const result2 = simulator.calculate({
  level: 8,
  regionSymbols: ['데마시아', '아이오니아']
});
expect(result2[0].championCount).toBeLessThanOrEqual(4); // 2개는 상징으로 커버

// 상징 4개 (지역 완성)
const result3 = simulator.calculate({
  level: 6,
  regionSymbols: ['데마시아', '녹서스', '빌지워터', '요들']
});
expect(result3[0].championCount).toBe(0); // 챔피언 없이 완성
```

### 멀티 지역 테스트
```typescript
// 멀티지역 챔피언 활용 확인
const result = simulator.calculate({
  level: 6,
  regionSymbols: []
});
// 바이(필트오버+자운), 신짜오(데마시아+아이오니아) 등 활용 확인
const multiRegionChampions = result[0].champions.filter(c =>
  getChampionRegions(c).length >= 2
);
expect(multiRegionChampions.length).toBeGreaterThan(0);
```

### 엣지 케이스 테스트
```typescript
// 상징 5개 (4개 초과)
expect(() => simulator.calculate({
  level: 6,
  regionSymbols: ['a', 'b', 'c', 'd', 'e']
})).toThrow();

// 잘못된 지역 이름
expect(() => simulator.calculate({
  level: 6,
  regionSymbols: ['서울']
})).toThrow();
```

---

## 8. UI 와이어프레임

### 입력 폼
```
┌─────────────────────────────────────────────────────────────┐
│  🌍 월드룬 시뮬레이터                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  타겟 레벨                                                   │
│  [Lv.6] [Lv.7] [Lv.8] [Lv.9] [Lv.10]                       │
│                                                             │
│  보유 지역 상징 (0/4)                    [전체 해제]         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [-] 공허 [+]      [-] 그림자군도 [+]   [-] 녹서스 [+] │   │
│  │ [-] 다르킨 [+]    [-] 데마시아 [+]     [-] 빌지워터[+]│   │
│  │ [-] 슈리마 [+]    [-] 아이오니아 [+]   [-] 요들 [+]   │   │
│  │ [-] 이쉬탈 [+]    [-] 자운 [+]        [-] 타곤 [+]   │   │
│  │ [-] 프렐요드 [+]  [-] 필트오버 [+]                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ 중복 상징은 추가 효과가 없습니다 (브론즈와 다름)         │
│                                                             │
│  [            최적 조합 계산            ]                    │
└─────────────────────────────────────────────────────────────┘
```

### 결과 카드
```
┌─────────────────────────────────────────────────────────────┐
│  #1                                    [최소 기물] [추천]    │
├─────────────────────────────────────────────────────────────┤
│  목표 지역: 데마시아 / 아이오니아 / 요들 / 자운              │
│                                                             │
│  지역 커버 방식:                                             │
│  ✅ 데마시아 - 신 짜오 (2코)                                 │
│  ✅ 아이오니아 - 신 짜오 (2코)                               │
│  ✅ 요들 - 직스 (5코)                                        │
│  ✅ 자운 - 직스 (5코)                                        │
│                                                             │
│  필요 기물: 2명    총 코스트: 7    여유 슬롯: 4개            │
│                                                             │
│  챔피언: [신 짜오(2)] [직스(5)]                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2024-12-23 | 초안 작성 |
