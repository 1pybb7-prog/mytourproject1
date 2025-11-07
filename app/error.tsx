"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

/**
 * @file error.tsx
 * @description 에러 페이지 컴포넌트
 *
 * Next.js App Router의 에러 바운더리입니다.
 * 서버 컴포넌트나 레이아웃에서 발생한 에러를 캐치합니다.
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (향후 에러 리포팅 서비스 연동 가능)
    console.error("[Error Page] 에러 발생:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold">오류가 발생했습니다</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {error.message ||
              "예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요."}
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">
              에러 ID: {error.digest}
            </p>
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={reset} variant="outline">
            <RefreshCw className="mr-2 size-4" />
            다시 시도
          </Button>
          <Button asChild variant="default">
            <Link href="/">
              <Home className="mr-2 size-4" />
              홈으로
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
