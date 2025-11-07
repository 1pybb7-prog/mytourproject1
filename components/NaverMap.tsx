"use client";

import { useEffect, useRef, useId } from "react";
import { useNaverMap } from "@/hooks/useNaverMap";
import type { TourItem } from "@/lib/types/tour";
import { convertTourCoordinates } from "@/lib/utils/coordinate-converter";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file NaverMap.tsx
 * @description Naver Maps 지도 컴포넌트 (홈페이지용 - 여러 마커)
 *
 * 관광지 목록을 Naver 지도에 마커로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 관광지 목록을 마커로 표시
 * 2. 마커 클릭 시 정보창 표시
 * 3. 선택된 마커 강조 기능
 * 4. 마커 클러스터링 지원
 *
 * @see {@link /docs/prd.md#22-naver-지도-연동} - PRD 문서의 지도 연동 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 지도 레이아웃
 */

interface NaverMapProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 선택된 관광지 ID */
  selectedTourId?: string;
  /** 관광지 선택 핸들러 */
  onTourSelect?: (tour: TourItem) => void;
  /** 추가 클래스명 */
  className?: string;
  /** 지도 높이 (기본값: 400px 모바일, 600px 데스크톱) */
  height?: string;
  /** 마커 클러스터링 사용 여부 (기본값: true) */
  enableClustering?: boolean;
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function MapSkeleton({
  height = "h-[400px] md:h-[600px]",
}: {
  height?: string;
}) {
  return (
    <div
      className={cn("w-full rounded-lg border border-border bg-card", height)}
    >
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  );
}

/**
 * 에러 상태 컴포넌트
 */
function ErrorState({
  error,
  height = "h-[400px] md:h-[600px]",
}: {
  error: Error;
  height?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-8",
        height,
      )}
    >
      <AlertCircle className="size-8 text-destructive" />
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-semibold text-destructive">
          지도를 불러올 수 없습니다
        </p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}

/**
 * Naver Maps 지도 컴포넌트 (홈페이지용)
 *
 * @param props - 컴포넌트 props
 * @returns 지도 컴포넌트
 */
function NaverMapComponent({
  tours,
  selectedTourId,
  onTourSelect,
  className,
  height = "h-[400px] md:h-[600px]",
  enableClustering = true,
}: NaverMapProps) {
  const mapId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevToursRef = useRef<TourItem[]>([]);
  const prevSelectedTourIdRef = useRef<string | undefined>(undefined);

  // 지도 훅 사용 (containerRef 우선, fallback으로 mapId 사용)
  const {
    map,
    isLoading,
    error,
    addMarkers,
    clearMarkers,
    moveToTour,
    showInfoWindow,
  } = useNaverMap({
    containerRef: containerRef,
    containerId: mapId, // fallback
    center: { lat: 37.5665, lng: 126.978 }, // 서울 시청 기본값
    zoom: 10,
    enableClustering,
    onMarkerClick: (tour) => {
      console.log("[NaverMap] 마커 클릭:", tour.title);
      if (onTourSelect) {
        onTourSelect(tour);
      }
    },
  });

  // 관광지 목록이 변경되면 마커 업데이트
  useEffect(() => {
    if (!map || isLoading) {
      return;
    }

    // 이전 목록과 비교하여 변경된 경우에만 업데이트
    const toursChanged =
      prevToursRef.current.length !== tours.length ||
      prevToursRef.current.some(
        (prevTour, index) => prevTour.contentid !== tours[index]?.contentid,
      );

    if (toursChanged) {
      console.log("[NaverMap] 관광지 목록 변경, 마커 업데이트:", tours.length);
      clearMarkers();
      if (tours.length > 0) {
        addMarkers(tours);
      }
      prevToursRef.current = [...tours];
    }
  }, [map, isLoading, tours, addMarkers, clearMarkers]);

  // 선택된 관광지가 변경되면 지도 이동
  useEffect(() => {
    if (!map || isLoading || !selectedTourId) {
      return;
    }

    // 이전 선택과 동일하면 무시
    if (prevSelectedTourIdRef.current === selectedTourId) {
      return;
    }

    const selectedTour = tours.find(
      (tour) => tour.contentid === selectedTourId,
    );
    if (selectedTour) {
      console.log("[NaverMap] 선택된 관광지로 이동:", selectedTour.title);
      moveToTour(selectedTour);

      // 정보창 표시
      try {
        const position = convertTourCoordinates(
          selectedTour.mapx,
          selectedTour.mapy,
        );
        showInfoWindow(selectedTour, position);
      } catch (err) {
        console.error("[NaverMap] 좌표 변환 실패:", err);
      }

      prevSelectedTourIdRef.current = selectedTourId;
    }
  }, [map, isLoading, selectedTourId, tours, moveToTour, showInfoWindow]);

  // 지도 컨테이너는 항상 렌더링 (ref가 설정되어야 함)
  return (
    <div className={cn("relative w-full", height, className)}>
      {/* 로딩/에러 상태를 overlay로 표시 */}
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <MapSkeleton height={height} />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10">
          <ErrorState error={error} height={height} />
        </div>
      )}
      {/* 지도 컨테이너는 항상 렌더링되지만, 로딩/에러 시 숨김 */}
      <div
        ref={containerRef}
        id={mapId}
        className={cn(
          "h-full w-full rounded-lg border border-border bg-card",
          (isLoading || error) && "hidden", // 로딩/에러 시 숨김
        )}
      />
    </div>
  );
}

// 'use client'로 이미 SSR이 비활성화되어 있으므로 dynamic() 불필요
export default NaverMapComponent;
