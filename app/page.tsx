"use client";

import { useState, useEffect } from "react";
import TourList from "@/components/TourList";
import TourFilter from "@/components/TourFilter";
import TourSearch from "@/components/TourSearch";
import TourSort from "@/components/TourSort";
import TourPagination from "@/components/TourPagination";
import NaverMap from "@/components/NaverMap";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTourFilter } from "@/hooks/useTourFilter";
import { useTourSort } from "@/hooks/useTourSort";
import { useTourList } from "@/hooks/useTourList";
import { useTourSearch } from "@/hooks/useTourSearch";
import { List, Map } from "lucide-react";
import type { TourItem } from "@/lib/types/tour";

/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록 + 지도
 *
 * 홈페이지에서는 관광지 목록과 지도를 함께 표시합니다.
 * 검색 기능을 통해 키워드로 관광지를 검색할 수 있습니다.
 * 필터 기능을 통해 지역과 관광 타입으로 목록을 필터링할 수 있습니다.
 * 검색과 필터를 동시에 사용할 수 있습니다.
 *
 * 주요 기능:
 * 1. 관광지 목록 표시 (좌측 또는 상단)
 * 2. Naver 지도 표시 (우측 또는 하단)
 * 3. 리스트 항목 클릭 시 해당 마커로 지도 이동
 * 4. 리스트 항목 호버 시 해당 마커 강조 (선택 사항)
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 관광지 목록 섹션
 * @see {@link /docs/prd.md#23-키워드-검색} - PRD 문서의 키워드 검색 섹션
 * @see {@link /docs/prd.md#22-naver-지도-연동} - PRD 문서의 지도 연동 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 홈페이지 레이아웃
 */

export default function Home() {
  const { filters, setAreaCode, setContentTypeId, resetFilters } =
    useTourFilter();
  const { sortOption, setSortOption } = useTourSort();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  const [hoveredTourId, setHoveredTourId] = useState<string | undefined>();
  const numOfRows = 12; // 페이지당 항목 수

  // 검색 모드 여부 확인
  const isSearchMode = Boolean(searchKeyword && searchKeyword.trim() !== "");

  // 필터/검색 변경 시 페이지 리셋 및 선택 초기화
  useEffect(() => {
    setPageNo(1);
    setSelectedTourId(undefined);
    setHoveredTourId(undefined);
    console.log("[Home] 필터/검색 변경으로 페이지 1로 리셋");
  }, [filters.areaCode, filters.contentTypeId, searchKeyword]);

  // 일반 모드: useTourList 사용
  const listQuery = useTourList({
    areaCode: filters.areaCode,
    contentTypeId: filters.contentTypeId,
    numOfRows,
    pageNo,
  });

  // 검색 모드: useTourSearch 사용
  const searchQuery = useTourSearch({
    keyword: searchKeyword,
    areaCode: filters.areaCode,
    contentTypeId: filters.contentTypeId,
    numOfRows,
    pageNo,
    enabled: isSearchMode,
  });

  // 현재 사용할 데이터 결정
  const { data: tours = [], isLoading } = isSearchMode
    ? searchQuery
    : listQuery;

  /**
   * 검색 실행 핸들러
   */
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setPageNo(1); // 검색 시 페이지 1로 리셋
    console.log("[Home] 검색 실행:", keyword);
  };

  /**
   * 검색 초기화 핸들러
   */
  const handleSearchClear = () => {
    setSearchKeyword("");
    setPageNo(1); // 검색 초기화 시 페이지 1로 리셋
    console.log("[Home] 검색 초기화");
  };

  /**
   * 필터 변경 핸들러 (페이지 리셋 포함)
   */
  const handleAreaCodeChange = (areaCode: string | undefined) => {
    setAreaCode(areaCode);
    setPageNo(1);
    console.log("[Home] 지역 필터 변경:", areaCode);
  };

  const handleContentTypeIdChange = (contentTypeId: string | undefined) => {
    setContentTypeId(contentTypeId);
    setPageNo(1);
    console.log("[Home] 관광 타입 필터 변경:", contentTypeId);
  };

  /**
   * 페이지 변경 핸들러
   */
  const handlePageChange = (page: number) => {
    setPageNo(page);
    // 페이지 변경 시 스크롤을 상단으로 이동
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log("[Home] 페이지 변경:", page);
  };

  /**
   * 관광지 선택 핸들러
   * 리스트 항목 클릭 시 해당 마커로 지도 이동
   */
  const handleTourSelect = (tour: TourItem) => {
    console.log("[Home] 관광지 선택:", tour.title, tour.contentid);
    setSelectedTourId(tour.contentid);
    // 선택된 관광지로 스크롤 (모바일에서 유용)
    const element = document.getElementById(`tour-${tour.contentid}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  /**
   * 관광지 호버 핸들러
   * 리스트 항목 호버 시 해당 마커 강조 (선택 사항)
   */
  const handleTourHover = (tourId: string | undefined) => {
    console.log("[Home] 관광지 호버:", tourId);
    setHoveredTourId(tourId);
  };

  return (
    <main className="min-h-[calc(100vh-80px)]">
      {/* 헤더 섹션 */}
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              한국의 아름다운 관광지를 탐험하세요
            </h1>
            <p className="text-muted-foreground">
              전국의 다양한 관광지를 검색하고 둘러보세요
            </p>
          </div>
        </div>
      </section>

      {/* 검색 섹션 */}
      <section className="border-b bg-background">
        <TourSearch
          keyword={searchKeyword}
          onKeywordChange={setSearchKeyword}
          onSearch={handleSearch}
          onClear={handleSearchClear}
        />
      </section>

      {/* 필터 섹션 */}
      <section className="border-b bg-background">
        <TourFilter
          areaCode={filters.areaCode}
          contentTypeId={filters.contentTypeId}
          onAreaCodeChange={handleAreaCodeChange}
          onContentTypeIdChange={handleContentTypeIdChange}
          onReset={resetFilters}
        />
      </section>

      {/* 정렬 섹션 */}
      <section className="border-b bg-background">
        <TourSort sortOption={sortOption} onSortChange={setSortOption} />
      </section>

      {/* 관광지 목록 + 지도 섹션 */}
      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 모바일: 탭 형태로 리스트/지도 전환 */}
        <div className="lg:hidden">
          <Tabs defaultValue="list" className="flex flex-col gap-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="size-4" />
                <span>목록</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="size-4" />
                <span>지도</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="flex flex-col gap-6">
              <TourList
                keyword={searchKeyword}
                areaCode={filters.areaCode}
                contentTypeId={filters.contentTypeId}
                numOfRows={numOfRows}
                pageNo={pageNo}
                sortOption={sortOption}
                selectedTourId={selectedTourId}
                hoveredTourId={hoveredTourId}
                onTourSelect={handleTourSelect}
                onTourHover={handleTourHover}
              />
              {/* 페이지네이션 */}
              {!isLoading && tours.length > 0 && (
                <TourPagination
                  currentPage={pageNo}
                  itemsPerPage={numOfRows}
                  currentItemsCount={tours.length}
                  onPageChange={handlePageChange}
                />
              )}
            </TabsContent>

            <TabsContent value="map" className="flex flex-col gap-6" forceMount>
              <NaverMap
                tours={tours}
                selectedTourId={selectedTourId}
                onTourSelect={handleTourSelect}
                height="min-h-[400px]"
                enableClustering={true}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* 데스크톱: 리스트(좌측) + 지도(우측) 그리드 레이아웃 */}
        <div className="hidden lg:flex lg:flex-row lg:gap-6">
          {/* 리스트 뷰 (좌측 50%) */}
          <div className="flex flex-1 flex-col gap-6">
            <TourList
              keyword={searchKeyword}
              areaCode={filters.areaCode}
              contentTypeId={filters.contentTypeId}
              numOfRows={numOfRows}
              pageNo={pageNo}
              sortOption={sortOption}
              selectedTourId={selectedTourId}
              hoveredTourId={hoveredTourId}
              onTourSelect={handleTourSelect}
              onTourHover={handleTourHover}
            />
            {/* 페이지네이션 */}
            {!isLoading && tours.length > 0 && (
              <TourPagination
                currentPage={pageNo}
                itemsPerPage={numOfRows}
                currentItemsCount={tours.length}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          {/* 지도 뷰 (우측 50%, sticky 포지셔닝) */}
          <div className="flex flex-1 flex-col lg:sticky lg:top-[8rem] lg:h-[calc(100vh-8rem)]">
            <NaverMap
              tours={tours}
              selectedTourId={selectedTourId}
              onTourSelect={handleTourSelect}
              height="h-[calc(100vh-8rem)]"
              enableClustering={true}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
