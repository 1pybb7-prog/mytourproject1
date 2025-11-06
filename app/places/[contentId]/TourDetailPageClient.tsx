"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TourDetailInfo from "@/components/tour-detail/TourDetailInfo";
import TourDetailMap from "@/components/tour-detail/TourDetailMap";
import TourDetailIntro from "@/components/tour-detail/TourDetailIntro";
import TourDetailGallery from "@/components/tour-detail/TourDetailGallery";
import { useTourDetail } from "@/hooks/useTourDetail";
import { useTourIntro } from "@/hooks/useTourIntro";
import { useTourImages } from "@/hooks/useTourImages";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * @file TourDetailPageClient.tsx
 * @description 관광지 상세페이지 클라이언트 컴포넌트
 *
 * React Query 훅을 사용하는 클라이언트 컴포넌트입니다.
 */

interface TourDetailPageClientProps {
  contentId: string;
}

/**
 * 상세페이지 클라이언트 컴포넌트
 */
export default function TourDetailPageClient({
  contentId,
}: TourDetailPageClientProps) {
  const { data: detail, isLoading, error } = useTourDetail(contentId);
  const { data: intro, isLoading: isLoadingIntro } = useTourIntro(
    contentId,
    detail?.contenttypeid || "",
  );
  const { data: images, isLoading: isLoadingImages } = useTourImages(contentId);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-4 p-6">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold">정보를 불러올 수 없습니다</h2>
          <p className="text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "오류가 발생했습니다. 잠시 후 다시 시도해주세요."}
          </p>
          <Link href="/">
            <Button variant="default">홈으로 가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-4 p-6">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold">
            관광지 정보를 찾을 수 없습니다
          </h2>
          <p className="text-muted-foreground">
            요청하신 관광지 정보가 존재하지 않습니다.
          </p>
          <Link href="/">
            <Button variant="default">홈으로 가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <main className="min-h-[calc(100vh-80px)]">
        {/* 뒤로가기 버튼 섹션 */}
        <section className="border-b bg-background">
          <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="size-4" />
                뒤로가기
              </Button>
            </Link>
          </div>
        </section>

        {/* 상세 정보 섹션 */}
        <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12">
            <TourDetailInfo detail={detail} />
            <TourDetailIntro intro={intro} isLoading={isLoadingIntro} />
            <TourDetailGallery
              images={images || []}
              isLoading={isLoadingImages}
              title={detail.title}
            />
            <TourDetailMap detail={detail} />
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
}
