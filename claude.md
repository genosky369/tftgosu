# tftgosu 프로젝트

## AI 작업 프로세스 (매 세션)

> **중요**: 모든 세션은 기록되며, AI는 작업 전 반드시 이전 맥락을 파악합니다.

```
┌─────────────────────────────────────────────────────┐
│  1. 세션 시작 시 (AI 필수 수행)                      │
├─────────────────────────────────────────────────────┤
│  □ claude.md 읽기                                   │
│  □ docs/history/ 폴더의 최근 기록 파일 읽기          │
│  □ 현재 구현 상태 파악                              │
│  □ 이전 세션의 "다음에 할 것" 확인                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  2. 작업 진행                                       │
├─────────────────────────────────────────────────────┤
│  □ 사용자 요청 처리                                 │
│  □ 중요 결정사항 발생 시 메모                       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  3. 세션 종료 시 (사용자가 요청하거나 작업 완료 시)   │
├─────────────────────────────────────────────────────┤
│  □ 오늘 날짜의 세션 기록 파일 생성/업데이트          │
│  □ claude.md의 "현재 구현 상태" 업데이트             │
└─────────────────────────────────────────────────────┘
```

### 세션 기록 폴더 구조

```
docs/history/
├── 2024-12-22.md    # 날짜별 세션 기록
├── 2024-12-23.md
└── ...
```

---

## 세션 기록 템플릿

```markdown
# YYYY-MM-DD 세션 기록

## 요약
- (이번 세션에서 한 일 3줄 이내)

## 주요 결정사항
- (기술적 결정, 방향성 결정 등)

## 구현/변경된 것
- (생성되거나 수정된 파일 목록)

## 다음에 할 것
- (다음 세션에서 이어서 할 작업)

## 참고사항
- (특이사항, 주의점, 사용자 선호도 등)
```

---

## 기능 개발 프로세스

> **원칙**: 한 번에 여러 기능을 만들지 않고, 기능 단위로 기획→논의→문서→개발 순서로 진행합니다.

```
┌─────────────────────────────────────────────────────┐
│  1. 기획 (Planning)                                  │
├─────────────────────────────────────────────────────┤
│  - 기능의 목적과 범위 정의                           │
│  - 사용자 시나리오 작성                              │
│  - 필요한 데이터/화면 목록                           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  2. 논의 (Review)                                    │
├─────────────────────────────────────────────────────┤
│  - 허점/빠진 부분 체크                               │
│  - 기술적 실현 가능성 검토                           │
│  - 사용자 경험 관점 검토                             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  3. 개발 문서 작성 (Documentation)                   │
├─────────────────────────────────────────────────────┤
│  - docs/features/[기능명].md 생성                    │
│  - 상세 스펙, 데이터 구조, UI 설계                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  4. 개발 (Development)                               │
├─────────────────────────────────────────────────────┤
│  - 문서 기반으로 구현                                │
│  - 완료 후 문서 및 구현 상태 업데이트                 │
└─────────────────────────────────────────────────────┘
```

### 문서 구조

```
docs/
├── history/              # 세션 기록
├── planning/
│   └── features.md       # 전체 기능 목록 및 우선순위
└── features/             # 기능별 상세 스펙 문서
    ├── simulator.md
    └── ...
```

---

## AI 협업 가이드

### AI 행동 원칙

> **질문을 통한 명확화**: 사용자의 요청이 애매모호하거나 여러 해석이 가능할 경우, AI는 바로 작업에 들어가지 않고 먼저 질문을 통해 요청을 구체화합니다.

**AI가 질문해야 하는 상황:**
- 요청의 범위가 불명확할 때 (예: "이거 수정해줘" → 어떤 부분을?)
- 여러 구현 방식이 가능할 때 (예: "버튼 만들어줘" → 어떤 스타일? 어디에?)
- 기술적 선택이 필요할 때 (예: "데이터 저장해줘" → 로컬? 서버? DB?)
- 우선순위 판단이 필요할 때 (예: "개선해줘" → 성능? UI? 코드 품질?)

**질문 예시:**
```
사용자: "로그인 기능 만들어줘"
AI: "로그인 기능을 만들기 전에 몇 가지 확인이 필요합니다:
    1. 인증 방식은 어떤 걸 원하시나요? (이메일/비밀번호, 소셜 로그인, 둘 다)
    2. 회원가입 기능도 함께 필요한가요?
    3. 로그인 상태 유지 기간은 어떻게 할까요?"
```

### 사용자 명령어

| 상황 | 명령어 |
|------|--------|
| 세션 시작 | "이전 기록 확인해줘" |
| 세션 종료 | "오늘 세션 정리해줘" |
| 중간 메모 | "이거 기록해둬: [내용]" |

### 코드 요청 시 포함할 정보
1. 어떤 기능을 원하는지
2. 관련된 기존 파일이 있다면 언급
3. 특별한 요구사항 (성능, 스타일 등)

### 예시 요청
```
"ChampionCard 컴포넌트를 만들어줘.
챔피언 이미지, 이름, 코스트를 보여주고
클릭하면 선택되도록 해줘."
```

### 피드백 방식
- 코드가 마음에 들면: "좋아, 다음 진행해줘"
- 수정이 필요하면: 구체적으로 어떤 부분을 어떻게 바꿀지 설명
- 이해가 안 되면: 언제든 질문 (코드 설명 요청 가능)

---

## 기술 스택

| 영역 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 프레임워크 | Next.js | 14.x | App Router 기반 웹 앱 |
| 언어 | TypeScript | 5.x | 타입 안정성 |
| 스타일링 | Tailwind CSS | 3.x | 유틸리티 기반 CSS |
| 상태관리 | Zustand | 4.x | 간단한 전역 상태 관리 |

---

## 폴더 구조

```
tftgosu/
├── claude.md              # 이 파일 (프로젝트 메모리)
├── docs/                   # 상세 문서
│   ├── history/            # 세션 기록
│   ├── DATA_STRUCTURE.md   # 데이터 구조 정의
│   ├── SIMULATION_LOGIC.md # 시뮬레이션 계산 로직
│   └── COMPONENTS.md       # UI 컴포넌트 가이드
├── src/
│   ├── app/                # Next.js App Router 페이지
│   ├── components/         # 재사용 UI 컴포넌트
│   ├── lib/                # 핵심 로직
│   ├── data/               # 정적 데이터
│   ├── types/              # TypeScript 타입 정의
│   └── stores/             # Zustand 상태 저장소
├── public/                 # 정적 파일 (이미지 등)
└── package.json
```

---

## 코딩 컨벤션

### 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `ChampionCard.tsx` |
| 컴포넌트 이름 | PascalCase | `export function ChampionCard()` |
| 함수/변수 | camelCase | `calculateDamage`, `totalHealth` |
| 상수 | UPPER_SNAKE_CASE | `MAX_ITEMS`, `BASE_ATTACK_SPEED` |
| 타입/인터페이스 | PascalCase | `interface Champion`, `type ItemStats` |
| 폴더 | kebab-case 또는 camelCase | `champion-card/` 또는 `championCard/` |

### 파일 구조 예시

```tsx
// src/components/champion/ChampionCard.tsx

// 1. 임포트
import { useState } from 'react';
import type { Champion } from '@/types/champion';

// 2. 타입 정의 (컴포넌트 전용)
interface ChampionCardProps {
  champion: Champion;
  onSelect?: (champion: Champion) => void;
}

// 3. 컴포넌트
export function ChampionCard({ champion, onSelect }: ChampionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="p-4 rounded-lg border hover:border-blue-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(champion)}
    >
      <img src={champion.imageUrl} alt={champion.name} />
      <h3>{champion.name}</h3>
      <p>Cost: {champion.cost}</p>
    </div>
  );
}
```

### 로직 함수 예시

```typescript
// src/lib/calculator/damageCalculator.ts

import type { Champion, Item } from '@/types';

/**
 * 챔피언의 총 공격력을 계산합니다.
 * 기본 공격력 + 아이템 보너스 공격력
 */
export function calculateTotalAD(champion: Champion, items: Item[]): number {
  const baseAD = champion.stats.attackDamage;
  const bonusAD = items.reduce((sum, item) => sum + (item.stats.attackDamage ?? 0), 0);

  return baseAD + bonusAD;
}

/**
 * 예상 DPS(초당 데미지)를 계산합니다.
 */
export function calculateDPS(
  champion: Champion,
  items: Item[],
  options?: { includeAbility?: boolean }
): number {
  const totalAD = calculateTotalAD(champion, items);
  const attackSpeed = calculateAttackSpeed(champion, items);

  const basicDPS = totalAD * attackSpeed;

  if (options?.includeAbility) {
    // 스킬 데미지 포함 계산
    const abilityDPS = calculateAbilityDPS(champion, items);
    return basicDPS + abilityDPS;
  }

  return basicDPS;
}
```

---

## 문서화 규칙

### 언제 문서를 업데이트하는가

1. **새 기능 추가 시**: `claude.md`의 "현재 구현 상태" 섹션 업데이트
2. **새 데이터 타입 추가 시**: `docs/DATA_STRUCTURE.md` 업데이트
3. **계산 로직 변경 시**: `docs/SIMULATION_LOGIC.md` 업데이트
4. **새 컴포넌트 추가 시**: `docs/COMPONENTS.md` 업데이트

### 코드 주석 규칙

```typescript
// 간단한 설명은 한 줄 주석
const result = calculate();

/**
 * 복잡한 함수는 JSDoc 스타일 사용
 * @param champion - 대상 챔피언
 * @param items - 장착된 아이템 배열
 * @returns 계산된 총 데미지
 */
function complexCalculation(champion: Champion, items: Item[]): number {
  // 구현
}

// TODO: 나중에 구현할 기능
// FIXME: 버그 수정 필요
// NOTE: 중요한 참고사항
```

---

## 현재 구현 상태

> 이 섹션은 개발 진행에 따라 업데이트됩니다.
> 최종 업데이트: 2024-12-22

### 완료된 기능
- [x] 프로젝트 문서화 구조 수립
- [x] claude.md 작성 (AI 작업 프로세스, 협업 가이드 포함)
- [x] docs/ 폴더 문서 작성 (DATA_STRUCTURE, SIMULATION_LOGIC, COMPONENTS)
- [x] 세션 기록 프로세스 정의
- [x] TFT Set 16 챔피언 데이터 확보 (100개, JSON)
- [x] Git + GitHub 설정 완료
- [ ] 프로젝트 초기 설정 (Next.js)
- [ ] 기본 데이터 구조 정의 (TypeScript)
- [ ] 메인 페이지 UI

### 진행 중
- (없음)

### 예정된 기능
- Next.js 프로젝트 초기화
- TypeScript 타입 파일 생성
- 챔피언/아이템 데이터를 TypeScript로 변환
- 챔피언 선택 UI
- 아이템 선택 UI
- 시뮬레이션 엔진
- 결과 시각화

### GitHub 저장소
- **URL**: https://github.com/genosky369/tftgosu

---

## 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [TFT 게임 위키](https://leagueoflegends.fandom.com/wiki/Teamfight_Tactics)
- [Riot Data Dragon](https://developer.riotgames.com/docs/tft) - TFT 공식 데이터
