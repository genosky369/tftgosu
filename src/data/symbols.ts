// TFT Set 16 상징 데이터
// 원본: 데이터/symnbol.txt

export const SYMBOLS: string[] = [
  "빌지워터",
  "녹서스",
  "다르킨",
  "슈리마",
  "난동꾼",
  "총잡이",
  "요들",
  "기동타격대",
  "원거리 사격",
  "전쟁기계",
  "아이오니아",
  "프렐요드",
  "방해꾼",
  "비전 마법사",
  "기원자",
  "토벌자",
  "엄호대",
  "학살자",
  "파수꾼",
  "필트오버",
  "공허",
  "그림자 군도",
  "데마시아",
  "자운",
  "이쉬탈",
];

// 상징 이름 정규화 (띄어쓰기 제거, 소문자)
export function normalizeSymbolName(name: string): string {
  return name.replace(/\s/g, '').toLowerCase();
}

// 정규화된 상징 이름 맵 (정규화된 이름 -> 원본 이름)
export const NORMALIZED_SYMBOLS: Map<string, string> = new Map(
  SYMBOLS.map(s => [normalizeSymbolName(s), s])
);
