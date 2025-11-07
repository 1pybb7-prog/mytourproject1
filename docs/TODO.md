# 개발 TODO 리스트

> PRD 문서와 Development Guideline을 기반으로 한 개발 작업 체크리스트

---

## Phase 1: 기본 구조 & 공통 설정

### 📊 진행 상황: 20% 완료

### 프로젝트 셋업

- [x] Development Guidelines 숙지 및 검토 ✅
- [x] 환경변수 설정 (`.env.local` 파일) ✅
  - [x] `NEXT_PUBLIC_TOUR_API_KEY` (한국관광공사 API) ✅
  - [ ] `NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID` (Naver Maps API) - 지도 구현 시 필요
  - [x] Clerk 인증 키 (기존 설정 확인) ✅
  - [x] Supabase 키 (기존 설정 확인) ✅

### 기본 구조 및 타입 정의

- [x] `lib/utils.ts` - `cn` 유틸리티 함수 설정 ✅
- [x] `lib/types/tour.ts` - 관광지 타입 정의 ✅
  - [x] `TourItem` 인터페이스 ✅
  - [x] `TourDetail` 인터페이스 ✅
  - [x] `TourIntro` 인터페이스 ✅
- [x] `lib/types/bookmark.ts` - 북마크 타입 정의 ✅
- [x] `lib/utils/coordinate-converter.ts` - 좌표 변환 유틸리티 (KATEC 좌표 정규화) ✅
  - [x] Naver Maps는 KATEC 좌표계 직접 지원 (변환 불필요) ✅
  - [x] 정수형 좌표를 실수형으로 변환하는 함수 구현 ✅

### API 클라이언트

- [x] `lib/api/tour-api.ts` - 한국관광공사 API 호출 함수들 ✅
  - [x] `getAreaCode` - 지역코드 조회 ✅
  - [x] `getAreaBasedList` - 지역 기반 관광정보 조회 ✅
  - [x] `searchKeyword` - 키워드 검색 ✅
  - [x] `getDetailCommon` - 공통 정보 조회 ✅
  - [x] `getDetailIntro` - 소개 정보 조회 ✅
  - [x] `getDetailImage` - 이미지 조회 ✅
- [x] `lib/api/supabase-api.ts` - Supabase 쿼리 함수들 (북마크) ✅
  - [x] 북마크 추가/삭제 함수 ✅
  - [x] 북마크 목록 조회 함수 ✅

### 레이아웃 및 Provider 설정

- [x] `app/layout.tsx` 업데이트 ✅
  - [x] React Query Provider 설정 (`@tanstack/react-query`) ✅
  - [x] Theme Provider 설정 (`next-themes`) ✅
  - [x] ClerkProvider 확인 (기존 설정) ✅
  - [x] SyncUserProvider 확인 (기존 설정) ✅

### 공통 컴포넌트

- [x] `components/ui/Skeleton.tsx` - 로딩 스켈레톤 UI (shadcn/ui) ✅
- [x] `components/ui/sonner.tsx` - 토스트 메시지 (shadcn/ui sonner) ✅
- [x] `components/ui/Button.tsx` - 버튼 컴포넌트 (shadcn/ui) ✅
- [x] `components/ui/Input.tsx` - 입력 컴포넌트 (shadcn/ui) ✅
- [x] `components/ui/Form.tsx` - 폼 컴포넌트 (shadcn/ui) ✅
- [x] `components/ui/Dialog.tsx` - 다이얼로그 컴포넌트 (shadcn/ui) ✅
- [x] `components/ui/Accordion.tsx` - 아코디언 컴포넌트 (shadcn/ui) ✅
- [x] `components/ui/Label.tsx` - 라벨 컴포넌트 (shadcn/ui) ✅
- [x] `components/ui/Textarea.tsx` - 텍스트영역 컴포넌트 (shadcn/ui) ✅
- [x] `components/ErrorBoundary.tsx` - 에러 바운더리 ✅
- [x] `components/LoadingSpinner.tsx` - 로딩 스피너 ✅

### 공통 페이지

- [x] `app/not-found.tsx` - 404 페이지 ✅
  - [x] Guideline 준수: Tailwind CSS 스타일링, Spacing-First 정책 ✅
- [x] `app/robots.ts` - robots.txt 생성 ✅
- [x] `app/sitemap.ts` - sitemap.xml 생성 ✅
- [x] `app/manifest.ts` - PWA 매니페스트 ✅
- [ ] 추가 작업: `NEXT_PUBLIC_SITE_URL` 환경변수 설정 (선택 사항, 기본값으로 작동 가능)
- [ ] 향후 작업: 동적 페이지(/places/[contentId]) 추가 시 sitemap.ts 업데이트 필요

---

## Phase 2: 홈페이지 (`/`) - 관광지 목록

### 📊 진행 상황: 5% 완료

### 페이지 기본 구조

- [x] `app/page.tsx` 생성 ✅
  - Guideline 준수: Next.js 15 App Router 구조 ✅
  - Spacing-First 정책: `padding` + `gap` 사용 ✅
- [x] 기본 UI 구조 확인 (헤더, 메인 영역, 푸터) ✅
  - [x] Navbar 컴포넌트 확인 ✅
- [x] 관광지 목록 기능 구현 완료 ✅

### 관광지 목록 기능 (MVP 2.1)

- [x] `components/TourCard.tsx` ✅
  - Guideline 준수: PascalCase 네이밍, `export default` ✅
  - Spacing-First 정책: `padding` + `gap` 사용 ✅
  - Tailwind CSS 유틸리티 우선 사용 ✅
  - `next/image` 사용 (이미지 최적화) ✅
  - 관광지 기본 정보 표시 (이름, 주소, 썸네일, 타입 뱃지) ✅
- [x] `components/TourList.tsx` ✅
  - React Query 훅 연동 (`useTourList`) ✅
  - 그리드 레이아웃 (반응형) ✅
  - Spacing-First 정책 준수 ✅
  - 로딩/에러/빈 상태 처리 ✅
- [x] `hooks/useTourList.ts` ✅
  - React Query `useQuery` 활용 ✅
  - 하드코딩된 샘플 데이터 반환 (UI 구성용) ✅
  - 페이지네이션 처리 준비 ✅
- [x] `lib/utils/tour-type-converter.ts` - 관광 타입 변환 유틸리티 ✅
- [x] `app/page.tsx` 홈페이지 레이아웃으로 업데이트 ✅
- [x] API 연동하여 실제 데이터 표시 ✅
  - `useTourList` 훅에서 실제 API 호출 (`getAreaBasedList`) ✅
  - 샘플 데이터 필터링 로직 제거 (API에서 처리) ✅
  - 에러 처리 개선 (API 키 미설정, 네트워크 에러 등) ✅
- [x] 페이지 확인 및 스타일링 조정 (반응형 검증) ✅

### 필터 기능

- [x] `components/TourFilter.tsx` ✅
  - Guideline 준수: 불필요한 추상화 금지 ✅
  - shadcn/ui Select 컴포넌트 활용 ✅
  - 지역 필터 (시/도) ✅
  - 관광 타입 필터 ✅
  - Spacing-First 정책 준수 ✅
  - 필터 초기화 버튼 ✅
- [x] `hooks/useTourFilter.ts` ✅
  - 필터 상태 관리 ✅
  - 필터링 로직 분리 ✅
  - React Query와 연동 ✅
- [x] `lib/utils/area-code-converter.ts` - 지역코드 변환 유틸리티 ✅
- [x] 필터 동작 연결 ✅
- [x] 필터링된 결과 표시 ✅
- [x] 페이지 확인 및 UX 개선 ✅

### 검색 기능 (MVP 2.3)

- [x] `components/TourSearch.tsx` ✅
  - shadcn/ui Input 컴포넌트 활용
  - 검색 아이콘 (lucide-react)
  - Spacing-First 정책 준수
- [x] `hooks/useTourSearch.ts` ✅
  - 검색 로직 훅
  - React Query 활용
- [x] 검색 API 연동 (`searchKeyword2`) ✅
- [x] 검색 결과 표시 ✅
- [x] 검색 + 필터 조합 동작 ✅
- [x] 페이지 확인 및 UX 개선 ✅

### 지도 연동 (MVP 2.2)

#### 환경 설정

- [x] Naver Cloud Platform (NCP) Maps API Client ID 발급
- [x] 환경변수 설정: `NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID` ✅
- [x] Client ID 도메인 제한 설정 (보안 강화)
- [x] `package.json`에 `@types/navermaps` 추가 ✅
- [x] `@navermaps/marker-clusterer` 라이브러리 설치 (선택 사항, npm 패키지 없음 - 직접 구현 완료) ✅
  - [x] `lib/utils/marker-clusterer.ts` 생성 ✅
  - [x] 마커 클러스터링 로직 구현 ✅
  - [x] MarkerClusterer 클래스 구현 ✅

#### 지도 로더 구현

- [x] `lib/utils/naver-map-loader.ts` 생성 ✅
  - [x] Naver Maps JavaScript API 동적 로드 함수 ✅
  - [x] 중복 로드 방지 로직 ✅
  - [x] Promise 기반 비동기 로딩 ✅
  - [x] API 초기화 완료 확인 (모든 필수 객체 체크) ✅
  - [x] 에러 처리 (Client ID 오류, 네트워크 오류 등) ✅
  - [x] 타임아웃 처리 (10초) ✅

#### 지도 훅 구현

- [x] `hooks/useNaverMap.ts` 생성 ✅
  - [x] 지도 초기화 및 상태 관리 ✅
  - [x] 지도 인스턴스 생성 및 관리 ✅
  - [x] 마커 생성 및 관리 로직 ✅
  - [x] 정보창(InfoWindow) 관리 ✅
  - [x] 지도 중심 이동 함수 ✅
  - [x] 마커 클릭 이벤트 처리 ✅
  - [x] 로딩 상태 관리 ✅
  - [x] 에러 상태 관리 ✅
  - [x] 클린업 로직 (컴포넌트 unmount 시) ✅

#### 지도 컴포넌트 구현

- [x] `components/NaverMap.tsx` 생성 (홈페이지용 - 여러 마커) ✅

  - [x] Guideline 준수: PascalCase 네이밍, `export default` ✅
  - [x] 동적 로딩: `next/dynamic` 활용 (SSR 비활성화) ✅
  - [x] `useNaverMap` 훅 연동 ✅
  - [x] 관광지 목록을 마커로 표시 ✅
  - [x] 마커 클릭 시 정보창 표시 ✅
    - [x] 관광지명 ✅
    - [x] 간단한 설명 ✅
    - [x] "상세보기" 버튼 ✅
  - [x] 선택된 마커 강조 기능 ✅
  - [x] 마커 클러스터링 (선택 사항) ✅
  - [x] Spacing-First 정책 준수 ✅
  - [x] 로딩 상태 표시 (스켈레톤 또는 스피너) ✅
  - [x] 에러 상태 표시 ✅

- [x] `components/NaverMapSingle.tsx` 생성 (상세페이지용 - 단일 마커) ✅
  - [x] Guideline 준수: PascalCase 네이밍, `export default` ✅
  - [x] 동적 로딩: `next/dynamic` 활용 (SSR 비활성화) ✅
  - [x] `useNaverMap` 훅 연동 ✅
  - [x] 단일 관광지 위치 표시 ✅
  - [x] Spacing-First 정책 준수 ✅
  - [x] 로딩 상태 표시 ✅
  - [x] 에러 상태 표시 ✅

#### 좌표 변환 유틸리티

- [x] `lib/utils/coordinate-converter.ts` 확인/업데이트 ✅
  - [x] KATEC 좌표계 정수형 → 실수형 변환 ✅
  - [x] 변환 함수: `mapx / 10000000`, `mapy / 10000000` ✅
  - [x] Naver Maps 좌표 형식 변환 (경도, 위도 순서) ✅

#### 지도-리스트 연동

- [x] 리스트 항목 클릭 시 해당 마커로 지도 이동 ✅
  - [x] `handleTourSelect` 함수 구현 ✅
  - [x] 선택된 관광지 ID 상태 관리 ✅
  - [x] 지도 중심 이동 (`moveToTour`) ✅
  - [x] 정보창 표시 ✅
- [x] 리스트 항목 호버 시 해당 마커 강조 (선택 사항) ✅
  - [x] `handleTourHover` 함수 구현 ✅
  - [x] 카드 스타일 변경 (임시 강조) ✅

#### 반응형 레이아웃

- [x] 데스크톱 레이아웃 (분할) ✅
  - [x] 리스트(좌측) + 지도(우측) 그리드 레이아웃 ✅
  - [x] 지도 고정 높이: `h-[calc(100vh-8rem)]` ✅
  - [x] 지도 sticky 포지셔닝 ✅
  - [x] Spacing-First 정책: `gap` 사용 ✅
- [x] 모바일 레이아웃 (탭) ✅
  - [x] 탭 형태로 리스트/지도 전환 ✅
  - [x] 지도 최소 높이: 400px ✅
  - [x] `Tabs` 컴포넌트 활용 (shadcn/ui) ✅

#### 지도 컨트롤 (기본)

- [x] 줌 인/아웃 컨트롤
  - [x] 줌 컨트롤 표시 (`zoomControl: true`)
  - [x] 컨트롤 위치 설정 (`TOP_RIGHT`)
- [x] 지도 유형 선택 (선택 사항)
  - [x] 일반/위성/지형 지도 타입 전환
  - [x] `mapTypeControl` 활성화

#### 추가 기능 (선택 사항)

- [x] 현재 위치로 이동 버튼
  - [x] Geolocation API 활용
  - [x] 사용자 위치 권한 요청
  - [x] 현재 위치 마커 표시
- [x] 마커 아이콘 커스터마이징
  - [x] 관광 타입별 아이콘 구분
  - [x] 커스텀 마커 이미지 사용
- [x] 전체화면 모드
- [x] 거리 측정 도구
- [x] 로드뷰 기능 (Street View)

#### 테스트 및 검증

- [ ] 지도 로딩 테스트 (정상 로드 확인)
- [ ] 마커 표시 테스트 (여러 관광지)
- [ ] 마커 클릭 이벤트 테스트
- [ ] 리스트-지도 연동 테스트
- [ ] 반응형 레이아웃 테스트 (모바일/데스크톱)
- [ ] 에러 처리 테스트 (Client ID 오류, 네트워크 오류)
- [ ] 성능 테스트 (많은 마커 처리)
- [ ] API 사용량 모니터링 (Naver Cloud Platform Console)

### 정렬 & 페이지네이션

- [x] 정렬 옵션 추가 ✅
  - 최신순 (modifiedtime 기준)
  - 이름순 (가나다순)
- [x] 페이지네이션 또는 무한 스크롤 ✅
  - shadcn/ui Pagination 컴포넌트 활용
- [x] 로딩 상태 개선 ✅
  - Skeleton UI 적용
- [x] 최종 페이지 확인 ✅

---

## Phase 3: 상세페이지 (`/places/[contentId]`)

### 📊 진행 상황: 50% 완료

### 페이지 기본 구조

- [x] `app/places/[contentId]/page.tsx` 생성 ✅
  - [x] Next.js 15: `await params` 사용 필수 ✅
  - [x] `generateMetadata` 함수로 SEO 최적화 ✅
  - [x] Open Graph 메타태그 설정 ✅
- [x] 기본 레이아웃 구조 ✅
  - [x] 뒤로가기 버튼 ✅
  - [x] 섹션 구분 ✅
  - [x] Spacing-First 정책 준수 ✅
- [ ] 라우팅 테스트 (홈에서 클릭 시 이동)

### 기본 정보 섹션 (MVP 2.4.1)

- [x] `components/tour-detail/TourDetailInfo.tsx` ✅
  - [x] Guideline 준수: PascalCase 네이밍 ✅
  - [x] `next/image` 사용 (이미지 최적화) ✅
  - [x] Spacing-First 정책 준수 ✅
  - [x] 관광지명, 대표 이미지, 주소, 전화번호, 홈페이지, 개요 표시 ✅
- [x] `hooks/useTourDetail.ts` ✅
  - [x] 상세 데이터 페칭 훅 ✅
  - [x] React Query 활용 ✅
- [x] `detailCommon2` API 연동 ✅
- [x] 주소 복사 기능 ✅
  - [x] `navigator.clipboard.writeText` 활용 ✅
  - [x] 토스트 메시지 표시 ✅
- [x] 전화번호 클릭 시 전화 연결 ✅
  - [x] `tel:` 링크 사용 ✅
- [ ] 페이지 확인 및 스타일링 (반응형 검증)

### 지도 섹션 (MVP 2.4.4)

#### 기본 구현

- [x] `components/tour-detail/TourDetailMap.tsx` - 외부 지도 링크만 제공 ✅
  - [x] "길찾기" 버튼 (Naver Maps 길찾기 링크) ✅
  - [x] "지도에서 보기" 버튼 (Naver Maps 웹/앱 연동) ✅
  - [x] 주소 정보 표시 ✅

#### 임베디드 지도 구현

- [ ] `NaverMapSingle` 컴포넌트 연동
  - [ ] `components/tour-detail/TourDetailMap.tsx`에 지도 표시 추가
  - [ ] 동적 로딩: `next/dynamic` 활용
  - [ ] 단일 관광지 위치 표시
  - [ ] 마커 1개 표시
  - [ ] 지도 크기: `aspect-square` 또는 고정 높이
- [ ] 좌표 변환
  - [ ] `detailCommon2` API에서 `mapx`, `mapy` 가져오기
  - [ ] KATEC 좌표계 변환 (`coordinate-converter.ts` 활용)
  - [ ] Naver Maps 좌표 형식으로 변환
- [ ] 지도 컨트롤
  - [ ] 줌 레벨 설정 (관광지 중심으로 적절한 줌)
  - [ ] 줌 인/아웃 컨트롤 표시
- [ ] 버튼 기능 유지
  - [x] "길찾기" 버튼 (Naver Maps 길찾기 링크) ✅
  - [x] "지도에서 보기" 버튼 (Naver Maps 웹/앱 연동) ✅

#### 레이아웃 및 스타일링

- [ ] 지도 섹션 레이아웃
  - [ ] 주소 정보 + 지도 + 버튼 순서
  - [ ] Spacing-First 정책 준수 (`gap` 사용)
  - [ ] 반응형 디자인 (모바일/데스크톱)
- [ ] 지도 컨테이너 스타일링
  - [ ] 테두리 및 둥근 모서리
  - [ ] 적절한 높이 설정
  - [ ] 오버플로우 처리

#### 테스트 및 검증

- [ ] 상세페이지에서 지도 표시 확인
- [ ] 마커 위치 정확도 확인
- [ ] 버튼 동작 확인 (길찾기, 지도에서 보기)
- [ ] 반응형 레이아웃 테스트

### 공유 기능 (MVP 2.4.5)

- [x] `components/tour-detail/ShareButton.tsx` ✅
  - Guideline 준수: PascalCase 네이밍 ✅
  - shadcn/ui Button 컴포넌트 활용 ✅
- [x] URL 복사 기능 ✅
  - `navigator.clipboard.writeText` 활용 ✅
- [x] 복사 완료 토스트 메시지 ✅
  - shadcn/ui Toast 활용 ✅
- [x] Open Graph 메타태그 동적 생성 ✅
  - `generateMetadata` 함수에서 설정 ✅
- [ ] 페이지 확인 및 공유 테스트

### 추가 정보 섹션

- [x] `components/tour-detail/TourDetailIntro.tsx` ✅
  - Guideline 준수: PascalCase 네이밍 ✅
  - 운영정보 표시 (운영시간, 휴무일, 이용요금, 주차 등) ✅
- [x] `detailIntro2` API 연동 (React Query 활용) ✅
- [x] `components/tour-detail/TourDetailGallery.tsx` ✅
  - Guideline 준수: PascalCase 네이밍 ✅
  - `next/image` 사용 (이미지 최적화) ✅
  - 간단한 캐러셀 구현 (그리드 레이아웃) ✅
  - 이미지 클릭 시 전체화면 모달 ✅
- [x] `detailImage2` API 연동 ✅
- [ ] 페이지 확인 (반응형 검증)

---

## Phase 4: 북마크 페이지 (`/bookmarks`) - 선택 사항

### 📊 진행 상황: 30% 완료

### Supabase 설정

- [x] `supabase/migrations/` 마이그레이션 파일 생성 ✅
- [x] `bookmarks` 테이블 생성 ✅
  - [x] `id` (UUID, Primary Key) ✅
  - [x] `user_id` (UUID, users 테이블 참조) ✅
  - [x] `content_id` (TEXT, 관광지 ID) ✅
  - [x] `created_at` (TIMESTAMP) ✅
  - [x] 인덱스 설정 ✅
  - [x] UNIQUE 제약 (user_id, content_id) ✅
- [x] RLS 정책 설정 ✅
  - [x] RLS 비활성화 (개발 환경) ✅
  - [ ] 프로덕션용 RLS 정책 설정 필요

### 북마크 기능 구현

- [x] `components/bookmarks/BookmarkButton.tsx`
  - Guideline 준수: PascalCase 네이밍
  - shadcn/ui Button 컴포넌트 활용
  - 별 아이콘 (채워짐/비어있음)
  - 북마크 상태 표시
- [x] `hooks/useBookmark.ts`
  - 북마크 로직 훅
  - React Query mutation 활용
  - Supabase 클라이언트 연동
- [x] 상세페이지에 북마크 버튼 추가
- [x] Supabase DB 연동
  - Server Actions 또는 API Route 사용
- [x] 인증된 사용자 확인
  - Clerk `useAuth` 훅 활용
- [x] 로그인하지 않은 경우 로그인 유도 모달
  - Clerk SignInButton 컴포넌트 활용
- [x] 상세페이지에서 북마크 동작 확인

### 북마크 목록 페이지

- [ ] `app/bookmarks/page.tsx` 생성
  - Next.js 15: `await params` 사용 (필요시)
  - `generateMetadata` 함수로 SEO 최적화
  - 인증된 사용자만 접근 가능
- [ ] `components/bookmarks/BookmarkList.tsx`
  - `TourCard` 컴포넌트 재사용
  - Guideline 준수: Spacing-First 정책
- [ ] `hooks/useBookmarkList.ts`
  - 북마크 목록 훅
  - React Query 활용
- [ ] 북마크한 관광지 목록 표시
- [ ] 정렬 옵션
  - 최신순, 이름순, 지역별
- [ ] 일괄 삭제 기능
- [ ] 페이지 확인 (반응형 검증)

---

## Phase 5: 최적화 & 배포

### 📊 진행 상황: 10% 완료

### 이미지 최적화

- [x] `next.config.ts` 외부 도메인 설정 ✅
  - [x] 기본 images 설정 확인 ✅
  - [x] 한국관광공사 이미지 도메인 허용 ✅
    - [x] `cdn.visitkorea.or.kr` ✅
    - [x] `tong.visitkorea.or.kr` ✅
  - [ ] Naver Maps 이미지 도메인 허용 (지도 기능 구현 시 필요)
- [ ] `next/image` 사용 확인
  - 모든 이미지에 `Image` 컴포넌트 사용
  - `loading="lazy"` 설정
  - `priority` 속성 적절히 사용

### 전역 에러 핸들링

- [ ] Error Boundary 구현
  - `components/ErrorBoundary.tsx` 활용
- [ ] API 에러 처리 통일
  - 에러 메시지 표시
  - 재시도 버튼 제공
- [ ] 네트워크 에러 처리
  - 오프라인 안내

### SEO 최적화

- [ ] 메타태그 설정
  - `generateMetadata` 함수 활용
  - 동적 메타태그 생성
- [ ] `sitemap.xml` 생성
  - `app/sitemap.ts` 파일 확인
- [ ] `robots.txt` 설정
  - `app/robots.ts` 파일 확인
- [ ] Open Graph 메타태그
  - 모든 페이지에 적절한 OG 태그 설정

### 성능 최적화

- [ ] 동적 import 활용
  - `next/dynamic` 사용
  - 무거운 컴포넌트 lazy loading
  - [ ] Naver Maps 동적 로딩 (`next/dynamic` 활용)
- [ ] React Query 캐싱 전략
  - 적절한 `staleTime`, `cacheTime` 설정
  - Query Key 전략 수립
- [ ] 이미지 lazy loading
  - 모든 이미지에 `loading="lazy"` 설정
  - Above-the-fold 이미지는 `priority` 사용

### 성능 측정

- [ ] Lighthouse 점수 측정
  - 목표: > 80점
  - Performance, Accessibility, Best Practices, SEO
- [ ] Core Web Vitals 측정
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)

### 환경변수 보안 검증

- [ ] API Key 도메인 제한 설정
  - 한국관광공사 API Key 제한 (가능한 경우)
  - [ ] Naver Maps Client ID 제한 (도메인 제한 설정 권장)
- [ ] 환경변수 노출 확인
  - `NEXT_PUBLIC_` 접두사 확인
  - 민감한 정보는 서버 사이드만 사용

### Guideline 준수 최종 검토

- [ ] 컴포넌트 네이밍 규칙 확인
  - PascalCase 사용
  - `[Domain][Role][Variant]` 패턴 준수
  - 금지어 사용하지 않음 (Common, Base, Util 등)
- [ ] Export 규칙 확인
  - 단일 컴포넌트: `export default`
  - 다중 export: named export
  - 페이지 컴포넌트: `export default`
- [ ] Spacing-First 정책 확인
  - `margin` 사용하지 않음
  - `padding` + `gap` 사용
  - 외곽 여백은 상단 래퍼의 padding
  - 형제 요소 간격은 부모의 gap
- [ ] 불필요한 추상화 제거 확인
  - 단순 스타일링 래퍼 컴포넌트 없음
  - 의미 없는 컨테이너 컴포넌트 없음
  - 불필요한 배럴 익스포트 없음
- [ ] 스타일링 시스템 확인
  - Tailwind CSS 유틸리티 우선 사용
  - 인라인 스타일 사용하지 않음
  - `next/image` 사용
  - 배경 이미지: Image 컴포넌트 + 오버레이

### 배포 준비

- [ ] Vercel 배포 설정
  - 환경변수 설정
  - 도메인 연결
- [ ] 배포 후 테스트
  - 모든 페이지 동작 확인
  - 반응형 디자인 확인
  - 성능 측정
  - SEO 확인

---

## 추가 작업 (선택 사항)

### 향후 개선 사항

- [ ] 지도 기능 고도화 (기본 구현 완료 후)
  - [ ] 현재 위치로 이동 버튼 (Geolocation API)
  - [ ] 마커 아이콘 커스터마이징 (관광 타입별 구분)
  - [ ] 전체화면 모드
  - [ ] 거리 측정 도구
  - [ ] 로드뷰 기능 (Street View)
  - [ ] Geocoding API 연동 (주소 → 좌표 변환)
  - [ ] Reverse Geocoding API 연동 (좌표 → 주소 변환)
  - [ ] Directions API 연동 (경로 표시 및 길찾기)
- [ ] 반려동물 정보 표시 (`detailPetTour2` API)
- [ ] 리뷰/평점 시스템 (Supabase 활용)
- [ ] 조회수 추적
- [ ] 인기 관광지 랭킹
- [ ] 사용자 맞춤 추천
- [ ] 다국어 지원 (i18n)
- [ ] PWA 지원 (오프라인 기능)

---

## 참고사항

### 필수 라이브러리 설치

```bash
# Naver Maps 클러스터링 (선택 사항)
pnpm add @navermaps/marker-clusterer

# Naver Maps 타입 정의
pnpm add -D @types/navermaps

# 이미지 슬라이더 (선택)
pnpm add swiper
```

**참고**:

- Naver Maps는 KATEC 좌표계를 직접 지원하므로 좌표 변환 라이브러리(`proj4`, `katec-to-wgs84`)가 불필요합니다.
- 좌표 변환은 `lib/utils/coordinate-converter.ts`에서 정수형 → 실수형 변환만 수행합니다.

### shadcn/ui 컴포넌트 설치

```bash
# 필수 컴포넌트
pnpx shadcn@latest add button
pnpx shadcn@latest add input
pnpx shadcn@latest add select
pnpx shadcn@latest add radio-group
pnpx shadcn@latest add skeleton
pnpx shadcn@latest add toast
pnpx shadcn@latest add pagination
```

### 개발 시 주의사항

- 모든 컴포넌트는 PascalCase 네이밍 사용
- Spacing-First 정책 준수 (`margin` 금지)
- `next/image` 사용으로 이미지 최적화
- React Query로 서버 상태 관리
- Guideline 규칙 준수 확인
