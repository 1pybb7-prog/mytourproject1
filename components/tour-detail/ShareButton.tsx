"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * @file ShareButton.tsx
 * @description 관광지 상세페이지 공유 버튼 컴포넌트
 *
 * URL 복사 기능을 제공하는 공유 버튼 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 현재 페이지 URL을 클립보드에 복사
 * 2. 복사 완료 토스트 메시지 표시
 * 3. 에러 처리 (클립보드 API 실패 시)
 *
 * @see {@link /docs/prd.md#245-추가-기능} - PRD 문서의 공유하기 섹션
 * @see {@link /docs/reference/design/Design.md#3-상세페이지} - 디자인 문서의 상세페이지
 */

interface ShareButtonProps {
  /** 공유할 페이지 URL (선택사항, 기본값: 현재 페이지 URL) */
  url?: string;
  /** 버튼 크기 (선택사항) */
  size?: "default" | "sm" | "lg" | "icon";
  /** 버튼 스타일 (선택사항) */
  variant?: "default" | "outline" | "ghost" | "secondary";
  /** 추가 클래스명 (선택사항) */
  className?: string;
}

/**
 * 공유 버튼 컴포넌트
 *
 * 현재 페이지 URL을 클립보드에 복사하는 기능을 제공합니다.
 */
export default function ShareButton({
  url,
  size = "default",
  variant = "outline",
  className,
}: ShareButtonProps) {
  /**
   * URL 복사 핸들러
   */
  const handleShare = async () => {
    try {
      // URL이 제공되지 않으면 현재 페이지 URL 사용
      const shareUrl = url || window.location.href;

      // 클립보드 API 사용 가능 여부 확인
      if (!navigator.clipboard) {
        // Fallback: 구형 브라우저 지원
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          document.body.removeChild(textArea);
          toast.success("링크가 복사되었습니다.");
          console.log("[ShareButton] URL 복사 (fallback):", shareUrl);
        } catch (err) {
          document.body.removeChild(textArea);
          throw err;
        }
        return;
      }

      // 클립보드 API 사용
      await navigator.clipboard.writeText(shareUrl);
      toast.success("링크가 복사되었습니다.");
      console.log("[ShareButton] URL 복사:", shareUrl);
    } catch (error) {
      console.error("[ShareButton] URL 복사 실패:", error);
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
      aria-label="페이지 링크 복사"
    >
      <Share2 className="size-4" />
      공유하기
    </Button>
  );
}
