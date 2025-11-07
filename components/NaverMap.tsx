"use client";

import { useEffect, useRef, useId, useState, useCallback } from "react";
import { useNaverMap } from "@/hooks/useNaverMap";
import type { TourItem } from "@/lib/types/tour";
import { convertTourCoordinates } from "@/lib/utils/coordinate-converter";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import MapControls from "@/components/MapControls";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const measuringPolylineRef = useRef<naver.maps.Polyline | null>(null);
  const measuringMarkersRef = useRef<naver.maps.Marker[]>([]);
  const measuringPointsRef = useRef<naver.maps.LatLng[]>([]);

  // 지도 훅 사용 (containerRef 우선, fallback으로 mapId 사용)
  const {
    map,
    isLoading,
    error,
    addMarkers,
    clearMarkers,
    moveToTour,
    showInfoWindow,
    moveToCurrentLocation,
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

  /**
   * 전체화면 모드 토글
   */
  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    if (!isFullscreen) {
      // 전체화면 진입
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).mozRequestFullScreen) {
        (containerRef.current as any).mozRequestFullScreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
      console.log("[NaverMap] 전체화면 모드 진입");
    } else {
      // 전체화면 종료
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
      console.log("[NaverMap] 전체화면 모드 종료");
    }
  }, [isFullscreen]);

  /**
   * 전체화면 상태 변경 감지
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen =
        document.fullscreenElement !== null ||
        (document as any).webkitFullscreenElement !== null ||
        (document as any).mozFullScreenElement !== null ||
        (document as any).msFullscreenElement !== null;

      setIsFullscreen(isCurrentlyFullscreen);
      console.log("[NaverMap] 전체화면 상태 변경:", isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, []);

  /**
   * 거리 측정 모드 토글
   */
  const handleMeasuringToggle = useCallback(() => {
    if (!map || !window.naver?.maps) {
      return;
    }

    const naverMaps = window.naver.maps;

    if (!isMeasuring) {
      // 거리 측정 모드 시작
      setIsMeasuring(true);
      console.log("[NaverMap] 거리 측정 모드 시작");

      // 지도 클릭 이벤트 추가
      const clickListener = naverMaps.Event.addListener(
        map,
        "click",
        (e: naver.maps.PointerEvent) => {
          if (!e.coord) {
            return;
          }

          // Coord를 LatLng로 변환
          const coord = e.coord as naver.maps.LatLng;
          const point = new naverMaps.LatLng(coord.lat(), coord.lng());
          measuringPointsRef.current.push(point);

          // 마커 추가
          const marker = new naverMaps.Marker({
            position: point,
            map,
            icon: {
              content: `
                <div style="
                  width: 12px;
                  height: 12px;
                  background-color: #ff4444;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
              `,
              anchor: new naverMaps.Point(6, 6),
            },
            zIndex: 1001,
          });
          measuringMarkersRef.current.push(marker);

          // 두 점 이상이면 선 그리기
          if (measuringPointsRef.current.length >= 2) {
            // 기존 선 제거
            if (measuringPolylineRef.current) {
              measuringPolylineRef.current.setMap(null);
            }

            // 새 선 그리기
            const polyline = new naverMaps.Polyline({
              map,
              path: measuringPointsRef.current,
              strokeColor: "#ff4444",
              strokeWeight: 3,
              strokeOpacity: 0.8,
              zIndex: 1000,
            });
            measuringPolylineRef.current = polyline;

            // 거리 계산 및 표시 (Haversine 공식 사용)
            let totalDistance = 0;
            for (let i = 1; i < measuringPointsRef.current.length; i++) {
              const p1 = measuringPointsRef.current[i - 1];
              const p2 = measuringPointsRef.current[i];

              // Haversine 공식으로 거리 계산 (미터 단위)
              const R = 6371000; // 지구 반지름 (미터)
              const dLat = ((p2.lat() - p1.lat()) * Math.PI) / 180;
              const dLng = ((p2.lng() - p1.lng()) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((p1.lat() * Math.PI) / 180) *
                  Math.cos((p2.lat() * Math.PI) / 180) *
                  Math.sin(dLng / 2) *
                  Math.sin(dLng / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = R * c;

              totalDistance += distance;
            }

            const distanceKm = (totalDistance / 1000).toFixed(2);
            const distanceM = totalDistance.toFixed(0);

            console.log(
              `[NaverMap] 거리 측정: ${distanceKm}km (${distanceM}m)`,
            );

            // 정보창 표시 (마지막 마커에)
            const infoWindow = new naverMaps.InfoWindow({
              content: `
                <div style="padding: 8px; font-size: 12px;">
                  총 거리: ${distanceKm}km (${distanceM}m)
                </div>
              `,
              backgroundColor: "#ffffff",
              borderColor: "#cccccc",
              borderWidth: 1,
            });
            infoWindow.open(map, point);
          }
        },
      );

      // 저장 (나중에 제거하기 위해)
      (map as any).__measuringClickListener = clickListener;
    } else {
      // 거리 측정 모드 종료
      setIsMeasuring(false);
      console.log("[NaverMap] 거리 측정 모드 종료");

      // 이벤트 리스너 제거
      if ((map as any).__measuringClickListener) {
        const listener = (map as any).__measuringClickListener;
        // removeListener는 리스너 객체를 인자로 받음
        naverMaps.Event.removeListener(listener);
        delete (map as any).__measuringClickListener;
      }

      // 마커 및 선 제거
      measuringMarkersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      measuringMarkersRef.current = [];

      if (measuringPolylineRef.current) {
        measuringPolylineRef.current.setMap(null);
        measuringPolylineRef.current = null;
      }

      measuringPointsRef.current = [];
    }
  }, [map, isMeasuring]);

  /**
   * 로드뷰 열기
   */
  const handleRoadView = useCallback(() => {
    if (!map) {
      return;
    }

    const center = map.getCenter();
    if (!center) {
      return;
    }

    // center는 LatLng 타입이므로 lat(), lng() 메서드 사용
    const lat = (center as naver.maps.LatLng).lat();
    const lng = (center as naver.maps.LatLng).lng();

    // Naver 로드뷰 URL 생성
    const roadViewUrl = `https://map.naver.com/v5/roadview/${lng},${lat}`;
    window.open(roadViewUrl, "_blank");
    console.log("[NaverMap] 로드뷰 열기:", { lat, lng });
  }, [map]);

  /**
   * 현재 위치로 이동
   */
  const handleCurrentLocation = useCallback(async () => {
    try {
      await moveToCurrentLocation();
      console.log("[NaverMap] 현재 위치로 이동 완료");
    } catch (error) {
      console.error("[NaverMap] 현재 위치로 이동 실패:", error);
      // 에러는 MapControls에서 이미 처리됨
    }
  }, [moveToCurrentLocation]);

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
      {/* 지도 컨트롤 버튼 */}
      {map && !isLoading && !error && (
        <MapControls
          map={map}
          isFullscreen={isFullscreen}
          onFullscreenToggle={handleFullscreenToggle}
          onCurrentLocation={handleCurrentLocation}
          isMeasuring={isMeasuring}
          onMeasuringToggle={handleMeasuringToggle}
          onRoadView={handleRoadView}
          position="bottom-right"
        />
      )}
    </div>
  );
}

// 'use client'로 이미 SSR이 비활성화되어 있으므로 dynamic() 불필요
export default NaverMapComponent;
