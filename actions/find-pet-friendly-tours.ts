"use server";

import { findPetFriendlyTours } from "@/lib/api/tour-api";
import type { TourItem, PetTourInfo } from "@/lib/types/tour";

/**
 * @file find-pet-friendly-tours.ts
 * @description 반려동물 동반 가능한 관광지 찾기 Server Action
 *
 * 서버 사이드에서 한국관광공사 반려동물 동반여행 API를 활용하여
 * 반려동물 동반 가능한 관광지를 찾습니다.
 * .env.local의 NEXT_PUBLIC_TOUR_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#25-반려동물-동반-여행} - PRD 문서의 반려동물 동반 여행 섹션
 */

interface FindPetFriendlyToursOptions {
  areaCode?: string;
  contentTypeId?: string;
  maxPages?: number;
  numOfRows?: number;
  maxResults?: number;
  minResults?: number; // 최소 결과 수 - 이 수를 찾으면 바로 반환
}

/**
 * 반려동물 동반 가능한 관광지 찾기 Server Action
 *
 * 여러 페이지의 관광지를 조회하고, 각 관광지의 반려동물 정보를 확인하여
 * 반려동물 동반 가능한 관광지만 반환합니다.
 *
 * @param options - 조회 옵션
 * @returns 반려동물 동반 가능한 관광지 목록 (반려동물 정보 포함)
 */
export async function findPetFriendlyToursAction(
  options: FindPetFriendlyToursOptions = {},
): Promise<Array<{ tour: TourItem; petInfo: PetTourInfo }>> {
  try {
    console.log(
      "[findPetFriendlyToursAction] 반려동물 동반 가능한 관광지 찾기 시작",
      options,
    );

    const results = await findPetFriendlyTours({
      areaCode: options.areaCode,
      contentTypeId: options.contentTypeId,
      maxPages: options.maxPages ?? 5,
      numOfRows: options.numOfRows ?? 100,
      maxResults: options.maxResults ?? 50,
      minResults: options.minResults ?? 10, // 최소 10개 찾으면 바로 반환
    });

    console.log(
      `[findPetFriendlyToursAction] 반려동물 동반 가능한 관광지 찾기 완료: ${results.length}개 발견`,
    );

    return results;
  } catch (error) {
    // API 키 미설정 또는 네트워크 에러 시 명확한 에러 메시지
    if (error instanceof Error) {
      console.error(
        "[findPetFriendlyToursAction] 에러 발생:",
        error.message,
        error,
      );

      if (error.message.includes("TOUR_API_KEY")) {
        console.error(
          "[findPetFriendlyToursAction] API 키 미설정:",
          "NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY를 .env.local에 설정해주세요.",
        );
        // API 키가 없어도 빈 배열을 반환하여 앱이 크래시되지 않도록 처리
        return [];
      }
      if (
        error.message.includes("API 호출 실패") ||
        error.message.includes("네트워크")
      ) {
        console.warn(
          "[findPetFriendlyToursAction] 네트워크 에러:",
          error.message,
        );
        // 네트워크 에러도 빈 배열을 반환하여 앱이 크래시되지 않도록 처리
        return [];
      }
      if (error.message.includes("API 에러")) {
        console.warn("[findPetFriendlyToursAction] API 에러:", error.message);
        // API 에러도 빈 배열을 반환하여 앱이 크래시되지 않도록 처리
        return [];
      }
    }

    // 기타 에러도 빈 배열을 반환하여 앱이 크래시되지 않도록 처리
    console.warn("[findPetFriendlyToursAction] 예상치 못한 에러:", error);
    return [];
  }
}
