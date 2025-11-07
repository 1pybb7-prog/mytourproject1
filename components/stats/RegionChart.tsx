"use client";

import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RegionStats } from "@/lib/types/stats";
import { cn } from "@/lib/utils";

/**
 * @file RegionChart.tsx
 * @description 지역별 분포 차트 컴포넌트
 *
 * 지역별 관광지 개수를 Bar Chart로 시각화하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 Bar Chart 표시
 * 2. 바 클릭 시 해당 지역 목록 페이지로 이동
 * 3. 호버 시 정확한 개수 표시
 * 4. 다크/라이트 모드 지원
 * 5. 반응형 디자인
 * 6. 로딩 상태
 * 7. 접근성 (ARIA 라벨, 키보드 네비게이션)
 *
 * @see {@link /docs/TODO.md#phase-4-통계-대시보드-페이지-stats} - TODO 문서의 통계 대시보드 섹션
 */

interface RegionChartProps {
  /** 지역별 통계 데이터 */
  data?: RegionStats[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 차트 색상 팔레트 (카테고리별로 다른 색상 적용)
 * CSS 변수를 직접 사용 (oklch 형식)
 */
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

/**
 * 차트 설정
 */
const chartConfig: ChartConfig = {
  count: {
    label: "관광지 개수",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

/**
 * 지역별 분포 차트 스켈레톤
 */
function RegionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[600px] w-full" />
      </CardContent>
    </Card>
  );
}

/**
 * 지역별 분포 차트 컴포넌트
 */
export default function RegionChart({
  data,
  isLoading = false,
  className,
}: RegionChartProps) {
  const router = useRouter();

  console.log("[RegionChart] 렌더링:", { isLoading, dataCount: data?.length });

  // 로딩 상태
  if (isLoading || !data) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <RegionChartSkeleton />
      </div>
    );
  }

  // 데이터가 없을 때
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>지역별 분포</CardTitle>
          <CardDescription>지역별 관광지 개수를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[600px] items-center justify-center">
            <p className="text-sm text-muted-foreground">데이터가 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 차트 데이터 준비 (상위 10개 지역만 표시, 각 지역별로 다른 색상 적용)
  const chartData = data.slice(0, 10).map((region, index) => ({
    name: region.name,
    count: region.count,
    areacode: region.areacode,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  console.log(
    "[RegionChart] 차트 데이터 색상:",
    chartData.map((item) => ({
      name: item.name,
      color: item.color,
    })),
  );

  /**
   * 바 클릭 핸들러
   * 해당 지역의 관광지 목록 페이지로 이동
   */
  const handleBarClick = (data: { areacode: string; name: string }) => {
    console.log("[RegionChart] 바 클릭:", data);
    // 홈페이지로 이동하고 지역 필터 적용
    router.push(`/?areaCode=${data.areacode}`);
  };

  /**
   * 툴팁 포맷터
   * 호버 시 정확한 개수 표시
   */
  const tooltipFormatter = (value: number) => {
    return [`${value.toLocaleString("ko-KR")}개`, "관광지 개수"];
  };

  /**
   * 라벨 포맷터
   * X축 라벨 포맷팅
   */
  const labelFormatter = (label: string) => {
    return label;
  };

  /**
   * 커스텀 바 렌더러
   * 각 바마다 다른 색상을 적용하고 호버 효과 추가
   */
  const renderCustomBar = (props: any) => {
    const { payload, x, y, width, height } = props;
    const color = payload.color || CHART_COLORS[0];

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        rx={4}
        style={{
          cursor: "pointer",
          transition: "opacity 0.2s ease, filter 0.2s ease",
        }}
        onClick={() => {
          handleBarClick({
            areacode: payload.areacode,
            name: payload.name,
          });
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.85";
          e.currentTarget.style.filter = "brightness(1.15) saturate(1.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.filter = "brightness(1) saturate(1)";
        }}
      />
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>지역별 분포</CardTitle>
          <CardDescription>
            지역별 관광지 개수를 확인하세요 (상위 10개 지역)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[600px] w-full">
            <BarChart
              data={chartData}
              margin={{
                top: 40,
                right: 60,
                left: 40,
                bottom: 120,
              }}
              accessibilityLayer
              role="img"
              aria-label="지역별 관광지 개수 분포 차트"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => value.toLocaleString("ko-KR")}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={tooltipFormatter}
                    labelFormatter={labelFormatter}
                  />
                }
              />
              <Bar
                dataKey="count"
                shape={renderCustomBar}
                role="button"
                aria-label="지역별 관광지 개수 바"
              />
            </BarChart>
          </ChartContainer>

          {/* 접근성을 위한 테이블 (스크린 리더용) */}
          <div className="sr-only">
            <table>
              <caption>지역별 관광지 개수</caption>
              <thead>
                <tr>
                  <th>지역</th>
                  <th>관광지 개수</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item) => (
                  <tr key={item.areacode}>
                    <td>{item.name}</td>
                    <td>{item.count.toLocaleString("ko-KR")}개</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
