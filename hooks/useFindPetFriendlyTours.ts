"use client";

import { useQuery } from "@tanstack/react-query";
import type { TourItem, PetTourInfo } from "@/lib/types/tour";
import { findPetFriendlyToursAction } from "@/actions/find-pet-friendly-tours";

/**
 * @file useFindPetFriendlyTours.ts
 * @description 반려동물 동반 가능한 관광지 찾기 훅
 *
 * React Query를 사용하여 반려동물 동반 가능한 관광지를 찾는 훅입니다.
 * Server Action을 통해 서버 사이드에서 한국관광공사 반려동물 동반여행 API를 호출합니다.
 * .env.local의 NEXT_PUBLIC_TOUR_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#25-반려동물-동반-여행} - PRD 문서의 반려동물 동반 여행 섹션
 */

interface UseFindPetFriendlyToursOptions {
  areaCode?: string;
  contentTypeId?: string;
  maxPages?: number;
  numOfRows?: number;
  maxResults?: number;
  minResults?: number; // 최소 결과 수 - 이 수를 찾으면 바로 반환
  enabled?: boolean; // 쿼리 실행 여부 제어
}

/**
 * 반려동물 동반 가능한 관광지 찾기 훅
 *
 * 여러 페이지의 관광지를 조회하고, 각 관광지의 반려동물 정보를 확인하여
 * 반려동물 동반 가능한 관광지만 반환합니다.
 *
 * @param options - 조회 옵션
 * @returns React Query 결과
 */
export function useFindPetFriendlyTours(
  options: UseFindPetFriendlyToursOptions = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["tours", "pet-friendly", options],
    queryFn: async (): Promise<
      Array<{ tour: TourItem; petInfo: PetTourInfo }>
    > => {
      console.log(
        "[useFindPetFriendlyTours] 반려동물 동반 가능한 관광지 찾기 시작",
        options,
      );

      const results = await findPetFriendlyToursAction({
        areaCode: options.areaCode,
        contentTypeId: options.contentTypeId,
        maxPages: options.maxPages ?? 5,
        numOfRows: options.numOfRows ?? 100,
        maxResults: options.maxResults ?? 50,
        minResults: options.minResults ?? 10, // 최소 10개 찾으면 바로 반환
      });

      console.log(
        `[useFindPetFriendlyTours] 반려동물 동반 가능한 관광지 찾기 완료: ${results.length}개 발견`,
      );

      return results;
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
    retry: 1, // 실패 시 1회 재시도
  });
}
