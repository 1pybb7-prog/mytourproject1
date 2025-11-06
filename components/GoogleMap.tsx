"use client";

import { useGoogleMap } from "@/hooks/useGoogleMap";
import type { TourItem } from "@/lib/types/tour";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file GoogleMap.tsx
 * @description Google Maps 지도 컴포넌트
 *
 * Google Maps JavaScript API를 사용하여 관광지 목록을 지도에 마커로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. Google Maps API 동적 로드 및 지도 초기화
 * 2. 관광지 마커 표시
 * 3. 마커 클릭 시 InfoWindow 표시
 * 4. 마커 클러스터링
 * 5. 리스트-지도 연동 (특정 마커로 이동)
 *
 * @see {@link /docs/prd.md#22-Google-지도-연동} - PRD 문서의 Google 지도 연동 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 지도 레이아웃
 */

interface GoogleMapProps {
  /** 관광지 목록 */
  tours?: TourItem[];
  /** 선택된 관광지 ID */
  selectedTourId?: string;
  /** 선택된 관광지 변경 핸들러 */
  onTourSelect?: (tourId: string) => void;
  /** 초기 중심 좌표 (위도, 경도) */
  initialCenter?: { lat: number; lng: number };
  /** 초기 줌 레벨 */
  initialZoom?: number;
  /** 지도 컨테이너 클래스명 */
  className?: string;
  /** 지도 컨테이너 ID */
  mapId?: string;
}

/**
 * 로딩 상태 컴포넌트
 */
function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-4 p-8">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex flex-col gap-2 text-center">
          <p className="text-sm font-medium">지도를 불러오는 중...</p>
          <p className="text-xs text-muted-foreground">잠시만 기다려주세요</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 에러 상태 컴포넌트
 */
function ErrorState({
  error,
  className,
}: {
  error: Error;
  className?: string;
}) {
  const isApiKeyError = error.message.includes(
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
  );
  const isContainerError =
    error.message.includes("지도 컨테이너를 찾을 수 없습니다");

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <AlertCircle className="size-12 text-destructive" />
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">지도를 불러올 수 없습니다</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {error.message}
          </p>
          {isApiKeyError && (
            <div className="mt-4 rounded-lg bg-muted p-4 text-left">
              <p className="text-xs font-medium mb-2">해결 방법:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>.env.local 파일을 프로젝트 루트에 생성하세요</li>
                <li>
                  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key 형식으로
                  추가하세요
                </li>
                <li>
                  Google Cloud Console에서 Maps JavaScript API를 활성화하세요
                </li>
                <li>개발 서버를 재시작하세요 (pnpm dev)</li>
              </ol>
            </div>
          )}
          {isContainerError && (
            <div className="mt-4 rounded-lg bg-muted p-4 text-left">
              <p className="text-xs font-medium mb-2">해결 방법:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>브라우저 콘솔(F12)에서 에러 메시지를 확인하세요</li>
                <li>페이지를 새로고침하세요</li>
                <li>개발 서버를 재시작하세요 (pnpm dev)</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Google Maps 지도 컴포넌트
 */
export default function GoogleMap({
  tours = [],
  selectedTourId,
  onTourSelect,
  initialCenter = { lat: 37.5665, lng: 126.978 }, // 서울 기본 좌표
  initialZoom = 8,
  className,
  mapId = "google-map",
}: GoogleMapProps) {
  const {
    map,
    isLoading,
    error,
    panToMarker,
    highlightMarker,
    openInfoWindow,
    closeInfoWindow,
  } = useGoogleMap({
    mapId,
    initialCenter,
    initialZoom,
    tours,
    selectedTourId,
    onTourSelect,
  });

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={cn("relative h-full min-h-[400px] w-full", className)}>
        <LoadingState className="absolute inset-0" />
        <div id={mapId} className="h-full w-full" />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={cn("relative h-full min-h-[400px] w-full", className)}>
        <ErrorState error={error} className="absolute inset-0" />
      </div>
    );
  }

  // 지도 표시
  return (
    <div className={cn("relative h-full w-full", className)}>
      <div
        id={mapId}
        className="h-full min-h-[400px] w-full rounded-lg border border-border"
        data-testid="map-container"
      />
      {map && (
        <div className="absolute bottom-2 right-2 z-10 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground">
          지도 로드 완료
        </div>
      )}
    </div>
  );
}
