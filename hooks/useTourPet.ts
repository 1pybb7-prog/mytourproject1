"use client";

import { useQuery } from "@tanstack/react-query";
import type { PetTourInfo } from "@/lib/types/tour";
import { getTourPet } from "@/actions/get-tour-pet";

/**
 * @file useTourPet.ts
 * @description 반려동물 동반 여행 정보 조회 훅
 *
 * React Query를 사용하여 반려동물 동반 여행 정보를 조회하는 훅입니다.
 * Server Action을 통해 서버 사이드에서 한국관광공사 반려동물 동반여행 API를 호출합니다.
 * .env.local의 NEXT_PUBLIC_TOUR_PET_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#25-반려동물-동반-여행} - PRD 문서의 반려동물 동반 여행 섹션
 */

/**
 * 반려동물 동반 여행 정보 조회 훅
 *
 * @param contentId - 콘텐츠ID
 * @returns React Query 결과
 */
export function useTourPet(contentId: string) {
  return useQuery({
    queryKey: ["tours", "pet", contentId],
    queryFn: async (): Promise<PetTourInfo | null> => {
      if (!contentId || contentId.trim() === "") {
        return null;
      }
      return await getTourPet(contentId);
    },
    enabled: Boolean(contentId && contentId.trim() !== ""),
    staleTime: 5 * 60 * 1000, // 5분 (반려동물 정보는 자주 변경되지 않음)
    gcTime: 10 * 60 * 1000, // 10분
    retry: 1, // 실패 시 1회 재시도
  });
}
