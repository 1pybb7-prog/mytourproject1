"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TourImage } from "@/actions/get-tour-images";

/**
 * @file TourDetailGallery.tsx
 * @description 관광지 이미지 갤러리 컴포넌트
 *
 * 관광지의 이미지 갤러리를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 이미지 갤러리 표시 (그리드 레이아웃)
 * 2. 이미지 클릭 시 전체화면 모달
 * 3. 이미지 최적화 (next/image)
 *
 * @see {@link /docs/prd.md#243-이미지-갤러리} - PRD 문서의 이미지 갤러리 섹션
 * @see {@link /docs/reference/design/Design.md#3-상세페이지} - 디자인 문서의 상세페이지
 */

interface TourDetailGalleryProps {
  images: TourImage[];
  isLoading?: boolean;
  title?: string;
  className?: string;
}

/**
 * 이미지 모달 컴포넌트
 */
function ImageModal({
  image,
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  image: TourImage;
  images: TourImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
      <DialogTitle className="sr-only">
        {image.imagename || `이미지 ${currentIndex + 1}`}
      </DialogTitle>
      <div className="relative flex h-[95vh] w-full items-center justify-center bg-black">
        {/* 이미지 */}
        <div className="relative h-full w-full">
          <Image
            src={image.originimgurl || image.smallimageurl}
            alt={image.imagename || "관광지 이미지"}
            fill
            className="object-contain"
            sizes="95vw"
            priority
          />
        </div>

        {/* 닫기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
          aria-label="닫기"
        >
          <X className="size-6" />
        </Button>

        {/* 이전 버튼 */}
        {images.length > 1 && currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrev}
            className="absolute left-4 z-10 bg-black/50 text-white hover:bg-black/70"
            aria-label="이전 이미지"
          >
            <span className="text-2xl">‹</span>
          </Button>
        )}

        {/* 다음 버튼 */}
        {images.length > 1 && currentIndex < images.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="absolute right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            aria-label="다음 이미지"
          >
            <span className="text-2xl">›</span>
          </Button>
        )}

        {/* 이미지 카운터 */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </DialogContent>
  );
}

/**
 * 관광지 이미지 갤러리 컴포넌트
 */
export default function TourDetailGallery({
  images,
  isLoading,
  title,
  className,
}: TourDetailGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 로딩 중이거나 이미지가 없는 경우 숨김
  if (isLoading || !images || images.length === 0) {
    return null;
  }

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const handleNext = () => {
    if (selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  return (
    <>
      <div className={cn("flex flex-col gap-6", className)}>
        <h2 className="text-2xl font-semibold">{title || "이미지 갤러리"}</h2>

        {/* 이미지 그리드 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <button
              key={image.serialnum || index}
              onClick={() => handleImageClick(index)}
              className="group relative aspect-square w-full overflow-hidden rounded-lg bg-muted transition-transform hover:scale-[1.02]"
              aria-label={`${image.imagename || `이미지 ${index + 1}`} 보기`}
            >
              <Image
                src={image.smallimageurl || image.originimgurl}
                alt={image.imagename || `이미지 ${index + 1}`}
                fill
                className="object-cover transition-transform group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                loading="lazy"
              />
              {/* 호버 오버레이 */}
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </button>
          ))}
        </div>
      </div>

      {/* 이미지 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {images[selectedIndex] && (
          <ImageModal
            image={images[selectedIndex]}
            images={images}
            currentIndex={selectedIndex}
            onClose={() => setIsModalOpen(false)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
      </Dialog>
    </>
  );
}
