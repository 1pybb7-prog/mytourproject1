"use client";

import { useQuery } from "@tanstack/react-query";
import type { TourItem } from "@/lib/types/tour";

/**
 * @file useTourList.ts
 * @description 관광지 목록 조회 훅
 *
 * React Query를 사용하여 관광지 목록을 조회하는 훅입니다.
 * 현재는 하드코딩된 샘플 데이터를 반환하며, 향후 API 연동 시 사용할 구조를 준비합니다.
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 관광지 목록 섹션
 */

/**
 * 샘플 관광지 데이터 (UI 구성용)
 */
const sampleTours: TourItem[] = [
  {
    contentid: "125266",
    title: "경복궁",
    addr1: "서울특별시 종로구 사직로 161",
    areacode: "1",
    contenttypeid: "12",
    mapx: "1988022",
    mapy: "451801",
    firstimage:
      "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=3d5a1f8d-5c27-4c1a-9b8e-8f7a6b5c4d3e",
    modifiedtime: "20250101",
  },
  {
    contentid: "126508",
    title: "부산 해운대",
    addr1: "부산광역시 해운대구 해운대해수욕장",
    areacode: "6",
    contenttypeid: "12",
    mapx: "1291637",
    mapy: "351217",
    firstimage:
      "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=4e6b2g9e-6d38-5d2b-0c9f-9g8b7c6d5e4f",
    modifiedtime: "20250101",
  },
  {
    contentid: "127853",
    title: "국립중앙박물관",
    addr1: "서울특별시 용산구 서빙고로 137",
    areacode: "1",
    contenttypeid: "14",
    mapx: "1987022",
    mapy: "451501",
    tel: "02-2077-9000",
    modifiedtime: "20250101",
  },
  {
    contentid: "129123",
    title: "제주도 한라산",
    addr1: "제주특별자치도 제주시 1100로",
    areacode: "39",
    contenttypeid: "12",
    mapx: "1265310",
    mapy: "332410",
    firstimage:
      "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=5f7c3h0f-7e49-6e3c-1d0g-0h9c8d7e6f5g",
    modifiedtime: "20250101",
  },
  {
    contentid: "130456",
    title: "전주 한옥마을",
    addr1: "전라북도 전주시 완산구 기린대로 99",
    areacode: "37",
    contenttypeid: "12",
    mapx: "1271488",
    mapy: "352123",
    modifiedtime: "20250101",
  },
  {
    contentid: "131789",
    title: "에버랜드",
    addr1: "경기도 용인시 처인구 포곡읍 에버랜드로 199",
    areacode: "31",
    contenttypeid: "12",
    mapx: "1272055",
    mapy: "373123",
    tel: "031-320-5000",
    modifiedtime: "20250101",
  },
  {
    contentid: "132234",
    title: "남산 N서울타워",
    addr1: "서울특별시 용산구 남산공원길 105",
    areacode: "1",
    contenttypeid: "12",
    mapx: "1986122",
    mapy: "451701",
    firstimage:
      "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=6g8d4i1g-8f5a-7f4d-2e1h-1i0d9e8f7g6h",
    tel: "02-3455-9277",
    modifiedtime: "20250101",
  },
  {
    contentid: "133567",
    title: "인천 차이나타운",
    addr1: "인천광역시 중구 차이나타운로 14",
    areacode: "2",
    contenttypeid: "39",
    mapx: "1266199",
    mapy: "373456",
    modifiedtime: "20250101",
  },
];

interface UseTourListOptions {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}

/**
 * 관광지 목록 조회 훅
 *
 * @param options - 조회 옵션
 * @returns React Query 결과
 */
export function useTourList(options: UseTourListOptions = {}) {
  return useQuery({
    queryKey: ["tours", "list", options],
    queryFn: async (): Promise<TourItem[]> => {
      // 향후 API 연동 시 사용할 코드 (주석 처리)
      // const { getAreaBasedList } = await import("@/lib/api/tour-api");
      // return await getAreaBasedList({
      //   areaCode: options.areaCode,
      //   contentTypeId: options.contentTypeId,
      //   numOfRows: options.numOfRows ?? 10,
      //   pageNo: options.pageNo ?? 1,
      // });

      // 현재는 샘플 데이터 반환 (UI 구성용)
      // 필터링 로직 추가 (향후 API에서 처리)
      let filtered = [...sampleTours];

      if (options.areaCode) {
        filtered = filtered.filter(
          (tour) => tour.areacode === options.areaCode,
        );
      }

      if (options.contentTypeId) {
        filtered = filtered.filter(
          (tour) => tour.contenttypeid === options.contentTypeId,
        );
      }

      // 페이지네이션 처리
      const numOfRows = options.numOfRows ?? 10;
      const pageNo = options.pageNo ?? 1;
      const startIndex = (pageNo - 1) * numOfRows;
      const endIndex = startIndex + numOfRows;

      return filtered.slice(startIndex, endIndex);
    },
    staleTime: 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  });
}
