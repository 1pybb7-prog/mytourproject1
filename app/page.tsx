"use client";

import { useState, useEffect, useMemo } from "react";
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
import { useBookmarkList } from "@/hooks/useBookmarkList";
import { usePetTourFilter } from "@/hooks/usePetTourFilter";
import { useFindPetFriendlyTours } from "@/hooks/useFindPetFriendlyTours";
import { List, Map as MapIcon } from "lucide-react";
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
  const {
    filters,
    setAreaCode,
    setContentTypeId,
    setPetFriendly,
    setPetSize,
    setPetType,
    setPetPlace,
    resetFilters,
  } = useTourFilter();
  const { sortOption, setSortOption } = useTourSort();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  const [hoveredTourId, setHoveredTourId] = useState<string | undefined>();
  const [isBookmarkFilterActive, setIsBookmarkFilterActive] = useState(false);

  // 반려동물 필터가 활성화되면 더 많은 관광지를 조회 (반려동물 정보가 있는 관광지가 적을 수 있음)
  const numOfRows = filters.petFriendly ? 100 : 12; // 페이지당 항목 수

  // 북마크 목록 조회
  const { bookmarkedContentIds } = useBookmarkList();

  // 검색 모드 여부 확인
  const isSearchMode = Boolean(searchKeyword && searchKeyword.trim() !== "");

  // 필터/검색/북마크 필터 변경 시 페이지 리셋 및 선택 초기화
  useEffect(() => {
    setPageNo(1);
    setSelectedTourId(undefined);
    setHoveredTourId(undefined);
    console.log("[Home] 필터/검색/북마크 필터 변경으로 페이지 1로 리셋", {
      petFriendly: filters.petFriendly,
      numOfRows: filters.petFriendly ? 100 : 12,
    });
  }, [
    filters.areaCode,
    filters.contentTypeId,
    filters.petFriendly,
    filters.petSize,
    filters.petType,
    filters.petPlace,
    searchKeyword,
    isBookmarkFilterActive,
  ]);

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

  // 반려동물 필터가 활성화되면 전용 함수 사용
  // 빠른 응답을 위해 먼저 적은 페이지만 조회하고, 최소 결과 수를 찾으면 바로 반환
  const petFriendlyQuery = useFindPetFriendlyTours({
    areaCode: filters.areaCode,
    contentTypeId: filters.contentTypeId,
    maxPages: 3, // 3페이지까지 조회 (300개 관광지) - 빠른 응답을 위해 줄임
    numOfRows: 100,
    maxResults: 20, // 최대 20개 결과 - 빠른 응답을 위해 줄임
    minResults: 10, // 최소 10개 찾으면 바로 반환
    enabled: Boolean(filters.petFriendly) && !isSearchMode, // 검색 모드가 아닐 때만 사용
  });

  // 현재 사용할 데이터 결정
  const { data: rawTours = [], isLoading } = isSearchMode
    ? searchQuery
    : listQuery;

  // 반려동물 필터가 활성화되고 검색 모드가 아닐 때는 전용 함수 결과 사용
  const petFriendlyTours = useMemo(() => {
    if (filters.petFriendly && !isSearchMode && petFriendlyQuery.data) {
      console.log(
        "[Home] 반려동물 동반 가능한 관광지 찾기 결과:",
        petFriendlyQuery.data.length,
        "개",
      );
      // 반려동물 정보가 포함된 관광지 목록 반환
      return petFriendlyQuery.data.map((item) => item.tour);
    }
    return null;
  }, [filters.petFriendly, isSearchMode, petFriendlyQuery.data]);

  // 반려동물 정보 맵 생성 (전용 함수 결과에서)
  const petInfoMapFromQuery = useMemo(() => {
    if (filters.petFriendly && !isSearchMode && petFriendlyQuery.data) {
      const map = new Map();
      petFriendlyQuery.data.forEach((item) => {
        map.set(item.tour.contentid, item.petInfo);
      });
      console.log("[Home] 반려동물 정보 맵 생성:", map.size, "개");
      return map;
    }
    return null;
  }, [filters.petFriendly, isSearchMode, petFriendlyQuery.data]);

  // 북마크 필터 적용
  const toursAfterBookmark = useMemo(() => {
    // 반려동물 필터가 활성화되고 검색 모드가 아닐 때는 전용 함수 결과 사용
    const sourceTours = petFriendlyTours || rawTours;

    if (!isBookmarkFilterActive) {
      return sourceTours;
    }

    // 북마크된 관광지만 필터링
    const filtered = sourceTours.filter((tour) =>
      bookmarkedContentIds.has(tour.contentid),
    );
    console.log(
      "[Home] 북마크 필터 적용:",
      sourceTours.length,
      "->",
      filtered.length,
    );
    return filtered;
  }, [
    rawTours,
    petFriendlyTours,
    isBookmarkFilterActive,
    bookmarkedContentIds,
  ]);

  // 반려동물 필터 적용 (검색 모드이거나 전용 함수를 사용하지 않을 때만)
  const {
    filteredTours: toursFromFilter,
    petInfoMap: petInfoMapFromFilter,
    isLoading: isPetFilterLoading,
  } = usePetTourFilter({
    tours: toursAfterBookmark,
    petFriendly: filters.petFriendly,
    petSize: filters.petSize,
    petType: filters.petType,
    petPlace: filters.petPlace,
    enabled:
      Boolean(filters.petFriendly) && (isSearchMode || !petFriendlyQuery.data), // 검색 모드이거나 전용 함수 결과가 없을 때만 사용
  });

  // 최종 관광지 목록 결정
  const tours = useMemo(() => {
    if (filters.petFriendly && !isSearchMode && petFriendlyTours) {
      // 전용 함수 결과 사용
      return petFriendlyTours;
    }
    // 기존 필터 결과 사용
    return toursFromFilter;
  }, [filters.petFriendly, isSearchMode, petFriendlyTours, toursFromFilter]);

  // 최종 반려동물 정보 맵 결정
  const petInfoMap = useMemo(() => {
    if (filters.petFriendly && !isSearchMode && petInfoMapFromQuery) {
      // 전용 함수 결과 사용
      return petInfoMapFromQuery;
    }
    // 기존 필터 결과 사용
    return petInfoMapFromFilter;
  }, [
    filters.petFriendly,
    isSearchMode,
    petInfoMapFromQuery,
    petInfoMapFromFilter,
  ]);

  // 로딩 상태 결정
  const isLoadingTours = useMemo(() => {
    if (filters.petFriendly && !isSearchMode) {
      return petFriendlyQuery.isLoading || isLoading;
    }
    return isLoading || isPetFilterLoading;
  }, [
    filters.petFriendly,
    isSearchMode,
    petFriendlyQuery.isLoading,
    isLoading,
    isPetFilterLoading,
  ]);

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
   * 관광지 호버 핸들러
   * 리스트 항목 호버 시 지도에 위치 표시
   */
  const handleTourHover = (tourId: string | undefined) => {
    console.log("[Home] 관광지 호버:", tourId);
    setHoveredTourId(tourId);
    // 호버 시 지도에 위치 표시
    if (tourId) {
      setSelectedTourId(tourId);
    } else {
      // 호버 아웃 시 선택 해제 (선택 사항)
      // setSelectedTourId(undefined);
    }
  };

  /**
   * 북마크 필터 토글 핸들러
   */
  const handleBookmarkFilterToggle = () => {
    setIsBookmarkFilterActive((prev) => !prev);
    console.log("[Home] 북마크 필터 토글:", !isBookmarkFilterActive);
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
          petFriendly={filters.petFriendly}
          petSize={filters.petSize}
          petType={filters.petType}
          petPlace={filters.petPlace}
          onAreaCodeChange={handleAreaCodeChange}
          onContentTypeIdChange={handleContentTypeIdChange}
          onPetFriendlyChange={(petFriendly) => {
            setPetFriendly(petFriendly);
            setPageNo(1);
            console.log("[Home] 반려동물 필터 변경:", petFriendly);
          }}
          onPetSizeChange={(petSize) => {
            setPetSize(petSize);
            setPageNo(1);
            console.log("[Home] 반려동물 크기 필터 변경:", petSize);
          }}
          onPetTypeChange={(petType) => {
            setPetType(petType);
            setPageNo(1);
            console.log("[Home] 반려동물 종류 필터 변경:", petType);
          }}
          onPetPlaceChange={(petPlace) => {
            setPetPlace(petPlace);
            setPageNo(1);
            console.log("[Home] 반려동물 장소 필터 변경:", petPlace);
          }}
          onReset={resetFilters}
        />
      </section>

      {/* 정렬 섹션 */}
      <section className="border-b bg-background">
        <TourSort
          sortOption={sortOption}
          onSortChange={setSortOption}
          isBookmarkFilterActive={isBookmarkFilterActive}
          onBookmarkFilterToggle={handleBookmarkFilterToggle}
        />
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
                <MapIcon className="size-4" />
                <span>지도</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="flex flex-col gap-6">
              <TourList
                tours={tours}
                isLoading={isLoadingTours}
                keyword={searchKeyword}
                areaCode={filters.areaCode}
                contentTypeId={filters.contentTypeId}
                numOfRows={numOfRows}
                pageNo={pageNo}
                sortOption={sortOption}
                selectedTourId={selectedTourId}
                hoveredTourId={hoveredTourId}
                onTourHover={handleTourHover}
                isBookmarkFilterActive={isBookmarkFilterActive}
                petInfoMap={petInfoMap}
                isPetFilterActive={Boolean(filters.petFriendly)}
              />
              {/* 페이지네이션 */}
              {!isLoadingTours && tours.length > 0 && (
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
                height="min-h-[400px]"
                enableClustering={true}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* 데스크톱: 리스트(좌측) + 지도(우측) 그리드 레이아웃 */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
          {/* 리스트 뷰 (좌측 50%) */}
          <div className="flex flex-col gap-6 overflow-y-auto lg:max-h-[calc(100vh-8rem)]">
            <TourList
              tours={tours}
              isLoading={isLoading || isPetFilterLoading}
              keyword={searchKeyword}
              areaCode={filters.areaCode}
              contentTypeId={filters.contentTypeId}
              numOfRows={numOfRows}
              pageNo={pageNo}
              sortOption={sortOption}
              selectedTourId={selectedTourId}
              hoveredTourId={hoveredTourId}
              onTourHover={handleTourHover}
              isBookmarkFilterActive={isBookmarkFilterActive}
              petInfoMap={petInfoMap}
              isPetFilterActive={Boolean(filters.petFriendly)}
            />
            {/* 페이지네이션 */}
            {!isLoading && !isPetFilterLoading && tours.length > 0 && (
              <TourPagination
                currentPage={pageNo}
                itemsPerPage={numOfRows}
                currentItemsCount={tours.length}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          {/* 지도 뷰 (우측 50%, sticky 포지셔닝) */}
          <div className="flex flex-col lg:sticky lg:top-[8rem] lg:h-[calc(100vh-8rem)]">
            {selectedTourId ? (
              <NaverMap
                tours={tours.filter(
                  (tour) => tour.contentid === selectedTourId,
                )}
                selectedTourId={selectedTourId}
                height="h-[calc(100vh-8rem)]"
                enableClustering={false}
              />
            ) : (
              <NaverMap
                tours={tours}
                selectedTourId={selectedTourId}
                height="h-[calc(100vh-8rem)]"
                enableClustering={true}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
