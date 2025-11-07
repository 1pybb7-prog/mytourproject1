import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BookmarkList from "@/components/bookmarks/BookmarkList";

/**
 * @file app/bookmarks/page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 인증된 사용자만 접근 가능
 * 2. 북마크한 관광지 목록 표시
 * 3. 정렬 옵션 (최신순, 이름순, 지역별)
 * 4. 일괄 삭제 기능
 *
 * @see {@link /docs/prd.md#261-북마크-추가-기능} - PRD 문서의 북마크 섹션
 */

/**
 * 메타데이터 생성 (SEO 최적화)
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "북마크 목록 - My Trip",
    description: "북마크한 관광지 목록을 확인하고 관리하세요.",
    openGraph: {
      title: "북마크 목록 - My Trip",
      description: "북마크한 관광지 목록을 확인하고 관리하세요.",
      type: "website",
      siteName: "My Trip",
    },
    twitter: {
      card: "summary",
      title: "북마크 목록 - My Trip",
      description: "북마크한 관광지 목록을 확인하고 관리하세요.",
    },
  };
}

/**
 * 북마크 목록 페이지 메인 컴포넌트
 */
export default async function BookmarksPage() {
  // 인증 확인
  const { userId } = await auth();

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!userId) {
    console.log(
      "[BookmarksPage] 인증되지 않은 사용자, 로그인 페이지로 리다이렉트",
    );
    redirect("/sign-in");
  }

  console.log("[BookmarksPage] 북마크 목록 페이지 렌더링:", { userId });

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col gap-6 md:gap-8">
        {/* 페이지 제목 */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold md:text-4xl">북마크 목록</h1>
          <p className="text-muted-foreground">
            북마크한 관광지 목록을 확인하고 관리하세요.
          </p>
        </div>

        {/* 북마크 목록 */}
        <BookmarkList />
      </div>
    </div>
  );
}
