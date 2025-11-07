"use client";

import {
  Heart,
  Ruler,
  MapPin,
  DollarSign,
  Car,
  Info,
  FileText,
} from "lucide-react";
import type { PetTourInfo } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * @file TourDetailPetTour.tsx
 * @description 반려동물 동반 여행 정보 섹션 컴포넌트
 *
 * 관광지의 반려동물 동반 여행 정보를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 반려동물 동반 가능 여부 표시
 * 2. 반려동물 크기/종류 제한 정보 표시
 * 3. 추가 요금 및 시설 정보 표시
 * 4. 주차장 정보 (반려동물 하차 공간)
 * 5. 산책로 정보
 * 6. 반려동물 배변 봉투 제공 여부
 * 7. 반려동물 음수대 위치
 *
 * @see {@link /docs/prd.md#25-반려동물-동반-여행} - PRD 문서의 반려동물 동반 여행 섹션
 */

interface TourDetailPetTourProps {
  petInfo: PetTourInfo | null;
  isLoading?: boolean;
  className?: string;
}

/**
 * 정보 항목 표시 컴포넌트
 */
function InfoItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | undefined;
  className?: string;
}) {
  if (!value) return null;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <p className="whitespace-pre-line text-base leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

/**
 * 반려동물 동반 여행 정보 섹션 컴포넌트
 */
export default function TourDetailPetTour({
  petInfo,
  isLoading,
  className,
}: TourDetailPetTourProps) {
  // 로딩 중이거나 데이터가 없는 경우 숨김
  if (isLoading || !petInfo) {
    return null;
  }

  // 표시할 정보가 있는지 확인
  const hasInfo =
    petInfo.chkpetleash ||
    petInfo.chkpetsize ||
    petInfo.chkpetplace ||
    petInfo.chkpetfee ||
    petInfo.petinfo ||
    petInfo.parking;

  // 정보가 하나도 없으면 숨김
  if (!hasInfo) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">🐾</span>
        <h2 className="text-2xl font-semibold">반려동물 동반 정보</h2>
      </div>

      <div className="flex flex-col gap-6">
        {/* 반려동물 동반 가능 여부 */}
        <InfoItem
          icon={Heart}
          label="반려동물 동반 가능 여부"
          value={petInfo.chkpetleash}
        />

        {/* 반려동물 크기 제한 */}
        <InfoItem
          icon={Ruler}
          label="반려동물 크기 제한"
          value={petInfo.chkpetsize}
        />

        {/* 입장 가능 장소 (실내/실외) */}
        <InfoItem
          icon={MapPin}
          label="입장 가능 장소"
          value={petInfo.chkpetplace}
        />

        {/* 추가 요금 */}
        <InfoItem
          icon={DollarSign}
          label="반려동물 동반 추가 요금"
          value={petInfo.chkpetfee}
        />

        {/* 주차장 정보 */}
        <InfoItem icon={Car} label="주차장 정보" value={petInfo.parking} />

        {/* 기타 반려동물 정보 */}
        <InfoItem
          icon={Info}
          label="기타 반려동물 정보"
          value={petInfo.petinfo}
        />
      </div>
    </div>
  );
}
