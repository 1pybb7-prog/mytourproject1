"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { TourItem } from "@/lib/types/tour";
import { convertTourCoordinates } from "@/lib/utils/coordinate-converter";

/**
 * @file useGoogleMap.ts
 * @description Google Maps 지도 상태 관리 훅
 *
 * Google Maps JavaScript API를 사용하여 지도를 초기화하고,
 * 관광지 마커를 관리하는 훅입니다.
 *
 * 주요 기능:
 * 1. Google Maps API 스크립트 동적 로드
 * 2. 지도 인스턴스 초기화 및 상태 관리
 * 3. 마커 생성/업데이트/삭제 로직
 * 4. InfoWindow 관리 (열기/닫기)
 * 5. 마커 클러스터링 로직
 * 6. 리스트-지도 연동 함수 (특정 마커로 이동, 마커 강조)
 *
 * @see {@link /docs/prd.md#22-Google-지도-연동} - PRD 문서의 Google 지도 연동 섹션
 */

/**
 * Google Maps API 타입 정의
 */
declare global {
  interface Window {
    google: typeof google;
    initMap?: () => void;
  }
}

interface UseGoogleMapOptions {
  /** 지도 컨테이너 ID */
  mapId?: string;
  /** 초기 중심 좌표 (위도, 경도) */
  initialCenter?: { lat: number; lng: number };
  /** 초기 줌 레벨 */
  initialZoom?: number;
  /** 관광지 목록 */
  tours?: TourItem[];
  /** 선택된 관광지 ID */
  selectedTourId?: string;
  /** 선택된 관광지 변경 핸들러 */
  onTourSelect?: (tourId: string) => void;
}

interface UseGoogleMapReturn {
  /** 지도 인스턴스 */
  map: google.maps.Map | null;
  /** 지도 로딩 상태 */
  isLoading: boolean;
  /** 지도 로드 에러 */
  error: Error | null;
  /** 특정 마커로 지도 이동 */
  panToMarker: (tourId: string) => void;
  /** 특정 마커 강조 */
  highlightMarker: (tourId: string) => void;
  /** InfoWindow 열기 */
  openInfoWindow: (tourId: string) => void;
  /** InfoWindow 닫기 */
  closeInfoWindow: () => void;
}

/**
 * Google Maps API 스크립트 로드
 */
function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있으면 즉시 resolve
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // 스크립트가 이미 로딩 중이면 해당 스크립트의 onload 이벤트를 기다림
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Google Maps API 스크립트 로드 실패")),
      );
      return;
    }

    // 새 스크립트 생성 및 로드
    // .env.local 파일의 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 환경변수 사용
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      reject(
        new Error(
          "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 환경변수가 설정되지 않았습니다.\n" +
            ".env.local 파일에 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY를 설정해주세요.",
        ),
      );
      return;
    }

    // API 키 유효성 검사 (기본적인 형식 확인)
    if (apiKey.trim() === "" || apiKey === "your_google_maps_api_key") {
      reject(
        new Error(
          "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY가 유효하지 않습니다.\n" +
            ".env.local 파일에 올바른 Google Maps API 키를 설정해주세요.",
        ),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("[useGoogleMap] Google Maps API 스크립트 로드 완료");
      resolve();
    };
    script.onerror = () => {
      console.error("[useGoogleMap] Google Maps API 스크립트 로드 실패");
      reject(
        new Error(
          "Google Maps API 스크립트 로드 실패.\n" +
            "API 키가 유효한지 확인하고, Google Cloud Console에서 Maps JavaScript API가 활성화되어 있는지 확인해주세요.",
        ),
      );
    };
    document.head.appendChild(script);
  });
}

/**
 * Google Maps 지도 관리 훅
 *
 * @param options - 설정 옵션
 * @returns 지도 인스턴스 및 제어 함수들
 */
export function useGoogleMap(
  options: UseGoogleMapOptions = {},
): UseGoogleMapReturn {
  const {
    mapId = "google-map",
    initialCenter = { lat: 37.5665, lng: 126.978 }, // 서울 기본 좌표
    initialZoom = 8,
    tours = [],
    selectedTourId,
    onTourSelect,
  } = options;

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<
    Map<string, google.maps.marker.AdvancedMarkerElement>
  >(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const selectedTourIdRef = useRef<string | undefined>(undefined);

  /**
   * Google Maps API 스크립트 로드 및 지도 초기화
   */
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 10;
    const retryDelay = 100; // 100ms

    async function initMap() {
      try {
        setIsLoading(true);
        setError(null);

        console.log("[useGoogleMap] 지도 초기화 시작, mapId:", mapId);

        // Google Maps API 스크립트 로드
        await loadGoogleMapsScript();

        if (!isMounted) return;

        // 지도 컨테이너 확인 (여러 번 시도)
        let mapContainer: HTMLElement | null = null;

        while (retryCount < maxRetries && !mapContainer) {
          mapContainer = document.getElementById(mapId);

          if (!mapContainer) {
            retryCount++;
            console.log(
              `[useGoogleMap] 지도 컨테이너를 찾을 수 없음 (시도 ${retryCount}/${maxRetries}), mapId: ${mapId}`,
            );

            if (retryCount < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
          }
        }

        if (!mapContainer) {
          throw new Error(
            `지도 컨테이너를 찾을 수 없습니다: ${mapId}\n` +
              "지도 컨테이너가 DOM에 렌더링되었는지 확인해주세요.",
          );
        }

        if (!isMounted) return;

        console.log(
          "[useGoogleMap] 지도 컨테이너 찾음, 지도 인스턴스 생성 시작",
        );

        // 지도 인스턴스 생성
        const mapInstance = new google.maps.Map(mapContainer, {
          center: initialCenter,
          zoom: initialZoom,
          mapId: "DEMO_MAP_ID", // 기본 맵 ID
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapRef.current = mapInstance;
        setMap(mapInstance);

        // InfoWindow 인스턴스 생성
        infoWindowRef.current = new google.maps.InfoWindow();

        console.log("[useGoogleMap] 지도 초기화 완료");
      } catch (err) {
        console.error("[useGoogleMap] 지도 초기화 실패:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("알 수 없는 오류"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [mapId, initialCenter.lat, initialCenter.lng, initialZoom]);

  /**
   * 관광지 목록을 마커로 변환하여 표시
   */
  useEffect(() => {
    if (!map || tours.length === 0) return;

    console.log("[useGoogleMap] 마커 생성 시작:", tours.length);

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current.clear();

    // 클러스터러 제거
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }

    // 새 마커 생성
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    tours.forEach((tour) => {
      try {
        // 좌표 유효성 검사
        if (
          !tour.mapx ||
          !tour.mapy ||
          tour.mapx.trim() === "" ||
          tour.mapy.trim() === ""
        ) {
          console.warn(
            `[useGoogleMap] 좌표가 없는 관광지 건너뛰기: ${tour.contentid} - ${tour.title}`,
          );
          return;
        }

        // 좌표 변환 (KATEC → WGS84)
        const { lat, lng } = convertTourCoordinates(tour.mapx, tour.mapy);

        // 변환된 좌표 유효성 검사
        if (
          isNaN(lat) ||
          isNaN(lng) ||
          !isFinite(lat) ||
          !isFinite(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        ) {
          console.warn(
            `[useGoogleMap] 유효하지 않은 좌표 변환 결과 건너뛰기: ${tour.contentid} - ${tour.title} (lat=${lat}, lng=${lng})`,
          );
          return;
        }

        // 마커 생성
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: tour.title,
        });

        // 마커 클릭 이벤트
        marker.addListener("click", () => {
          console.log("[useGoogleMap] 마커 클릭:", tour.contentid);
          if (onTourSelect) {
            onTourSelect(tour.contentid);
          }
          openInfoWindow(tour.contentid);
        });

        markersRef.current.set(tour.contentid, marker);
        newMarkers.push(marker);
      } catch (err) {
        console.error(
          `[useGoogleMap] 마커 생성 실패 (${tour.contentid}):`,
          err instanceof Error ? err.message : String(err),
        );
        // 에러가 발생해도 다른 마커는 계속 생성
      }
    });

    // 마커 클러스터링 적용
    if (newMarkers.length > 0) {
      clustererRef.current = new MarkerClusterer({
        map,
        markers: newMarkers,
      });
    }

    console.log("[useGoogleMap] 마커 생성 완료:", newMarkers.length);
  }, [map, tours, onTourSelect]);

  /**
   * 선택된 관광지에 따라 지도 이동 및 InfoWindow 표시
   */
  useEffect(() => {
    if (!map || !selectedTourId) return;

    // 이전 선택과 동일하면 무시
    if (selectedTourIdRef.current === selectedTourId) return;
    selectedTourIdRef.current = selectedTourId;

    panToMarker(selectedTourId);
    openInfoWindow(selectedTourId);
  }, [map, selectedTourId]);

  /**
   * 특정 마커로 지도 이동
   */
  const panToMarker = useCallback(
    (tourId: string) => {
      const marker = markersRef.current.get(tourId);
      if (!marker || !map) return;

      const position = marker.position;
      if (!position) return;

      // LatLngLiteral 또는 LatLng 객체에서 좌표 추출
      let lat: number;
      let lng: number;

      // position이 LatLngLiteral 객체인지 확인
      if (
        typeof position === "object" &&
        position !== null &&
        "lat" in position &&
        "lng" in position &&
        typeof (position as any).lat !== "function"
      ) {
        // LatLngLiteral 객체
        const pos = position as google.maps.LatLngLiteral;
        lat = pos.lat;
        lng = pos.lng;
      } else if (
        position &&
        typeof position === "object" &&
        "lat" in position &&
        typeof (position as any).lat === "function"
      ) {
        // LatLng 객체 (함수 형태)
        const latLng = position as google.maps.LatLng;
        lat = latLng.lat();
        lng = latLng.lng();
      } else {
        return;
      }

      map.panTo({ lat, lng });
      map.setZoom(15); // 줌 레벨 조정

      console.log("[useGoogleMap] 지도 이동:", tourId);
    },
    [map],
  );

  /**
   * 특정 마커 강조 (애니메이션 효과)
   */
  const highlightMarker = useCallback(
    (tourId: string) => {
      const marker = markersRef.current.get(tourId);
      if (!marker || !map) return;

      const position = marker.position;
      if (!position) return;

      // LatLngLiteral 또는 LatLng 객체에서 좌표 추출
      let lat: number;
      let lng: number;

      // position이 LatLngLiteral 객체인지 확인
      if (
        typeof position === "object" &&
        position !== null &&
        "lat" in position &&
        "lng" in position &&
        typeof (position as any).lat !== "function"
      ) {
        // LatLngLiteral 객체
        const pos = position as google.maps.LatLngLiteral;
        lat = pos.lat;
        lng = pos.lng;
      } else if (
        position &&
        typeof position === "object" &&
        "lat" in position &&
        typeof (position as any).lat === "function"
      ) {
        // LatLng 객체 (함수 형태)
        const latLng = position as google.maps.LatLng;
        lat = latLng.lat();
        lng = latLng.lng();
      } else {
        return;
      }

      // 지도를 해당 마커로 약간 이동 (애니메이션 효과)
      map.panTo({ lat, lng });

      // 마커 강조 효과 (간단한 구현)
      // 실제로는 마커 스타일을 변경하거나 애니메이션을 추가할 수 있습니다
      console.log("[useGoogleMap] 마커 강조:", tourId);
    },
    [map],
  );

  /**
   * InfoWindow 열기
   */
  const openInfoWindow = useCallback(
    (tourId: string) => {
      const marker = markersRef.current.get(tourId);
      if (!marker || !map || !infoWindowRef.current) return;

      const tour = tours.find((t) => t.contentid === tourId);
      if (!tour) return;

      const position = marker.position;
      if (!position) return;

      const lat =
        typeof position === "object" && "lat" in position
          ? position.lat
          : (position as google.maps.LatLng).lat();
      const lng =
        typeof position === "object" && "lng" in position
          ? position.lng
          : (position as google.maps.LatLng).lng();

      // InfoWindow 내용 생성
      const content = `
        <div style="padding: 12px; max-width: 300px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
            ${tour.title}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
            ${tour.addr1}
          </p>
          <a 
            href="/places/${tour.contentid}" 
            style="display: inline-block; padding: 6px 12px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;"
          >
            상세보기
          </a>
        </div>
      `;

      infoWindowRef.current.setContent(content);
      infoWindowRef.current.open({
        anchor: marker,
        map,
      });

      console.log("[useGoogleMap] InfoWindow 열기:", tourId);
    },
    [map, tours],
  );

  /**
   * InfoWindow 닫기
   */
  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      console.log("[useGoogleMap] InfoWindow 닫기");
    }
  }, []);

  return {
    map,
    isLoading,
    error,
    panToMarker,
    highlightMarker,
    openInfoWindow,
    closeInfoWindow,
  };
}
