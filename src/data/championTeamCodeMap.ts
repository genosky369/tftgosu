// TFT Set 16 챔피언 팀 코드 매핑
// 생성 기준: Community Dragon TFTSet16 데이터
// character_id 알파벳순 정렬 후 1부터 번호 부여 (16진수)

export const TEAM_CODE_SET_ID = "TFTSet16";

// 한글 이름 → 16진수 ID 매핑 (character_id 알파벳순 정렬 기준)
export const CHAMPION_HEX_MAP: Record<string, string> = {
  // 01-10 (1-16)
  "아트록스": "01",      // TFT16_Aatrox
  "아리": "02",          // TFT16_Ahri
  "암베사": "03",        // TFT16_Ambessa
  "애니비아": "04",      // TFT16_Anivia
  "애니": "05",          // TFT16_Annie
  "아펠리오스": "06",    // TFT16_Aphelios
  "애쉬": "07",          // TFT16_Ashe
  "아우렐리온 솔": "08", // TFT16_AurelionSol
  "아지르": "09",        // TFT16_Azir
  "바드": "0A",          // TFT16_Bard
  "내셔 남작": "0B",     // TFT16_BaronNashor
  "벨베스": "0C",        // TFT16_BelVeth
  "블리츠크랭크": "0D",  // TFT16_Blitzcrank
  "브라움": "0E",        // TFT16_Braum
  "브라이어": "0F",      // TFT16_Briar
  "브록": "10",          // TFT16_Brock

  // 11-20 (17-32)
  "케이틀린": "11",      // TFT16_Caitlyn
  "초가스": "12",        // TFT16_ChoGath
  "다리우스": "13",      // TFT16_Darius
  "다이애나": "14",      // TFT16_Diana
  "문도 박사": "15",     // TFT16_DrMundo
  "드레이븐": "16",      // TFT16_Draven
  "에코": "17",          // TFT16_Ekko
  "피들스틱": "18",      // TFT16_Fiddlesticks
  "피즈": "19",          // TFT16_Fizz
  "갈리오": "1A",        // TFT16_Galio
  "갱플랭크": "1B",      // TFT16_Gangplank
  "가렌": "1C",          // TFT16_Garen
  "그레이브즈": "1D",    // TFT16_Graves
  "그웬": "1E",          // TFT16_Gwen
  "일라오이": "1F",      // TFT16_Illaoi
  "자르반 4세": "20",    // TFT16_JarvanIV

  // 21-30 (33-48)
  "진": "21",            // TFT16_Jhin
  "징크스": "22",        // TFT16_Jinx
  "카이사": "23",        // TFT16_Kaisa
  "칼리스타": "24",      // TFT16_Kalista
  "케넨": "25",          // TFT16_Kennen
  "킨드레드": "26",      // TFT16_Kindred
  "코부코와 유미": "27", // TFT16_Kobuko
  "코그모": "28",        // TFT16_KogMaw
  "르블랑": "29",        // TFT16_Leblanc
  "레오나": "2A",        // TFT16_Leona
  "리산드라": "2B",      // TFT16_Lissandra
  "로리스": "2C",        // TFT16_Loris
  "루시안과 세나": "2D", // TFT16_Lucian
  "룰루": "2E",          // TFT16_Lulu
  "럭스": "2F",          // TFT16_Lux
  "말자하": "30",        // TFT16_Malzahar

  // 31-40 (49-64)
  "멜": "31",            // TFT16_Mel
  "밀리오": "32",        // TFT16_Milio
  "미스 포츈": "33",     // TFT16_MissFortune
  "나서스": "34",        // TFT16_Nasus
  "노틸러스": "35",      // TFT16_Nautilus
  "니코": "36",          // TFT16_Neeko
  "니달리": "37",        // TFT16_Nidalee
  "오리아나": "38",      // TFT16_Orianna
  "오른": "39",          // TFT16_Ornn
  "뽀삐": "3A",          // TFT16_Poppy
  "키아나": "3B",        // TFT16_Qiyana
  "렉사이": "3C",        // TFT16_RekSai
  "레넥톤": "3D",        // TFT16_Renekton
  "협곡의 전령": "3E",   // TFT16_RiftHerald
  "럼블": "3F",          // TFT16_Rumble
  "라이즈": "40",        // TFT16_Ryze

  // 41-50 (65-80)
  "세주아니": "41",      // TFT16_Sejuani
  "세라핀": "42",        // TFT16_Seraphine
  "세트": "43",          // TFT16_Sett
  "쉔": "44",            // TFT16_Shen
  "쉬바나": "45",        // TFT16_Shyvana
  "신지드": "46",        // TFT16_Singed
  "사이온": "47",        // TFT16_Sion
  "스카너": "48",        // TFT16_Skarner
  "소나": "49",          // TFT16_Sona
  "스웨인": "4A",        // TFT16_Swain
  "사일러스": "4B",      // TFT16_Sylas
  "탐 켄치": "4C",       // TFT16_TahmKench
  "타릭": "4D",          // TFT16_Taric
  "티모": "4E",          // TFT16_Teemo
  "T-헥스": "4F",        // TFT16_THex
  "쓰레쉬": "50",        // TFT16_Thresh

  // 51-60 (81-96)
  "트리스타나": "51",    // TFT16_Tristana
  "트린다미어": "52",    // TFT16_Tryndamere
  "트위스티드 페이트": "53", // TFT16_TwistedFate
  "베인": "54",          // TFT16_Vayne
  "베이가": "55",        // TFT16_Veigar
  "바이": "56",          // TFT16_Vi
  "비에고": "57",        // TFT16_Viego
  "볼리베어": "58",      // TFT16_Volibear
  "워윅": "59",          // TFT16_Warwick
  "오공": "5A",          // TFT16_Wukong
  "제라스": "5B",        // TFT16_Xerath
  "신 짜오": "5C",       // TFT16_XinZhao
  "야스오": "5D",        // TFT16_Yasuo
  "요네": "5E",          // TFT16_Yone
  "요릭": "5F",          // TFT16_Yorick
  "유나라": "60",        // TFT16_Yunara

  // 61-64 (97-100)
  "자헨": "61",          // TFT16_Zaahen
  "질리언": "62",        // TFT16_Zilean
  "직스": "63",          // TFT16_Ziggs
  "조이": "64",          // TFT16_Zoe
};

// 챔피언 이름으로 hex ID 가져오기
export function getChampionHexId(koreanName: string): string | null {
  return CHAMPION_HEX_MAP[koreanName] || null;
}

// 챔피언 이름 배열로 팀 코드 생성
export function generateTeamCode(championNames: string[]): string {
  // 헤더
  const header = "01";

  // 챔피언 ID 변환 (최대 10개)
  const hexIds: string[] = [];
  for (const name of championNames.slice(0, 10)) {
    const hexId = getChampionHexId(name);
    if (hexId) {
      hexIds.push(hexId);
    }
  }

  // 10개 슬롯 채우기 (부족하면 00으로)
  while (hexIds.length < 10) {
    hexIds.push("00");
  }

  // 코드 조합: 헤더 + 챔피언들 + 세트ID
  return header + hexIds.join("") + TEAM_CODE_SET_ID;
}

// 팀 코드 검증 (올바른 형식인지)
export function isValidTeamCode(code: string): boolean {
  // 형식: 01 + (2자리 hex × 10) + TFTSet16
  // 총 길이: 2 + 20 + 9 = 31자
  if (code.length !== 31) return false;
  if (!code.startsWith("01")) return false;
  if (!code.endsWith(TEAM_CODE_SET_ID)) return false;

  // 중간 20자가 모두 hex인지 확인
  const hexPart = code.slice(2, 22);
  return /^[0-9A-Fa-f]{20}$/.test(hexPart);
}
