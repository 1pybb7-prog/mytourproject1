"use server";

import { getDetailImage } from "@/lib/api/tour-api";

/**
 * @file get-tour-images.ts
 * @description 관광지 이미지 목록 조회 Server Action
 *
 * 서버 사이드에서 한국관광공사 API를 호출하여 관광지 이미지 목록을 조회합니다.
 * .env.local의 TOUR_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#243-이미지-갤러리} - PRD 문서의 이미지 갤러리 섹션
 */

/**
 * 관광지 이미지 타입
 */
export interface TourImage {
  /** 콘텐츠ID */
  contentid: string;
  /** 이미지명 */
  imagename: string;
  /** 원본 이미지 URL */
  originimgurl: string;
  /** 시리얼 번호 */
  serialnum: string;
  /** 썸네일 이미지 URL */
  smallimageurl: string;
}

/**
 * 관광지 이미지 목록 조회 Server Action
 *
 * @param contentId - 콘텐츠ID
 * @returns 이미지 목록
 */
export async function getTourImages(
  contentId: string,
): Promise<TourImage[]> {
  try {
    if (!contentId || contentId.trim() === "") {
      throw new Error("관광지 ID가 필요합니다.");
    }

    return await getDetailImage(contentId);
  } catch (error) {
    // API 키 미설정 또는 네트워크 에러 시 명확한 에러 메시지
    if (error instanceof Error) {
      if (error.message.includes("TOUR_API_KEY")) {
        throw new Error(
          "관광지 데이터를 불러오려면 API 키가 필요합니다. .env.local 파일에 TOUR_API_KEY를 설정해주세요.",
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
          "관광지 정보를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        );
      }
    }
    throw error;
  }
}

