"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import TourCard from "@/components/TourCard";
import NaverMap from "@/components/NaverMap";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { sortTours, type SortOption } from "@/lib/utils/tour-sorter";
import type { TourItem } from "@/lib/types/tour";

/**
 * @file TourListWithMap.tsx
 * @description 관광지 목록 + 지도 1:1 매칭 컴포넌트
 *
 * 각 관광지 카드 옆에 지도를 1:1로 배치하고,
 * 스크롤 시 현재 보이는 관광지에 맞춰 지도를 업데이트합니다.
 *
 * 주요 기능:
 * 1. 관광지 카드와 지도를 1:1로 매칭
 * 2. Intersection Observer로 현재 보이는 관광지 감지
 * 3. 스크롤 시 현재 보이는 관광지에 맞춰 지도 업데이트
 *
 * @see {@link /docs/prd.md#22-naver-지도-연동} - PRD 문서의 지도 연동 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 레이아웃
 */

interface TourListWithMapProps {
  tours: TourItem[];
  isLoading: boolean;
  keyword?: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
  sortOption?: SortOption;
  selectedTourId?: string;
  hoveredTourId?: string;
  onTourSelect?: (tour: TourItem) => void;
  onTourHover?: (tourId: string | undefined) => void;
  className?: string;
}

/**
 * 로딩 스켈레톤 카드 + 지도
 */
function TourCardMapSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-md">
        <Skeleton className="aspect-square w-full" />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <Skeleton className="aspect-square w-full rounded-lg" />
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

export default function TourListWithMap({
  tours,
  isLoading,
  keyword,
  areaCode,
  contentTypeId,
  numOfRows = 10,
  pageNo = 1,
  sortOption = "latest",
  selectedTourId,
  hoveredTourId,
  onTourSelect,
  onTourHover,
  className,
}: TourListWithMapProps) {
  const [visibleTourId, setVisibleTourId] = useState<string | undefined>(
    tours[0]?.contentid,
  );
  const observerRef = useRef<IntersectionObserver | null>(null);
  const tourRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // 정렬된 데이터 계산 (메모이제이션)
  const sortedData = useMemo(() => {
    if (!tours || tours.length === 0) {
      return [];
    }
    return sortTours(tours, sortOption);
  }, [tours, sortOption]);

  // Intersection Observer로 현재 보이는 관광지 감지
  useEffect(() => {
    if (sortedData.length === 0) {
      return;
    }

    // 초기 보이는 관광지 설정
    if (sortedData.length > 0 && !visibleTourId) {
      setVisibleTourId(sortedData[0].contentid);
    }

    // 기존 Observer 정리
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 새로운 Observer 생성
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // 가장 많이 보이는 관광지 찾기
        let maxIntersection = 0;
        let mostVisibleTourId: string | undefined = undefined;

        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio > maxIntersection
          ) {
            maxIntersection = entry.intersectionRatio;
            const tourId = entry.target.getAttribute("data-tour-id");
            if (tourId) {
              mostVisibleTourId = tourId;
            }
          }
        });

        // 가장 많이 보이는 관광지가 있으면 업데이트
        if (mostVisibleTourId && mostVisibleTourId !== visibleTourId) {
          console.log(
            "[TourListWithMap] 현재 보이는 관광지 변경:",
            mostVisibleTourId,
          );
          setVisibleTourId(mostVisibleTourId);
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: "-30% 0px -30% 0px", // 화면 중앙 40% 영역만 감지
      },
    );

    // 약간의 지연 후 Observer 시작 (DOM 렌더링 완료 대기)
    const timeoutId = setTimeout(() => {
      sortedData.forEach((tour) => {
        const element = document.getElementById(`tour-${tour.contentid}`);
        if (element && observerRef.current) {
          tourRefs.current.set(tour.contentid, element as HTMLDivElement);
          observerRef.current.observe(element);
        }
      });
    }, 100);

    // 클린업
    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sortedData, visibleTourId]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        {Array.from({ length: numOfRows }).map((_, index) => (
          <TourCardMapSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 빈 상태
  if (!sortedData || sortedData.length === 0) {
    return (
      <div className={cn(className)}>
        <EmptyState isSearchMode={Boolean(keyword && keyword.trim() !== "")} />
      </div>
    );
  }

  // 현재 보이는 관광지 (선택된 관광지가 있으면 우선, 없으면 visibleTourId 사용)
  const currentTourId = selectedTourId || visibleTourId;
  const currentTour = sortedData.find(
    (tour) => tour.contentid === currentTourId,
  );

  // 목록 표시 (각 관광지 카드 옆에 지도)
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {sortedData.map((tour) => {
        const isCurrentTour = tour.contentid === currentTourId;

        return (
          <div
            key={tour.contentid}
            id={`tour-${tour.contentid}`}
            data-tour-id={tour.contentid}
            className="grid grid-cols-2 gap-6 items-stretch"
          >
            {/* 관광지 카드 (좌측 50%) */}
            <div className="flex flex-col w-full h-full">
              <TourCard
                tour={tour}
                isSelected={selectedTourId === tour.contentid}
                isHovered={hoveredTourId === tour.contentid}
                onSelect={onTourSelect}
                onHover={onTourHover}
              />
            </div>

            {/* 지도 (우측 50%, 현재 보이는 관광지만 표시) */}
            {isCurrentTour && currentTour ? (
              <div className="flex flex-col w-full h-full">
                <NaverMap
                  tours={[currentTour]}
                  selectedTourId={currentTour.contentid}
                  onTourSelect={onTourSelect}
                  height="h-full"
                  enableClustering={false}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-border bg-muted w-full h-full">
                <p className="text-sm text-muted-foreground">
                  스크롤하여 지도 보기
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
