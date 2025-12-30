/**
 * 메타 조합 분석 스크립트 (K-means 클러스터링)
 *
 * 실행: node scripts/analyze-meta-comps.js
 *
 * 챌린저 게임 데이터를 K-means 클러스터링하여 메타 조합 티어리스트 생성
 */

const { createClient } = require('@supabase/supabase-js');
const { kmeans } = require('ml-kmeans');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// 환경 변수
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase 클라이언트
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 설정
const MIN_SAMPLE_SIZE = 200;  // 최소 표본 수
const K_CLUSTERS = 30;        // 클러스터 개수 (조정 가능)

// 챔피언 목록 (벡터화용)
const CHAMPIONS = [
  "TFT16_THex", "TFT16_Garen", "TFT16_Galio", "TFT16_Gangplank", "TFT16_Graves",
  "TFT16_Gwen", "TFT16_Nasus", "TFT16_BaronNashor", "TFT16_Nautilus", "TFT16_Nidalee",
  "TFT16_Neeko", "TFT16_Darius", "TFT16_Diana", "TFT16_Draven", "TFT16_Ryze",
  "TFT16_Lux", "TFT16_Rumble", "TFT16_Renekton", "TFT16_Leona", "TFT16_RekSai",
  "TFT16_Loris", "TFT16_Lucian", "TFT16_Lulu", "TFT16_Leblanc", "TFT16_Lissandra",
  "TFT16_Malzahar", "TFT16_Mel", "TFT16_DrMundo", "TFT16_MissFortune", "TFT16_Milio",
  "TFT16_Bard", "TFT16_Vi", "TFT16_Veigar", "TFT16_Vayne", "TFT16_BelVeth",
  "TFT16_Volibear", "TFT16_Braum", "TFT16_Briar", "TFT16_Brock", "TFT16_Blitzcrank",
  "TFT16_Viego", "TFT16_Poppy", "TFT16_Sion", "TFT16_Sylas", "TFT16_Seraphine",
  "TFT16_Sejuani", "TFT16_Sett", "TFT16_Sona", "TFT16_Shen", "TFT16_Shyvana",
  "TFT16_Swain", "TFT16_Skarner", "TFT16_XinZhao", "TFT16_Singed", "TFT16_Thresh",
  "TFT16_Ahri", "TFT16_AurelionSol", "TFT16_Azir", "TFT16_Aatrox", "TFT16_Aphelios",
  "TFT16_Ambessa", "TFT16_Annie", "TFT16_Anivia", "TFT16_Ashe", "TFT16_Yasuo",
  "TFT16_Ekko", "TFT16_Wukong", "TFT16_Ornn", "TFT16_Orianna", "TFT16_Yone",
  "TFT16_Yorick", "TFT16_Warwick", "TFT16_Yunara", "TFT16_Illaoi", "TFT16_JarvanIV",
  "TFT16_Zaahen", "TFT16_Xerath", "TFT16_Zoe", "TFT16_Ziggs", "TFT16_Jhin",
  "TFT16_Zilean", "TFT16_Jinx", "TFT16_ChoGath", "TFT16_Kaisa", "TFT16_Kalista",
  "TFT16_Kennen", "TFT16_Caitlyn", "TFT16_KogMaw", "TFT16_Kobuko", "TFT16_Qiyana",
  "TFT16_Kindred", "TFT16_Taric", "TFT16_TahmKench", "TFT16_Tristana", "TFT16_Tryndamere",
  "TFT16_TwistedFate", "TFT16_Teemo", "TFT16_Fiddlesticks", "TFT16_Fizz", "TFT16_RiftHerald"
];

// 챔피언 이름 매핑 (API 이름 -> 한글)
const CHAMPION_NAMES = {
  "TFT16_THex": "T-헥스", "TFT16_Garen": "가렌", "TFT16_Galio": "갈리오", "TFT16_Gangplank": "갱플랭크",
  "TFT16_Graves": "그레이브즈", "TFT16_Gwen": "그웬", "TFT16_Nasus": "나서스", "TFT16_BaronNashor": "내셔 남작",
  "TFT16_Nautilus": "노틸러스", "TFT16_Nidalee": "니달리", "TFT16_Neeko": "니코", "TFT16_Darius": "다리우스",
  "TFT16_Diana": "다이애나", "TFT16_Draven": "드레이븐", "TFT16_Ryze": "라이즈", "TFT16_Lux": "럭스",
  "TFT16_Rumble": "럼블", "TFT16_Renekton": "레넥톤", "TFT16_Leona": "레오나", "TFT16_RekSai": "렉사이",
  "TFT16_Loris": "로리스", "TFT16_Lucian": "루시안과 세나", "TFT16_Lulu": "룰루", "TFT16_Leblanc": "르블랑",
  "TFT16_Lissandra": "리산드라", "TFT16_Malzahar": "말자하", "TFT16_Mel": "멜", "TFT16_DrMundo": "문도 박사",
  "TFT16_MissFortune": "미스 포츈", "TFT16_Milio": "밀리오", "TFT16_Bard": "바드", "TFT16_Vi": "바이",
  "TFT16_Veigar": "베이가", "TFT16_Vayne": "베인", "TFT16_BelVeth": "벨베스", "TFT16_Volibear": "볼리베어",
  "TFT16_Braum": "브라움", "TFT16_Briar": "브라이어", "TFT16_Brock": "브록", "TFT16_Blitzcrank": "블리츠크랭크",
  "TFT16_Viego": "비에고", "TFT16_Poppy": "뽀삐", "TFT16_Sion": "사이온", "TFT16_Sylas": "사일러스",
  "TFT16_Seraphine": "세라핀", "TFT16_Sejuani": "세주아니", "TFT16_Sett": "세트", "TFT16_Sona": "소나",
  "TFT16_Shen": "쉔", "TFT16_Shyvana": "쉬바나", "TFT16_Swain": "스웨인", "TFT16_Skarner": "스카너",
  "TFT16_XinZhao": "신 짜오", "TFT16_Singed": "신지드", "TFT16_Thresh": "쓰레쉬", "TFT16_Ahri": "아리",
  "TFT16_AurelionSol": "아우렐리온 솔", "TFT16_Azir": "아지르", "TFT16_Aatrox": "아트록스", "TFT16_Aphelios": "아펠리오스",
  "TFT16_Ambessa": "암베사", "TFT16_Annie": "애니", "TFT16_Anivia": "애니비아", "TFT16_Ashe": "애쉬",
  "TFT16_Yasuo": "야스오", "TFT16_Ekko": "에코", "TFT16_Wukong": "오공", "TFT16_Ornn": "오른",
  "TFT16_Orianna": "오리아나", "TFT16_Yone": "요네", "TFT16_Yorick": "요릭", "TFT16_Warwick": "워윅",
  "TFT16_Yunara": "유나라", "TFT16_Illaoi": "일라오이", "TFT16_JarvanIV": "자르반 4세", "TFT16_Zaahen": "자헨",
  "TFT16_Xerath": "제라스", "TFT16_Zoe": "조이", "TFT16_Ziggs": "직스", "TFT16_Jhin": "진",
  "TFT16_Zilean": "질리언", "TFT16_Jinx": "징크스", "TFT16_ChoGath": "초가스", "TFT16_Kaisa": "카이사",
  "TFT16_Kalista": "칼리스타", "TFT16_Kennen": "케넨", "TFT16_Caitlyn": "케이틀린", "TFT16_KogMaw": "코그모",
  "TFT16_Kobuko": "코부코와 유미", "TFT16_Qiyana": "키아나", "TFT16_Kindred": "킨드레드", "TFT16_Taric": "타릭",
  "TFT16_TahmKench": "탐 켄치", "TFT16_Tristana": "트리스타나", "TFT16_Tryndamere": "트린다미어",
  "TFT16_TwistedFate": "트위스티드 페이트", "TFT16_Teemo": "티모", "TFT16_Fiddlesticks": "피들스틱",
  "TFT16_Fizz": "피즈", "TFT16_RiftHerald": "협곡의 전령"
};

// 시너지 이름 매핑 (API 이름 -> 한글)
const TRAIT_NAMES = {
  // 지역
  "TFT16_Bilgewater": "빌지워터", "TFT16_Demacia": "데마시아", "TFT16_Freljord": "프렐요드",
  "TFT16_Ionia": "아이오니아", "TFT16_Ixtal": "이쉬탈", "TFT16_Noxus": "녹서스",
  "TFT16_Piltover": "필트오버", "TFT16_ShadowIsles": "그림자 군도", "TFT16_Shurima": "슈리마",
  "TFT16_Targon": "타곤", "TFT16_Void": "공허", "TFT16_Zaun": "자운", "TFT16_Yordle": "요들",
  // 직업/특성
  "TFT16_Brawler": "난동꾼", "TFT16_Artillery": "원거리 사격", "TFT16_Bastion": "파수꾼",
  "TFT16_BatQueen": "학살자", "TFT16_Bruiser": "엄호대", "TFT16_Conqueror": "토벌자",
  "TFT16_Disruptor": "방해꾼", "TFT16_Invoker": "기원자", "TFT16_Mage": "비전 마법사",
  "TFT16_Marksman": "총잡이", "TFT16_Striker": "기동타격대", "TFT16_Warbot": "전쟁기계",
  "TFT16_Slayer": "학살자", "TFT16_Defender": "파수꾼", "TFT16_Explorer": "기동타격대",
  "TFT16_Gunslinger": "총잡이", "TFT16_Longshot": "원거리 사격", "TFT16_Juggernaut": "난동꾼",
  "TFT16_Warden": "파수꾼", "TFT16_Magus": "비전 마법사", "TFT16_Vanquisher": "토벌자",
  // 특수
  "TFT16_Darkin": "다르킨", "TFT16_HexTech": "마법공학기계", "TFT16_Dragon": "용족",
  "TFT16_HexMech": "마법공학기계", "TFT16_ShyvanaUnique": "용족", "TFT16_Harvester": "학살자",
  // 유니크
  "TFT16_Caretaker": "관리인", "TFT16_Soulbound": "영혼결속자", "TFT16_SoulBond": "영혼결속자",
  "TFT16_DarkChild": "어둠의 아이", "TFT16_Runewright": "룬 마법사", "TFT16_WorldEnder": "세계의 종결자",
  "TFT16_VoidRiftHerald": "균열의 재앙", "TFT16_Emperor": "황제", "TFT16_Transcended": "초월체",
  "TFT16_Glutton": "대식가", "TFT16_Hero": "영웅", "TFT16_Heroic": "영웅", "TFT16_Absorber": "흡수자",
  "TFT16_Immortal": "불멸자", "TFT16_Eternal": "영겁", "TFT16_Huntress": "여사냥꾼",
  "TFT16_Kingpin": "우두머리", "TFT16_TheBoss": "우두머리", "TFT16_ChainBreaker": "사슬파괴자",
  "TFT16_SylasTrait": "사슬파괴자", "TFT16_Smith": "대장장이", "TFT16_Blacksmith": "대장장이",
  "TFT16_StarForger": "별의 창조자", "TFT16_AurelionSolUnique": "별의 창조자",
  "TFT16_TimeGuardian": "시간의 수호자", "TFT16_Chronokeeper": "시간의 수호자",
  "TFT16_RuneMage": "룬 마법사", "TFT16_XerathUnique": "초월체",
  "TFT16_KaisaUnique": "흡수자", "TFT16_DarkinWeapon": "다르킨",
  "TFT16_BaronUnique": "균열의 재앙", "TFT16_KindredUnique": "영겁"
};

// 아이템 이름 매핑
const ITEM_NAMES = {
  "TFT_Item_Deathblade": "죽음의 검", "TFT_Item_MadredsBloodrazor": "거인 학살자",
  "TFT_Item_GuardianAngel": "밤의 끝자락", "TFT_Item_Bloodthirster": "피바라기",
  "TFT_Item_HextechGunblade": "마법공학 총검", "TFT_Item_SpearOfShojin": "쇼진의 창",
  "TFT_Item_SteraksGage": "스테락의 도전", "TFT_Item_InfinityEdge": "무한의 대검",
  "TFT_Item_RapidFireCannon": "붉은 덩굴정령", "TFT_Item_TitansResolve": "거인의 결의",
  "TFT_Item_RunaansHurricane": "크라켄의 분노", "TFT_Item_GuinsoosRageblade": "구인수의 격노검",
  "TFT_Item_StatikkShiv": "공허의 지팡이", "TFT_Item_Leviathan": "내셔의 이빨",
  "TFT_Item_LastWhisper": "최후의 속삭임", "TFT_Item_BrambleVest": "덤불 조끼",
  "TFT_Item_GargoyleStoneplate": "가고일 돌갑옷", "TFT_Item_Crownguard": "크라운가드",
  "TFT_Item_FrozenHeart": "수호자의 맹세", "TFT_Item_RedBuff": "태양불꽃 망토",
  "TFT_Item_NightHarvester": "굳건한 심장", "TFT_Item_DragonsClaw": "용의 발톱",
  "TFT_Item_IonicSpark": "이온 충격기", "TFT_Item_AdaptiveHelm": "적응형 투구",
  "TFT_Item_SpectralGauntlet": "저녁갑주", "TFT_Item_Quicksilver": "수은",
  "TFT_Item_RabadonsDeathcap": "라바돈의 죽음모자", "TFT_Item_ArchangelsStaff": "대천사의 지팡이",
  "TFT_Item_Morellonomicon": "모렐로노미콘", "TFT_Item_JeweledGauntlet": "보석 건틀릿",
  "TFT_Item_BlueBuff": "푸른 파수꾼", "TFT_Item_Redemption": "정령의 형상",
  "TFT_Item_UnstableConcoction": "정의의 손길", "TFT_Item_WarmogsArmor": "워모그의 갑옷",
  "TFT_Item_PowerGauntlet": "타격대의 철퇴", "TFT_Item_ThiefsGloves": "도적의 장갑"
};

// 조합 아이템 매핑
const COMPONENT_NAMES = {
  "BFSword": "대검", "RecurveBow": "활", "ChainVest": "갑옷", "NegatronCloak": "망토",
  "NeedlesslyLargeRod": "지팡이", "TearOfTheGoddess": "눈물", "GiantsBelt": "벨트",
  "SparringGloves": "장갑", "Spatula": "뒤집개"
};

// 완성 아이템 -> 조합 아이템 레시피
const ITEM_RECIPES = {
  "TFT_Item_Deathblade": ["BFSword", "BFSword"],
  "TFT_Item_MadredsBloodrazor": ["BFSword", "RecurveBow"],
  "TFT_Item_GuardianAngel": ["BFSword", "ChainVest"],
  "TFT_Item_Bloodthirster": ["BFSword", "NegatronCloak"],
  "TFT_Item_HextechGunblade": ["BFSword", "NeedlesslyLargeRod"],
  "TFT_Item_SpearOfShojin": ["BFSword", "TearOfTheGoddess"],
  "TFT_Item_SteraksGage": ["BFSword", "GiantsBelt"],
  "TFT_Item_InfinityEdge": ["BFSword", "SparringGloves"],
  "TFT_Item_RapidFireCannon": ["RecurveBow", "RecurveBow"],
  "TFT_Item_TitansResolve": ["RecurveBow", "ChainVest"],
  "TFT_Item_RunaansHurricane": ["RecurveBow", "NegatronCloak"],
  "TFT_Item_GuinsoosRageblade": ["RecurveBow", "NeedlesslyLargeRod"],
  "TFT_Item_StatikkShiv": ["RecurveBow", "TearOfTheGoddess"],
  "TFT_Item_Leviathan": ["RecurveBow", "GiantsBelt"],
  "TFT_Item_LastWhisper": ["RecurveBow", "SparringGloves"],
  "TFT_Item_BrambleVest": ["ChainVest", "ChainVest"],
  "TFT_Item_GargoyleStoneplate": ["ChainVest", "NegatronCloak"],
  "TFT_Item_Crownguard": ["ChainVest", "NeedlesslyLargeRod"],
  "TFT_Item_FrozenHeart": ["ChainVest", "TearOfTheGoddess"],
  "TFT_Item_RedBuff": ["ChainVest", "GiantsBelt"],
  "TFT_Item_NightHarvester": ["ChainVest", "SparringGloves"],
  "TFT_Item_DragonsClaw": ["NegatronCloak", "NegatronCloak"],
  "TFT_Item_IonicSpark": ["NegatronCloak", "NeedlesslyLargeRod"],
  "TFT_Item_AdaptiveHelm": ["NegatronCloak", "TearOfTheGoddess"],
  "TFT_Item_SpectralGauntlet": ["NegatronCloak", "GiantsBelt"],
  "TFT_Item_Quicksilver": ["NegatronCloak", "SparringGloves"],
  "TFT_Item_RabadonsDeathcap": ["NeedlesslyLargeRod", "NeedlesslyLargeRod"],
  "TFT_Item_ArchangelsStaff": ["NeedlesslyLargeRod", "TearOfTheGoddess"],
  "TFT_Item_Morellonomicon": ["NeedlesslyLargeRod", "GiantsBelt"],
  "TFT_Item_JeweledGauntlet": ["NeedlesslyLargeRod", "SparringGloves"],
  "TFT_Item_BlueBuff": ["TearOfTheGoddess", "TearOfTheGoddess"],
  "TFT_Item_Redemption": ["TearOfTheGoddess", "GiantsBelt"],
  "TFT_Item_UnstableConcoction": ["TearOfTheGoddess", "SparringGloves"],
  "TFT_Item_WarmogsArmor": ["GiantsBelt", "GiantsBelt"],
  "TFT_Item_PowerGauntlet": ["GiantsBelt", "SparringGloves"],
  "TFT_Item_ThiefsGloves": ["SparringGloves", "SparringGloves"]
};

// 데이터 로드 함수
async function loadAllPlayers() {
  console.log('📊 플레이어 데이터 로딩 중...');

  const PAGE_SIZE = 1000;
  const allPlayers = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('tft_players')
      .select('placement, units, traits')
      .not('units', 'is', null)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error('DB 조회 오류:', error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allPlayers.push(...data);
      offset += PAGE_SIZE;
      process.stdout.write(`\r  ${allPlayers.length}명 로드됨`);

      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    }
  }

  console.log(`\n✅ 총 ${allPlayers.length}명 로드 완료`);
  return allPlayers;
}

// 챔피언 벡터화 함수
function vectorizeUnits(units) {
  const vector = new Array(CHAMPIONS.length).fill(0);

  if (!units || !Array.isArray(units)) return vector;

  for (const unit of units) {
    const champId = unit.character_id;
    const idx = CHAMPIONS.indexOf(champId);
    if (idx !== -1) {
      vector[idx] = 1;
    }
  }

  return vector;
}

// 플레이어 데이터를 벡터로 변환
function prepareVectors(players) {
  console.log('🔄 챔피언 데이터 벡터화 중...');

  const vectors = [];
  const validPlayers = [];

  for (const player of players) {
    const vector = vectorizeUnits(player.units);
    const unitCount = vector.reduce((sum, v) => sum + v, 0);

    // 최소 6개 챔피언 이상인 경우만 (레벨 6 이상)
    if (unitCount >= 6) {
      vectors.push(vector);
      validPlayers.push(player);
    }
  }

  console.log(`✅ ${validPlayers.length}개 유효 벡터 생성`);
  return { vectors, validPlayers };
}

// K-means 클러스터링 실행
function runKMeans(vectors, k) {
  console.log(`🎯 K-means 클러스터링 (k=${k}) 실행 중...`);

  const result = kmeans(vectors, k, {
    initialization: 'kmeans++',
    maxIterations: 100
  });

  console.log('✅ 클러스터링 완료');
  return result;
}

// 클러스터별 통계 계산
function calculateClusterStats(clusters, validPlayers) {
  console.log('📈 클러스터별 통계 계산 중...');

  const clusterStats = {};

  // 클러스터별 플레이어 그룹화
  for (let i = 0; i < validPlayers.length; i++) {
    const clusterId = clusters[i];
    if (!clusterStats[clusterId]) {
      clusterStats[clusterId] = {
        players: [],
        placements: [],
        championCounts: {},
        traitCounts: {},
        itemCounts: {}
      };
    }
    clusterStats[clusterId].players.push(validPlayers[i]);
    clusterStats[clusterId].placements.push(validPlayers[i].placement);
  }

  // 각 클러스터 통계 계산
  for (const clusterId in clusterStats) {
    const stats = clusterStats[clusterId];
    const players = stats.players;
    const n = players.length;

    // 기본 통계
    const avgPlacement = stats.placements.reduce((a, b) => a + b, 0) / n;
    const variance = stats.placements.reduce((sum, p) => sum + Math.pow(p - avgPlacement, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // 등수 분포
    const distribution = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // [0, 1등, 2등, ..., 8등]
    for (const p of stats.placements) {
      distribution[p]++;
    }
    const distributionPercent = distribution.map(c => Math.round((c / n) * 100) / 100);

    // 챔피언 등장 빈도
    for (const player of players) {
      if (!player.units) continue;
      for (const unit of player.units) {
        const champId = unit.character_id;
        if (!stats.championCounts[champId]) {
          stats.championCounts[champId] = { count: 0, totalItems: 0 };
        }
        stats.championCounts[champId].count++;
        stats.championCounts[champId].totalItems += (unit.itemNames || []).length;
      }
    }

    // 시너지 등장 빈도
    for (const player of players) {
      if (!player.traits) continue;
      for (const trait of player.traits) {
        if (trait.style > 0) { // 활성화된 시너지만
          if (!stats.traitCounts[trait.name]) {
            stats.traitCounts[trait.name] = { count: 0, totalUnits: 0, totalTier: 0 };
          }
          stats.traitCounts[trait.name].count++;
          stats.traitCounts[trait.name].totalUnits += trait.num_units;
          stats.traitCounts[trait.name].totalTier += trait.tier_current;
        }
      }
    }

    // 아이템 등장 빈도
    for (const player of players) {
      if (!player.units) continue;
      for (const unit of player.units) {
        if (!unit.itemNames) continue;
        for (const itemName of unit.itemNames) {
          if (itemName.startsWith('TFT_Item_') || itemName.startsWith('TFT16_Item_')) {
            if (!stats.itemCounts[itemName]) {
              stats.itemCounts[itemName] = { count: 0, placements: [] };
            }
            stats.itemCounts[itemName].count++;
            stats.itemCounts[itemName].placements.push(player.placement);
          }
        }
      }
    }

    // 통계 저장
    stats.gameCount = n;
    stats.avgPlacement = Math.round(avgPlacement * 100) / 100;
    stats.stdDeviation = Math.round(stdDev * 100) / 100;
    stats.placementDistribution = distributionPercent;
    stats.top4Rate = Math.round((distributionPercent[1] + distributionPercent[2] + distributionPercent[3] + distributionPercent[4]) * 100);
    stats.winRate = Math.round(distributionPercent[1] * 100);
  }

  console.log('✅ 통계 계산 완료');
  return clusterStats;
}

// 클러스터 이름 자동 생성
function generateClusterName(stats) {
  const n = stats.gameCount;

  // 핵심 시너지 찾기 (80% 이상 등장, 티어 2 이상)
  const mainTraits = [];
  for (const traitName in stats.traitCounts) {
    const trait = stats.traitCounts[traitName];
    const frequency = trait.count / n;
    const avgTier = trait.totalTier / trait.count;
    const avgUnits = trait.totalUnits / trait.count;

    if (frequency >= 0.7 && avgTier >= 2) {
      mainTraits.push({
        name: traitName,
        frequency,
        avgTier,
        avgUnits
      });
    }
  }

  // 가장 높은 티어, 높은 유닛 수의 시너지 선택
  mainTraits.sort((a, b) => {
    if (b.avgTier !== a.avgTier) return b.avgTier - a.avgTier;
    return b.avgUnits - a.avgUnits;
  });

  // 메인 캐리 찾기 (아이템 장착률 높은 챔피언)
  let mainCarry = null;
  let maxItemRate = 0;

  for (const champId in stats.championCounts) {
    const champ = stats.championCounts[champId];
    const frequency = champ.count / n;
    const avgItems = champ.totalItems / champ.count;

    // 60% 이상 등장 + 평균 아이템 1.5개 이상
    if (frequency >= 0.6 && avgItems >= 1.5) {
      const itemRate = frequency * avgItems;
      if (itemRate > maxItemRate) {
        maxItemRate = itemRate;
        mainCarry = { champId, frequency, avgItems };
      }
    }
  }

  // 이름 조합
  let name = '';

  if (mainTraits.length > 0) {
    const trait = mainTraits[0];
    const traitNameKo = TRAIT_NAMES[trait.name] || trait.name.replace('TFT16_', '').replace('Set16_', '');
    const traitCount = Math.round(trait.avgUnits);
    name = `${traitCount}${traitNameKo}`;
  }

  if (mainCarry) {
    const carryNameKo = CHAMPION_NAMES[mainCarry.champId] || mainCarry.champId.replace('TFT16_', '');
    if (name) {
      name += ` ${carryNameKo}`;
    } else {
      name = carryNameKo;
    }
  }

  if (!name) {
    name = `클러스터 ${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  return {
    name,
    mainTrait: mainTraits[0] || null,
    mainCarry
  };
}

// 아이템 우선순위 계산
function calculateItemPriority(stats, allPlayerStats) {
  const n = stats.gameCount;
  const completedItems = [];
  const componentItems = {};

  // 완성 아이템 우선순위
  for (const itemName in stats.itemCounts) {
    const item = stats.itemCounts[itemName];
    const appearanceRate = item.count / n;

    if (appearanceRate < 0.05) continue; // 5% 미만은 제외

    const avgPlacement = item.placements.reduce((a, b) => a + b, 0) / item.placements.length;

    // 이 아이템이 없을 때 평균 등수 계산 (전체 클러스터 평균)
    const avgPlacementWithout = stats.avgPlacement;
    const placementDelta = avgPlacement - avgPlacementWithout;

    // 우선순위 점수 계산
    // 등수 개선 효과 (40%) + 픽률 (30%) + 표본 신뢰도 (30%)
    const deltaScore = -placementDelta * 40;
    const popularityScore = appearanceRate * 30;
    const sampleScore = Math.min(item.count / 200, 1) * 30;
    const priorityScore = deltaScore + popularityScore + sampleScore;

    completedItems.push({
      itemApiName: itemName,
      itemName: ITEM_NAMES[itemName] || itemName.replace('TFT_Item_', '').replace('TFT16_Item_', ''),
      appearanceRate: Math.round(appearanceRate * 100),
      avgPlacement: Math.round(avgPlacement * 100) / 100,
      placementDelta: Math.round(placementDelta * 100) / 100,
      gameCount: item.count,
      priorityScore: Math.round(priorityScore * 100) / 100
    });

    // 조합 아이템 역산
    const recipe = ITEM_RECIPES[itemName];
    if (recipe) {
      for (const comp of recipe) {
        if (!componentItems[comp]) {
          componentItems[comp] = { count: 0, totalDelta: 0, itemsUsing: [] };
        }
        componentItems[comp].count += item.count;
        componentItems[comp].totalDelta += placementDelta * item.count;
        componentItems[comp].itemsUsing.push(itemName);
      }
    }
  }

  // 정렬 (점수 높은 순)
  completedItems.sort((a, b) => b.priorityScore - a.priorityScore);

  // 조합 아이템 우선순위
  const componentPriority = [];
  for (const comp in componentItems) {
    const data = componentItems[comp];
    const avgDelta = data.totalDelta / data.count;

    componentPriority.push({
      componentId: comp,
      componentName: COMPONENT_NAMES[comp] || comp,
      avgDelta: Math.round(avgDelta * 100) / 100,
      usageCount: data.count,
      itemsUsing: [...new Set(data.itemsUsing)].slice(0, 3)
    });
  }

  componentPriority.sort((a, b) => a.avgDelta - b.avgDelta);

  return {
    completedItems: completedItems.slice(0, 15), // 상위 15개
    componentItems: componentPriority.slice(0, 8) // 상위 8개
  };
}

// 복합 점수 계산 (METAsrc 방식 참고)
// 참고: docs/features/tier-scoring.md
function calculateCompositeScore(stats) {
  // 평균 등수 점수 (40%) - 1등=100점, 8등=0점
  const placementScore = (8 - stats.avgPlacement) / 7 * 100;

  // Top4 비율 점수 (25%)
  const top4Score = stats.top4Rate;

  // 1등 비율 점수 (20%) - 20% 1등률 = 100점
  const winScore = Math.min(stats.winRate * 5, 100);

  // 안정성 점수 (15%) - 표준편차 1.0=100점, 4.0=0점
  const consistencyScore = Math.max((4 - stats.stdDeviation) / 3 * 100, 0);

  // 복합 점수
  return (
    placementScore * 0.40 +
    top4Score * 0.25 +
    winScore * 0.20 +
    consistencyScore * 0.15
  );
}

// 티어 분류 (복합 점수 기반)
function assignTier(compositeScore) {
  if (compositeScore >= 65) return 'S';
  if (compositeScore >= 55) return 'A';
  if (compositeScore >= 45) return 'B';
  return 'C';
}

// 핵심 챔피언 추출
function extractCoreChampions(stats) {
  const n = stats.gameCount;
  const core = [];
  const flex = [];

  for (const champId in stats.championCounts) {
    const champ = stats.championCounts[champId];
    const frequency = champ.count / n;
    const avgItems = champ.totalItems / champ.count;

    if (frequency >= 0.8) {
      core.push({
        apiName: champId,
        name: CHAMPION_NAMES[champId] || champId.replace('TFT16_', ''),
        frequency: Math.round(frequency * 100),
        avgItems: Math.round(avgItems * 100) / 100
      });
    } else if (frequency >= 0.5) {
      flex.push({
        apiName: champId,
        name: CHAMPION_NAMES[champId] || champId.replace('TFT16_', ''),
        frequency: Math.round(frequency * 100),
        avgItems: Math.round(avgItems * 100) / 100
      });
    }
  }

  core.sort((a, b) => b.frequency - a.frequency);
  flex.sort((a, b) => b.frequency - a.frequency);

  return { core, flex };
}

// 메인 함수
async function main() {
  console.log('🚀 메타 조합 분석 시작\n');

  // 환경 변수 확인
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    // 1. 데이터 로드
    const players = await loadAllPlayers();

    if (players.length < 1000) {
      console.error('❌ 데이터가 부족합니다. 최소 1000개 이상의 데이터가 필요합니다.');
      process.exit(1);
    }

    // 2. 벡터화
    const { vectors, validPlayers } = prepareVectors(players);

    // 3. K-means 클러스터링
    const kmeansResult = runKMeans(vectors, K_CLUSTERS);

    // 4. 클러스터별 통계 계산
    const clusterStats = calculateClusterStats(kmeansResult.clusters, validPlayers);

    // 5. 메타 조합 생성
    console.log('\n📝 메타 조합 생성 중...');

    const metaComps = [];
    let validClusterCount = 0;

    for (const clusterId in clusterStats) {
      const stats = clusterStats[clusterId];

      // 최소 표본 수 체크
      if (stats.gameCount < MIN_SAMPLE_SIZE) {
        continue;
      }

      validClusterCount++;

      // 이름 및 메인 정보 생성
      const nameInfo = generateClusterName(stats);

      // 핵심 챔피언 추출
      const champions = extractCoreChampions(stats);

      // 아이템 우선순위 계산
      const itemAnalysis = calculateItemPriority(stats, clusterStats);

      // 복합 점수 계산 (METAsrc 방식)
      const compositeScore = calculateCompositeScore(stats);

      // 메타 조합 객체 생성
      metaComps.push({
        id: `comp_${clusterId}`,
        name: nameInfo.name,
        tier: assignTier(compositeScore),

        coreChampions: champions.core,
        flexChampions: champions.flex,
        mainTrait: nameInfo.mainTrait ? {
          apiName: nameInfo.mainTrait.name,
          name: TRAIT_NAMES[nameInfo.mainTrait.name] || nameInfo.mainTrait.name,
          avgUnits: Math.round(nameInfo.mainTrait.avgUnits),
          avgTier: Math.round(nameInfo.mainTrait.avgTier * 10) / 10
        } : null,
        mainCarry: nameInfo.mainCarry ? CHAMPION_NAMES[nameInfo.mainCarry.champId] : null,

        stats: {
          gameCount: stats.gameCount,
          avgPlacement: stats.avgPlacement,
          stdDeviation: stats.stdDeviation,
          placementDistribution: stats.placementDistribution,
          top4Rate: stats.top4Rate,
          winRate: stats.winRate,
          compositeScore: Math.round(compositeScore * 10) / 10  // 복합 점수 추가
        },

        itemAnalysis
      });
    }

    // 평균 등수 순으로 정렬
    metaComps.sort((a, b) => a.stats.avgPlacement - b.stats.avgPlacement);

    console.log(`✅ ${validClusterCount}개 유효 클러스터 중 ${metaComps.length}개 메타 조합 생성`);

    // 6. JSON 파일로 저장
    const outputPath = path.join(__dirname, '../src/data/meta-comps.json');
    const output = {
      patch: '14.24', // TODO: 동적으로 가져오기
      updatedAt: new Date().toISOString(),
      totalGames: validPlayers.length,
      comps: metaComps
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n💾 결과 저장: ${outputPath}`);

    // 7. 요약 출력
    console.log('\n========================================');
    console.log('📊 분석 결과 요약');
    console.log('========================================');
    console.log(`총 게임 수: ${validPlayers.length}`);
    console.log(`유효 클러스터: ${validClusterCount}`);
    console.log(`메타 조합: ${metaComps.length}개`);
    console.log('');
    console.log('티어별 분포:');
    console.log(`  S티어: ${metaComps.filter(c => c.tier === 'S').length}개`);
    console.log(`  A티어: ${metaComps.filter(c => c.tier === 'A').length}개`);
    console.log(`  B티어: ${metaComps.filter(c => c.tier === 'B').length}개`);
    console.log(`  C티어: ${metaComps.filter(c => c.tier === 'C').length}개`);
    console.log('');
    console.log('상위 5개 조합:');
    for (let i = 0; i < Math.min(5, metaComps.length); i++) {
      const comp = metaComps[i];
      console.log(`  ${i + 1}. ${comp.name} (${comp.tier}티어, ${comp.stats.avgPlacement}등, ${comp.stats.gameCount}게임)`);
    }
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ 분석 중 오류:', error);
    process.exit(1);
  }
}

// 실행
main();
