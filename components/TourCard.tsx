"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { TourItem } from "@/lib/types/tour";
import { getTourTypeName } from "@/lib/utils/tour-type-converter";
import { cn } from "@/lib/utils";

/**
 * @file TourCard.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 썸네일 이미지 표시 (next/image 사용)
 * 2. 관광지명, 주소, 타입 뱃지 표시
 * 3. 클릭 시 상세페이지로 이동
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 관광지 목록 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 카드 레이아웃
 */

interface TourCardProps {
  tour: TourItem;
  className?: string;
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 */
const DEFAULT_IMAGE_URL = "https://via.placeholder.com/400x300?text=No+Image";

export default function TourCard({ tour, className }: TourCardProps) {
  const imageUrl = tour.firstimage || tour.firstimage2 || DEFAULT_IMAGE_URL;
  const tourTypeName = getTourTypeName(tour.contenttypeid);
  const detailUrl = `/places/${tour.contentid}`;

  return (
    <Link
      href={detailUrl}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        className,
      )}
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={tour.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
        {/* 타입 뱃지 */}
        <div className="absolute right-2 top-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
            {tourTypeName}
          </span>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* 관광지명 */}
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary">
          {tour.title}
        </h3>

        {/* 주소 */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          <span className="line-clamp-2">{tour.addr1}</span>
        </div>

        {/* 전화번호 (있는 경우) */}
        {tour.tel && (
          <div className="text-sm text-muted-foreground">{tour.tel}</div>
        )}
      </div>
    </Link>
  );
}
