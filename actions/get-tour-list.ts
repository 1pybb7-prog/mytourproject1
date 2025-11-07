"use server";

import { getAreaBasedList } from "@/lib/api/tour-api";
import type { TourItem } from "@/lib/types/tour";

/**
 * @file get-tour-list.ts
 * @description 관광지 목록 조회 Server Action
 *
 * 서버 사이드에서 한국관광공사 API를 호출하여 관광지 목록을 조회합니다.
 * .env.local의 TOUR_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 관광지 목록 섹션
 */

interface GetTourListOptions {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}

/**
 * 관광지 목록 조회 Server Action
 *
 * @param options - 조회 옵션
 * @returns 관광지 목록
 */
export async function getTourList(
  options: GetTourListOptions = {},
): Promise<TourItem[]> {
  try {
    return await getAreaBasedList({
      areaCode: options.areaCode,
      contentTypeId: options.contentTypeId,
      numOfRows: options.numOfRows ?? 10,
      pageNo: options.pageNo ?? 1,
    });
  } catch (error) {
    // API 키 미설정 또는 네트워크 에러 시 명확한 에러 메시지
    if (error instanceof Error) {
      console.error("[getTourList] 에러 발생:", error.message, error);

      if (error.message.includes("TOUR_API_KEY")) {
        console.error(
          "[getTourList] API 키 미설정:",
          "NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY를 .env.local에 설정해주세요.",
        );
        // API 키가 없어도 빈 배열을 반환하여 앱이 크래시되지 않도록 처리
        return [];
      }
      if (
        error.message.includes("API 호출 실패") ||
        error.message.includes("네트워크")
      ) {
        console.warn("[getTourList] 네트워크 에러:", error.message);
        // 네트워크 에러도 빈 배열을 반환하여 앱이 크래시되지 않도록 처리
        return [];
      }
      if (error.message.includes("API 에러")) {
        console.warn("[getTourList] API 에러:", error.message);
        // API 에러도 빈 배열을 반환하여 앱이 크래시되지 않도록 처리
        return [];
      }
    }

    // 기타 에러도 빈 배열을 반환하여 앱이 크래시되지 않도록 처리
    console.warn("[getTourList] 예상치 못한 에러:", error);
    return [];
  }
}
