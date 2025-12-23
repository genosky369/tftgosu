# 브론즈 시뮬레이터 설계 문서

> 최종 업데이트: 2024-12-22

---

## 1. 개요

### 목적
"영원한 브론즈" 증강 선택 시, 주어진 레벨과 상징으로 **브론즈 등급 시너지를 최대한 많이 활성화**하는 챔피언 조합을 찾는다.

### 증강 효과
| 등급 | 효과 |
|------|------|
| 골드 | 브론즈 등급 특성당 피해 증폭 2.5% |
| 프리즘 | 브론즈 등급 특성당 피해 증폭 2.5% + 내구력 2% |

### 핵심 가치
- **브론즈 시너지 개수 최대화** (피해 증폭 극대화)
- **같은 브론즈 개수라면 덱 코스트가 높은 것** (더 강한 챔피언 구성)

---

## 2. 데이터 구조

### 2.1 입력 데이터

#### Champion (챔피언)
```typescript
interface Champion {
  name: string;           // 챔피언 이름
  cost: number;           // 코스트 (1~5)
  traits: string[];       // 지역 특성 (데마시아, 필트오버 등)
  classes: string[];      // 직업 특성 (총잡이, 엄호대 등)
  // 스탯은 시뮬레이터에서 사용하지 않음
}
```

#### BronzeSynergy (브론즈 시너지)
```typescript
interface BronzeSynergy {
  synergy: string;        // 시너지 이름
  count: number;          // 브론즈 달성에 필요한 유닛 수
  tier: 'bronze';         // 등급
}
```

#### Symbol (상징)
```typescript
interface Symbol {
  name: string;           // 상징 이름 (빌지워터, 총잡이 등)
  type: 'trait' | 'class'; // 지역 특성 또는 직업 특성
}
```

### 2.2 사용자 입력

```typescript
interface SimulatorInput {
  level: 6 | 7 | 8 | 9 | 10;  // 타겟 레벨 (배치 가능 유닛 수)
  symbols: string[];           // 보유 상징 목록 (최대 7개)
  excludedChampions: string[]; // 제외할 챔피언 목록
                               // "해금 챔피언 제외" 체크 시 40개 자동 추가
}
```

### 2.3 출력 데이터

```typescript
interface SimulatorResult {
  champions: Champion[];       // 선택된 챔피언 목록
  bronzeSynergies: ActiveSynergy[];  // 활성화된 브론즈 시너지
  bronzeCount: number;         // 브론즈 시너지 총 개수
  totalCost: number;           // 덱 총 코스트
}

interface ActiveSynergy {
  name: string;                // 시너지 이름
  current: number;             // 현재 활성화 수
  required: number;            // 브론즈 달성 필요 수
  isActive: boolean;           // 브론즈 달성 여부
}
```

---

## 2.5 필터링 기능

### 챔피언 제외 기능

#### 사용 시나리오
```
상황 1: 특정 챔피언을 보유하기 어려운 상황
이유: 레벨이 낮거나, 골드가 부족하거나, 이미 다른 사람이 가져감

상황 2: 해금 챔피언을 아직 많이 획득하지 못한 신규 유저
이유: 퀘스트 완료가 어려워 대부분의 해금 챔피언 미보유

→ 개별 챔피언 제외 또는 "해금 챔피언 제외" 체크박스로 일괄 제외
```

#### 해금 챔피언 목록 (40개)

> 특정 퀘스트를 완료해야 사용할 수 있는 챔피언들
> 예: "니코 2성 2마리를 전투에 포함시키기" 등

| 코스트 | 챔피언 |
|--------|--------|
| 1코 | 그레이브즈, 바드, 뽀삐, 오리아나, 요릭, 트린다미어 |
| 2코 | 그웬, 다리우스, 르블랑, 케넨, 코부코와 유미 |
| 3코 | 나서스, 니달리, 다이애나, 레넥톤, 베이가, 스카너, 신지드, 요네, 워윅, 카이사, 칼리스타, 피즈, 협곡의 전령, T-헥스 |
| 4코 | 갈리오, 멜, 세트, 볼리베어, 쓰레쉬, 아트록스, 제라스, 직스, 탐 켄치, 내셔 남작 |
| 5코 | 라이즈, 브록, 사일러스, 아우렐리온 솔, 자헨 |

#### 구현
```typescript
import { UNLOCK_CHAMPIONS } from '@/data/unlockChampions';

// 제외된 챔피언은 조합 생성에서 제외
const availableChampions = CHAMPIONS.filter(c =>
  !input.excludedChampions.includes(c.name)
);

// "해금 챔피언 제외" 체크 시 → excludedChampions에 해금 챔피언 40개 자동 추가
function handleExcludeUnlockChange(checked: boolean) {
  if (checked) {
    setExcludedChampions(prev => [...new Set([...prev, ...UNLOCK_CHAMPIONS])]);
  } else {
    setExcludedChampions(prev => prev.filter(c => !UNLOCK_CHAMPIONS.includes(c)));
  }
}
```

#### UI
```
┌─────────────────────────────────────────────────────────────┐
│  제외할 챔피언 (선택)                           [전체 해제]   │
│                                                             │
│  [✓] 해금 챔피언 제외 (40개)                                │
│      퀘스트로 해금해야 하는 챔피언들을 일괄 제외             │
│                                                             │
│  선택된 제외 챔피언:                                         │
│  [그레이브즈 ✕] [바드 ✕] [뽀삐 ✕] ... +37개                │
│                                                             │
│  코스트별 보기: [1코] [2코] [3코] [4코] [5코]               │
│  ─────────────────────────────────────────────────────────  │
│  [ ] T-헥스 🔒   [ ] 갈리오 🔒   [✓] 아트록스 🔒           │
│  🔒 = 해금 챔피언                                           │
└─────────────────────────────────────────────────────────────┘
```

#### 동작 방식
1. **해금 챔피언 제외 체크박스**
   - 체크 ON → 해금 챔피언 40개가 자동으로 제외 목록에 추가
   - 체크 OFF → 해금 챔피언 40개가 제외 목록에서 제거
   - 개별 해금 챔피언은 체크박스와 별개로 추가/제거 가능

2. **코스트별 탭**
   - 탭 클릭 시 해당 코스트의 챔피언 목록만 표시
   - 해금 챔피언은 🔒 아이콘으로 구분
   - 체크박스로 제외할 챔피언 개별 선택 가능

3. **선택된 제외 챔피언 표시**
   - 상단에 태그 형태로 표시
   - 태그 클릭 시 제외 해제
   - 많을 경우 "+N개" 형태로 축약 표시

---

## 3. 핵심 객체 설계

### 3.1 클래스 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                    BronzeSimulator                          │
├─────────────────────────────────────────────────────────────┤
│ - champions: Champion[]                                     │
│ - bronzeSynergies: BronzeSynergy[]                         │
│ - symbols: Symbol[]                                         │
├─────────────────────────────────────────────────────────────┤
│ + calculate(input: SimulatorInput): SimulatorResult[]       │
│ - generateCombinations(level: number): Champion[][]         │
│ - applySymbols(champions: Champion[], symbols: string[])    │
│ - countBronzeSynergies(composition: Composition): number    │
│ - sortResults(results: SimulatorResult[]): SimulatorResult[]│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Composition                            │
├─────────────────────────────────────────────────────────────┤
│ - champions: Champion[]                                     │
│ - symbols: string[]                                         │
│ - synergyCount: Map<string, number>                        │
├─────────────────────────────────────────────────────────────┤
│ + addChampion(champion: Champion): void                     │
│ + addSymbol(symbol: string): void                          │
│ + getSynergyCount(synergy: string): number                 │
│ + getActiveBronzeSynergies(): ActiveSynergy[]              │
│ + getTotalCost(): number                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SynergyCalculator                        │
├─────────────────────────────────────────────────────────────┤
│ + countSynergies(champions: Champion[]): Map<string, number>│
│ + isBronzeActive(synergy: string, count: number): boolean   │
│ + getBronzeThreshold(synergy: string): number              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 핵심 모듈

```
src/
├── lib/
│   └── simulator/
│       ├── BronzeSimulator.ts      # 메인 시뮬레이터 클래스
│       ├── Composition.ts          # 덱 구성 관리
│       ├── SynergyCalculator.ts    # 시너지 계산
│       └── types.ts                # 타입 정의
├── data/
│   ├── champions.ts                # 챔피언 데이터
│   ├── bronzeSynergies.ts          # 브론즈 시너지 데이터
│   └── symbols.ts                  # 상징 데이터
└── app/
    └── simulator/
        └── bronze/
            ├── page.tsx            # UI 페이지
            └── components/
                ├── InputForm.tsx   # 입력 폼
                └── ResultList.tsx  # 결과 목록
```

---

## 4. 알고리즘

### 4.1 기본 알고리즘 (Brute Force)

```
1. 입력 받기: level, symbols
2. 모든 챔피언 조합 생성 (100C_level)
3. 각 조합에 대해:
   a. 상징 적용하여 시너지 카운트 증가
   b. 브론즈 시너지 개수 계산
   c. 덱 총 코스트 계산
4. 결과 정렬:
   - 1차: 브론즈 시너지 개수 (내림차순)
   - 2차: 덱 총 코스트 (내림차순)
5. 상위 N개 결과 반환
```

### 4.2 조합 수 계산

| 레벨 | 유닛 수 | 조합 수 (100C_n) |
|------|---------|------------------|
| 6 | 6 | 1,192,052,400 |
| 7 | 7 | 16,007,560,800 |
| 8 | 8 | 186,087,894,300 |
| 9 | 9 | 1,902,231,808,400 |
| 10 | 10 | 17,310,309,456,440 |

> ⚠️ **문제**: 조합 수가 너무 많아 Brute Force는 불가능

### 4.3 최적화된 알고리즘 (Greedy + Pruning)

```
1. 시너지별 기여도 계산
   - 각 챔피언이 활성화할 수 있는 브론즈 시너지 수 계산

2. Greedy 선택
   a. 가장 많은 브론즈 시너지를 활성화하는 챔피언 선택
   b. 이미 선택된 챔피언과의 시너지 시너지 고려
   c. 반복

3. Pruning (가지치기)
   - 이미 실버 이상인 시너지에 기여하는 챔피언 제외
   - 최대 브론즈 개수 달성 불가능한 조합 조기 종료

4. 상징 최적 배치
   - 선택된 챔피언 기반으로 상징을 어디에 붙일지 결정
   - 브론즈 1개 부족한 시너지에 우선 배치
```

### 4.4 의사 코드

```typescript
function calculate(input: SimulatorInput): SimulatorResult[] {
  const { level, symbols } = input;
  const results: SimulatorResult[] = [];

  // 1. 챔피언별 브론즈 기여도 점수 계산
  const championScores = champions.map(c => ({
    champion: c,
    score: calculateBronzeContribution(c)
  }));

  // 2. 점수 높은 순으로 정렬
  championScores.sort((a, b) => b.score - a.score);

  // 3. 상위 후보군에서 조합 탐색 (상위 30개만)
  const candidates = championScores.slice(0, 30);

  // 4. 조합 생성 및 평가
  for (const combination of generateCombinations(candidates, level)) {
    const composition = new Composition(combination, symbols);
    const bronzeCount = composition.getBronzeCount();

    results.push({
      champions: combination,
      bronzeSynergies: composition.getActiveBronzeSynergies(),
      bronzeCount,
      totalCost: composition.getTotalCost()
    });
  }

  // 5. 정렬 및 반환
  return sortAndLimit(results, 100);
}
```

---

## 5. 🔥 악마의 변호사: 잠재적 문제점

### 5.1 성능 문제

#### [심각도: 높음] 조합 폭발 (Combinatorial Explosion)

| 문제 | 설명 |
|------|------|
| 발생 조건 | 레벨 10, 상징 7개 선택 시 |
| 예상 영향 | 계산 시간 수십 초 ~ 수 분, UI 프리징 |
| 근본 원인 | 100C10 = 17조 가지 조합 |

**해결책**:
```typescript
// 1. Web Worker로 계산 분리
const worker = new Worker('/workers/bronze-calculator.js');
worker.postMessage({ level, symbols });
worker.onmessage = (e) => setResults(e.data);

// 2. 후보군 제한 (Greedy)
const candidates = getTopCandidates(champions, 25); // 상위 25개만

// 3. 조기 종료 조건
if (currentBronzeCount < bestBronzeCount - 2) {
  return; // 가지치기
}

// 4. 진행률 표시
onProgress?.((current / total) * 100);
```

#### [심각도: 중간] 메모리 사용량

| 문제 | 설명 |
|------|------|
| 발생 조건 | 결과를 모두 메모리에 저장 시 |
| 예상 영향 | 브라우저 메모리 부족, 크래시 |

**해결책**:
```typescript
// 결과 제한
const MAX_RESULTS = 100;
if (results.length >= MAX_RESULTS) {
  // 가장 낮은 점수 결과 제거
  results.pop();
}
```

### 5.2 데이터 정합성 문제

#### [심각도: 중간] 상징과 특성 매칭 오류

| 문제 | 설명 |
|------|------|
| 발생 조건 | 상징 이름과 시너지 이름 불일치 |
| 예상 영향 | 잘못된 계산 결과 |
| 예시 | "그림자 군도" vs "그림자군도" (띄어쓰기) |

**해결책**:
```typescript
// 정규화 함수
function normalizeTraitName(name: string): string {
  return name.replace(/\s/g, '').toLowerCase();
}

// 매칭 시 정규화 적용
const normalized = normalizeTraitName(symbol);
const match = traits.find(t => normalizeTraitName(t) === normalized);
```

#### [심각도: 중간] traits와 classes 혼동

| 문제 | 설명 |
|------|------|
| 발생 조건 | 챔피언 데이터에서 traits(지역)과 classes(직업) 구분 |
| 예상 영향 | 일부 시너지 누락 |

**해결책**:
```typescript
// 모든 시너지 통합
function getAllSynergies(champion: Champion): string[] {
  return [...champion.traits, ...champion.classes];
}
```

### 5.3 UI/UX 문제

#### [심각도: 중간] 계산 중 무응답

| 문제 | 설명 |
|------|------|
| 발생 조건 | 긴 계산 시간 |
| 예상 영향 | 사용자가 "멈췄나?" 오해, 중복 클릭 |

**해결책**:
```typescript
// 1. 로딩 상태 표시
const [isCalculating, setIsCalculating] = useState(false);

// 2. 진행률 표시
<ProgressBar value={progress} />

// 3. 취소 버튼
<Button onClick={cancelCalculation}>계산 취소</Button>

// 4. 예상 시간 표시
<p>예상 시간: {estimatedTime}초</p>
```

#### [심각도: 낮음] 결과 이해 어려움

| 문제 | 설명 |
|------|------|
| 발생 조건 | 결과 목록이 너무 많거나 복잡할 때 |
| 예상 영향 | 사용자가 어떤 조합을 선택해야 할지 모름 |

**해결책**:
```typescript
// 1. 결과 그룹핑 (브론즈 개수별)
const grouped = groupBy(results, 'bronzeCount');

// 2. 핵심 정보 하이라이트
<Badge color="gold">{result.bronzeCount}개 브론즈</Badge>

// 3. 조합 비교 기능
<CompareButton results={selectedResults} />
```

### 5.4 엣지 케이스

#### [심각도: 높음] 상징 7개 초과 입력

| 문제 | 설명 |
|------|------|
| 발생 조건 | 클라이언트 검증 우회 |
| 예상 영향 | 불가능한 조합 계산, 잘못된 결과 |

**해결책**:
```typescript
// 입력 검증 (서버 사이드도 필수)
function validateInput(input: SimulatorInput): ValidationResult {
  if (input.symbols.length > 7) {
    return { valid: false, error: '상징은 최대 7개까지 선택 가능합니다.' };
  }
  if (input.level < 6 || input.level > 10) {
    return { valid: false, error: '레벨은 6~10 사이여야 합니다.' };
  }
  return { valid: true };
}
```

#### [심각도: 중간] 상징 없이 계산

| 문제 | 설명 |
|------|------|
| 발생 조건 | 상징 0개로 계산 시작 |
| 예상 영향 | 의도된 동작이지만 사용자 혼란 가능 |

**해결책**:
```typescript
// 경고 메시지 표시
if (input.symbols.length === 0) {
  showWarning('상징 없이 계산합니다. 상징을 추가하면 더 많은 브론즈 시너지를 활성화할 수 있습니다.');
}
```

#### [심각도: 낮음] 동일 결과 중복

| 문제 | 설명 |
|------|------|
| 발생 조건 | 같은 시너지, 코스트의 다른 조합 |
| 예상 영향 | 결과 목록에 비슷한 조합 다수 |

**해결책**:
```typescript
// 결과 중복 제거 (시너지 구성 기준)
function deduplicateResults(results: SimulatorResult[]): SimulatorResult[] {
  const seen = new Set<string>();
  return results.filter(r => {
    const key = r.bronzeSynergies.map(s => s.name).sort().join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
```

---

## 6. 구현 우선순위

| 순서 | 항목 | 중요도 | 난이도 |
|------|------|--------|--------|
| 1 | 타입 정의 (`types.ts`) | 높음 | 낮음 |
| 2 | 데이터 변환 (JSON → TS) | 높음 | 낮음 |
| 3 | SynergyCalculator 구현 | 높음 | 중간 |
| 4 | Composition 클래스 구현 | 높음 | 중간 |
| 5 | BronzeSimulator 기본 버전 | 높음 | 중간 |
| 6 | 입력 폼 UI | 중간 | 낮음 |
| 7 | 결과 목록 UI | 중간 | 중간 |
| 8 | Web Worker 분리 | 중간 | 높음 |
| 9 | 성능 최적화 | 낮음 | 높음 |

---

## 7. 테스트 시나리오

### 기본 테스트
```typescript
// 레벨 6, 상징 없음
const result1 = simulator.calculate({ level: 6, symbols: [] });
expect(result1[0].bronzeCount).toBeGreaterThan(0);

// 레벨 10, 상징 7개
const result2 = simulator.calculate({
  level: 10,
  symbols: ['빌지워터', '녹서스', '총잡이', '엄호대', '요들', '프렐요드', '필트오버']
});
expect(result2[0].bronzeCount).toBeGreaterThanOrEqual(result1[0].bronzeCount);
```

### 엣지 케이스 테스트
```typescript
// 상징 0개
// 상징 7개 (최대)
// 상징 8개 (에러 기대)
// 레벨 5 (에러 기대)
// 레벨 11 (에러 기대)
// 존재하지 않는 상징 (에러 기대)
```

---

## 8. 참고 사항

### 브론즈 시너지 데이터 (40개)
- 지역 특성: 공허, 그림자군도, 녹서스, 다르킨, 데마시아, 빌지워터, 슈리마, 아이오니아, 요들, 이쉬탈, 자운, 프렐요드, 필트오버
- 직업 특성: 기동타격대, 기원자, 난동꾼, 방해꾼, 비전마법사, 엄호대, 원거리사격, 전쟁기계, 총잡이, 토벌자, 파수꾼, 학살자

### 상징 목록 (25개)
빌지워터, 녹서스, 다르킨, 슈리마, 난동꾼, 총잡이, 요들, 기동타격대, 원거리 사격, 전쟁기계, 아이오니아, 프렐요드, 방해꾼, 비전 마법사, 기원자, 토벌자, 엄호대, 학살자, 파수꾼, 필트오버, 공허, 그림자 군도, 데마시아, 자운, 이쉬탈

---

## 9. 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2024-12-22 | 초안 작성 |
| 2024-12-23 | 챔피언 제외 기능 추가 (개별 제외 + 해금 챔피언 일괄 제외) |
