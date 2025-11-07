import type { Metadata } from "next";

/**
 * @file app/stats/page.tsx
 * @description 통계 대시보드 페이지
 *
 * 관광지 통계 정보를 시각화하여 표시하는 대시보드 페이지입니다.
 *
 * 주요 기능:
 * 1. 전체 통계 요약 (전체 관광지 수, Top 지역, Top 타입)
 * 2. 지역별 분포 차트 (Bar Chart)
 * 3. 타입별 분포 차트 (Pie Chart)
 * 4. 시간대별 트렌드 차트 (Line Chart)
 *
 * @see {@link /docs/TODO.md#phase-4-통계-대시보드-페이지-stats} - TODO 문서의 통계 대시보드 섹션
 */

/**
 * 메타데이터 생성 (SEO 최적화)
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "통계 대시보드 - My Trip",
    description: "관광지 통계 정보를 확인하고 분석하세요.",
    openGraph: {
      title: "통계 대시보드 - My Trip",
      description: "관광지 통계 정보를 확인하고 분석하세요.",
      type: "website",
      siteName: "My Trip",
    },
    twitter: {
      card: "summary",
      title: "통계 대시보드 - My Trip",
      description: "관광지 통계 정보를 확인하고 분석하세요.",
    },
  };
}

/**
 * 통계 대시보드 페이지 메인 컴포넌트
 */
export default async function StatsPage() {
  console.log("[StatsPage] 통계 대시보드 페이지 렌더링");

  return (
    <main className="min-h-[calc(100vh-80px)]">
      {/* 헤더 섹션 */}
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              통계 대시보드
            </h1>
            <p className="text-muted-foreground">
              관광지 통계 정보를 확인하고 분석하세요
            </p>
          </div>
        </div>
      </section>

      {/* 통계 요약 섹션 */}
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold sm:text-3xl">통계 요약</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* 통계 카드들이 여기에 표시됩니다 */}
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">전체 관광지 수</p>
                <p className="mt-2 text-2xl font-bold">-</p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Top 지역</p>
                <p className="mt-2 text-2xl font-bold">-</p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Top 타입</p>
                <p className="mt-2 text-2xl font-bold">-</p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">마지막 업데이트</p>
                <p className="mt-2 text-2xl font-bold">-</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 차트 섹션 */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            {/* 지역별 분포 차트 */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                지역별 분포
              </h2>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-center text-muted-foreground">
                  지역별 분포 차트가 여기에 표시됩니다
                </p>
              </div>
            </div>

            {/* 타입별 분포 차트 */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                타입별 분포
              </h2>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-center text-muted-foreground">
                  타입별 분포 차트가 여기에 표시됩니다
                </p>
              </div>
            </div>

            {/* 시간대별 트렌드 차트 */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                시간대별 트렌드
              </h2>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-center text-muted-foreground">
                  시간대별 트렌드 차트가 여기에 표시됩니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
