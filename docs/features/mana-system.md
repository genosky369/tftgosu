# TFT 마나 시스템 (Set 15+)

## 개요

Set 15 (K.O. 콜로세움)부터 역할군별 마나 획득 방식이 개편되었습니다.
기존에는 모든 챔피언이 공격 시 10마나, 피격 시 받은 피해량의 일부를 마나로 회복했지만,
이제는 역할군에 따라 다른 방식으로 마나를 획득합니다.

## 역할군별 마나 시스템

| 역할군 | 공격당 마나 | 피격시 마나 | 마나 재생 | 추가 효과 |
|--------|------------|------------|----------|----------|
| **Tank** | 5 | O (피해량 비례) | - | 타겟팅 우선순위 높음 |
| **Fighter** | 10 | X | - | 모든 피해 흡혈 10% |
| **Assassin** | 10 | X | - | 타겟팅 우선순위 낮음, 비대상 피해 -15% |
| **Marksman** | 10 | X | - | - |
| **Mage** | 7 | X | 2/초 | - |
| **Specialist** | 특수 | - | - | 특수 마나 시스템 (케일 등) |

## 타겟팅 우선순위

높음 → 낮음 순서:
1. **Tank** (가장 먼저 타겟팅됨)
2. Fighter / Marksman / Mage / Specialist (일반)
3. **Assassin** (가장 늦게 타겟팅됨)

## Community Dragon 역할 매핑

Community Dragon JSON의 상세 역할군(role)을 마나 시스템 역할군(manaClass)으로 매핑합니다.

### Tank (탱커)
- `APTank` - AP 기반 탱커 (Nautilus, Leona, Taric 등)
- `ADTank` - AD 기반 탱커 (Garen, Darius, Poppy 등)

### Fighter (전사)
- `ADFighter` - AD 전사 (Ambessa, Vi, Yasuo 등)
- `APFighter` - AP 전사 (Sett, Sylas, Thresh 등)
- `HFighter` - 하이브리드 전사 (Yone, Viego)

### Assassin (암살자)
- `ADReaper` - AD 암살자 (Briar, Rek'Sai)
- `APReaper` - AP 암살자 (Fiddlesticks, Fizz, Diana)

### Marksman (원거리 딜러)
- `ADCarry` - AD 캐리 (Draven, Aphelios, Ashe 등)

### Mage (마법사)
- `APCaster` - AP 캐스터 (Lulu, Zoe, Lux 등)
- `ADCaster` - AD 캐스터 (Tristana, Miss Fortune 등)
- `APCarry` - AP 캐리 (Azir, Ziggs)

### Specialist (전문가)
- `ADSpecialist` - AD 전문가 (Jinx)
- `APSpecialist` - AP 전문가 (Twisted Fate)
- `ADCasterFormSwapper` - 변신형 (Kai'Sa)

## 데이터 파일

### 챔피언 데이터 (`src/data/set16-champions.json`)

```json
{
  "name": "Annie",
  "role": "APCaster",       // Community Dragon 원본 역할
  "manaClass": "Mage",      // 마나 시스템 역할군
  "traits": ["Dark Child", "Arcanist"],
  "stats": { ... }
}
```

### 마나 클래스 스탯 (`src/data/mana-class-stats.json`)

```json
{
  "Tank": {
    "manaPerAttack": 5,
    "manaOnHit": true,
    "manaRegen": 0,
    "bonusEffect": "타겟팅 우선순위 높음"
  },
  "Mage": {
    "manaPerAttack": 7,
    "manaOnHit": false,
    "manaRegen": 2,
    "bonusEffect": null
  }
  // ...
}
```

## 사용 예시

```typescript
import champions from '@/data/set16-champions.json';
import manaClassStats from '@/data/mana-class-stats.json';

// 챔피언의 마나 획득량 계산
function getManaPerAttack(champion: Champion): number {
  const stats = manaClassStats[champion.manaClass];
  return stats?.manaPerAttack || 10;
}

// Annie의 마나 획득량
const annie = champions.find(c => c.name === 'Annie');
console.log(getManaPerAttack(annie)); // 7 (Mage)

// Garen의 마나 획득량
const garen = champions.find(c => c.name === 'Garen');
console.log(getManaPerAttack(garen)); // 5 (Tank)
```

## 참고 자료

- [나무위키 - 전략적 팀 전투/세트 15](https://namu.wiki/w/전략적%20팀%20전투/세트%2015)
- [루리웹 - TFT 역할군 개편](https://bbs.ruliweb.com/pc/board/1003/read/2328859)
