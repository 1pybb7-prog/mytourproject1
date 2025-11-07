/**
 * @file marker-clusterer.ts
 * @description Naver Maps 마커 클러스터링 유틸리티
 *
 * Naver Maps에서 많은 마커를 효율적으로 표시하기 위한 클러스터링 기능을 제공합니다.
 * npm 패키지가 없으므로 직접 구현한 클러스터링 로직을 사용합니다.
 *
 * 주요 기능:
 * 1. 마커들을 거리 기반으로 클러스터링
 * 2. 클러스터 마커 생성 및 관리
 * 3. 줌 레벨에 따라 클러스터 표시/해제
 * 4. 클러스터 클릭 시 확대 기능
 *
 * @see {@link /docs/prd.md#22-naver-지도-연동} - PRD 문서의 지도 연동 섹션
 */

import type { TourItem } from "@/lib/types/tour";
import { convertTourCoordinates } from "./coordinate-converter";
import { createMarkerIcon } from "./marker-icon";

/**
 * 마커 데이터 타입
 */
export interface MarkerData {
  /** 관광지 정보 */
  tour: TourItem;
  /** Naver Maps 좌표 */
  position: {
    lat: number;
    lng: number;
  };
  /** 마커 인스턴스 (Naver Maps Marker) */
  marker?: naver.maps.Marker;
}

/**
 * 클러스터 데이터 타입
 */
export interface ClusterData {
  /** 클러스터 중심 좌표 */
  position: {
    lat: number;
    lng: number;
  };
  /** 클러스터에 포함된 마커들 */
  markers: MarkerData[];
  /** 클러스터 마커 인스턴스 */
  clusterMarker?: naver.maps.Marker;
}

/**
 * 마커 클러스터링 옵션
 */
export interface ClusterOptions {
  /** 클러스터링 최소 거리 (픽셀 단위, 기본값: 60) */
  minDistance?: number;
  /** 클러스터링 최소 줌 레벨 (기본값: 10) */
  minZoom?: number;
  /** 클러스터 마커 스타일 */
  clusterStyle?: {
    /** 배경색 */
    backgroundColor?: string;
    /** 텍스트 색상 */
    textColor?: string;
    /** 크기 */
    size?: number;
  };
}

/**
 * 두 좌표 간의 거리 계산 (픽셀 단위)
 *
 * @param pos1 - 첫 번째 좌표
 * @param pos2 - 두 번째 좌표
 * @param map - Naver Maps 인스턴스
 * @returns 픽셀 거리
 */
function getPixelDistance(
  pos1: { lat: number; lng: number },
  pos2: { lat: number; lng: number },
  map: naver.maps.Map,
): number {
  try {
    const proj = map.getProjection();

    // Projection이 null인 경우 (지도 초기화 실패 또는 인증 문제)
    if (!proj) {
      console.warn(
        "[getPixelDistance] Projection이 null입니다. 지도 인증을 확인하세요.",
      );
      // 대략적인 거리 계산 (위도/경도 차이의 평균)
      const latDiff = Math.abs(pos1.lat - pos2.lat);
      const lngDiff = Math.abs(pos1.lng - pos2.lng);
      return (latDiff + lngDiff) * 100000; // 대략적인 픽셀 변환
    }

    const point1 = proj.fromCoordToOffset(
      new naver.maps.LatLng(pos1.lat, pos1.lng),
    );
    const point2 = proj.fromCoordToOffset(
      new naver.maps.LatLng(pos2.lat, pos2.lng),
    );

    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;

    return Math.sqrt(dx * dx + dy * dy);
  } catch (error) {
    console.error("[getPixelDistance] 거리 계산 실패:", error);
    // 폴백: 간단한 유클리드 거리
    const latDiff = Math.abs(pos1.lat - pos2.lat);
    const lngDiff = Math.abs(pos1.lng - pos2.lng);
    return (latDiff + lngDiff) * 100000;
  }
}

/**
 * 클러스터 중심 좌표 계산
 *
 * @param markers - 마커 배열
 * @returns 중심 좌표
 */
function getClusterCenter(markers: MarkerData[]): {
  lat: number;
  lng: number;
} {
  if (markers.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const sum = markers.reduce(
    (acc, marker) => ({
      lat: acc.lat + marker.position.lat,
      lng: acc.lng + marker.position.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: sum.lat / markers.length,
    lng: sum.lng / markers.length,
  };
}

/**
 * 클러스터 마커 HTML 생성
 *
 * @param count - 클러스터에 포함된 마커 개수
 * @param style - 클러스터 스타일
 * @returns HTML 문자열
 */
function createClusterMarkerHTML(
  count: number,
  style: Required<ClusterOptions["clusterStyle"]>,
): string {
  return `
    <div style="
      width: ${style.size}px;
      height: ${style.size}px;
      background-color: ${style.backgroundColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${style.textColor};
      font-weight: bold;
      font-size: 12px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      cursor: pointer;
    ">
      ${count}
    </div>
  `;
}

/**
 * 관광지 목록을 마커 데이터로 변환
 *
 * @param tours - 관광지 목록
 * @returns 마커 데이터 배열
 */
export function createMarkerData(tours: TourItem[]): MarkerData[] {
  return tours
    .filter((tour) => tour.mapx && tour.mapy)
    .map((tour) => {
      try {
        const position = convertTourCoordinates(tour.mapx, tour.mapy);
        return {
          tour,
          position,
        };
      } catch (error) {
        console.error(
          `[createMarkerData] 좌표 변환 실패: ${tour.contentid}`,
          error,
        );
        return null;
      }
    })
    .filter((marker): marker is MarkerData => marker !== null);
}

/**
 * 마커들을 클러스터로 그룹화
 *
 * @param markers - 마커 데이터 배열
 * @param map - Naver Maps 인스턴스
 * @param options - 클러스터링 옵션
 * @returns 클러스터 배열
 */
export function clusterMarkers(
  markers: MarkerData[],
  map: naver.maps.Map,
  options: ClusterOptions = {},
): ClusterData[] {
  const { minDistance = 60, minZoom = 10 } = options;

  const currentZoom = map.getZoom();

  // 최소 줌 레벨 미만이면 클러스터링하지 않음
  if (currentZoom < minZoom) {
    return markers.map((marker) => ({
      position: marker.position,
      markers: [marker],
    }));
  }

  const clusters: ClusterData[] = [];
  const processed = new Set<number>();

  for (let i = 0; i < markers.length; i++) {
    if (processed.has(i)) continue;

    const cluster: MarkerData[] = [markers[i]];
    processed.add(i);

    // 현재 마커와 가까운 마커들을 찾아서 클러스터에 추가
    for (let j = i + 1; j < markers.length; j++) {
      if (processed.has(j)) continue;

      const distance = getPixelDistance(
        markers[i].position,
        markers[j].position,
        map,
      );

      if (distance < minDistance) {
        cluster.push(markers[j]);
        processed.add(j);
      }
    }

    // 클러스터 중심 좌표 계산
    const center = getClusterCenter(cluster);

    clusters.push({
      position: center,
      markers: cluster,
    });
  }

  return clusters;
}

/**
 * 클러스터 마커 생성
 *
 * @param cluster - 클러스터 데이터
 * @param map - Naver Maps 인스턴스
 * @param options - 클러스터링 옵션
 * @returns Naver Maps Marker 인스턴스
 */
export function createClusterMarker(
  cluster: ClusterData,
  map: naver.maps.Map,
  options: ClusterOptions = {},
): naver.maps.Marker {
  const { clusterStyle = {} } = options;

  const style = {
    backgroundColor: clusterStyle.backgroundColor || "#4285f4",
    textColor: clusterStyle.textColor || "#ffffff",
    size: clusterStyle.size || 40,
  };

  const html = createClusterMarkerHTML(cluster.markers.length, style);
  const position = new naver.maps.LatLng(
    cluster.position.lat,
    cluster.position.lng,
  );

  const marker = new naver.maps.Marker({
    position,
    map,
    icon: {
      content: html,
      anchor: new naver.maps.Point(style.size / 2, style.size / 2),
    },
    zIndex: 1000,
  });

  // 클러스터 클릭 시 확대
  naver.maps.Event.addListener(marker, "click", () => {
    if (cluster.markers.length === 0) return;

    // 첫 번째 마커로 경계 초기화
    const firstPos = cluster.markers[0].position;
    const bounds = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(firstPos.lat, firstPos.lng),
      new naver.maps.LatLng(firstPos.lat, firstPos.lng),
    );

    // 나머지 마커들로 경계 확장
    cluster.markers.forEach((m) => {
      bounds.extend(new naver.maps.LatLng(m.position.lat, m.position.lng));
    });

    map.fitBounds(bounds, {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    });
  });

  return marker;
}

/**
 * 개별 마커 생성
 *
 * @param markerData - 마커 데이터
 * @param map - Naver Maps 인스턴스
 * @returns Naver Maps Marker 인스턴스
 */
export function createMarker(
  markerData: MarkerData,
  map: naver.maps.Map,
): naver.maps.Marker {
  const position = new naver.maps.LatLng(
    markerData.position.lat,
    markerData.position.lng,
  );

  // 관광 타입별 아이콘 사용
  const icon = createMarkerIcon(markerData.tour, naver.maps, 30);

  const marker = new naver.maps.Marker({
    position,
    map,
    icon,
  });

  return marker;
}

/**
 * 마커 클러스터링 관리 클래스
 */
export class MarkerClusterer {
  private map: naver.maps.Map;
  private markers: MarkerData[] = [];
  private clusters: ClusterData[] = [];
  private clusterMarkers: naver.maps.Marker[] = [];
  private individualMarkers: naver.maps.Marker[] = [];
  private options: Required<ClusterOptions>;
  private updateTimeout: number | null = null;

  constructor(map: naver.maps.Map, options: ClusterOptions = {}) {
    this.map = map;
    this.options = {
      minDistance: options.minDistance || 60,
      minZoom: options.minZoom || 10,
      clusterStyle: {
        backgroundColor: options.clusterStyle?.backgroundColor || "#4285f4",
        textColor: options.clusterStyle?.textColor || "#ffffff",
        size: options.clusterStyle?.size || 40,
      },
    };

    // 지도 줌 변경 시 클러스터 업데이트
    naver.maps.Event.addListener(this.map, "zoom_changed", () => {
      this.debouncedUpdate();
    });

    // 지도 이동 시 클러스터 업데이트
    naver.maps.Event.addListener(this.map, "dragend", () => {
      this.debouncedUpdate();
    });
  }

  /**
   * 디바운스된 업데이트 함수
   */
  private debouncedUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    this.updateTimeout = window.setTimeout(() => {
      this.update();
    }, 100);
  }

  /**
   * 마커 추가
   *
   * @param tours - 관광지 목록
   */
  addMarkers(tours: TourItem[]) {
    const newMarkers = createMarkerData(tours);
    this.markers = [...this.markers, ...newMarkers];
    this.update();
  }

  /**
   * 모든 마커 제거
   */
  clearMarkers() {
    // 기존 마커 제거
    this.clusterMarkers.forEach((marker) => marker.setMap(null));
    this.individualMarkers.forEach((marker) => marker.setMap(null));

    this.markers = [];
    this.clusters = [];
    this.clusterMarkers = [];
    this.individualMarkers = [];
  }

  /**
   * 마커 업데이트
   */
  update() {
    // 기존 마커 제거
    this.clusterMarkers.forEach((marker) => marker.setMap(null));
    this.individualMarkers.forEach((marker) => marker.setMap(null));

    this.clusterMarkers = [];
    this.individualMarkers = [];

    if (this.markers.length === 0) {
      return;
    }

    // 클러스터링
    this.clusters = clusterMarkers(this.markers, this.map, this.options);

    // 클러스터 또는 개별 마커 생성
    this.clusters.forEach((cluster) => {
      if (cluster.markers.length > 1) {
        // 클러스터 마커 생성
        const clusterMarker = createClusterMarker(
          cluster,
          this.map,
          this.options,
        );
        this.clusterMarkers.push(clusterMarker);
      } else {
        // 개별 마커 생성
        const marker = createMarker(cluster.markers[0], this.map);
        this.individualMarkers.push(marker);
      }
    });
  }

  /**
   * 특정 마커 찾기
   *
   * @param contentId - 관광지 ID
   * @returns 마커 데이터 또는 null
   */
  findMarker(contentId: string): MarkerData | null {
    return this.markers.find((m) => m.tour.contentid === contentId) || null;
  }

  /**
   * 특정 마커로 지도 이동
   *
   * @param contentId - 관광지 ID
   */
  moveToMarker(contentId: string) {
    const marker = this.findMarker(contentId);
    if (marker) {
      const position = new naver.maps.LatLng(
        marker.position.lat,
        marker.position.lng,
      );
      this.map.setCenter(position);
      this.map.setZoom(15);
    }
  }

  /**
   * 인스턴스 정리
   */
  destroy() {
    this.clearMarkers();
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }
}
