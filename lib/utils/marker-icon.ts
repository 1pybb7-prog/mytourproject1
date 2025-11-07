/**
 * @file marker-icon.ts
 * @description 관광 타입별 마커 아이콘 생성 유틸리티
 *
 * 관광 타입(contenttypeid)에 따라 다른 색상과 아이콘을 가진 마커를 생성합니다.
 *
 * 주요 기능:
 * 1. 관광 타입별 색상 매핑
 * 2. 관광 타입별 아이콘(이모지) 매핑
 * 3. 마커 HTML 생성 함수
 *
 * @see {@link /docs/TODO.md#마커-아이콘-커스터마이징} - TODO 문서의 마커 아이콘 섹션
 */

import type { TourItem } from "@/lib/types/tour";

/**
 * 관광 타입별 색상 매핑
 */
const TOUR_TYPE_COLORS: Record<string, string> = {
  "12": "#4285f4", // 관광지 - 파란색
  "14": "#9c27b0", // 문화시설 - 보라색
  "15": "#f44336", // 축제/행사 - 빨간색
  "25": "#00bcd4", // 여행코스 - 청록색
  "28": "#4caf50", // 레포츠 - 초록색
  "32": "#ff9800", // 숙박 - 주황색
  "38": "#e91e63", // 쇼핑 - 분홍색
  "39": "#ff5722", // 음식점 - 주황빨강
};

/**
 * 관광 타입별 아이콘(이모지) 매핑
 */
const TOUR_TYPE_ICONS: Record<string, string> = {
  "12": "🏛️", // 관광지
  "14": "🎭", // 문화시설
  "15": "🎉", // 축제/행사
  "25": "🗺️", // 여행코스
  "28": "⚽", // 레포츠
  "32": "🏨", // 숙박
  "38": "🛍️", // 쇼핑
  "39": "🍽️", // 음식점
};

/**
 * 관광 타입에 따른 색상 가져오기
 *
 * @param contenttypeid - 콘텐츠타입ID
 * @returns 색상 코드 (기본값: #ff4444)
 */
export function getTourTypeColor(contenttypeid: string): string {
  return TOUR_TYPE_COLORS[contenttypeid] || "#ff4444";
}

/**
 * 관광 타입에 따른 아이콘 가져오기
 *
 * @param contenttypeid - 콘텐츠타입ID
 * @returns 아이콘 이모지 (기본값: 📍)
 */
export function getTourTypeIcon(contenttypeid: string): string {
  return TOUR_TYPE_ICONS[contenttypeid] || "📍";
}

/**
 * 관광지 정보로 마커 아이콘 HTML 생성
 *
 * @param tour - 관광지 정보
 * @param size - 마커 크기 (기본값: 30)
 * @returns 마커 아이콘 HTML 문자열
 */
export function createMarkerIconHTML(
  tour: TourItem,
  size: number = 30,
): string {
  const color = getTourTypeColor(tour.contenttypeid);
  const icon = getTourTypeIcon(tour.contenttypeid);
  const anchorX = size / 2;
  const anchorY = size;

  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(45deg);
        color: white;
        font-size: ${size * 0.5}px;
        line-height: 1;
      ">
        ${icon}
      </div>
    </div>
  `;
}

/**
 * Naver Maps 마커 아이콘 옵션 생성
 *
 * @param tour - 관광지 정보
 * @param naverMaps - Naver Maps API 객체
 * @param size - 마커 크기 (기본값: 30)
 * @returns Naver Maps 마커 아이콘 옵션
 */
export function createMarkerIcon(
  tour: TourItem,
  naverMaps: typeof naver.maps,
  size: number = 30,
): naver.maps.MarkerOptions["icon"] {
  const anchorX = size / 2;
  const anchorY = size;

  return {
    content: createMarkerIconHTML(tour, size),
    anchor: new naverMaps.Point(anchorX, anchorY),
  };
}
