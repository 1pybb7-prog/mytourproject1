"use client";

import { useMemo } from "react";
import { useTourList } from "@/hooks/useTourList";
import { useTourSearch } from "@/hooks/useTourSearch";
import TourCard from "@/components/TourCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { sortTours, type SortOption } from "@/lib/utils/tour-sorter";
import type { TourItem } from "@/lib/types/tour";

/**
 * @file TourList.tsx
 * @description 관광지 목록 표시 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. React Query를 통한 관광지 목록 조회 (일반 모드)
 * 2. React Query를 통한 관광지 검색 (검색 모드)
 * 3. 반응형 그리드 레이아웃 (모바일: 1열, 태블릿: 2열, 데스크톱: 3-4열)
 * 4. 로딩/에러/빈 상태 처리
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 관광지 목록 섹션
 * @see {@link /docs/prd.md#23-키워드-검색} - PRD 문서의 키워드 검색 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 리스트 레이아웃
 */

interface TourListProps {
  keyword?: string; // 검색 키워드 (있으면 검색 모드, 없으면 일반 모드)
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
  sortOption?: SortOption; // 정렬 옵션
  selectedTourId?: string; // 선택된 관광지 ID
  hoveredTourId?: string; // 호버된 관광지 ID
  onTourHover?: (tourId: string | undefined) => void; // 관광지 호버 핸들러
  className?: string;
}

/**
 * 로딩 스켈레톤 카드
 */
function TourCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-md">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/**
 * 빈 상태 컴포넌트
 */
function EmptyState({ isSearchMode }: { isSearchMode?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <AlertCircle className="size-12 text-muted-foreground" />
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">
          {isSearchMode ? "검색 결과가 없습니다" : "관광지를 찾을 수 없습니다"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isSearchMode
            ? "다른 키워드로 검색해보세요."
            : "다른 조건으로 검색해보세요."}
        </p>
      </div>
    </div>
  );
}

/**
 * 에러 상태 컴포넌트
 */
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <AlertCircle className="size-12 text-destructive" />
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">
          데이터를 불러오는데 실패했습니다
        </h3>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}

export default function TourList({
  keyword,
  areaCode,
  contentTypeId,
  numOfRows = 10,
  pageNo = 1,
  sortOption = "latest",
  selectedTourId,
  hoveredTourId,
  onTourHover,
  className,
}: TourListProps) {
  // 검색 모드: keyword가 있으면 useTourSearch 사용
  const searchQuery = useTourSearch({
    keyword: keyword ?? "",
    areaCode,
    contentTypeId,
    numOfRows,
    pageNo,
    enabled: Boolean(keyword && keyword.trim() !== ""),
  });

  // 일반 모드: keyword가 없으면 useTourList 사용
  const listQuery = useTourList({
    areaCode,
    contentTypeId,
    numOfRows,
    pageNo,
  });

  // 검색 모드인지 일반 모드인지 확인
  const isSearchMode = Boolean(keyword && keyword.trim() !== "");
  const { data, isLoading, isError, error } = isSearchMode
    ? searchQuery
    : listQuery;

  // 정렬된 데이터 계산 (메모이제이션)
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return sortTours(data, sortOption);
  }, [data, sortOption]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className,
        )}
      >
        {Array.from({ length: numOfRows }).map((_, index) => (
          <TourCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className={cn(className)}>
        <ErrorState error={error as Error} />
      </div>
    );
  }

  // 빈 상태
  if (!sortedData || sortedData.length === 0) {
    return (
      <div className={cn(className)}>
        <EmptyState isSearchMode={isSearchMode} />
      </div>
    );
  }

  // 목록 표시
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1",
        className,
      )}
    >
      {sortedData.map((tour) => (
        <div key={tour.contentid} id={`tour-${tour.contentid}`}>
          <TourCard
            tour={tour}
            isSelected={selectedTourId === tour.contentid}
            isHovered={hoveredTourId === tour.contentid}
            onHover={onTourHover}
          />
        </div>
      ))}
    </div>
  );
}
