# TFT 시뮬레이터 UI 컴포넌트 가이드

이 문서는 프로젝트의 UI 컴포넌트들을 설명합니다.

---

## 컴포넌트 구조

```
src/components/
├── ui/                 # 기본 UI 컴포넌트
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   └── Tooltip.tsx
├── champion/           # 챔피언 관련 컴포넌트
│   ├── ChampionCard.tsx
│   ├── ChampionGrid.tsx
│   ├── ChampionDetail.tsx
│   └── ChampionStats.tsx
├── item/               # 아이템 관련 컴포넌트
│   ├── ItemCard.tsx
│   ├── ItemGrid.tsx
│   ├── ItemSlot.tsx
│   └── ItemTooltip.tsx
├── simulator/          # 시뮬레이터 컴포넌트
│   ├── SimulatorPanel.tsx
│   ├── ResultDisplay.tsx
│   └── ComparisonChart.tsx
└── layout/             # 레이아웃 컴포넌트
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Footer.tsx
```

---

## 기본 UI 컴포넌트

### Button

```tsx
// src/components/ui/Button.tsx

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
}: ButtonProps) {
  const baseStyles = 'rounded font-medium transition-colors';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

**사용 예시:**

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  시뮬레이션 시작
</Button>
```

---

### Card

```tsx
// src/components/ui/Card.tsx

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm
        ${hoverable ? 'hover:shadow-md hover:border-blue-300 cursor-pointer transition-all' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// 서브 컴포넌트
Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-3 border-b border-gray-100">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-3 border-t border-gray-100">{children}</div>;
};
```

**사용 예시:**

```tsx
<Card hoverable onClick={() => selectChampion(champion)}>
  <Card.Header>
    <h3>징크스</h3>
  </Card.Header>
  <Card.Body>
    <img src="/images/champions/jinx.png" alt="징크스" />
  </Card.Body>
</Card>
```

---

## 챔피언 컴포넌트

### ChampionCard

챔피언을 카드 형태로 표시합니다.

```tsx
// src/components/champion/ChampionCard.tsx

interface ChampionCardProps {
  champion: Champion;
  selected?: boolean;
  onClick?: (champion: Champion) => void;
}

export function ChampionCard({ champion, selected, onClick }: ChampionCardProps) {
  // 코스트별 테두리 색상
  const costColors = {
    1: 'border-gray-400',
    2: 'border-green-500',
    3: 'border-blue-500',
    4: 'border-purple-500',
    5: 'border-yellow-500',
  };

  return (
    <div
      className={`
        relative w-16 h-16 rounded cursor-pointer border-2
        ${costColors[champion.cost]}
        ${selected ? 'ring-2 ring-blue-400' : ''}
        hover:scale-105 transition-transform
      `}
      onClick={() => onClick?.(champion)}
    >
      <img
        src={champion.imageUrl}
        alt={champion.name}
        className="w-full h-full object-cover rounded"
      />
      {/* 코스트 표시 */}
      <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
        {champion.cost}
      </div>
    </div>
  );
}
```

**사용 예시:**

```tsx
<ChampionCard
  champion={jinx}
  selected={selectedChampion?.id === jinx.id}
  onClick={handleChampionSelect}
/>
```

---

### ChampionGrid

여러 챔피언을 그리드로 표시합니다.

```tsx
// src/components/champion/ChampionGrid.tsx

interface ChampionGridProps {
  champions: Champion[];
  selectedId?: string;
  onSelect: (champion: Champion) => void;
  filterByCost?: number;
}

export function ChampionGrid({
  champions,
  selectedId,
  onSelect,
  filterByCost,
}: ChampionGridProps) {
  const filteredChampions = filterByCost
    ? champions.filter(c => c.cost === filterByCost)
    : champions;

  // 코스트별로 그룹화
  const groupedByCost = groupBy(filteredChampions, 'cost');

  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(cost => (
        groupedByCost[cost]?.length > 0 && (
          <div key={cost}>
            <h4 className="text-sm font-medium mb-2">{cost} 코스트</h4>
            <div className="flex flex-wrap gap-2">
              {groupedByCost[cost].map(champion => (
                <ChampionCard
                  key={champion.id}
                  champion={champion}
                  selected={champion.id === selectedId}
                  onClick={onSelect}
                />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
```

---

## 아이템 컴포넌트

### ItemSlot

장착된 아이템 슬롯을 표시합니다.

```tsx
// src/components/item/ItemSlot.tsx

interface ItemSlotProps {
  item?: Item;
  index: number;
  onRemove?: (index: number) => void;
  onClick?: () => void;
}

export function ItemSlot({ item, index, onRemove, onClick }: ItemSlotProps) {
  if (!item) {
    return (
      <div
        className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400"
        onClick={onClick}
      >
        <span className="text-gray-400 text-xl">+</span>
      </div>
    );
  }

  return (
    <div className="relative w-12 h-12">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-full h-full rounded border-2 border-yellow-500"
      />
      {onRemove && (
        <button
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs"
          onClick={() => onRemove(index)}
        >
          ×
        </button>
      )}
    </div>
  );
}
```

---

### ItemTooltip

아이템 정보를 툴팁으로 표시합니다.

```tsx
// src/components/item/ItemTooltip.tsx

interface ItemTooltipProps {
  item: Item;
  children: React.ReactNode;
}

export function ItemTooltip({ item, children }: ItemTooltipProps) {
  return (
    <div className="group relative">
      {children}
      <div className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        w-48 p-3 bg-gray-900 text-white rounded shadow-lg
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all z-50
      ">
        <h4 className="font-bold text-yellow-400">{item.name}</h4>
        <p className="text-sm text-gray-300 mt-1">{item.description}</p>

        {/* 스탯 목록 */}
        <div className="mt-2 space-y-1 text-sm">
          {item.stats.attackDamage && (
            <div className="text-red-400">+{item.stats.attackDamage} 공격력</div>
          )}
          {item.stats.abilityPower && (
            <div className="text-purple-400">+{item.stats.abilityPower} 주문력</div>
          )}
          {item.stats.attackSpeed && (
            <div className="text-yellow-400">+{item.stats.attackSpeed * 100}% 공격 속도</div>
          )}
          {/* ... 기타 스탯 */}
        </div>

        {/* 패시브 효과 */}
        {item.passive && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <span className="text-blue-400">{item.passive.name}: </span>
            <span className="text-gray-300">{item.passive.description}</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 시뮬레이터 컴포넌트

### SimulatorPanel

시뮬레이션 설정 패널입니다.

```tsx
// src/components/simulator/SimulatorPanel.tsx

interface SimulatorPanelProps {
  champion: Champion | null;
  items: Item[];
  starLevel: 1 | 2 | 3;
  onStarLevelChange: (level: 1 | 2 | 3) => void;
  onItemAdd: (item: Item) => void;
  onItemRemove: (index: number) => void;
  onSimulate: () => void;
}

export function SimulatorPanel({
  champion,
  items,
  starLevel,
  onStarLevelChange,
  onItemAdd,
  onItemRemove,
  onSimulate,
}: SimulatorPanelProps) {
  return (
    <Card>
      <Card.Header>
        <h2 className="text-lg font-bold">시뮬레이터 설정</h2>
      </Card.Header>
      <Card.Body>
        {/* 챔피언 선택 영역 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">선택된 챔피언</label>
          {champion ? (
            <div className="flex items-center gap-3">
              <img src={champion.imageUrl} className="w-16 h-16 rounded" />
              <div>
                <div className="font-bold">{champion.name}</div>
                <div className="text-sm text-gray-500">{champion.cost} 코스트</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">챔피언을 선택하세요</div>
          )}
        </div>

        {/* 성급 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">성급</label>
          <div className="flex gap-2">
            {[1, 2, 3].map(level => (
              <button
                key={level}
                className={`px-4 py-2 rounded ${
                  starLevel === level
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => onStarLevelChange(level as 1 | 2 | 3)}
              >
                {'★'.repeat(level)}
              </button>
            ))}
          </div>
        </div>

        {/* 아이템 슬롯 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">아이템 (최대 3개)</label>
          <div className="flex gap-2">
            {[0, 1, 2].map(index => (
              <ItemSlot
                key={index}
                item={items[index]}
                index={index}
                onRemove={items[index] ? onItemRemove : undefined}
              />
            ))}
          </div>
        </div>

        {/* 시뮬레이션 버튼 */}
        <Button
          variant="primary"
          className="w-full"
          disabled={!champion}
          onClick={onSimulate}
        >
          시뮬레이션 실행
        </Button>
      </Card.Body>
    </Card>
  );
}
```

---

### ResultDisplay

시뮬레이션 결과를 표시합니다.

```tsx
// src/components/simulator/ResultDisplay.tsx

interface ResultDisplayProps {
  result: SimulationResult | null;
  loading?: boolean;
}

export function ResultDisplay({ result, loading }: ResultDisplayProps) {
  if (loading) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center py-8 text-gray-500">
            계산 중...
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center py-8 text-gray-400">
            챔피언과 아이템을 선택하고 시뮬레이션을 실행하세요
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h2 className="text-lg font-bold">시뮬레이션 결과</h2>
      </Card.Header>
      <Card.Body>
        {/* DPS 결과 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatBox
            label="기본 공격 DPS"
            value={result.dps.basicAttackDPS.toFixed(1)}
            color="red"
          />
          <StatBox
            label="스킬 DPS"
            value={result.dps.abilityDPS.toFixed(1)}
            color="purple"
          />
          <StatBox
            label="총 DPS"
            value={result.dps.totalDPS.toFixed(1)}
            color="blue"
            highlight
          />
        </div>

        {/* 최종 스탯 */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">최종 스탯</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>체력: {result.totalStats.health}</div>
            <div>공격력: {result.totalStats.attackDamage}</div>
            <div>공격 속도: {result.totalStats.attackSpeed.toFixed(2)}</div>
            <div>치명타: {(result.totalStats.critChance * 100).toFixed(0)}%</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

function StatBox({ label, value, color, highlight }: {
  label: string;
  value: string;
  color: 'red' | 'purple' | 'blue';
  highlight?: boolean;
}) {
  const colorStyles = {
    red: 'text-red-600',
    purple: 'text-purple-600',
    blue: 'text-blue-600',
  };

  return (
    <div className={`text-center p-3 rounded ${highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${colorStyles[color]}`}>{value}</div>
    </div>
  );
}
```

---

## 컴포넌트 추가 가이드

### 새 컴포넌트 생성 시 체크리스트

1. [ ] 적절한 폴더에 파일 생성 (ui, champion, item, simulator, layout)
2. [ ] Props 인터페이스 정의
3. [ ] Tailwind CSS로 스타일링
4. [ ] 이 문서에 사용법 추가
5. [ ] `claude.md`의 구현 상태 업데이트

### 스타일 가이드

- **색상**: Tailwind 기본 팔레트 사용
- **간격**: `gap-`, `p-`, `m-` 유틸리티 일관되게 사용
- **반응형**: `sm:`, `md:`, `lg:` 접두사로 반응형 처리
- **호버/포커스**: 인터랙티브 요소에 항상 `hover:`, `focus:` 상태 추가

### TFT 테마 색상

| 용도 | Tailwind 클래스 |
|------|----------------|
| 1코스트 | `gray-400` |
| 2코스트 | `green-500` |
| 3코스트 | `blue-500` |
| 4코스트 | `purple-500` |
| 5코스트 | `yellow-500` |
| 공격력 | `red-500` |
| 주문력 | `purple-500` |
| 체력 | `green-500` |
| 마나 | `blue-500` |
