/**
 * @file tour-type-converter.ts
 * @description 관광 타입 변환 유틸리티
 *
 * 한국관광공사 API의 contenttypeid를 텍스트로 변환하는 함수를 제공합니다.
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 관광 타입 필터 섹션
 */

/**
 * 관광 타입 ID를 텍스트로 변환
 *
 * @param contenttypeid - 콘텐츠타입ID (12, 14, 15, 25, 28, 32, 38, 39)
 * @returns 관광 타입 텍스트
 */
export function getTourTypeName(contenttypeid: string): string {
  const typeMap: Record<string, string> = {
    "12": "관광지",
    "14": "문화시설",
    "15": "축제/행사",
    "25": "여행코스",
    "28": "레포츠",
    "32": "숙박",
    "38": "쇼핑",
    "39": "음식점",
  };

  return typeMap[contenttypeid] || "기타";
}

/**
 * 관광 타입 ID 목록
 */
export const TOUR_TYPE_IDS = [
  "12",
  "14",
  "15",
  "25",
  "28",
  "32",
  "38",
  "39",
] as const;

/**
 * 관광 타입 옵션 목록 (필터 등에서 사용)
 */
export const TOUR_TYPE_OPTIONS = TOUR_TYPE_IDS.map((id) => ({
  value: id,
  label: getTourTypeName(id),
}));
