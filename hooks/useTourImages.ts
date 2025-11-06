"use client";

import { useQuery } from "@tanstack/react-query";
import { getTourImages, type TourImage } from "@/actions/get-tour-images";

/**
 * @file useTourImages.ts
 * @description 관광지 이미지 목록 조회 훅
 *
 * React Query를 사용하여 관광지 이미지 목록을 조회하는 훅입니다.
 * Server Action을 통해 서버 사이드에서 한국관광공사 API를 호출합니다.
 * .env.local의 TOUR_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#243-이미지-갤러리} - PRD 문서의 이미지 갤러리 섹션
 */

/**
 * 관광지 이미지 목록 조회 훅
 *
 * @param contentId - 콘텐츠ID
 * @returns React Query 결과
 */
export function useTourImages(contentId: string) {
  return useQuery({
    queryKey: ["tours", "images", contentId],
    queryFn: async (): Promise<TourImage[]> => {
      if (!contentId || contentId.trim() === "") {
        return [];
      }
      return await getTourImages(contentId);
    },
    enabled: Boolean(contentId && contentId.trim() !== ""),
    staleTime: 5 * 60 * 1000, // 5분 (이미지는 자주 변경되지 않음)
    gcTime: 10 * 60 * 1000, // 10분
    retry: 1, // 실패 시 1회 재시도
  });
}

