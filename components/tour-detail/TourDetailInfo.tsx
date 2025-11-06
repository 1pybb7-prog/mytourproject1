"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Globe, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TourDetail } from "@/lib/types/tour";
import { getTourTypeName } from "@/lib/utils/tour-type-converter";
import { Button } from "@/components/ui/button";
import ShareButton from "./ShareButton";
import { cn } from "@/lib/utils";

/**
 * @file TourDetailInfo.tsx
 * @description 관광지 상세 정보 섹션 컴포넌트
 *
 * 관광지의 기본 정보를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 관광지명, 대표 이미지, 주소, 전화번호, 홈페이지, 개요 표시
 * 2. 주소 복사 기능 (클립보드)
 * 3. 전화번호 클릭 시 전화 연결
 * 4. 홈페이지 링크
 *
 * @see {@link /docs/prd.md#241-기본-정보-섹션} - PRD 문서의 기본 정보 섹션
 * @see {@link /docs/reference/design/Design.md#3-상세페이지} - 디자인 문서의 상세페이지
 */

interface TourDetailInfoProps {
  detail: TourDetail;
  className?: string;
}

export default function TourDetailInfo({
  detail,
  className,
}: TourDetailInfoProps) {
  const [copied, setCopied] = useState(false);

  const imageUrl = detail.firstimage || detail.firstimage2;
  const hasImage = Boolean(imageUrl);
  const fullAddress = detail.addr2
    ? `${detail.addr1} ${detail.addr2}`.trim()
    : detail.addr1;
  const tourTypeName = getTourTypeName(detail.contenttypeid);

  /**
   * 주소 복사 핸들러
   */
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      toast.success("주소가 복사되었습니다.");
      console.log("[TourDetailInfo] 주소 복사:", fullAddress);

      // 2초 후 복사 상태 초기화
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("[TourDetailInfo] 주소 복사 실패:", error);
      toast.error("주소 복사에 실패했습니다.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* 대표 이미지 */}
      {hasImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src={imageUrl}
            alt={detail.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
            priority
          />
        </div>
      )}

      {/* 기본 정보 */}
      <div className="flex flex-col gap-6">
        {/* 관광지명 및 타입 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="flex-1 text-3xl font-bold sm:text-4xl">
              {detail.title}
            </h1>
            <ShareButton size="sm" variant="outline" />
          </div>
          {tourTypeName && (
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {tourTypeName}
              </span>
            </div>
          )}
        </div>

        {/* 주소 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <MapPin className="mt-1 size-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-base leading-relaxed">{fullAddress}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAddress}
                className="w-fit gap-2"
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    주소 복사
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 전화번호 */}
        {detail.tel && (
          <div className="flex items-center gap-2">
            <Phone className="size-5 shrink-0 text-muted-foreground" />
            <a
              href={`tel:${detail.tel.replace(/[^0-9]/g, "")}`}
              className="text-base text-primary hover:underline"
            >
              {detail.tel}
            </a>
          </div>
        )}

        {/* 홈페이지 */}
        {detail.homepage && (
          <div className="flex items-center gap-2">
            <Globe className="size-5 shrink-0 text-muted-foreground" />
            <Link
              href={detail.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-base text-primary hover:underline"
            >
              {detail.homepage}
            </Link>
          </div>
        )}

        {/* 개요 */}
        {detail.overview && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">개요</h2>
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {detail.overview}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
