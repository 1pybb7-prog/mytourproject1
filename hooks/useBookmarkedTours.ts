"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBookmarkList } from "@/hooks/useBookmarkList";
import { getTourDetail } from "@/actions/get-tour-detail";
import type { TourItem } from "@/lib/types/tour";
import type { TourDetail } from "@/lib/types/tour";

/**
 * @file useBookmarkedTours.ts
 * @description 북마크한 관광지 목록 조회 훅
 *
 * 북마크 목록을 가져와서 각 관광지의 상세 정보를 조회하는 훅입니다.
 *
 * 주요 기능:
 * 1. 북마크 목록 조회
 * 2. 각 북마크의 관광지 상세 정보 조회
 * 3. TourItem 형식으로 변환
 *
 * @see {@link /docs/prd.md#261-북마크-추가-기능} - PRD 문서의 북마크 섹션
 */

/**
 * TourDetail을 TourItem으로 변환
 *
 * @param detail - 관광지 상세 정보
 * @param bookmarkCreatedAt - 북마크 생성일시 (modifiedtime 대체)
 * @returns TourItem 형식의 관광지 정보
 */
function convertDetailToItem(
  detail: TourDetail,
  bookmarkCreatedAt: string,
): TourItem {
  return {
    contentid: detail.contentid,
    contenttypeid: detail.contenttypeid,
    title: detail.title,
    addr1: detail.addr1,
    addr2: detail.addr2,
    areacode: "", // TourDetail에는 areacode가 없으므로 빈 문자열
    mapx: detail.mapx,
    mapy: detail.mapy,
    firstimage: detail.firstimage,
    firstimage2: detail.firstimage2,
    tel: detail.tel,
    modifiedtime: bookmarkCreatedAt.split("T")[0].replace(/-/g, ""), // 북마크 생성일을 modifiedtime으로 사용
  };
}

/**
 * 북마크한 관광지 목록 조회 훅
 *
 * @returns 북마크한 관광지 목록 및 상태
 */
export function useBookmarkedTours() {
  const {
    bookmarks,
    isLoading: isLoadingBookmarks,
    error: bookmarkError,
  } = useBookmarkList();

  // 각 북마크의 관광지 상세 정보 조회
  const contentIds = useMemo(
    () => bookmarks.map((bookmark) => bookmark.content_id),
    [bookmarks],
  );

  const {
    data: tourDetails,
    isLoading: isLoadingTours,
    error: tourError,
  } = useQuery({
    queryKey: ["bookmarked-tours", contentIds],
    queryFn: async (): Promise<TourItem[]> => {
      if (contentIds.length === 0) {
        return [];
      }

      console.log(
        "[useBookmarkedTours] 북마크한 관광지 상세 정보 조회 시작:",
        contentIds.length,
      );

      // 모든 관광지 상세 정보를 병렬로 조회
      const detailPromises = bookmarks.map(async (bookmark) => {
        try {
          const detail = await getTourDetail(bookmark.content_id);
          if (!detail) {
            console.warn(
              `[useBookmarkedTours] 관광지 상세 정보 없음: ${bookmark.content_id}`,
            );
            return null;
          }
          return convertDetailToItem(detail, bookmark.created_at);
        } catch (error) {
          console.error(
            `[useBookmarkedTours] 관광지 상세 정보 조회 실패: ${bookmark.content_id}`,
            error,
          );
          return null;
        }
      });

      const results = await Promise.all(detailPromises);
      const tours = results.filter((tour): tour is TourItem => tour !== null);

      console.log(
        "[useBookmarkedTours] 북마크한 관광지 상세 정보 조회 완료:",
        tours.length,
      );

      return tours;
    },
    enabled: contentIds.length > 0 && !isLoadingBookmarks,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  return {
    tours: tourDetails ?? [],
    isLoading: isLoadingBookmarks || isLoadingTours,
    error: bookmarkError || tourError,
  };
}
