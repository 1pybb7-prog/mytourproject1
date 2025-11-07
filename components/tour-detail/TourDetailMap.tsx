"use client";

import { useMemo } from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourDetail } from "@/lib/types/tour";
import { convertTourCoordinates } from "@/lib/utils/coordinate-converter";
import { cn } from "@/lib/utils";

/**
 * @file TourDetailMap.tsx
 * @description 관광지 상세페이지 위치 정보 컴포넌트
 *
 * 관광지의 위치 정보를 표시하고, 외부 지도 서비스 연동 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. "길찾기" 버튼 (Naver Maps 길찾기 링크)
 * 2. "지도에서 보기" 버튼 (Naver Maps 웹/앱 연동)
 *
 * @see {@link /docs/prd.md#244-지도-섹션} - PRD 문서의 지도 섹션
 * @see {@link /docs/reference/design/Design.md#3-상세페이지} - 디자인 문서의 상세페이지
 */

interface TourDetailMapProps {
  detail: TourDetail;
  className?: string;
}

/**
 * Naver Maps 길찾기 URL 생성
 *
 * @param lat - 위도
 * @param lng - 경도
 * @returns Naver Maps 길찾기 URL
 */
function getDirectionsUrl(lat: number, lng: number): string {
  return `https://map.naver.com/v5/directions/-/-/${lng},${lat}/?c=15,0,0,0,dh`;
}

/**
 * Naver Maps 지도 보기 URL 생성
 *
 * @param lat - 위도
 * @param lng - 경도
 * @param title - 관광지명 (선택 사항)
 * @returns Naver Maps 지도 보기 URL
 */
function getMapUrl(lat: number, lng: number, title?: string): string {
  if (title) {
    // 검색 쿼리로 사용 (주소 또는 관광지명)
    const query = encodeURIComponent(title);
    return `https://map.naver.com/v5/search/${query}`;
  }
  // 좌표로 직접 이동
  return `https://map.naver.com/v5/?c=${lng},${lat},15,0,0,0,dh`;
}

export default function TourDetailMap({
  detail,
  className,
}: TourDetailMapProps) {
  // 좌표 정규화 (KATEC → WGS84)
  const coordinates = useMemo(() => {
    try {
      if (!detail.mapx || !detail.mapy) {
        return null;
      }
      return convertTourCoordinates(detail.mapx, detail.mapy);
    } catch (error) {
      console.error("[TourDetailMap] 좌표 정규화 실패:", error);
      return null;
    }
  }, [detail.mapx, detail.mapy]);

  // 좌표가 없을 경우 처리
  if (!coordinates) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">위치 정보</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-5 shrink-0" />
            <p className="text-sm">위치 정보가 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  // 길찾기 URL
  const directionsUrl = getDirectionsUrl(coordinates.lat, coordinates.lng);
  // 지도 보기 URL
  const mapUrl = getMapUrl(coordinates.lat, coordinates.lng, detail.title);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* 섹션 제목 */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">위치 정보</h2>
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="size-5 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            {detail.addr1 && <p className="text-sm">{detail.addr1}</p>}
            {detail.addr2 && (
              <p className="text-sm text-muted-foreground/80">{detail.addr2}</p>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          variant="default"
          className="flex-1 gap-2"
          onClick={() => {
            console.log("[TourDetailMap] 길찾기 클릭:", directionsUrl);
          }}
        >
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <Navigation className="size-4" />
            길찾기
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => {
            console.log("[TourDetailMap] 지도에서 보기 클릭:", mapUrl);
          }}
        >
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="size-4" />
            지도에서 보기
          </a>
        </Button>
      </div>
    </div>
  );
}
