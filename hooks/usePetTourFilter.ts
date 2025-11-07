"use client";

import { useMemo, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import type { TourItem } from "@/lib/types/tour";

/**
 * @file usePetTourFilter.ts
 * @description 반려동물 필터링 훅
 *
 * 관광지 목록에 대해 반려동물 정보를 조회하고 필터링하는 훅입니다.
 *
 * @see {@link /docs/prd.md#25-반려동물-동반-여행} - PRD 문서의 반려동물 동반 여행 섹션
 */

interface PetTourFilterOptions {
  tours: TourItem[];
  petFriendly?: boolean;
  petSize?: "small" | "medium" | "large" | undefined;
  petType?: "dog" | "cat" | undefined;
  petPlace?: "indoor" | "outdoor" | undefined;
  enabled?: boolean;
}

/**
 * 반려동물 필터링 훅
 *
 * @param options - 필터 옵션
 * @returns 필터링된 관광지 목록 및 반려동물 정보
 */
export function usePetTourFilter({
  tours,
  petFriendly,
  petSize,
  petType,
  petPlace,
  enabled = true,
}: PetTourFilterOptions) {
  // 반려동물 필터 활성화 여부
  const isPetFilterEnabled = enabled && Boolean(petFriendly);

  // React Hooks 규칙 준수를 위해 쿼리 개수를 항상 고정 (최대 100개)
  // tours 배열의 길이가 변경되어도 Hook 순서는 유지
  const MAX_QUERIES = 100;

  // tours 배열의 contentid를 추출하여 안정화된 키 생성
  const toursKey = useMemo(
    () => tours.map((t) => t.contentid).join(","),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tours.map((t) => t.contentid).join(",")],
  );

  // 쿼리 개수를 고정하기 위해 항상 MAX_QUERIES 개수만큼 쿼리 생성
  // React Hooks 규칙 준수를 위해 항상 같은 개수의 쿼리 생성
  const queries = useMemo(() => {
    const queriesArray: Array<{
      queryKey: readonly [string, string, string];
      queryFn: () => Promise<any>;
      enabled: boolean;
      staleTime: number;
      gcTime: number;
      retry: number;
      throwOnError?: boolean;
    }> = [];

    // 실제 tours 배열의 관광지에 대한 쿼리 생성 (최대 MAX_QUERIES 개)
    for (let i = 0; i < Math.min(tours.length, MAX_QUERIES); i++) {
      const tour = tours[i];
      queriesArray.push({
        queryKey: ["tours", "pet", tour.contentid] as const,
        queryFn: async () => {
          try {
            const { getTourPet } = await import("@/actions/get-tour-pet");
            const result = await getTourPet(tour.contentid);
            // null이 반환되는 경우도 정상적인 응답으로 처리
            return result;
          } catch (error) {
            // 에러가 발생해도 null을 반환하여 앱이 크래시되지 않도록 처리
            console.warn(
              `[usePetTourFilter] 반려동물 정보 조회 실패: ${tour.contentid}`,
              error,
            );
            return null;
          }
        },
        enabled: isPetFilterEnabled, // 필터가 활성화된 경우에만 실행
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
        retry: 1,
        // 에러가 발생해도 쿼리가 실패 상태로 남지 않도록 처리
        throwOnError: false,
      });
    }

    // 쿼리 개수를 고정하기 위해 빈 쿼리 추가 (Hook 순서 안정화)
    // 항상 MAX_QUERIES 개수만큼 쿼리 생성
    while (queriesArray.length < MAX_QUERIES) {
      queriesArray.push({
        queryKey: [
          "tours",
          "pet",
          `placeholder-${queriesArray.length}`,
        ] as const,
        queryFn: async () => null,
        enabled: false, // 항상 비활성화
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
      });
    }

    return queriesArray;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toursKey, isPetFilterEnabled]);

  // 각 관광지의 반려동물 정보 조회 (병렬 처리)
  // React Hooks 규칙 준수를 위해 항상 호출 (enabled 옵션으로 제어)
  const petQueries = useQueries({
    queries,
  });

  // 반려동물 정보 맵 생성
  const petInfoMap = useMemo(() => {
    const map = new Map<string, any>();
    let successCount = 0;
    let nullCount = 0;
    let errorCount = 0;
    let loadingCount = 0;

    petQueries.forEach((query, index) => {
      // 실제 tours 배열의 인덱스 범위 내에서만 처리
      if (index < tours.length) {
        // 로딩 중인 경우 건너뛰기
        if (query.isLoading) {
          loadingCount++;
          return;
        }

        // 에러가 발생한 경우
        if (query.error) {
          errorCount++;
          console.warn(
            `[usePetTourFilter] API 에러: ${tours[index].contentid}`,
            query.error,
          );
          return;
        }

        // 쿼리가 완료되었고 데이터가 있는 경우
        if (query.data !== undefined) {
          if (query.data !== null) {
            map.set(tours[index].contentid, query.data);
            successCount++;
          } else {
            // 쿼리는 완료되었지만 데이터가 null인 경우
            nullCount++;
          }
        } else {
          // 쿼리가 아직 완료되지 않은 경우 (data가 undefined)
          loadingCount++;
        }
      }
    });

    // 디버깅: 반려동물 정보 맵 생성 로그
    if (isPetFilterEnabled) {
      console.log("[usePetTourFilter] 반려동물 정보 맵 생성:", {
        총_관광지: tours.length,
        성공: successCount,
        데이터없음: nullCount,
        에러: errorCount,
        로딩중: loadingCount,
        맵_크기: map.size,
        쿼리_상태_샘플: petQueries
          .slice(0, Math.min(3, tours.length))
          .map((q, i) => ({
            index: i,
            contentid: tours[i]?.contentid,
            isLoading: q.isLoading,
            hasData: q.data !== undefined,
            dataIsNull: q.data === null,
            hasError: !!q.error,
          })),
      });
    }

    return map;
  }, [petQueries, tours, isPetFilterEnabled]);

  // 필터링된 관광지 목록
  const filteredTours = useMemo(() => {
    // 반려동물 필터가 활성화되지 않은 경우 원본 목록 반환
    if (!isPetFilterEnabled) {
      return tours;
    }

    // 로딩 중인 쿼리 확인 (실제 tours 배열 범위 내에서만)
    const isLoadingPetInfo = petQueries.some(
      (query, index) => index < tours.length && query.isLoading,
    );

    // 완료된 쿼리 확인 (로딩이 아니고 data가 undefined가 아닌 경우)
    const hasCompletedQueries = petQueries.some(
      (query, index) =>
        index < tours.length && !query.isLoading && query.data !== undefined,
    );

    // 모든 쿼리가 로딩 중이고 완료된 쿼리가 없으면 원본 목록 반환
    if (isLoadingPetInfo && !hasCompletedQueries) {
      console.log("[usePetTourFilter] 쿼리 로딩 중... 완료 대기");
      return tours;
    }

    const filtered = tours.filter((tour) => {
      const petInfo = petInfoMap.get(tour.contentid);

      // 반려동물 정보가 없는 경우 제외 (API 응답이 null이거나 데이터가 없는 경우)
      if (!petInfo) {
        return false;
      }

      // 반려동물 정보가 있는지 확인 (chkpetleash, petinfo, chkpetsize 등)
      const hasPetInfo =
        petInfo.chkpetleash ||
        petInfo.petinfo ||
        petInfo.chkpetsize ||
        petInfo.chkpetplace ||
        petInfo.chkpetfee ||
        petInfo.parking;

      // 반려동물 정보가 전혀 없는 경우 제외
      if (!hasPetInfo) {
        return false;
      }

      // chkpetleash가 있는 경우, "불가능"인지 확인
      if (petInfo.chkpetleash) {
        const leashValue = petInfo.chkpetleash.trim();
        // "불가능"인 경우 제외
        if (leashValue === "불가능" || leashValue.includes("불가")) {
          return false;
        }
        // "가능" 또는 긍정적인 값이 있으면 통과 (chkpetleash가 있으면 통과)
      } else {
        // chkpetleash가 없어도 다른 반려동물 정보(petinfo 등)가 있으면 포함
        // 단, 명시적으로 "불가능"이라고 표시된 경우는 제외
        if (
          petInfo.petinfo &&
          (petInfo.petinfo.includes("불가능") ||
            petInfo.petinfo.includes("불가"))
        ) {
          return false;
        }
      }

      // 반려동물 크기 필터
      if (petSize) {
        const sizeText = petInfo.chkpetsize || "";
        const sizeMatch =
          (petSize === "small" &&
            (sizeText.includes("소형") || sizeText.includes("소"))) ||
          (petSize === "medium" &&
            (sizeText.includes("중형") || sizeText.includes("중"))) ||
          (petSize === "large" &&
            (sizeText.includes("대형") || sizeText.includes("대")));
        if (!sizeMatch) {
          return false;
        }
      }

      // 반려동물 종류 필터 (API 응답에 종류 정보가 없을 수 있음)
      // 일단 구현하지 않음

      // 실내/실외 필터
      if (petPlace) {
        const placeText = petInfo.chkpetplace || "";
        const placeMatch =
          (petPlace === "indoor" &&
            (placeText.includes("실내") || placeText.includes("내"))) ||
          (petPlace === "outdoor" &&
            (placeText.includes("실외") || placeText.includes("외")));
        if (!placeMatch) {
          return false;
        }
      }

      return true;
    });

    // 디버깅: 필터링 결과 로그
    console.log("[usePetTourFilter] 필터링 결과:", {
      원본_개수: tours.length,
      필터링_후: filtered.length,
      반려동물_정보_맵_크기: petInfoMap.size,
      필터_옵션: {
        petFriendly,
        petSize,
        petPlace,
      },
      필터링된_관광지_ID: filtered.map((t) => t.contentid).slice(0, 5),
    });

    return filtered;
  }, [
    tours,
    petInfoMap,
    isPetFilterEnabled,
    petSize,
    petPlace,
    petFriendly,
    petQueries,
  ]);

  // 로딩 상태 (필터가 활성화된 경우에만 로딩 상태 확인)
  const isLoading = isPetFilterEnabled
    ? petQueries.some((query) => query.isLoading)
    : false;

  return {
    filteredTours,
    petInfoMap,
    isLoading,
  };
}
