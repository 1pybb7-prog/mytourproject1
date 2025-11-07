"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  loadNaverMaps,
  NaverMapsLoadError,
} from "@/lib/utils/naver-map-loader";
import {
  MarkerClusterer,
  type ClusterOptions,
} from "@/lib/utils/marker-clusterer";
import { convertTourCoordinates } from "@/lib/utils/coordinate-converter";
import { createMarkerIcon } from "@/lib/utils/marker-icon";
import type { TourItem } from "@/lib/types/tour";

/**
 * @file useNaverMap.ts
 * @description Naver Maps 지도 관리 훅
 *
 * Naver Maps 지도를 초기화하고 관리하는 React 훅입니다.
 * 지도 인스턴스, 마커, 정보창 등을 관리합니다.
 *
 * 주요 기능:
 * 1. 지도 초기화 및 상태 관리
 * 2. 지도 인스턴스 생성 및 관리
 * 3. 마커 생성 및 관리 로직
 * 4. 정보창(InfoWindow) 관리
 * 5. 지도 중심 이동 함수
 * 6. 마커 클릭 이벤트 처리
 * 7. 로딩 상태 관리
 * 8. 에러 상태 관리
 * 9. 클린업 로직 (컴포넌트 unmount 시)
 *
 * @see {@link /docs/prd.md#22-naver-지도-연동} - PRD 문서의 지도 연동 섹션
 */

/**
 * 지도 초기화 옵션
 */
export interface UseNaverMapOptions {
  /** 지도 컨테이너 ID 또는 요소 */
  containerId?: string;
  /** 지도 컨테이너 Ref (containerId보다 우선) */
  containerRef?: React.RefObject<HTMLElement>;
  /** 초기 중심 좌표 */
  center?: { lat: number; lng: number };
  /** 초기 줌 레벨 (기본값: 10) */
  zoom?: number;
  /** 마커 클러스터링 사용 여부 (기본값: true) */
  enableClustering?: boolean;
  /** 클러스터링 옵션 */
  clusterOptions?: ClusterOptions;
  /** 마커 클릭 핸들러 */
  onMarkerClick?: (tour: TourItem) => void;
  /** 지도 로드 완료 핸들러 */
  onMapLoad?: (map: naver.maps.Map) => void;
}

/**
 * 지도 훅 반환 타입
 */
export interface UseNaverMapReturn {
  /** 지도 인스턴스 */
  map: naver.maps.Map | null;
  /** 마커 클러스터러 인스턴스 */
  clusterer: MarkerClusterer | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 상태 */
  error: Error | null;
  /** 지도 중심 이동 */
  moveTo: (lat: number, lng: number, zoom?: number) => void;
  /** 특정 관광지로 이동 */
  moveToTour: (tour: TourItem) => void;
  /** 마커 추가 */
  addMarkers: (tours: TourItem[]) => void;
  /** 모든 마커 제거 */
  clearMarkers: () => void;
  /** 정보창 표시 */
  showInfoWindow: (
    tour: TourItem,
    position: { lat: number; lng: number },
  ) => void;
  /** 정보창 닫기 */
  closeInfoWindow: () => void;
  /** 현재 위치로 이동 및 마커 표시 */
  moveToCurrentLocation: () => Promise<void>;
  /** 현재 위치 마커 제거 */
  clearCurrentLocationMarker: () => void;
  /** 지도 재초기화 */
  reinitialize: () => void;
}

/**
 * Naver Maps 지도 관리 훅
 *
 * @param options - 지도 초기화 옵션
 * @returns 지도 상태 및 제어 함수들
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useNaverMap } from '@/hooks/useNaverMap';
 *
 * export default function MapComponent() {
 *   const {
 *     map,
 *     isLoading,
 *     error,
 *     addMarkers,
 *     moveToTour,
 *   } = useNaverMap({
 *     containerId: 'map',
 *     center: { lat: 37.5665, lng: 126.9780 },
 *     zoom: 10,
 *     enableClustering: true,
 *     onMarkerClick: (tour) => {
 *       console.log('마커 클릭:', tour.title);
 *     },
 *   });
 *
 *   useEffect(() => {
 *     if (map && tours) {
 *       addMarkers(tours);
 *     }
 *   }, [map, tours, addMarkers]);
 *
 *   if (isLoading) return <div>지도 로딩 중...</div>;
 *   if (error) return <div>에러: {error.message}</div>;
 *
 *   return <div id="map" style={{ width: '100%', height: '400px' }} />;
 * }
 * ```
 */
export function useNaverMap(
  options: UseNaverMapOptions = {},
): UseNaverMapReturn {
  const {
    containerId,
    containerRef: externalContainerRef,
    center = { lat: 37.5665, lng: 126.978 }, // 서울 시청 기본값
    zoom = 10,
    enableClustering = true,
    clusterOptions = {},
    onMarkerClick,
    onMapLoad,
  } = options;

  // 상태 관리
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 참조 관리
  const mapRef = useRef<naver.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const currentLocationMarkerRef = useRef<naver.maps.Marker | null>(null); // 현재 위치 마커
  const naverMapsRef = useRef<typeof naver.maps | null>(null);
  const containerElementRef = useRef<HTMLElement | null>(null);
  const isInitializedRef = useRef(false); // 초기화 완료 여부 추적
  const clusterOptionsRef = useRef(clusterOptions); // 클러스터 옵션 참조
  const onMapLoadRef = useRef(onMapLoad); // 지도 로드 핸들러 참조

  // 옵션 업데이트
  useEffect(() => {
    clusterOptionsRef.current = clusterOptions;
  }, [clusterOptions]);

  useEffect(() => {
    onMapLoadRef.current = onMapLoad;
  }, [onMapLoad]);

  /**
   * 지도 초기화
   */
  const initializeMap = useCallback(async () => {
    // 이미 초기화된 경우 무시
    if (isInitializedRef.current) {
      console.log("[useNaverMap] 이미 초기화됨, 무시");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("[useNaverMap] 지도 초기화 시작");

      // Naver Maps API 로드
      const naverMaps = await loadNaverMaps();
      naverMapsRef.current = naverMaps;

      // 컨테이너 요소 찾기 (통합 재시도 로직)
      // 우선순위: externalContainerRef > containerId > containerElementRef
      let containerElement: HTMLElement | null = null;
      let retryCount = 0;
      const maxRetries = 20; // 2초 대기 (20 * 100ms)
      const retryDelay = 100;

      console.log("[useNaverMap] 컨테이너 찾기 시작", {
        hasExternalRef: !!externalContainerRef,
        containerId,
        hasInternalRef: !!containerElementRef.current,
      });

      // 모든 방법에 대해 재시도
      while (!containerElement && retryCount < maxRetries) {
        // 1. externalContainerRef 우선 확인
        if (externalContainerRef?.current) {
          containerElement = externalContainerRef.current;
          console.log(
            `[useNaverMap] ✓ externalContainerRef로 컨테이너 찾음 (시도 ${
              retryCount + 1
            })`,
          );
          break;
        }

        // 2. containerId로 찾기
        if (containerId) {
          const element = document.getElementById(containerId);
          if (element) {
            containerElement = element;
            console.log(
              `[useNaverMap] ✓ ID로 컨테이너 찾음 (시도 ${
                retryCount + 1
              }, ID: ${containerId})`,
            );
            break;
          }
        }

        // 3. 내부 containerElementRef 확인
        if (containerElementRef.current) {
          containerElement = containerElementRef.current;
          console.log(
            `[useNaverMap] ✓ containerElementRef로 컨테이너 찾음 (시도 ${
              retryCount + 1
            })`,
          );
          break;
        }

        // 찾지 못한 경우 재시도
        retryCount++;
        console.log(
          `[useNaverMap] ⏳ 컨테이너 대기 중... (${retryCount}/${maxRetries})`,
          {
            externalRefCurrent: externalContainerRef?.current,
            domElement: containerId
              ? document.getElementById(containerId)
              : null,
          },
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }

      // 최종 확인
      if (!containerElement) {
        const errorDetails = {
          containerId: containerId || "없음",
          hasExternalRef: !!externalContainerRef,
          externalRefCurrent: externalContainerRef?.current || "null",
          hasInternalRef: !!containerElementRef.current,
          retriesExhausted: retryCount >= maxRetries,
        };
        console.error(
          "[useNaverMap] ✗ 컨테이너를 찾을 수 없습니다:",
          errorDetails,
        );
        throw new Error(
          `지도 컨테이너를 찾을 수 없습니다. ${JSON.stringify(errorDetails)}`,
        );
      }

      console.log("[useNaverMap] ✓ 컨테이너 준비 완료:", containerElement);

      // 지도 옵션 설정
      const mapOptions: naver.maps.MapOptions = {
        center: new naverMaps.LatLng(center.lat, center.lng),
        zoom,
        zoomControl: true,
        zoomControlOptions: {
          position: naverMaps.Position.TOP_RIGHT,
        },
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: naverMaps.Position.TOP_LEFT,
        } as naver.maps.MapTypeControlOptions,
      };

      // 지도 생성
      const mapInstance = new naverMaps.Map(containerElement, mapOptions);
      mapRef.current = mapInstance;
      setMap(mapInstance);

      console.log("[useNaverMap] 지도 생성 완료");

      // 마커 클러스터링 초기화
      if (enableClustering) {
        const clustererInstance = new MarkerClusterer(
          mapInstance,
          clusterOptionsRef.current,
        );
        clustererRef.current = clustererInstance;
        setClusterer(clustererInstance);
        console.log("[useNaverMap] 마커 클러스터러 초기화 완료");
      }

      // 지도 로드 완료 핸들러 호출
      if (onMapLoadRef.current) {
        onMapLoadRef.current(mapInstance);
      }

      isInitializedRef.current = true;
      setIsLoading(false);
      console.log("[useNaverMap] 지도 초기화 완료");
    } catch (err) {
      console.error("[useNaverMap] 지도 초기화 실패:", err);
      const error =
        err instanceof Error
          ? err
          : new Error("지도 초기화 중 알 수 없는 오류가 발생했습니다");
      setError(error);
      setIsLoading(false);
      isInitializedRef.current = false; // 실패 시 재시도 가능하도록
    }
  }, [containerId, center.lat, center.lng, zoom, enableClustering]);

  /**
   * 지도 중심 이동
   */
  const moveTo = useCallback((lat: number, lng: number, zoomLevel?: number) => {
    if (!mapRef.current || !naverMapsRef.current) {
      console.warn("[useNaverMap] 지도가 초기화되지 않았습니다");
      return;
    }

    const position = new naverMapsRef.current.LatLng(lat, lng);
    mapRef.current.setCenter(position);

    if (zoomLevel !== undefined) {
      mapRef.current.setZoom(zoomLevel);
    }

    console.log("[useNaverMap] 지도 중심 이동:", { lat, lng, zoom: zoomLevel });
  }, []);

  /**
   * 특정 관광지로 이동
   */
  const moveToTour = useCallback(
    (tour: TourItem) => {
      if (!tour.mapx || !tour.mapy) {
        console.warn("[useNaverMap] 관광지 좌표가 없습니다:", tour.contentid);
        return;
      }

      try {
        const position = convertTourCoordinates(tour.mapx, tour.mapy);
        moveTo(position.lat, position.lng, 15);
        console.log("[useNaverMap] 관광지로 이동:", tour.title);
      } catch (err) {
        console.error("[useNaverMap] 좌표 변환 실패:", err);
      }
    },
    [moveTo],
  );

  /**
   * 마커 추가
   */
  const addMarkers = useCallback(
    (tours: TourItem[]) => {
      if (!mapRef.current) {
        console.warn("[useNaverMap] 지도가 초기화되지 않았습니다");
        return;
      }

      if (enableClustering && clustererRef.current) {
        // 클러스터링 사용
        clustererRef.current.addMarkers(tours);
        console.log("[useNaverMap] 마커 추가 (클러스터링):", tours.length);
      } else {
        // 개별 마커 생성
        if (!naverMapsRef.current) {
          console.warn("[useNaverMap] Naver Maps API가 로드되지 않았습니다");
          return;
        }

        const naverMaps = naverMapsRef.current;

        tours.forEach((tour) => {
          if (!tour.mapx || !tour.mapy) {
            return;
          }

          try {
            const position = convertTourCoordinates(tour.mapx, tour.mapy);
            const latLng = new naverMaps.LatLng(position.lat, position.lng);

            // 마커 생성 (관광 타입별 아이콘 사용)
            const marker = new naverMaps.Marker({
              position: latLng,
              map: mapRef.current!,
              icon: createMarkerIcon(tour, naverMaps, 30),
            });

            // 마커 클릭 이벤트
            naverMaps.Event.addListener(marker, "click", () => {
              if (onMarkerClick) {
                onMarkerClick(tour);
              }
              showInfoWindow(tour, position);
            });

            markersRef.current.push(marker);
          } catch (err) {
            console.error(
              `[useNaverMap] 마커 생성 실패: ${tour.contentid}`,
              err,
            );
          }
        });

        console.log("[useNaverMap] 마커 추가 (개별):", tours.length);
      }
    },
    [enableClustering, onMarkerClick],
  );

  /**
   * 모든 마커 제거
   */
  const clearMarkers = useCallback(() => {
    if (enableClustering && clustererRef.current) {
      clustererRef.current.clearMarkers();
      console.log("[useNaverMap] 마커 제거 (클러스터링)");
    } else {
      // 개별 마커 제거
      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current = [];
      console.log("[useNaverMap] 마커 제거 (개별)");
    }

    // 정보창 닫기
    closeInfoWindow();
  }, [enableClustering]);

  /**
   * 정보창 표시
   */
  const showInfoWindow = useCallback(
    (tour: TourItem, position: { lat: number; lng: number }) => {
      if (!mapRef.current || !naverMapsRef.current) {
        console.warn("[useNaverMap] 지도가 초기화되지 않았습니다");
        return;
      }

      const naverMaps = naverMapsRef.current;

      // 기존 정보창 닫기
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      // 정보창 내용 생성
      const content = `
        <div style="
          padding: 12px;
          min-width: 200px;
          max-width: 300px;
        ">
          <h3 style="
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: bold;
            color: #333;
          ">
            ${tour.title}
          </h3>
          ${
            tour.addr1
              ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${tour.addr1}</p>`
              : ""
          }
          <a
            href="/places/${tour.contentid}"
            style="
              display: inline-block;
              padding: 6px 12px;
              background-color: #4285f4;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-size: 12px;
              margin-top: 8px;
            "
            onmouseover="this.style.backgroundColor='#357ae8'"
            onmouseout="this.style.backgroundColor='#4285f4'"
          >
            상세보기
          </a>
        </div>
      `;

      // 정보창 생성 및 표시
      const infoWindow = new naverMaps.InfoWindow({
        content,
        backgroundColor: "#ffffff",
        borderColor: "#cccccc",
        borderWidth: 1,
        anchorSize: new naverMaps.Size(10, 10),
        pixelOffset: new naverMaps.Point(0, -10),
      });

      infoWindow.open(
        mapRef.current,
        new naverMaps.LatLng(position.lat, position.lng),
      );
      infoWindowRef.current = infoWindow;

      console.log("[useNaverMap] 정보창 표시:", tour.title);
    },
    [],
  );

  /**
   * 정보창 닫기
   */
  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
      console.log("[useNaverMap] 정보창 닫기");
    }
  }, []);

  /**
   * 현재 위치로 이동 및 마커 표시
   */
  const moveToCurrentLocation = useCallback(async (): Promise<void> => {
    if (!mapRef.current || !naverMapsRef.current) {
      console.warn("[useNaverMap] 지도가 초기화되지 않았습니다");
      throw new Error("지도가 초기화되지 않았습니다");
    }

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error(
          "이 브라우저는 위치 서비스를 지원하지 않습니다",
        );
        console.error("[useNaverMap]", error.message);
        reject(error);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const naverMaps = naverMapsRef.current!;
          const map = mapRef.current!;

          console.log("[useNaverMap] 현재 위치:", { latitude, longitude });

          // 지도 중심 이동
          const latLng = new naverMaps.LatLng(latitude, longitude);
          map.setCenter(latLng);
          map.setZoom(15);

          // 기존 현재 위치 마커 제거
          if (currentLocationMarkerRef.current) {
            currentLocationMarkerRef.current.setMap(null);
          }

          // 현재 위치 마커 생성
          const marker = new naverMaps.Marker({
            position: latLng,
            map,
            icon: {
              content: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background-color: #4285f4;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
              `,
              anchor: new naverMaps.Point(10, 10),
            },
            zIndex: 1000, // 다른 마커보다 위에 표시
          });

          currentLocationMarkerRef.current = marker;
          console.log("[useNaverMap] 현재 위치 마커 표시 완료");

          resolve();
        },
        (error) => {
          console.error("[useNaverMap] 위치 가져오기 실패:", error);
          let errorMessage = "위치를 가져올 수 없습니다.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "위치 권한이 거부되었습니다.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "위치 정보를 사용할 수 없습니다.";
              break;
            case error.TIMEOUT:
              errorMessage = "위치 요청 시간이 초과되었습니다.";
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  }, []);

  /**
   * 현재 위치 마커 제거
   */
  const clearCurrentLocationMarker = useCallback(() => {
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
      currentLocationMarkerRef.current = null;
      console.log("[useNaverMap] 현재 위치 마커 제거");
    }
  }, []);

  /**
   * 지도 재초기화
   */
  const reinitialize = useCallback(() => {
    console.log("[useNaverMap] 지도 재초기화 시작");

    // 초기화 플래그 리셋
    isInitializedRef.current = false;

    // 기존 리소스 정리
    if (clustererRef.current) {
      clustererRef.current.destroy();
      clustererRef.current = null;
      setClusterer(null);
    }

    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    if (mapRef.current) {
      mapRef.current = null;
      setMap(null);
    }

    // 재초기화
    initializeMap();
  }, [initializeMap]);

  // 초기화 (컨테이너 ID가 변경될 때만 재초기화)
  useEffect(() => {
    // 초기화 플래그 리셋
    isInitializedRef.current = false;

    // DOM이 준비될 때까지 충분한 지연 후 초기화
    // (dynamic import + React render cycle 고려)
    const timer = setTimeout(() => {
      initializeMap();
    }, 200); // 100ms → 200ms로 증가

    // 클린업
    return () => {
      clearTimeout(timer);
      console.log("[useNaverMap] 클린업 시작");

      // 초기화 플래그 리셋
      isInitializedRef.current = false;

      // 클러스터러 정리
      if (clustererRef.current) {
        clustererRef.current.destroy();
        clustererRef.current = null;
      }

      // 마커 정리
      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current = [];

      // 정보창 정리
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }

      // 현재 위치 마커 정리
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null);
        currentLocationMarkerRef.current = null;
      }

      // 지도 정리
      if (mapRef.current) {
        mapRef.current = null;
      }

      console.log("[useNaverMap] 클린업 완료");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]); // containerId만 의존성으로 사용 (initializeMap은 내부에서 안정적)

  return {
    map,
    clusterer,
    isLoading,
    error,
    moveTo,
    moveToTour,
    addMarkers,
    clearMarkers,
    showInfoWindow,
    closeInfoWindow,
    moveToCurrentLocation,
    clearCurrentLocationMarker,
    reinitialize,
  };
}
