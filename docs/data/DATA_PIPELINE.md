# TFT 데이터 파이프라인

> 이 문서는 TFT 데이터가 어디서 오고, 어떻게 가공되어 프로젝트에서 사용되는지 설명합니다.

---

## 데이터 출처

### Community Dragon

**URL**: `https://raw.communitydragon.org/latest/cdragon/tft/en_us.json`

- Riot Games의 공식 게임 파일에서 추출된 데이터
- 패치마다 자동 업데이트됨
- JSON 형식, 약 20MB 크기
- 모든 시즌(Set) 데이터 포함

**신뢰성**: 게임 클라이언트에서 직접 추출되므로 가장 정확한 데이터

---

## 데이터 갱신 프로세스

### 자동화 스크립트

```bash
npm run update-tft-data
```

**스크립트 위치**: `scripts/update-tft-data.js`

**실행 과정**:
1. Community Dragon에서 JSON 다운로드 (20MB)
2. Set 16 데이터만 필터링
3. 챔피언, 특성, 아이템 파싱
4. 정제된 JSON 파일로 저장
5. 임시 파일 삭제

### GitHub Actions 자동 갱신 (선택사항)

**워크플로우**: `.github/workflows/update-tft-data.yml`

- 매일 UTC 00:00 (한국시간 09:00) 실행
- 변경사항 있으면 자동 커밋
- 수동 실행도 가능 (workflow_dispatch)

---

## 생성되는 데이터 파일

### 1. 챔피언 데이터

**파일**: `src/data/set16-champions.json`

```json
{
  "name": "Yunara",
  "apiName": "TFT16_Yunara",
  "cost": 4,
  "traits": ["Ionia", "Quickstriker"],
  "role": "ADCarry",
  "manaClass": "Marksman",
  "stats": {
    "hp": 800,
    "damage": 60,
    "armor": 30,
    "magicResist": 30,
    "attackSpeed": 0.8,
    "critChance": 0.25,
    "critMultiplier": 1.4,
    "mana": 50,
    "initialMana": 0,
    "range": 4
  },
  "ability": {
    "name": "Transcendent State",
    "desc": "스킬 설명...",
    "variables": [
      { "name": "ADDamage", "value": [0, 85, 130, 450, 500, 0, 0] },
      { "name": "AttackSpeed", "value": [0, 0.75, 0.75, 3, 2, 0, 0] }
    ]
  }
}
```

### 2. 특성 데이터

**파일**: `src/data/set16-traits.json`

```json
{
  "name": "Quickstriker",
  "apiName": "TFT16_Quickstriker",
  "desc": "특성 설명...",
  "effects": [
    { "minUnits": 2, "maxUnits": 3, "style": 1, "variables": {...} },
    { "minUnits": 4, "maxUnits": 5, "style": 3, "variables": {...} }
  ]
}
```

### 3. 아이템 데이터

**파일**: `src/data/set16-items.json`

```json
{
  "base": [...],      // 기본 컴포넌트 (10개)
  "combined": [...],  // 조합 아이템 (51개)
  "radiant": [...]    // 찬란한 아이템 (45개)
}
```

### 4. 마나 클래스 스탯

**파일**: `src/data/mana-class-stats.json`

```json
{
  "Tank": { "manaPerAttack": 5, "manaOnHit": true, "manaRegen": 0 },
  "Fighter": { "manaPerAttack": 10, "manaOnHit": false, "manaRegen": 0 },
  "Mage": { "manaPerAttack": 7, "manaOnHit": false, "manaRegen": 2 }
}
```

---

## 스킬 스케일링 데이터 접근법

### 중요: 별도 파일 없음

스킬 스케일링(AD/AP 계수)은 **별도 파일로 관리하지 않음**.
`set16-champions.json`의 `ability.variables`에서 직접 접근.

### variables 배열 인덱스 규칙

```
value[0] = 기본값 (사용 안함)
value[1] = 1성
value[2] = 2성
value[3] = 3성
value[4]+ = 기타 (특수 모드 등)
```

### 자주 사용되는 변수명

| 변수명 | 의미 | 단위 |
|--------|------|------|
| `ADDamage` | AD 스케일링 | % (85 = 85% AD) |
| `APDamage` | AP 스케일링 | % |
| `BaseMagicDamage` | 기본 마법 피해 | 고정값 |
| `BasePhysicalDamage` | 기본 물리 피해 | 고정값 |
| `AttackSpeed` | 공격속도 보너스 | 소수 (0.75 = +75%) |
| `ShieldAmount` | 방어막 수치 | 고정값 또는 % |
| `StunDuration` | 기절 시간 | 초 |
| `HealAmount` | 회복량 | 고정값 또는 % |
| `Duration` | 지속 시간 | 초 |

### 예시: 유나라 스킬 데이터 접근

```typescript
import champions from '@/data/set16-champions.json';

const yunara = champions.find(c => c.name === 'Yunara');

// AD 스케일링 가져오기
const adDamageVar = yunara.ability.variables.find(v => v.name === 'ADDamage');
const adRatio1Star = adDamageVar.value[1]; // 85 (= 85% AD)
const adRatio2Star = adDamageVar.value[2]; // 130 (= 130% AD)
const adRatio3Star = adDamageVar.value[3]; // 450 (= 450% AD)

// 공격속도 보너스 가져오기
const asVar = yunara.ability.variables.find(v => v.name === 'AttackSpeed');
const asBonus3Star = asVar.value[3]; // 3 (= +300%)
```

---

## 역할군 (Role) 매핑

Community Dragon의 세부 역할군을 마나 시스템 역할군으로 매핑:

```javascript
const ROLE_TO_MANA_CLASS = {
  // Tank (공격당 5마나 + 피격시 마나)
  'APTank': 'Tank',
  'ADTank': 'Tank',

  // Fighter (공격당 10마나 + 흡혈 10%)
  'ADFighter': 'Fighter',
  'APFighter': 'Fighter',
  'HFighter': 'Fighter',

  // Assassin (공격당 10마나)
  'ADReaper': 'Assassin',
  'APReaper': 'Assassin',

  // Marksman (공격당 10마나)
  'ADCarry': 'Marksman',

  // Mage (공격당 7마나 + 초당 2 재생)
  'APCaster': 'Mage',
  'ADCaster': 'Mage',
  'APCarry': 'Mage',

  // Specialist (특수)
  'ADSpecialist': 'Specialist',
  'APSpecialist': 'Specialist',
  'ADCasterFormSwapper': 'Specialist'
};
```

---

## 데이터 정확성 검증

### 검증 방법

1. **Community Dragon 원본 확인**
   - URL: https://raw.communitydragon.org/latest/cdragon/tft/en_us.json
   - `sets["16"].champions` 에서 챔피언 검색

2. **League of Legends Wiki**
   - URL: https://wiki.leagueoflegends.com/en-us/
   - TFT 챔피언 페이지에서 스킬 설명 확인

3. **인게임 테스트**
   - Practice Tool에서 실제 수치 확인

### 주의사항

- 패치 직후에는 Community Dragon 업데이트까지 시간차 존재
- 일부 변수명이 직관적이지 않을 수 있음 (예: `XerathZapAttacksRequired`)
- 히든 스탯이나 버그 수정은 반영되지 않을 수 있음

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2024-12-26 | 데이터 파이프라인 초기 구축 |
| 2024-12-26 | role/manaClass 필드 추가 |
| 2024-12-26 | ability-scaling.json 삭제 (원본 데이터 사용) |
