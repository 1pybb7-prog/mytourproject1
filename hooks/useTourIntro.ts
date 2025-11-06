"use client";

import { useQuery } from "@tanstack/react-query";
import type { TourIntro } from "@/lib/types/tour";
import { getTourIntro } from "@/actions/get-tour-intro";

/**
 * @file useTourIntro.ts
 * @description 관광지 소개 정보 조회 훅
 *
 * React Query를 사용하여 관광지 소개 정보를 조회하는 훅입니다.
 * Server Action을 통해 서버 사이드에서 한국관광공사 API를 호출합니다.
 * .env.local의 TOUR_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#242-운영-정보-섹션} - PRD 문서의 운영 정보 섹션
 */

/**
 * 관광지 소개 정보 조회 훅
 *
 * @param contentId - 콘텐츠ID
 * @param contentTypeId - 콘텐츠타입ID
 * @returns React Query 결과
 */
export function useTourIntro(contentId: string, contentTypeId: string) {
  return useQuery({
    queryKey: ["tours", "intro", contentId, contentTypeId],
    queryFn: async (): Promise<TourIntro | null> => {
      if (!contentId || contentId.trim() === "") {
        return null;
      }
      if (!contentTypeId || contentTypeId.trim() === "") {
        return null;
      }
      return await getTourIntro(contentId, contentTypeId);
    },
    enabled:
      Boolean(contentId && contentId.trim() !== "") &&
      Boolean(contentTypeId && contentTypeId.trim() !== ""),
    staleTime: 5 * 60 * 1000, // 5분 (소개 정보는 자주 변경되지 않음)
    gcTime: 10 * 60 * 1000, // 10분
    retry: 1, // 실패 시 1회 재시도
  });
}
