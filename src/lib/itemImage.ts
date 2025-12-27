/**
 * TFT 아이템 이미지 URL 유틸리티
 *
 * Data Dragon CDN에서 아이템 이미지를 가져옵니다.
 */

const DDRAGON_VERSION = "15.24.1";
const DDRAGON_BASE = "https://ddragon.leagueoflegends.com/cdn";

/**
 * 완성 아이템 이미지 URL
 * @param itemApiName - TFT_Item_xxx 형태의 API 이름
 */
export function getItemImageUrl(itemApiName: string): string {
  return `${DDRAGON_BASE}/${DDRAGON_VERSION}/img/tft-item/${itemApiName}.png`;
}

/**
 * 조합 아이템 이미지 URL
 * @param componentId - BFSword, RecurveBow 등 조합 아이템 ID
 */
export function getComponentImageUrl(componentId: string): string {
  return `${DDRAGON_BASE}/${DDRAGON_VERSION}/img/tft-item/TFT_Item_${componentId}.png`;
}
