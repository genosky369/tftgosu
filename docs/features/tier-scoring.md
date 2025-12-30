# 메타 조합 티어 산정 기준

> 작성일: 2025-12-30
> 참고: METAsrc 방식 (average placement, top 4 rate, win rate, pick rate 복합 점수)

## 1. 개요

단순 평균 등수가 아닌 **복합 점수(Composite Score)**를 사용하여 티어를 산정합니다.

---

## 2. 점수 계산 공식

### 2.1 복합 점수 (Composite Score)

```
CompositeScore = (PlacementScore × 40%) + (Top4Score × 25%) + (WinScore × 20%) + (ConsistencyScore × 15%)
```

### 2.2 각 지표별 점수 계산

#### 평균 등수 점수 (PlacementScore) - 40%
```javascript
// 평균 등수를 0~100 점수로 변환
// 1등 = 100점, 8등 = 0점
PlacementScore = (8 - avgPlacement) / 7 * 100
```

| 평균 등수 | 점수 |
|-----------|------|
| 1.0등 | 100점 |
| 2.0등 | 85.7점 |
| 3.0등 | 71.4점 |
| 3.5등 | 64.3점 |
| 4.0등 | 57.1점 |
| 4.5등 | 50.0점 |
| 5.0등 | 42.9점 |

#### Top4 비율 점수 (Top4Score) - 25%
```javascript
// Top4 비율을 그대로 점수로 사용 (0~100%)
Top4Score = top4Rate
```

| Top4 비율 | 점수 |
|-----------|------|
| 70% | 70점 |
| 60% | 60점 |
| 50% | 50점 |

#### 1등 비율 점수 (WinScore) - 20%
```javascript
// 1등 비율 × 5 (최대 100점으로 정규화)
// 20% 1등률이면 100점
WinScore = Math.min(winRate * 5, 100)
```

| 1등 비율 | 점수 |
|----------|------|
| 20% | 100점 |
| 15% | 75점 |
| 12.5% (평균) | 62.5점 |
| 10% | 50점 |

#### 안정성 점수 (ConsistencyScore) - 15%
```javascript
// 표준편차가 낮을수록 안정적
// 표준편차 1.0 = 100점, 4.0 = 0점
ConsistencyScore = Math.max((4 - stdDeviation) / 3 * 100, 0)
```

| 표준편차 | 점수 | 해석 |
|----------|------|------|
| 1.5 | 83.3점 | 매우 안정 |
| 2.0 | 66.7점 | 안정 |
| 2.5 | 50.0점 | 보통 |
| 3.0 | 33.3점 | 변동 큼 |
| 3.5 | 16.7점 | 도박성 |

---

## 3. 티어 산정 기준

### 3.1 복합 점수 기반 티어

| 티어 | 복합 점수 | 설명 |
|------|-----------|------|
| **S** | ≥ 65점 | 최상위 메타 |
| **A** | ≥ 55점 | 강력한 조합 |
| **B** | ≥ 45점 | 평균 이상 |
| **C** | < 45점 | 평균 이하 / 상황적 |

### 3.2 예시 계산

**9공허 협곡의 전령** (평균 3.51등, Top4 58%, 1등 15%, 표준편차 2.0)

```
PlacementScore = (8 - 3.51) / 7 * 100 = 64.1점
Top4Score = 58점
WinScore = 15 * 5 = 75점
ConsistencyScore = (4 - 2.0) / 3 * 100 = 66.7점

CompositeScore = (64.1 × 0.4) + (58 × 0.25) + (75 × 0.2) + (66.7 × 0.15)
              = 25.64 + 14.5 + 15 + 10.0
              = 65.14점 → S티어
```

---

## 4. 최소 표본 수

- **최소 200게임** 이상인 조합만 티어리스트에 포함
- 표본이 적으면 통계적 신뢰도가 낮음

---

## 5. 구현 코드

```javascript
function calculateCompositeScore(stats) {
  // 평균 등수 점수 (40%)
  const placementScore = (8 - stats.avgPlacement) / 7 * 100;

  // Top4 비율 점수 (25%)
  const top4Score = stats.top4Rate;

  // 1등 비율 점수 (20%)
  const winScore = Math.min(stats.winRate * 5, 100);

  // 안정성 점수 (15%)
  const consistencyScore = Math.max((4 - stats.stdDeviation) / 3 * 100, 0);

  // 복합 점수
  return (
    placementScore * 0.40 +
    top4Score * 0.25 +
    winScore * 0.20 +
    consistencyScore * 0.15
  );
}

function assignTier(compositeScore) {
  if (compositeScore >= 65) return 'S';
  if (compositeScore >= 55) return 'A';
  if (compositeScore >= 45) return 'B';
  return 'C';
}
```

---

## 6. 참고

- METAsrc: average placement, top 4 rate, win rate, pick rate, gold cost 복합 알고리즘
- 픽률(pick rate)은 메타 인기도 지표로, 티어 산정보다는 참고용으로 표시
- 골드 코스트는 현재 미적용 (추후 고려 가능)

---

## 7. 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2025-12-30 | 초기 버전 작성 (복합 점수 시스템 도입) |
