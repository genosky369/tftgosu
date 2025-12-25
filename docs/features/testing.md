# 테스트 환경 구축

## 개요

시뮬레이터 계산 로직의 정확성을 자동으로 검증하기 위한 Jest 테스트 환경 구축.

---

## 목적

1. **계산 로직 검증**: 브론즈/세계룬 시뮬레이터의 시너지 계산이 정확한지 확인
2. **회귀 방지**: 코드 수정 시 기존 기능이 깨지지 않는지 자동 확인
3. **신뢰성 확보**: 수동 테스트로는 커버하기 어려운 케이스 자동화

---

## 기술 스택

| 도구 | 용도 |
|------|------|
| Jest | 테스트 프레임워크 |
| ts-jest | TypeScript 지원 |
| @types/jest | Jest 타입 정의 |

---

## 설치 명령어

```bash
npm install -D jest ts-jest @types/jest
```

---

## 설정 파일

### jest.config.js

```javascript
/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    '!src/lib/**/*.d.ts',
  ],
};

module.exports = config;
```

### package.json 스크립트 추가

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 폴더 구조

```
src/
├── lib/
│   └── simulator/
│       ├── BronzeSimulator.ts
│       ├── WorldRuneSimulator.ts
│       └── __tests__/
│           ├── BronzeSimulator.test.ts
│           └── WorldRuneSimulator.test.ts
```

---

## 테스트 대상 함수

### BronzeSimulator.ts

| 함수 | 테스트 내용 |
|------|------------|
| `countSynergies()` | 챔피언 + 상징 시너지 카운트 정확성 |
| `countBronzeSynergies()` | 브론즈 달성 시너지 개수 |
| `getActiveBronzeSynergies()` | 활성화된 시너지 목록 |
| `validateInput()` | 입력 검증 (레벨, 상징 개수) |
| `calculate()` | 전체 계산 결과 (통합 테스트) |

### WorldRuneSimulator.ts

| 함수 | 테스트 내용 |
|------|------------|
| 지역 활성화 계산 | 4개 지역 빠른 활성화 조합 |
| 필터링 로직 | 지역 제외, 챔피언 제외, 최대 코스트 |

---

## 테스트 케이스 설계

### 1. 단위 테스트 (Unit Tests)

개별 함수의 정확성 검증.

```typescript
describe('countSynergies', () => {
  it('챔피언 시너지를 정확히 카운트한다', () => {
    const champions = [가렌, 바이]; // 예시
    const result = countSynergies(champions, []);
    expect(result.get('데마시아')).toBe(1);
    expect(result.get('엄호대')).toBe(2);
  });

  it('상징을 시너지에 추가한다', () => {
    const result = countSynergies([가렌], ['데마시아']);
    expect(result.get('데마시아')).toBe(2);
  });
});
```

### 2. 통합 테스트 (Integration Tests)

실제 사용 시나리오 검증.

```typescript
describe('calculate (브론즈 시뮬레이터)', () => {
  it('9레벨 + 상징 4개 조합 계산', () => {
    const input = {
      level: 9,
      symbols: ['데마시아', '공허', '요들', '필트오버'],
      excludedChampions: [],
    };
    const results = calculate(input);

    // 최상위 결과의 브론즈 개수 확인
    expect(results[0].bronzeCount).toBeGreaterThanOrEqual(8);
  });
});
```

### 3. 검증 케이스 (Verification Tests)

수동 계산한 "정답"과 비교.

```typescript
describe('검증 케이스', () => {
  it('케이스 1: 유나라, 리산드라, 라이즈, 애쉬, 코부코, 브라움, 협곡의 전령, 가렌, 바이', () => {
    const champions = findChampionsByNames([
      '유나라', '리산드라', '라이즈', '애쉬',
      '코부코와 유미', '브라움', '협곡의 전령', '가렌', '바이'
    ]);
    const symbols = ['데마시아', '공허', '요들', '필트오버'];

    const synergyCounts = countSynergies(champions, symbols);
    const bronzeCount = countBronzeSynergies(synergyCounts);

    expect(bronzeCount).toBe(8);
  });
});
```

---

## 실행 방법

```bash
# 전체 테스트 실행
npm test

# 특정 파일만 테스트
npm test BronzeSimulator

# 워치 모드 (파일 변경 시 자동 실행)
npm test:watch

# 커버리지 리포트
npm test:coverage
```

---

## 테스트 작성 가이드

### 네이밍 규칙

```typescript
describe('함수명 또는 기능', () => {
  it('어떤 상황에서 어떤 결과가 나온다', () => {
    // ...
  });
});
```

### 예시

```typescript
describe('countBronzeSynergies', () => {
  it('프렐요드 3명이면 브론즈 1개로 카운트한다', () => {
    // ...
  });

  it('데마시아 2명이면 브론즈 미달성 (최소 3명 필요)', () => {
    // ...
  });
});
```

---

## 구현 순서

1. Jest + ts-jest 설치
2. jest.config.js 생성
3. package.json 스크립트 추가
4. `__tests__` 폴더 생성
5. BronzeSimulator.test.ts 작성
6. 테스트 실행 및 검증
7. (선택) WorldRuneSimulator.test.ts 작성

---

## 주의사항

### 내부 함수 테스트

현재 `countSynergies`, `countBronzeSynergies` 등은 내부 함수(export 안 됨).
테스트를 위해 두 가지 방법 중 선택:

**방법 1**: 함수들을 export (권장)
```typescript
// BronzeSimulator.ts
export function countSynergies(...) { ... }
export function countBronzeSynergies(...) { ... }
```

**방법 2**: calculate() 결과로 간접 테스트
```typescript
// 내부 함수를 직접 테스트하지 않고 calculate() 결과로 검증
```

### Path Alias

`@/` alias가 테스트에서도 동작하도록 `moduleNameMapper` 설정 필요.

---

## 예상 결과

```
$ npm test

 PASS  src/lib/simulator/__tests__/BronzeSimulator.test.ts
  countSynergies
    ✓ 챔피언 시너지를 정확히 카운트한다 (3 ms)
    ✓ 상징을 시너지에 추가한다 (1 ms)
  countBronzeSynergies
    ✓ 프렐요드 3명이면 브론즈 1개로 카운트한다 (1 ms)
    ✓ 데마시아 2명이면 브론즈 미달성 (1 ms)
  검증 케이스
    ✓ 케이스 1: 9명 조합 브론즈 8개 (2 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```
