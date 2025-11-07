"use client";

import { useEffect, useRef, useId, useMemo } from "react";
import { useNaverMap } from "@/hooks/useNaverMap";
import type { TourDetail } from "@/lib/types/tour";
import { convertTourCoordinates } from "@/lib/utils/coordinate-converter";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file NaverMapSingle.tsx
 * @description Naver Maps 지도 컴포넌트 (상세페이지용 - 단일 마커)
 *
 * 단일 관광지의 위치를 Naver 지도에 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 단일 관광지 위치 표시
 * 2. 관광지 중심으로 지도 설정
 * 3. 마커 표시
 *
 * @see {@link /docs/prd.md#22-naver-지도-연동} - PRD 문서의 지도 연동 섹션
 * @see {@link /docs/reference/design/Design.md#3-상세페이지} - 디자인 문서의 상세페이지
 */

interface NaverMapSingleProps {
  /** 관광지 상세 정보 */
  detail: TourDetail;
  /** 추가 클래스명 */
  className?: string;
  /** 지도 높이 (기본값: 400px) */
  height?: string;
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function MapSkeleton({ height = "h-[400px]" }: { height?: string }) {
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
  height = "h-[400px]",
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
 * Naver Maps 지도 컴포넌트 (상세페이지용)
 *
 * @param props - 컴포넌트 props
 * @returns 지도 컴포넌트
 */
function NaverMapSingleComponent({
  detail,
  className,
  height = "h-[400px]",
}: NaverMapSingleProps) {
  const mapId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevDetailIdRef = useRef<string | undefined>(undefined);

  // 좌표 변환
  const coordinates = useMemo(() => {
    try {
      if (!detail.mapx || !detail.mapy) {
        return null;
      }
      return convertTourCoordinates(detail.mapx, detail.mapy);
    } catch (error) {
      console.error("[NaverMapSingle] 좌표 변환 실패:", error);
      return null;
    }
  }, [detail.mapx, detail.mapy]);

  // 지도 훅 사용
  const { map, isLoading, error, addMarkers, clearMarkers, moveTo } =
    useNaverMap({
      containerId: mapId,
      center: coordinates || { lat: 37.5665, lng: 126.978 }, // 좌표가 없으면 서울 시청 기본값
      zoom: 15,
      enableClustering: false, // 단일 마커이므로 클러스터링 비활성화
    });

  // 관광지 정보가 변경되면 지도 업데이트
  useEffect(() => {
    if (!map || isLoading || !coordinates) {
      return;
    }

    // 이전 관광지와 동일하면 무시
    if (prevDetailIdRef.current === detail.contentid) {
      return;
    }

    console.log(
      "[NaverMapSingle] 관광지 정보 변경, 지도 업데이트:",
      detail.title,
    );

    // 기존 마커 제거
    clearMarkers();

    // 지도 중심 이동
    moveTo(coordinates.lat, coordinates.lng, 15);

    // 마커 추가 (TourItem 형식으로 변환)
    const tourItem = {
      contentid: detail.contentid,
      contenttypeid: detail.contenttypeid,
      title: detail.title,
      addr1: detail.addr1,
      addr2: detail.addr2,
      areacode: "", // 상세페이지에서는 불필요
      mapx: detail.mapx,
      mapy: detail.mapy,
      firstimage: detail.firstimage,
      firstimage2: detail.firstimage2,
      tel: detail.tel,
      modifiedtime: "", // 상세페이지에서는 불필요
    };

    addMarkers([tourItem]);

    prevDetailIdRef.current = detail.contentid;
  }, [map, isLoading, coordinates, detail, addMarkers, clearMarkers, moveTo]);

  // 좌표가 없을 경우 처리
  if (!coordinates) {
    return (
      <div className={cn("flex w-full flex-col gap-4", className)}>
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-4 rounded-lg border border-muted bg-muted/50 p-8",
            height,
          )}
        >
          <AlertCircle className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">위치 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  // 지도 컨테이너는 항상 렌더링 (ref가 설정되어야 함)
  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {/* 로딩/에러 상태를 overlay로 표시 */}
      {isLoading && (
        <div className="w-full">
          <MapSkeleton height={height} />
        </div>
      )}
      {error && (
        <div className="w-full">
          <ErrorState error={error} height={height} />
        </div>
      )}
      {/* 지도 컨테이너는 항상 렌더링되지만, 로딩/에러 시 숨김 */}
      <div
        ref={containerRef}
        id={mapId}
        className={cn(
          "w-full rounded-lg border border-border bg-card",
          height,
          (isLoading || error) && "hidden", // 로딩/에러 시 숨김
        )}
      />
    </div>
  );
}

// 'use client'로 이미 SSR이 비활성화되어 있으므로 dynamic() 불필요
export default NaverMapSingleComponent;
