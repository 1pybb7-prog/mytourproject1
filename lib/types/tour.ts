/**
 * @file tour.ts
 * @description 관광지 관련 타입 정의
 *
 * 한국관광공사 공공 API(KorService2)의 응답 데이터 구조를 기반으로 한 타입 정의입니다.
 *
 * 주요 타입:
 * 1. TourItem - 관광지 목록 항목 (areaBasedList2 API 응답)
 * 2. TourDetail - 관광지 상세 정보 (detailCommon2 API 응답)
 * 3. TourIntro - 관광지 소개 정보 (detailIntro2 API 응답)
 *
 * 좌표 정보:
 * - mapx, mapy는 KATEC 좌표계의 정수형 값
 * - Naver Maps는 KATEC 좌표계를 직접 지원하므로 변환 불필요
 *
 * @see {@link /docs/prd.md#5-데이터-구조} - PRD 문서의 데이터 구조 섹션
 */

/**
 * 관광지 목록 항목 타입
 *
 * areaBasedList2 API 응답 데이터 구조
 */
export interface TourItem {
  /** 주소 */
  addr1: string;
  /** 상세주소 (선택) */
  addr2?: string;
  /** 지역코드 (시/도) */
  areacode: string;
  /** 콘텐츠ID (고유 식별자) */
  contentid: string;
  /** 콘텐츠타입ID (관광 타입: 12, 14, 15, 25, 28, 32, 38, 39) */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
  /** 대표이미지1 (URL) */
  firstimage?: string;
  /** 대표이미지2 (URL) */
  firstimage2?: string;
  /** 전화번호 */
  tel?: string;
  /** 대분류 카테고리 */
  cat1?: string;
  /** 중분류 카테고리 */
  cat2?: string;
  /** 소분류 카테고리 */
  cat3?: string;
  /** 수정일 (YYYYMMDD 형식) */
  modifiedtime: string;
}

/**
 * 관광지 상세 정보 타입
 *
 * detailCommon2 API 응답 데이터 구조
 */
export interface TourDetail {
  /** 콘텐츠ID (고유 식별자) */
  contentid: string;
  /** 콘텐츠타입ID (관광 타입: 12, 14, 15, 25, 28, 32, 38, 39) */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 주소 */
  addr1: string;
  /** 상세주소 (선택) */
  addr2?: string;
  /** 우편번호 (선택) */
  zipcode?: string;
  /** 전화번호 */
  tel?: string;
  /** 홈페이지 URL */
  homepage?: string;
  /** 개요 (긴 설명문) */
  overview?: string;
  /** 대표이미지1 (URL) */
  firstimage?: string;
  /** 대표이미지2 (URL) */
  firstimage2?: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
}

/**
 * 관광지 소개 정보 타입
 *
 * detailIntro2 API 응답 데이터 구조
 *
 * 주의: 관광 타입(contenttypeid)에 따라 사용 가능한 필드가 다릅니다.
 * 예를 들어, 관광지(12)와 음식점(39)의 필드가 다를 수 있습니다.
 */
export interface TourIntro {
  /** 콘텐츠ID (고유 식별자) */
  contentid: string;
  /** 콘텐츠타입ID (관광 타입: 12, 14, 15, 25, 28, 32, 38, 39) */
  contenttypeid: string;
  /** 이용시간/운영시간 */
  usetime?: string;
  /** 휴무일 */
  restdate?: string;
  /** 문의처 */
  infocenter?: string;
  /** 주차 가능 여부 */
  parking?: string;
  /** 반려동물 동반 가능 여부 */
  chkpet?: string;
  /** 이용요금 */
  usefee?: string;
  /** 수용인원 */
  accomcount?: string;
  /** 체험 프로그램 정보 */
  expguide?: string;
  /** 유모차 대여 가능 여부 */
  chkbabycarriage?: string;
  /** 장애인 편의시설 */
  chkcreditcard?: string;
  /** 기타 정보 (타입별로 다름) */
  [key: string]: string | undefined;
}
