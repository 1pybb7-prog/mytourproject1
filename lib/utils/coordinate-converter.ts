/**
 * @file coordinate-converter.ts
 * @description 좌표 변환 유틸리티 함수
 *
 * 한국관광공사 API는 KATEC 좌표계를 사용하며, Naver 지도도 KATEC 좌표계를 직접 지원합니다.
 * 이 모듈은 KATEC 좌표계를 Naver Maps에서 사용할 수 있는 형식으로 정규화하는 함수를 제공합니다.
 *
 * 주요 기능:
 * 1. KATEC 정수형 좌표를 실수형으로 변환 (mapx / 10000000, mapy / 10000000)
 * 2. Naver Maps 좌표 형식 변환 (경도, 위도 순서 → lat, lng)
 *
 * 좌표 변환 과정:
 * 1. KATEC 정수형 좌표를 실수형으로 변환 (mapx / 10000000, mapy / 10000000)
 * 2. Naver Maps 형식 (위도, 경도)으로 반환
 *
 * 참고: Naver Maps는 KATEC 좌표계를 직접 지원하므로 별도 좌표 변환 라이브러리(proj4)가 불필요합니다.
 *
 * @dependencies
 * - 없음 (순수 유틸리티 함수)
 *
 * @see {@link /docs/prd.md#53-좌표-변환} - PRD 문서의 좌표 변환 섹션
 */

/**
 * Naver Maps에서 사용할 수 있는 좌표 타입
 */
export interface NaverLatLng {
  /** 위도 (latitude) */
  lat: number;
  /** 경도 (longitude) */
  lng: number;
}

/**
 * KATEC 좌표계를 Naver Maps 형식으로 정규화
 *
 * 한국관광공사 API에서 제공하는 KATEC 좌표계 정수형 문자열을
 * Naver Maps에서 사용할 수 있는 실수형 좌표로 변환합니다.
 *
 * 변환 공식:
 * - 경도 (X): mapx / 10000000
 * - 위도 (Y): mapy / 10000000
 * - Naver Maps 형식: { lat: 위도, lng: 경도 }
 *
 * @param mapx - 경도 (KATEC 좌표계, 정수형 문자열, 예: "1290000000")
 * @param mapy - 위도 (KATEC 좌표계, 정수형 문자열, 예: "350000000")
 * @returns Naver Maps에서 사용할 수 있는 좌표 객체 { lat, lng }
 *
 * @throws {Error} 좌표 값이 유효하지 않은 경우
 *
 * @example
 * ```typescript
 * const { lat, lng } = normalizeKatecCoordinates("1290000000", "350000000");
 * // { lat: 35.0, lng: 129.0 }
 * ```
 */
export function normalizeKatecCoordinates(
  mapx: string,
  mapy: string,
): NaverLatLng {
  console.log(
    `[normalizeKatecCoordinates] 좌표 변환 시작: mapx=${mapx}, mapy=${mapy}`,
  );

  try {
    // 입력값 검증
    if (!mapx || !mapy) {
      throw new Error(`좌표 값이 비어있습니다: mapx=${mapx}, mapy=${mapy}`);
    }

    // 좌표를 숫자로 변환
    const x = parseFloat(mapx);
    const y = parseFloat(mapy);

    // 유효성 검사
    if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
      throw new Error(`유효하지 않은 좌표 값: mapx=${mapx}, mapy=${mapy}`);
    }

    // API에서 이미 실수형으로 제공하는 경우와 정수형으로 제공하는 경우 구분
    // 실수형: 100 이상 (예: 127.12, 36.45)
    // 정수형: 1억 이상 (예: 1271216721, 364529297)
    const isAlreadyDecimal = x < 1000 && y < 1000;

    let katecX: number;
    let katecY: number;

    if (isAlreadyDecimal) {
      // 이미 실수형인 경우 그대로 사용
      katecX = x;
      katecY = y;
      console.log(
        `[normalizeKatecCoordinates] 이미 실수형 좌표: katecX=${katecX}, katecY=${katecY}`,
      );
    } else {
      // 정수형인 경우 10000000으로 나누기
      katecX = x / 10000000;
      katecY = y / 10000000;
      console.log(
        `[normalizeKatecCoordinates] 정수형 변환: katecX=${katecX}, katecY=${katecY}`,
      );
    }

    // Naver Maps 형식으로 반환 (위도, 경도 순서)
    const result = {
      lat: katecY, // 위도 (Y)
      lng: katecX, // 경도 (X)
    };

    console.log(
      `[normalizeKatecCoordinates] 좌표 변환 완료: lat=${result.lat}, lng=${result.lng}`,
    );

    return result;
  } catch (error) {
    console.error(
      `[normalizeKatecCoordinates] 좌표 정규화 실패: mapx=${mapx}, mapy=${mapy}`,
      error,
    );
    throw error;
  }
}

/**
 * TourItem 또는 TourDetail의 좌표를 Naver Maps 형식으로 변환
 *
 * 한국관광공사 API 응답 데이터의 mapx, mapy 필드를
 * Naver Maps에서 사용할 수 있는 형식으로 변환합니다.
 *
 * @param mapx - 경도 (KATEC 좌표계, 정수형 문자열)
 * @param mapy - 위도 (KATEC 좌표계, 정수형 문자열)
 * @returns Naver Maps에서 사용할 수 있는 좌표 객체 { lat, lng }
 *
 * @throws {Error} 좌표 값이 유효하지 않은 경우
 *
 * @example
 * ```typescript
 * const tourItem: TourItem = { mapx: "1290000000", mapy: "350000000", ... };
 * const { lat, lng } = convertTourCoordinates(tourItem.mapx, tourItem.mapy);
 * // { lat: 35.0, lng: 129.0 }
 * ```
 */
export function convertTourCoordinates(
  mapx: string,
  mapy: string,
): NaverLatLng {
  console.log(
    `[convertTourCoordinates] 관광지 좌표 변환: mapx=${mapx}, mapy=${mapy}`,
  );
  return normalizeKatecCoordinates(mapx, mapy);
}
