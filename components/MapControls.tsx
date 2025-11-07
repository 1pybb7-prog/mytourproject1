"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Navigation, Maximize, Minimize, Ruler, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file MapControls.tsx
 * @description 지도 컨트롤 버튼 컴포넌트
 *
 * 지도 위에 오버레이로 표시되는 컨트롤 버튼들을 제공합니다.
 *
 * 주요 기능:
 * 1. 현재 위치로 이동 버튼
 * 2. 전체화면 모드 토글 버튼
 * 3. 거리 측정 도구 토글 버튼
 * 4. 로드뷰 버튼 (선택 사항)
 *
 * @see {@link /docs/TODO.md#지도-컨트롤} - TODO 문서의 지도 컨트롤 섹션
 */

interface MapControlsProps {
  /** 지도 인스턴스 */
  map: naver.maps.Map | null;
  /** 전체화면 모드 여부 */
  isFullscreen?: boolean;
  /** 전체화면 모드 토글 핸들러 */
  onFullscreenToggle?: () => void;
  /** 현재 위치로 이동 핸들러 */
  onCurrentLocation?: () => void;
  /** 거리 측정 모드 여부 */
  isMeasuring?: boolean;
  /** 거리 측정 모드 토글 핸들러 */
  onMeasuringToggle?: () => void;
  /** 로드뷰 핸들러 */
  onRoadView?: () => void;
  /** 추가 클래스명 */
  className?: string;
  /** 컨트롤 위치 (기본값: 'bottom-right') */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

/**
 * 지도 컨트롤 버튼 컴포넌트
 */
export default function MapControls({
  map,
  isFullscreen = false,
  onFullscreenToggle,
  onCurrentLocation,
  isMeasuring = false,
  onMeasuringToggle,
  onRoadView,
  className,
  position = "bottom-right",
}: MapControlsProps) {
  const [isLocating, setIsLocating] = useState(false);

  /**
   * 현재 위치로 이동
   */
  const handleCurrentLocation = useCallback(async () => {
    if (!onCurrentLocation) {
      return;
    }

    setIsLocating(true);
    console.log("[MapControls] 현재 위치 요청");

    try {
      await onCurrentLocation();
      console.log("[MapControls] 현재 위치로 이동 완료");
    } catch (error) {
      console.error("[MapControls] 현재 위치로 이동 실패:", error);
      const errorMessage =
        error instanceof Error ? error.message : "위치를 가져올 수 없습니다.";
      alert(errorMessage);
    } finally {
      setIsLocating(false);
    }
  }, [onCurrentLocation]);

  // 위치 클래스 결정
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <div
      className={cn(
        "absolute z-10 flex flex-col gap-2",
        positionClasses[position],
        className,
      )}
    >
      {/* 현재 위치로 이동 버튼 */}
      {onCurrentLocation && (
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 shadow-lg"
          onClick={handleCurrentLocation}
          disabled={isLocating || !map}
          title="현재 위치로 이동"
        >
          <Navigation className={cn("h-5 w-5", isLocating && "animate-spin")} />
        </Button>
      )}

      {/* 전체화면 모드 토글 버튼 */}
      {onFullscreenToggle && (
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 shadow-lg"
          onClick={onFullscreenToggle}
          title={isFullscreen ? "전체화면 종료" : "전체화면"}
        >
          {isFullscreen ? (
            <Minimize className="h-5 w-5" />
          ) : (
            <Maximize className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* 거리 측정 도구 토글 버튼 */}
      {onMeasuringToggle && (
        <Button
          size="icon"
          variant={isMeasuring ? "default" : "secondary"}
          className="h-10 w-10 shadow-lg"
          onClick={onMeasuringToggle}
          title={isMeasuring ? "거리 측정 종료" : "거리 측정"}
        >
          <Ruler className="h-5 w-5" />
        </Button>
      )}

      {/* 로드뷰 버튼 */}
      {onRoadView && (
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 shadow-lg"
          onClick={onRoadView}
          title="로드뷰"
        >
          <MapPin className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
