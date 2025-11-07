/**
 * @file naver-map-loader.ts
 * @description Naver Maps JavaScript API 동적 로더
 *
 * Naver Maps JavaScript API를 동적으로 로드하고 초기화하는 유틸리티입니다.
 * Next.js의 SSR 환경에서 안전하게 동작하도록 설계되었습니다.
 *
 * 주요 기능:
 * 1. Naver Maps JavaScript API 동적 로드
 * 2. 중복 로드 방지 로직
 * 3. Promise 기반 비동기 로딩
 * 4. API 초기화 완료 확인 (필수 객체 체크)
 * 5. 에러 처리 (Client ID 오류, 네트워크 오류 등)
 * 6. 타임아웃 처리 (10초)
 *
 * @see {@link /docs/prd.md#22-naver-지도-연동} - PRD 문서의 지도 연동 섹션
 */

/**
 * Naver Maps API 로드 옵션
 */
export interface LoadNaverMapsOptions {
  /** 타임아웃 시간 (밀리초, 기본값: 10000) */
  timeout?: number;
  /** 재시도 횟수 (기본값: 0) */
  retries?: number;
}

/**
 * Naver Maps API 로드 에러 타입
 */
export class NaverMapsLoadError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "NaverMapsLoadError";
  }
}

/**
 * 스크립트 태그 ID
 */
const NAVER_MAPS_SCRIPT_ID = "naver-maps-script";

/**
 * 로드 중인 Promise (중복 로드 방지)
 */
let loadPromise: Promise<typeof naver.maps> | null = null;

/**
 * Naver Maps API가 로드되었는지 확인
 *
 * @returns API가 로드되었는지 여부
 */
function isNaverMapsLoaded(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    typeof window.naver !== "undefined" &&
    typeof window.naver.maps !== "undefined" &&
    typeof window.naver.maps.Map !== "undefined" &&
    typeof window.naver.maps.Marker !== "undefined" &&
    typeof window.naver.maps.InfoWindow !== "undefined" &&
    typeof window.naver.maps.LatLng !== "undefined" &&
    typeof window.naver.maps.LatLngBounds !== "undefined" &&
    typeof window.naver.maps.Point !== "undefined" &&
    typeof window.naver.maps.Event !== "undefined"
  );
}

/**
 * Naver Maps API 초기화 완료 확인
 *
 * @param naverMaps - naver.maps 객체
 * @returns 초기화 완료 여부
 */
function isNaverMapsInitialized(naverMaps: typeof naver.maps): boolean {
  try {
    // 필수 객체 확인 (실제 Naver Maps API에서 제공하는 객체만 확인)
    // 참고: naver.maps.Bounds는 존재하지 않으며, LatLngBounds만 존재합니다
    const requiredObjects = [
      "Map",
      "Marker",
      "InfoWindow",
      "LatLng",
      "LatLngBounds",
      "Point",
      "Event",
      "Size",
    ];

    for (const objName of requiredObjects) {
      if (!naverMaps[objName]) {
        console.error(`[loadNaverMaps] 필수 객체 누락: naver.maps.${objName}`);
        return false;
      }
    }

    // 생성자 함수 확인
    if (typeof naverMaps.Map !== "function") {
      console.error("[loadNaverMaps] naver.maps.Map이 함수가 아닙니다");
      return false;
    }

    return true;
  } catch (error) {
    console.error("[loadNaverMaps] 초기화 확인 중 에러:", error);
    return false;
  }
}

/**
 * 타임아웃 Promise 생성
 *
 * @param timeout - 타임아웃 시간 (밀리초)
 * @returns 타임아웃 에러를 발생시키는 Promise
 */
function createTimeoutPromise(timeout: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(
        new NaverMapsLoadError(
          `Naver Maps API 로드 타임아웃 (${timeout}ms 초과)`,
          "TIMEOUT",
        ),
      );
    }, timeout);
  });
}

/**
 * Naver Maps JavaScript API 스크립트 로드
 *
 * @param clientId - Naver Cloud Platform Client ID
 * @returns Promise<HTMLScriptElement>
 */
function loadScript(clientId: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    // 이미 스크립트가 존재하는지 확인
    const existingScript = document.getElementById(
      NAVER_MAPS_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      // 이미 로드 중이거나 로드 완료된 경우
      if (existingScript.dataset.loaded === "true") {
        resolve(existingScript);
        return;
      }

      // 로드 중인 경우 이벤트 리스너 추가
      existingScript.addEventListener("load", () => {
        existingScript.dataset.loaded = "true";
        resolve(existingScript);
      });
      existingScript.addEventListener("error", (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Naver Maps 스크립트 로드 실패";
        reject(
          new NaverMapsLoadError(
            errorMessage,
            "SCRIPT_LOAD_ERROR",
            error instanceof Error ? error : undefined,
          ),
        );
      });
      return;
    }

    // 새 스크립트 생성
    const script = document.createElement("script");
    script.id = NAVER_MAPS_SCRIPT_ID;
    // 신규 통합 API 파라미터 사용 (ncpKeyId)
    // @see https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.defer = true;
    script.dataset.loaded = "false";

    // 로드 성공
    script.onload = () => {
      script.dataset.loaded = "true";
      console.log("[loadNaverMaps] Naver Maps 스크립트 로드 완료");
      resolve(script);
    };

    // 로드 실패
    script.onerror = (error) => {
      console.error("[loadNaverMaps] Naver Maps 스크립트 로드 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Naver Maps 스크립트 로드 실패 (네트워크 오류 또는 Client ID 오류)";
      reject(
        new NaverMapsLoadError(
          errorMessage,
          "SCRIPT_LOAD_ERROR",
          error instanceof Error ? error : undefined,
        ),
      );
    };

    // 스크립트 추가
    document.head.appendChild(script);
  });
}

/**
 * Naver Maps API가 완전히 로드될 때까지 대기
 *
 * @param maxWaitTime - 최대 대기 시간 (밀리초, 기본값: 8000)
 * @param checkInterval - 확인 간격 (밀리초, 기본값: 100)
 * @returns Promise<typeof naver.maps>
 */
function waitForNaverMaps(
  maxWaitTime: number = 8000,
  checkInterval: number = 100,
): Promise<typeof naver.maps> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkIntervalId = setInterval(() => {
      // 타임아웃 확인
      if (Date.now() - startTime > maxWaitTime) {
        clearInterval(checkIntervalId);
        reject(
          new NaverMapsLoadError(
            `Naver Maps API 초기화 대기 타임아웃 (${maxWaitTime}ms 초과)`,
            "INIT_TIMEOUT",
          ),
        );
        return;
      }

      // API 로드 확인
      if (isNaverMapsLoaded()) {
        const naverMaps = window.naver.maps;

        // 초기화 완료 확인
        if (isNaverMapsInitialized(naverMaps)) {
          clearInterval(checkIntervalId);
          console.log("[loadNaverMaps] Naver Maps API 초기화 완료");
          resolve(naverMaps);
          return;
        }
      }
    }, checkInterval);
  });
}

/**
 * Naver Maps JavaScript API 로드
 *
 * @param options - 로드 옵션
 * @returns Promise<typeof naver.maps> - 로드된 Naver Maps API 객체
 *
 * @example
 * ```typescript
 * import { loadNaverMaps } from "@/lib/utils/naver-map-loader";
 *
 * // 기본 사용
 * const naverMaps = await loadNaverMaps();
 * const map = new naverMaps.Map("map", {
 *   center: new naverMaps.LatLng(37.5665, 126.9780),
 *   zoom: 10,
 * });
 *
 * // 옵션 지정
 * const naverMaps = await loadNaverMaps({
 *   timeout: 15000,
 *   retries: 2,
 * });
 * ```
 */
export async function loadNaverMaps(
  options: LoadNaverMapsOptions = {},
): Promise<typeof naver.maps> {
  const { timeout = 10000, retries = 0 } = options;

  // SSR 환경 확인
  if (typeof window === "undefined") {
    throw new NaverMapsLoadError(
      "Naver Maps API는 브라우저 환경에서만 로드할 수 있습니다",
      "SSR_ERROR",
    );
  }

  // Client ID 확인
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
  if (!clientId) {
    throw new NaverMapsLoadError(
      "NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID 환경변수가 설정되지 않았습니다",
      "CLIENT_ID_MISSING",
    );
  }

  // 이미 로드된 경우 즉시 반환
  if (isNaverMapsLoaded()) {
    const naverMaps = window.naver.maps;
    if (isNaverMapsInitialized(naverMaps)) {
      console.log("[loadNaverMaps] 이미 로드된 Naver Maps API 사용");
      return naverMaps;
    }
  }

  // 중복 로드 방지: 이미 로드 중인 경우 기존 Promise 반환
  if (loadPromise) {
    console.log("[loadNaverMaps] 이미 로드 중인 Naver Maps API 대기");
    return loadPromise;
  }

  // 로드 함수
  const doLoad = async (): Promise<typeof naver.maps> => {
    try {
      // 스크립트 로드
      await loadScript(clientId);

      // API 초기화 대기 (타임아웃 적용)
      // 스크립트 로드 후 API 초기화까지 시간이 필요하므로 여유있게 설정
      const initTimeout = Math.max(timeout - 2000, 5000); // 최소 5초는 보장
      const naverMaps = await Promise.race([
        waitForNaverMaps(initTimeout, 100),
        createTimeoutPromise(timeout),
      ]);

      return naverMaps;
    } catch (error) {
      // 로드 실패 시 Promise 초기화
      loadPromise = null;

      // 재시도 로직
      if (retries > 0 && error instanceof NaverMapsLoadError) {
        console.warn(
          `[loadNaverMaps] 로드 실패, 재시도 중... (남은 횟수: ${retries})`,
          error,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기 후 재시도
        return loadNaverMaps({ ...options, retries: retries - 1 });
      }

      throw error;
    }
  };

  // 로드 시작
  loadPromise = doLoad();

  try {
    const result = await loadPromise;
    return result;
  } finally {
    // 성공/실패와 관계없이 Promise 초기화 (재시도를 위해)
    if (retries === 0) {
      loadPromise = null;
    }
  }
}

/**
 * Naver Maps API가 로드되었는지 확인
 *
 * @returns API가 로드되었는지 여부
 */
export function isLoaded(): boolean {
  return isNaverMapsLoaded();
}

/**
 * 로드된 Naver Maps API 객체 가져오기
 *
 * @returns naver.maps 객체 또는 null
 */
export function getNaverMaps(): typeof naver.maps | null {
  if (isNaverMapsLoaded()) {
    return window.naver.maps;
  }
  return null;
}
