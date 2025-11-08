/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API(KorService2) 호출 함수들
 *
 * 한국관광공사 공공 API를 사용하여 관광지 정보를 조회하는 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 지역코드 조회 (areaCode2)
 * 2. 지역 기반 관광정보 조회 (areaBasedList2)
 * 3. 키워드 검색 (searchKeyword2)
 * 4. 공통 정보 조회 (detailCommon2)
 * 5. 소개 정보 조회 (detailIntro2)
 * 6. 이미지 조회 (detailImage2)
 * 7. 반려동물 동반 여행 정보 조회 (detailPetTour2)
 *
 * API 기본 정보:
 * - Base URL: https://apis.data.go.kr/B551011/KorService2
 * - 공통 파라미터: serviceKey, MobileOS: "ETC", MobileApp: "MyTrip", _type: "json"
 *
 * @see {@link /docs/prd.md#4-api-명세} - PRD 문서의 API 명세 섹션
 */

import type {
  TourItem,
  TourDetail,
  TourIntro,
  PetTourInfo,
} from "@/lib/types/tour";
import { TOUR_API_BASE_URL, TOUR_API_COMMON_PARAMS } from "@/lib/api/constants";

/**
 * API Base URL
 */
const BASE_URL = TOUR_API_BASE_URL;

/**
 * API 공통 파라미터
 */
const COMMON_PARAMS = TOUR_API_COMMON_PARAMS;

/**
 * API 서비스 키 가져오기
 *
 * NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 환경변수에서 가져옵니다.
 */
function getServiceKey(): string {
  const key =
    process.env.NEXT_PUBLIC_TOUR_API_KEY ||
    process.env.TOUR_API_KEY ||
    process.env.NEXT_PUBLIC_TOUR_API_KEY?.trim() ||
    process.env.TOUR_API_KEY?.trim();

  if (!key || key.trim() === "") {
    console.error("[Tour API] 환경 변수 확인:", {
      NEXT_PUBLIC_TOUR_API_KEY: process.env.NEXT_PUBLIC_TOUR_API_KEY
        ? "설정됨"
        : "미설정",
      TOUR_API_KEY: process.env.TOUR_API_KEY ? "설정됨" : "미설정",
    });
    throw new Error(
      "TOUR_API_KEY 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY를 설정해주세요.",
    );
  }

  // 환경 변수가 제대로 읽혔는지 확인 (키 값은 로그에 출력하지 않음)
  console.log(
    "[Tour API] API 키 로드 성공:",
    key.length > 0 ? `${key.substring(0, 8)}...` : "빈 값",
  );

  return key.trim();
}

/**
 * 반려동물 동반여행 API 서비스 키 가져오기
 *
 * NEXT_PUBLIC_TOUR_PET_API_KEY 환경변수에서 가져옵니다.
 */
function getPetTourServiceKey(): string {
  const key =
    process.env.NEXT_PUBLIC_TOUR_PET_API_KEY || process.env.TOUR_PET_API_KEY;

  if (!key) {
    console.error("[Tour API] 환경 변수 확인:", {
      NEXT_PUBLIC_TOUR_PET_API_KEY: process.env.NEXT_PUBLIC_TOUR_PET_API_KEY
        ? "설정됨"
        : "미설정",
      TOUR_PET_API_KEY: process.env.TOUR_PET_API_KEY ? "설정됨" : "미설정",
    });
    throw new Error(
      "TOUR_PET_API_KEY 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_PET_API_KEY 또는 TOUR_PET_API_KEY를 설정해주세요.",
    );
  }

  // 환경 변수가 제대로 읽혔는지 확인 (키 값은 로그에 출력하지 않음)
  console.log(
    "[Tour API] 반려동물 API 키 로드 성공:",
    key.length > 0 ? `${key.substring(0, 8)}...` : "빈 값",
  );

  return key.trim();
}

/**
 * API 응답 타입
 */
interface ApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * API 호출 공통 함수
 */
async function fetchApi<T>(
  endpoint: string,
  params: Record<string, string | number | undefined>,
): Promise<T[]> {
  const serviceKey = getServiceKey();

  const searchParams = new URLSearchParams({
    serviceKey,
    ...COMMON_PARAMS,
    ...Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    ),
  });

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  console.log(`[Tour API] 호출: ${endpoint}`, {
    params,
    serviceKeyLength: serviceKey.length,
    url: url.substring(0, 100) + "...", // URL 일부만 로그에 출력
  });

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
      throw new Error(
        `API 호출 실패: ${response.status} ${response.statusText}`,
      );
    }

    const data: ApiResponse<T> = await response.json();

    // API 에러 체크
    if (data.response.header.resultCode !== "0000") {
      throw new Error(
        `API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`,
      );
    }

    // 데이터 추출
    const items = data.response.body.items?.item;
    if (!items) {
      return [];
    }

    // 배열이 아닌 경우 배열로 변환
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error(`[Tour API] 에러: ${endpoint}`, error);
    throw error;
  }
}

/**
 * 지역코드 조회
 *
 * @param areaCode - 지역코드 (시/도, 선택 사항)
 * @returns 지역코드 목록
 */
export async function getAreaCode(areaCode?: string) {
  return fetchApi<{
    code: string;
    name: string;
    rnum: number;
  }>("/areaCode2", {
    areaCode,
  });
}

/**
 * 지역 기반 관광정보 조회
 *
 * @param options - 조회 옵션
 * @param options.areaCode - 지역코드 (시/도)
 * @param options.contentTypeId - 콘텐츠타입ID (관광 타입: 12, 14, 15, 25, 28, 32, 38, 39)
 * @param options.sigunguCode - 시군구코드 (선택 사항)
 * @param options.numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param options.pageNo - 페이지 번호 (기본값: 1)
 * @returns 관광지 목록
 */
export async function getAreaBasedList(options: {
  areaCode?: string;
  contentTypeId?: string;
  sigunguCode?: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<TourItem[]> {
  return fetchApi<TourItem>("/areaBasedList2", {
    areaCode: options.areaCode,
    contentTypeId: options.contentTypeId,
    sigunguCode: options.sigunguCode,
    numOfRows: options.numOfRows ?? 10,
    pageNo: options.pageNo ?? 1,
  });
}

/**
 * 키워드 검색
 *
 * @param keyword - 검색 키워드
 * @param options - 검색 옵션
 * @param options.areaCode - 지역코드 (선택 사항)
 * @param options.contentTypeId - 콘텐츠타입ID (선택 사항)
 * @param options.numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param options.pageNo - 페이지 번호 (기본값: 1)
 * @returns 검색 결과 목록
 */
export async function searchKeyword(
  keyword: string,
  options?: {
    areaCode?: string;
    contentTypeId?: string;
    numOfRows?: number;
    pageNo?: number;
  },
): Promise<TourItem[]> {
  return fetchApi<TourItem>("/searchKeyword2", {
    keyword,
    areaCode: options?.areaCode,
    contentTypeId: options?.contentTypeId,
    numOfRows: options?.numOfRows ?? 10,
    pageNo: options?.pageNo ?? 1,
  });
}

/**
 * 공통 정보 조회
 *
 * @param contentId - 콘텐츠ID
 * @returns 관광지 상세 정보
 */
export async function getDetailCommon(
  contentId: string,
): Promise<TourDetail | null> {
  const results = await fetchApi<TourDetail>("/detailCommon2", {
    contentId,
  });

  return results[0] ?? null;
}

/**
 * 소개 정보 조회
 *
 * @param contentId - 콘텐츠ID
 * @param contentTypeId - 콘텐츠타입ID
 * @returns 관광지 소개 정보
 */
export async function getDetailIntro(
  contentId: string,
  contentTypeId: string,
): Promise<TourIntro | null> {
  const results = await fetchApi<TourIntro>("/detailIntro2", {
    contentId,
    contentTypeId,
  });

  return results[0] ?? null;
}

/**
 * 이미지 조회
 *
 * @param contentId - 콘텐츠ID
 * @returns 이미지 목록
 */
export async function getDetailImage(contentId: string) {
  return fetchApi<{
    contentid: string;
    imagename: string;
    originimgurl: string;
    serialnum: string;
    smallimageurl: string;
  }>("/detailImage2", {
    contentId,
  });
}

/**
 * 반려동물 동반 여행 정보 조회
 *
 * @param contentId - 콘텐츠ID
 * @returns 반려동물 동반 여행 정보
 */
export async function getDetailPetTour(
  contentId: string,
): Promise<PetTourInfo | null> {
  // 반려동물 API 키가 없으면 일반 API 키 사용 (같은 키를 사용할 수 있음)
  let serviceKey: string;
  try {
    serviceKey = getPetTourServiceKey();
  } catch (error) {
    // 반려동물 API 키가 없으면 일반 API 키 사용
    console.log(
      "[Tour API] 반려동물 API 키가 없어 일반 API 키 사용",
      error instanceof Error ? error.message : error,
    );
    serviceKey = getServiceKey();
  }

  const searchParams = new URLSearchParams({
    serviceKey,
    ...COMMON_PARAMS,
    contentId,
  });

  const url = `${BASE_URL}/detailPetTour2?${searchParams.toString()}`;

  console.log(`[Tour API] 호출: detailPetTour2`, {
    contentId,
    serviceKeyLength: serviceKey.length,
    serviceKeyPrefix: serviceKey.substring(0, 8),
  });

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
      throw new Error(
        `API 호출 실패: ${response.status} ${response.statusText}`,
      );
    }

    const data: ApiResponse<PetTourInfo> = await response.json();

    // API 에러 체크
    if (data.response.header.resultCode !== "0000") {
      console.warn(
        `[Tour API] detailPetTour2 API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`,
        { contentId },
      );
      // API 에러가 발생해도 null을 반환 (에러를 throw하지 않음)
      return null;
    }

    // 더 자세한 응답 구조 로깅 (디버깅용)
    console.log(`[Tour API] detailPetTour2 응답 구조: ${contentId}`, {
      resultCode: data.response.header.resultCode,
      totalCount: data.response.body.totalCount,
      itemsType: typeof data.response.body.items,
      itemsValue: data.response.body.items,
      hasItem:
        data.response.body.items &&
        typeof data.response.body.items === "object" &&
        "item" in data.response.body.items,
    });

    // 데이터 추출
    // items가 빈 문자열이거나 null인 경우 처리
    if (
      !data.response.body.items ||
      (typeof data.response.body.items === "string" &&
        data.response.body.items === "")
    ) {
      console.log(
        `[Tour API] detailPetTour2 데이터 없음 (items가 빈 문자열): ${contentId}`,
        {
          body: data.response.body,
          items: data.response.body.items,
          totalCount: data.response.body.totalCount,
        },
      );
      return null;
    }

    // items가 객체가 아닌 경우 처리
    if (typeof data.response.body.items !== "object") {
      console.log(
        `[Tour API] detailPetTour2 데이터 없음 (items가 객체가 아님): ${contentId}`,
        {
          body: data.response.body,
          items: data.response.body.items,
          itemsType: typeof data.response.body.items,
        },
      );
      return null;
    }

    const items = data.response.body.items.item;
    if (!items) {
      console.log(
        `[Tour API] detailPetTour2 데이터 없음 (item이 없음): ${contentId}`,
        {
          body: data.response.body,
          items: data.response.body.items,
          totalCount: data.response.body.totalCount,
        },
      );
      return null;
    }

    // 배열이 아닌 경우 배열로 변환 후 첫 번째 항목 반환
    const results = Array.isArray(items) ? items : [items];
    const petInfo = results[0] ?? null;

    if (petInfo) {
      console.log(`[Tour API] detailPetTour2 성공: ${contentId}`, {
        acmpyTypeCd: petInfo.acmpyTypeCd,
        acmpyPsblCpam: petInfo.acmpyPsblCpam,
        acmpyNeedMtr: petInfo.acmpyNeedMtr,
        etcAcmpyInfo: petInfo.etcAcmpyInfo,
        hasPetInfo: Boolean(
          petInfo.acmpyTypeCd ||
            petInfo.acmpyPsblCpam ||
            petInfo.acmpyNeedMtr ||
            petInfo.etcAcmpyInfo,
        ),
      });
    }

    return petInfo;
  } catch (error) {
    console.error(`[Tour API] 에러: detailPetTour2`, error);
    throw error;
  }
}

/**
 * 반려동물 동반 가능한 관광지 찾기
 *
 * 여러 페이지의 관광지를 조회하고, 각 관광지의 반려동물 정보를 확인하여
 * 반려동물 동반 가능한 관광지만 반환합니다.
 *
 * @param options - 조회 옵션
 * @param options.areaCode - 지역코드 (시/도)
 * @param options.contentTypeId - 콘텐츠타입ID (관광 타입: 12, 14, 15, 25, 28, 32, 38, 39)
 * @param options.maxPages - 최대 조회할 페이지 수 (기본값: 5)
 * @param options.numOfRows - 페이지당 항목 수 (기본값: 100)
 * @param options.maxResults - 최대 반환할 결과 수 (기본값: 50)
 * @returns 반려동물 동반 가능한 관광지 목록 (반려동물 정보 포함)
 */
export async function findPetFriendlyTours(options: {
  areaCode?: string;
  contentTypeId?: string;
  maxPages?: number;
  numOfRows?: number;
  maxResults?: number;
  minResults?: number; // 최소 결과 수 - 이 수를 찾으면 바로 반환
}): Promise<Array<{ tour: TourItem; petInfo: PetTourInfo }>> {
  const {
    areaCode,
    contentTypeId,
    maxPages = 5,
    numOfRows = 100,
    maxResults = 50,
    minResults = 10, // 최소 10개 찾으면 바로 반환
  } = options;

  console.log("[Tour API] 반려동물 동반 가능한 관광지 찾기 시작", {
    areaCode,
    contentTypeId,
    maxPages,
    numOfRows,
    maxResults,
    minResults,
  });

  const results: Array<{ tour: TourItem; petInfo: PetTourInfo }> = [];

  try {
    // 여러 페이지의 관광지를 조회
    for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
      console.log(
        `[Tour API] 관광지 목록 조회 중: 페이지 ${pageNo}/${maxPages}`,
      );

      // 관광지 목록 조회
      const tours = await getAreaBasedList({
        areaCode,
        contentTypeId,
        numOfRows,
        pageNo,
      });

      if (tours.length === 0) {
        console.log(`[Tour API] 페이지 ${pageNo}에서 관광지 없음, 조회 종료`);
        break;
      }

      console.log(
        `[Tour API] 페이지 ${pageNo}에서 ${tours.length}개 관광지 조회됨`,
      );

      // 각 관광지의 반려동물 정보를 병렬로 조회
      // 한 번에 너무 많은 요청을 보내지 않도록 배치 처리 (50개씩)
      const BATCH_SIZE = 50;
      const petInfoResults: Array<{
        tour: TourItem;
        petInfo: PetTourInfo | null;
      } | null> = [];

      for (let i = 0; i < tours.length; i += BATCH_SIZE) {
        const batch = tours.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (tour) => {
          try {
            const petInfo = await getDetailPetTour(tour.contentid);
            return { tour, petInfo };
          } catch (error) {
            console.warn(
              `[Tour API] 반려동물 정보 조회 실패: ${tour.contentid}`,
              error,
            );
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        petInfoResults.push(...batchResults);
      }

      // 반려동물 정보가 있는 관광지만 필터링
      for (const result of petInfoResults) {
        if (!result || !result.petInfo) {
          continue;
        }

        const { petInfo } = result;

        // 반려동물 정보가 있는지 확인
        const hasPetInfo =
          petInfo.acmpyTypeCd ||
          petInfo.acmpyPsblCpam ||
          petInfo.acmpyNeedMtr ||
          petInfo.etcAcmpyInfo;

        if (!hasPetInfo) {
          continue;
        }

        // "불가능"인 경우 제외
        if (petInfo.acmpyTypeCd) {
          const typeValue = petInfo.acmpyTypeCd.trim();
          if (typeValue === "불가능" || typeValue.includes("불가")) {
            continue;
          }
        }

        // 반려동물 정보가 있고 "가능"한 경우 추가
        results.push({
          tour: result.tour,
          petInfo,
        });

        console.log(
          `[Tour API] 반려동물 동반 가능한 관광지 발견: ${result.tour.title} (${result.tour.contentid})`,
          {
            acmpyTypeCd: petInfo.acmpyTypeCd,
            acmpyPsblCpam: petInfo.acmpyPsblCpam,
          },
        );

        // 최대 결과 수에 도달하면 종료
        if (results.length >= maxResults) {
          console.log(
            `[Tour API] 최대 결과 수(${maxResults})에 도달, 조회 종료`,
          );
          return results;
        }

        // 최소 결과 수를 찾았으면 바로 반환 (빠른 응답)
        if (results.length >= minResults && pageNo >= 2) {
          console.log(
            `[Tour API] 최소 결과 수(${minResults})에 도달, 빠른 응답을 위해 조회 종료`,
          );
          return results;
        }
      }

      // 이미 충분한 결과를 찾았으면 종료
      if (results.length >= maxResults) {
        break;
      }

      // 최소 결과 수를 찾았고 2페이지 이상 조회했으면 종료 (빠른 응답)
      if (results.length >= minResults && pageNo >= 2) {
        console.log(
          `[Tour API] 최소 결과 수(${minResults})에 도달, 빠른 응답을 위해 조회 종료`,
        );
        break;
      }
    }

    console.log(
      `[Tour API] 반려동물 동반 가능한 관광지 찾기 완료: ${results.length}개 발견`,
    );

    return results;
  } catch (error) {
    console.error("[Tour API] 반려동물 동반 가능한 관광지 찾기 실패", error);
    throw error;
  }
}
