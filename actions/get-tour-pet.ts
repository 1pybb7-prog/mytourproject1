"use server";

import { getDetailPetTour } from "@/lib/api/tour-api";
import type { PetTourInfo } from "@/lib/types/tour";

/**
 * @file get-tour-pet.ts
 * @description 반려동물 동반 여행 정보 조회 Server Action
 *
 * 서버 사이드에서 한국관광공사 반려동물 동반여행 API를 호출하여 반려동물 동반 정보를 조회합니다.
 * .env.local의 NEXT_PUBLIC_TOUR_PET_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#25-반려동물-동반-여행} - PRD 문서의 반려동물 동반 여행 섹션
 */

/**
 * 반려동물 동반 여행 정보 조회 Server Action
 *
 * @param contentId - 콘텐츠ID
 * @returns 반려동물 동반 여행 정보
 */
export async function getTourPet(
  contentId: string,
): Promise<PetTourInfo | null> {
  try {
    if (!contentId || contentId.trim() === "") {
      throw new Error("관광지 ID가 필요합니다.");
    }

    return await getDetailPetTour(contentId);
  } catch (error) {
    // API 키 미설정 또는 네트워크 에러 시 명확한 에러 메시지
    if (error instanceof Error) {
      if (error.message.includes("TOUR_PET_API_KEY")) {
        throw new Error(
          "반려동물 동반 정보를 불러오려면 API 키가 필요합니다. .env.local 파일에 NEXT_PUBLIC_TOUR_PET_API_KEY를 설정해주세요.",
        );
      }
      if (
        error.message.includes("API 호출 실패") ||
        error.message.includes("네트워크")
      ) {
        throw new Error(
          "네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.",
        );
      }
      if (error.message.includes("API 에러")) {
        throw new Error(
          "반려동물 동반 정보를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        );
      }
    }
    throw error;
  }
}
