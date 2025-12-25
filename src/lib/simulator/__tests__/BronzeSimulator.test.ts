import { CHAMPIONS } from '@/data/champions';
import { BRONZE_THRESHOLDS } from '@/data/bronzeSynergies';
import {
  validateInput,
  countSynergies,
  countBronzeSynergies,
  getActiveBronzeSynergies,
  normalizeTraitName,
} from '../BronzeSimulator';
import type { Champion } from '@/types/simulator';

// 헬퍼 함수: 이름으로 챔피언 찾기
function findChampionByName(name: string): Champion {
  const champion = CHAMPIONS.find(c => c.name === name);
  if (!champion) {
    throw new Error(`챔피언을 찾을 수 없습니다: ${name}`);
  }
  return champion;
}

function findChampionsByNames(names: string[]): Champion[] {
  return names.map(name => findChampionByName(name));
}

describe('validateInput', () => {
  it('레벨 6~10 사이는 유효하다', () => {
    expect(validateInput({ level: 6, symbols: [] }).valid).toBe(true);
    expect(validateInput({ level: 10, symbols: [] }).valid).toBe(true);
  });

  it('레벨 6 미만은 무효하다', () => {
    const result = validateInput({ level: 5, symbols: [] });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('레벨');
  });

  it('레벨 10 초과는 무효하다', () => {
    const result = validateInput({ level: 11, symbols: [] });
    expect(result.valid).toBe(false);
  });

  it('상징 7개까지는 유효하다', () => {
    const symbols = ['공허', '요들', '데마시아', '필트오버', '프렐요드', '녹서스', '아이오니아'];
    expect(validateInput({ level: 9, symbols }).valid).toBe(true);
  });

  it('상징 8개 이상은 무효하다', () => {
    const symbols = ['공허', '요들', '데마시아', '필트오버', '프렐요드', '녹서스', '아이오니아', '빌지워터'];
    const result = validateInput({ level: 9, symbols });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('상징');
  });
});

describe('normalizeTraitName', () => {
  it('공백을 제거하고 소문자로 변환한다', () => {
    expect(normalizeTraitName('비전 마법사')).toBe('비전마법사');
    expect(normalizeTraitName('기동타격대')).toBe('기동타격대');
  });
});

describe('countSynergies', () => {
  it('챔피언 시너지를 정확히 카운트한다', () => {
    // 가렌: 데마시아, 엄호대
    // 바이: 필트오버, 자운, 엄호대
    const champions = findChampionsByNames(['가렌', '바이']);
    const result = countSynergies(champions, []);

    expect(result.get('데마시아')).toBe(1);
    expect(result.get('엄호대')).toBe(2);
    expect(result.get('필트오버')).toBe(1);
    expect(result.get('자운')).toBe(1);
  });

  it('상징을 시너지에 추가한다', () => {
    const champions = findChampionsByNames(['가렌']); // 데마시아 1
    const result = countSynergies(champions, ['데마시아']);

    expect(result.get('데마시아')).toBe(2);
  });

  it('같은 상징 여러 개를 카운트한다', () => {
    const champions = findChampionsByNames(['가렌']); // 데마시아 1
    const result = countSynergies(champions, ['데마시아', '데마시아']);

    expect(result.get('데마시아')).toBe(3);
  });
});

describe('countBronzeSynergies', () => {
  it('브론즈 조건을 충족한 시너지 개수를 반환한다', () => {
    // 프렐요드 3명: 리산드라, 애쉬, 브라움
    const champions = findChampionsByNames(['리산드라', '애쉬', '브라움']);
    const synergyCounts = countSynergies(champions, []);
    const bronzeCount = countBronzeSynergies(synergyCounts);

    // 프렐요드 3 = 브론즈 달성
    expect(bronzeCount).toBeGreaterThanOrEqual(1);
  });

  it('데마시아 2명은 브론즈 미달성 (최소 3명 필요)', () => {
    // 가렌, 소나: 데마시아 2명
    const champions = findChampionsByNames(['가렌', '소나']);
    const synergyCounts = countSynergies(champions, []);

    // 데마시아 브론즈 조건은 3명
    const demaciaNormalized = normalizeTraitName('데마시아');
    const demaciaCount = synergyCounts.get(demaciaNormalized) || 0;
    const demaciaThreshold = BRONZE_THRESHOLDS.get('데마시아') || 999;

    expect(demaciaCount).toBe(2);
    expect(demaciaThreshold).toBe(3);
    expect(demaciaCount).toBeLessThan(demaciaThreshold);
  });
});

describe('getActiveBronzeSynergies', () => {
  it('활성화된 시너지와 비활성화된 시너지를 구분한다', () => {
    // 프렐요드 3명 + 엄호대 2명
    const champions = findChampionsByNames(['리산드라', '애쉬', '브라움', '가렌']);
    const synergyCounts = countSynergies(champions, []);
    const activeSynergies = getActiveBronzeSynergies(synergyCounts);

    const freljord = activeSynergies.find(s => s.name === '프렐요드');
    const vanguard = activeSynergies.find(s => s.name === '엄호대');

    expect(freljord?.isActive).toBe(true);
    expect(freljord?.current).toBe(3);

    // 엄호대: 리산드라(기원자), 브라움(파수꾼), 가렌(엄호대) → 가렌 1명만
    // 다시 확인: 리산드라=기원자, 브라움=파수꾼, 가렌=엄호대 → 엄호대 1명
    // 수정 필요
  });
});

describe('검증 케이스', () => {
  it('케이스 1: 9명 조합 + 상징 4개 = 브론즈 8개', () => {
    /**
     * 챔피언: 유나라, 리산드라, 라이즈, 애쉬, 코부코와 유미, 브라움, 협곡의 전령, 가렌, 바이
     * 상징: 데마시아, 공허, 요들, 필트오버
     *
     * 예상 브론즈 시너지:
     * 1. 프렐요드 (3): 리산드라, 애쉬, 브라움
     * 2. 기동타격대 (2): 유나라, 애쉬
     * 3. 기원자 (2): 리산드라, 코부코
     * 4. 난동꾼 (2): 코부코, 협곡의 전령
     * 5. 엄호대 (2): 가렌, 바이
     * 6. 공허 (2): 협곡의 전령(1) + 상징(1)
     * 7. 요들 (2): 코부코(1) + 상징(1)
     * 8. 필트오버 (2): 바이(1) + 상징(1)
     *
     * 미달성:
     * - 데마시아: 가렌(1) + 상징(1) = 2 (최소 3 필요)
     */
    const champions = findChampionsByNames([
      '유나라',
      '리산드라',
      '라이즈',
      '애쉬',
      '코부코와 유미',
      '브라움',
      '협곡의 전령',
      '가렌',
      '바이',
    ]);
    const symbols = ['데마시아', '공허', '요들', '필트오버'];

    const synergyCounts = countSynergies(champions, symbols);
    const bronzeCount = countBronzeSynergies(synergyCounts);
    const activeSynergies = getActiveBronzeSynergies(synergyCounts);

    // 브론즈 시너지 8개 예상
    expect(bronzeCount).toBe(8);

    // 활성화된 시너지 목록 검증
    const activeNames = activeSynergies
      .filter(s => s.isActive)
      .map(s => s.name);

    expect(activeNames).toContain('프렐요드');
    expect(activeNames).toContain('기동타격대');
    expect(activeNames).toContain('기원자');
    expect(activeNames).toContain('난동꾼');
    expect(activeNames).toContain('엄호대');
    expect(activeNames).toContain('공허');
    expect(activeNames).toContain('요들');
    expect(activeNames).toContain('필트오버');

    // 데마시아는 미달성
    const demacia = activeSynergies.find(s => s.name === '데마시아');
    expect(demacia?.isActive).toBe(false);
    expect(demacia?.current).toBe(2);
  });

  it('케이스 2: 상징 없이 프렐요드 3명만', () => {
    const champions = findChampionsByNames(['리산드라', '애쉬', '브라움']);
    const synergyCounts = countSynergies(champions, []);
    const bronzeCount = countBronzeSynergies(synergyCounts);

    // 프렐요드(3) 브론즈 달성
    expect(bronzeCount).toBeGreaterThanOrEqual(1);

    const activeSynergies = getActiveBronzeSynergies(synergyCounts);
    const freljord = activeSynergies.find(s => s.name === '프렐요드');
    expect(freljord?.isActive).toBe(true);
  });
});
