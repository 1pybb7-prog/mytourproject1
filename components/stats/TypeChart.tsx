"use client";

import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
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
import type { TypeStats } from "@/lib/types/stats";
import { cn } from "@/lib/utils";

/**
 * @file TypeChart.tsx
 * @description 타입별 분포 차트 컴포넌트
 *
 * 관광 타입별 관광지 개수를 Donut Chart로 시각화하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 타입별 관광지 개수 Donut Chart 표시
 * 2. 타입별 비율 및 개수 표시
 * 3. 섹션 클릭 시 해당 타입 목록 페이지로 이동
 * 4. 호버 시 타입명, 개수, 비율 표시
 * 5. 다크/라이트 모드 지원
 * 6. 반응형 디자인
 * 7. 로딩 상태
 * 8. 접근성 (ARIA 라벨)
 *
 * @see {@link /docs/TODO.md#phase-4-통계-대시보드-페이지-stats} - TODO 문서의 통계 대시보드 섹션
 */

interface TypeChartProps {
  /** 타입별 통계 데이터 */
  data?: TypeStats[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 차트 색상 설정
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
 * 타입별 분포 차트 스켈레톤
 */
function TypeChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[600px] w-full rounded-full" />
      </CardContent>
    </Card>
  );
}

/**
 * 타입별 분포 차트 컴포넌트
 */
export default function TypeChart({
  data,
  isLoading = false,
  className,
}: TypeChartProps) {
  const router = useRouter();

  console.log("[TypeChart] 렌더링:", { isLoading, dataCount: data?.length });

  // 로딩 상태
  if (isLoading || !data) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <TypeChartSkeleton />
      </div>
    );
  }

  // 데이터가 없을 때
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>타입별 분포</CardTitle>
          <CardDescription>
            관광 타입별 관광지 개수를 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[600px] items-center justify-center">
            <p className="text-sm text-muted-foreground">데이터가 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 전체 개수 계산
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  // 차트 데이터 준비 (비율 포함, 각 타입별로 다른 색상 적용)
  const chartData = data.map((type, index) => ({
    name: type.name,
    count: type.count,
    contenttypeid: type.contenttypeid,
    percentage: totalCount > 0 ? (type.count / totalCount) * 100 : 0,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  console.log(
    "[TypeChart] 차트 데이터 색상:",
    chartData.map((item) => ({
      name: item.name,
      color: item.color,
    })),
  );

  /**
   * 섹션 클릭 핸들러
   * 해당 타입의 관광지 목록 페이지로 이동
   */
  const handlePieClick = (data: { contenttypeid: string; name: string }) => {
    console.log("[TypeChart] 섹션 클릭:", data);
    // 홈페이지로 이동하고 타입 필터 적용
    router.push(`/?contentTypeId=${data.contenttypeid}`);
  };

  /**
   * 툴팁 포맷터
   * 호버 시 타입명, 개수, 비율 표시
   */
  const tooltipFormatter = (value: number, name: string, props: any) => {
    const percentage = props.payload.percentage;
    return [
      `${value.toLocaleString("ko-KR")}개 (${percentage.toFixed(1)}%)`,
      name,
    ];
  };

  /**
   * 라벨 포맷터
   * 차트에 표시할 라벨 포맷팅
   */
  const labelFormatter = (label: string) => {
    return label;
  };

  /**
   * 커스텀 라벨 렌더러
   * Donut Chart 중앙에 총 개수 표시
   */
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // 라벨이 너무 작으면 표시하지 않음
    if (percent < 0.05) {
      return null;
    }

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-medium"
        fontSize={14}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>타입별 분포</CardTitle>
          <CardDescription>
            관광 타입별 관광지 개수와 비율을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-[600px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="40%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={200}
                  innerRadius={120}
                  dataKey="count"
                  onClick={(data) => {
                    handlePieClick({
                      contenttypeid: data.contenttypeid,
                      name: data.name,
                    });
                  }}
                  style={{ cursor: "pointer" }}
                  role="button"
                  aria-label="타입별 관광지 개수 도넛 차트"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{
                        cursor: "pointer",
                        transition: "opacity 0.2s ease, filter 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.8";
                        e.currentTarget.style.filter = "brightness(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.filter = "brightness(1)";
                      }}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={tooltipFormatter}
                      labelFormatter={labelFormatter}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>

            {/* 중앙 총 개수 표시 */}
            <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-4xl font-bold">
                {totalCount.toLocaleString("ko-KR")}
              </p>
              <p className="text-sm text-muted-foreground">전체 관광지</p>
            </div>

            {/* 커스텀 범례: 4개씩 2줄로 표시 */}
            <div className="absolute bottom-0 left-0 right-0 mt-4">
              <div className="flex flex-col gap-4">
                {/* 첫 번째 줄: 처음 4개 */}
                <div className="grid grid-cols-4 gap-4">
                  {chartData.slice(0, 4).map((entry, index) => (
                    <div
                      key={`legend-${index}`}
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        handlePieClick({
                          contenttypeid: entry.contenttypeid,
                          name: entry.name,
                        });
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm truncate">
                        {entry.name} ({entry.count.toLocaleString("ko-KR")}개)
                      </span>
                    </div>
                  ))}
                </div>
                {/* 두 번째 줄: 나머지 4개 */}
                {chartData.length > 4 && (
                  <div className="grid grid-cols-4 gap-4">
                    {chartData.slice(4, 8).map((entry, index) => (
                      <div
                        key={`legend-${index + 4}`}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                          handlePieClick({
                            contenttypeid: entry.contenttypeid,
                            name: entry.name,
                          });
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm truncate">
                          {entry.name} ({entry.count.toLocaleString("ko-KR")}개)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 접근성을 위한 테이블 (스크린 리더용) */}
          <div className="sr-only">
            <table>
              <caption>타입별 관광지 개수 및 비율</caption>
              <thead>
                <tr>
                  <th>타입</th>
                  <th>개수</th>
                  <th>비율</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item) => (
                  <tr key={item.contenttypeid}>
                    <td>{item.name}</td>
                    <td>{item.count.toLocaleString("ko-KR")}개</td>
                    <td>{item.percentage.toFixed(1)}%</td>
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
