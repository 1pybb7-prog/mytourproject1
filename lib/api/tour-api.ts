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

/**
 * API Base URL
 */
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

/**
 * API 공통 파라미터
 */
const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
} as const;

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
    throw new Error(
      "TOUR_PET_API_KEY 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_PET_API_KEY 또는 TOUR_PET_API_KEY를 설정해주세요.",
    );
  }

  return key;
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
  const serviceKey = getPetTourServiceKey();

  const searchParams = new URLSearchParams({
    serviceKey,
    ...COMMON_PARAMS,
    contentId,
  });

  const url = `${BASE_URL}/detailPetTour2?${searchParams.toString()}`;

  console.log(`[Tour API] 호출: detailPetTour2`, { contentId });

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

    // 데이터 추출
    const items = data.response.body.items?.item;
    if (!items) {
      console.log(`[Tour API] detailPetTour2 데이터 없음: ${contentId}`, {
        body: data.response.body,
        items: data.response.body.items,
      });
      return null;
    }

    // 배열이 아닌 경우 배열로 변환 후 첫 번째 항목 반환
    const results = Array.isArray(items) ? items : [items];
    const petInfo = results[0] ?? null;

    if (petInfo) {
      console.log(`[Tour API] detailPetTour2 성공: ${contentId}`, {
        chkpetleash: petInfo.chkpetleash,
        chkpetsize: petInfo.chkpetsize,
        hasPetInfo: Boolean(
          petInfo.chkpetleash ||
            petInfo.petinfo ||
            petInfo.chkpetsize ||
            petInfo.chkpetplace,
        ),
      });
    }

    return petInfo;
  } catch (error) {
    console.error(`[Tour API] 에러: detailPetTour2`, error);
    throw error;
  }
}
