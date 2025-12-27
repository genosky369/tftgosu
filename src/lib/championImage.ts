/**
 * 챔피언의 apiName으로 로컬 이미지 URL을 반환합니다.
 * @param apiName - 챔피언 API 이름 (예: TFT16_Leona)
 * @returns 이미지 URL
 */
export function getChampionImageUrl(apiName: string): string {
  // apiName에서 TFT16_ 접두사 제거
  const name = apiName.replace('TFT16_', '');
  return `/images/champions/${name}.jpg`;
}

/**
 * 챔피언 이름(영문)으로 이미지 URL을 반환합니다.
 * @param name - 챔피언 영문 이름 (예: Leona)
 * @returns 이미지 URL
 */
export function getChampionImageUrlByName(name: string): string {
  return `/images/champions/${name}.jpg`;
}
