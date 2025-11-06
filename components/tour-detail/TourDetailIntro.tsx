"use client";

import {
  Clock,
  CalendarX,
  DollarSign,
  Car,
  Users,
  Baby,
  Heart,
  CreditCard,
  Phone,
  FileText,
} from "lucide-react";
import type { TourIntro } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * @file TourDetailIntro.tsx
 * @description 관광지 운영 정보 섹션 컴포넌트
 *
 * 관광지의 운영 정보를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 운영시간, 휴무일, 이용요금, 주차 등 운영 정보 표시
 * 2. 관광 타입별로 다른 필드 표시
 * 3. 정보가 없는 경우 숨김 처리
 *
 * @see {@link /docs/prd.md#242-운영-정보-섹션} - PRD 문서의 운영 정보 섹션
 * @see {@link /docs/reference/design/Design.md#3-상세페이지} - 디자인 문서의 상세페이지
 */

interface TourDetailIntroProps {
  intro: TourIntro | null;
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
 * 관광지 운영 정보 섹션 컴포넌트
 */
export default function TourDetailIntro({
  intro,
  isLoading,
  className,
}: TourDetailIntroProps) {
  // 로딩 중이거나 데이터가 없는 경우 숨김
  if (isLoading || !intro) {
    return null;
  }

  // 표시할 정보가 있는지 확인
  const hasInfo =
    intro.usetime ||
    intro.restdate ||
    intro.usefee ||
    intro.parking ||
    intro.accomcount ||
    intro.expguide ||
    intro.chkbabycarriage ||
    intro.chkpet ||
    intro.chkcreditcard ||
    intro.infocenter;

  // 정보가 하나도 없으면 숨김
  if (!hasInfo) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <h2 className="text-2xl font-semibold">운영 정보</h2>

      <div className="flex flex-col gap-6">
        {/* 운영시간 */}
        <InfoItem icon={Clock} label="운영시간" value={intro.usetime} />

        {/* 휴무일 */}
        <InfoItem icon={CalendarX} label="휴무일" value={intro.restdate} />

        {/* 이용요금 */}
        <InfoItem icon={DollarSign} label="이용요금" value={intro.usefee} />

        {/* 주차 */}
        <InfoItem icon={Car} label="주차" value={intro.parking} />

        {/* 수용인원 */}
        <InfoItem icon={Users} label="수용인원" value={intro.accomcount} />

        {/* 체험 프로그램 */}
        <InfoItem
          icon={FileText}
          label="체험 프로그램"
          value={intro.expguide}
        />

        {/* 유모차 대여 */}
        <InfoItem
          icon={Baby}
          label="유모차 대여"
          value={intro.chkbabycarriage}
        />

        {/* 반려동물 동반 */}
        <InfoItem icon={Heart} label="반려동물 동반" value={intro.chkpet} />

        {/* 장애인 편의시설 */}
        <InfoItem
          icon={CreditCard}
          label="장애인 편의시설"
          value={intro.chkcreditcard}
        />

        {/* 문의처 */}
        <InfoItem icon={Phone} label="문의처" value={intro.infocenter} />
      </div>
    </div>
  );
}
