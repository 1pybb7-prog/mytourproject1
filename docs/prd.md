# PRD: 한국 관광지 정보 서비스 (My Trip)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목적

한국관광공사 공공 API를 활용하여 사용자가 전국의 관광지 정보를 쉽게 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스 개발

### 1.2 타겟 유저

- 국내 여행을 계획하는 사용자
- 주변 관광지를 찾는 사용자
- 특정 지역의 관광 정보가 필요한 사용자

### 1.3 핵심 가치

- **편리성**: 전국 관광지 정보를 한 곳에서 검색
- **시각화**: Naver 지도 연동으로 위치 기반 정보 제공
- **상세성**: 운영시간, 요금, 이미지 등 종합 정보 제공

---

## 2. MVP 핵심 기능

### 2.1 관광지 목록 + 지역/타입 필터

#### 기능 설명

사용자가 지역(시/도)과 관광 타입을 선택하여 해당하는 관광지 목록을 조회

#### 상세 요구사항

- **지역 필터**

  - 시/도 단위 선택 (서울, 부산, 경기 등)
  - 시/군/구 단위 선택 (선택 사항)
  - "전체" 옵션 제공

- **관광 타입 필터**

  - 관광지 (12)
  - 문화시설 (14)
  - 축제/행사 (15)
  - 여행코스 (25)
  - 레포츠 (28)
  - 숙박 (32)
  - 쇼핑 (38)
  - 음식점 (39)
  - "전체" 옵션 제공

- **목록 표시 정보**

  - 썸네일 이미지 (없으면 기본 이미지)
  - 관광지명
  - 주소
  - 관광 타입 뱃지
  - 간단한 개요 (1-2줄)

- **페이지네이션**

  - 페이지당 10-20개 항목
  - 무한 스크롤 또는 페이지 번호 선택

- **정렬 옵션**
  - 최신순 (modifiedtime 기준)
  - 이름순 (가나다순)

#### 사용 API

- `areaCode2`: 지역코드 조회
- `areaBasedList2`: 지역 기반 관광정보 조회

#### UI 요구사항

- 반응형 디자인 (모바일/태블릿/데스크톱)
- 카드 형태의 그리드 레이아웃
- 필터는 상단 또는 사이드바에 배치
- 로딩 상태 표시

---

### 2.2 Naver 지도 연동

#### 기능 설명

관광지 목록의 위치를 Naver 지도에 마커로 표시하고, 사용자 인터랙션 제공

#### 상세 요구사항

- **지도 표시**

  - 초기 중심: 선택된 지역의 중심 좌표
  - 줌 레벨: 지역 범위에 따라 자동 조정
  - 모든 관광지를 마커로 표시

- **마커 기능**

  - 각 관광지를 마커로 표시
  - 마커 클릭 시 정보창(InfoWindow) 표시
    - 관광지명
    - 간단한 설명
    - "상세보기" 버튼
  - 마커 아이콘: 관광 타입별로 구분 (선택 사항)
  - 마커 클러스터링: 많은 마커가 있을 때 자동으로 그룹화 (선택 사항)

- **지도-리스트 연동**

  - 리스트 항목 클릭 시 해당 마커로 지도 이동 및 정보창 표시
  - 리스트 항목 호버 시 해당 마커 강조 (선택 사항)

- **지도 컨트롤**
  - 줌 인/아웃
  - 지도 유형 선택 (일반/위성/지형)
  - 현재 위치로 이동 버튼 (Geolocation API 활용)
  - 전체화면 모드 (선택 사항)
  - 거리 측정 도구 (선택 사항)
  - 로드뷰 기능 (Street View, 선택 사항)

#### 기술 요구사항

- **Naver Maps JavaScript API** 사용

  - Naver Cloud Platform (NCP) Maps API 사용
  - Client ID 방식 인증 (`NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID`)
  - 필요한 API 라이브러리:
    - 기본 지도 (naver.maps.Map)
    - 마커 표시 (naver.maps.Marker)
    - 정보창 (naver.maps.InfoWindow)
  - 클러스터링: `@navermaps/marker-clusterer` 라이브러리 활용 (선택 사항)

- **좌표 데이터 변환**: `mapx` (경도), `mapy` (위도)

  - 한국관광공사 API는 KATEC 좌표계, 정수형으로 저장
  - Naver 지도는 KATEC 좌표계를 직접 지원하므로 변환 불필요
  - 변환 방법:
    1. 정수형 좌표를 실수형으로 변환: `mapx / 10000000`, `mapy / 10000000`
    2. Naver Maps에 직접 사용 가능 (KATEC 좌표계 지원)
  - Naver 지도는 KATEC 좌표계 사용 (경도, 위도 순서)

- **API 제한사항**

  - Client ID는 도메인 제한 설정 권장
  - 일일 할당량 모니터링 필요
  - Naver Cloud Platform Console에서 사용량 추적 및 알림 설정
  - 무료 할당량: 월 30,000회 지도 로드

- **추가 기능 (선택 사항)**
  - Geocoding API: 주소 → 좌표 변환
  - Reverse Geocoding API: 좌표 → 주소 변환
  - Directions API: 경로 표시 및 길찾기 기능

#### UI 요구사항

- 데스크톱: 리스트(좌측) + 지도(우측) 분할 레이아웃
- 모바일: 탭 형태로 리스트/지도 전환
- 지도 최소 높이: 400px (모바일), 600px (데스크톱)

---

### 2.3 키워드 검색

#### 기능 설명

사용자가 입력한 키워드로 관광지를 검색하고 결과를 표시

#### 상세 요구사항

- **검색 기능**

  - 검색창에 키워드 입력
  - 엔터 또는 검색 버튼 클릭으로 검색 실행
  - 자동완성 기능 (선택 사항)

- **검색 범위**

  - 관광지명
  - 주소
  - 설명 내용

- **검색 결과**

  - 목록 형태로 표시 (2.1과 동일한 카드 레이아웃)
  - 지도에 마커로 표시
  - 검색 결과 개수 표시
  - 결과 없음 시 안내 메시지

- **검색 필터 조합**
  - 키워드 + 지역 필터
  - 키워드 + 관광 타입 필터
  - 모든 필터 동시 적용 가능

#### 사용 API

- `searchKeyword2`: 키워드 검색

#### UI 요구사항

- 헤더에 검색창 고정
- 검색창 너비: 최소 300px (모바일), 500px (데스크톱)
- 검색 아이콘 표시
- 검색 중 로딩 스피너

---

### 2.4 상세페이지

#### 기능 설명

사용자가 관광지를 클릭하면 상세 정보를 보여주는 페이지로 이동

#### 상세 요구사항

##### 2.4.1 기본 정보 섹션

- **표시 항목** (detailCommon2)
  - 관광지명 (대제목)
  - 대표 이미지 (크게 표시)
  - 주소 (복사 기능)
  - 전화번호 (클릭 시 전화 연결)
  - 홈페이지 (링크)
  - 개요 (긴 설명문)
  - 관광 타입 및 카테고리

##### 2.4.2 운영 정보 섹션

- **표시 항목** (detailIntro2)
  - 운영시간 / 개장시간
  - 휴무일
  - 이용요금
  - 주차 가능 여부
  - 수용인원
  - 체험 프로그램 (있는 경우)
  - 유모차/반려동물 동반 가능 여부

##### 2.4.3 이미지 갤러리

- **표시 항목** (detailImage2)
  - 대표 이미지 + 서브 이미지들
  - 이미지 클릭 시 전체화면 모달
  - 이미지 슬라이드 기능
  - 이미지 없으면 기본 이미지

##### 2.4.4 지도 섹션

- **표시 항목**
  - 해당 관광지 위치를 Naver 지도에 표시
  - 마커 1개 (해당 관광지)
  - "길찾기" 버튼 → Naver Maps 길찾기 링크 (웹/앱 연동)
  - "지도에서 보기" 버튼 → Naver Maps 웹/앱에서 열기
  - 좌표 정보 표시 (선택 사항)

##### 2.4.5 추가 기능

###### 공유하기

- **URL 복사**
  - 클립보드 복사 기능
  - 복사 완료 토스트 메시지
  - 공유 아이콘 버튼 (Share/Link 아이콘)

###### 북마크 (Supabase 연동)

- **기능**

  - 즐겨찾기 추가/제거
  - 별 아이콘 (채워짐/비어있음)
  - 북마크 개수 표시 (선택 사항)

- **데이터 저장**

  - ~~localStorage~~ → Supabase `bookmarks` 테이블
  - 인증된 사용자만 사용 가능
  - 로그인하지 않은 경우: 로그인 유도 또는 localStorage 임시 저장

- **북마크 목록 페이지** (`/bookmarks`, 선택 사항)
  - 사용자가 북마크한 관광지 목록
  - 카드 레이아웃 (2.1과 동일)
  - 정렬: 최신순, 이름순, 지역별
  - 일괄 삭제 기능

###### 기술 요구사항

- **클립보드 API**

  - `navigator.clipboard.writeText()`
  - HTTPS 환경 필수

- **Open Graph 메타태그** (SEO 최적화)
  - 동적 메타태그 생성 (Next.js Metadata API)
  - 필수 속성:
    - `og:title`: 관광지명
    - `og:description`: 관광지 설명 (100자 이내)
    - `og:image`: 대표 이미지 (1200x630 권장)
    - `og:url`: 상세페이지 URL
    - `og:type`: "website"

#### 사용 API

- `detailCommon2`: 공통 정보
- `detailIntro2`: 소개 정보
- `detailImage2`: 이미지 목록
- `detailPetTour2`: 반려동물 정보 (선택 사항)

#### URL 구조

```
/places/[contentId]
예: /places/125266
```

#### UI 요구사항

- 단일 컬럼 레이아웃 (모바일 우선)
- 섹션별 구분선 또는 카드
- 뒤로가기 버튼 (헤더)
- 이미지 갤러리: swiper 또는 캐러셀
- 정보 없는 항목은 숨김 처리

---

## 3. 기술 스택

### 3.1 Frontend

- **Framework**: Next.js 15.5.6 (App Router)
  - 동적 라우트 파라미터: `await params` 사용 필수
  - 이미지 최적화: `next/image` 사용
  - 메타데이터: `generateMetadata` 함수 활용
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
  - Spacing-First 정책: `padding` + `gap` 사용, `margin` 금지
  - 인라인 스타일 금지 (`style={{ }}` 사용 금지)
- **UI Components**: shadcn/ui (Radix UI 기반)
- **Icons**: lucide-react
- **Maps**: Naver Maps JavaScript API
- **State Management**: React Query (@tanstack/react-query) - 서버 상태
- **Theme**: next-themes - 다크모드 지원

### 3.2 Authentication

- **Clerk**: 사용자 인증 (로그인 필요 시)

### 3.3 Database

- **Supabase**: PostgreSQL (북마크, 사용자 기록 저장 시)

### 3.4 API

- **한국관광공사 공공 API**: KorService2
- **Naver Maps API**: Maps JavaScript API

---

## 4. API 명세

### 4.1 사용 API 목록

| API           | 엔드포인트        | 용도                | 필수 파라미터                                             |
| ------------- | ----------------- | ------------------- | --------------------------------------------------------- |
| 지역코드 조회 | `/areaCode2`      | 지역 필터 생성      | serviceKey, MobileOS, MobileApp                           |
| 지역기반 조회 | `/areaBasedList2` | 관광지 목록         | serviceKey, MobileOS, MobileApp, areaCode, contentTypeId  |
| 키워드 검색   | `/searchKeyword2` | 검색 기능           | serviceKey, MobileOS, MobileApp, keyword                  |
| 공통정보 조회 | `/detailCommon2`  | 상세페이지 기본정보 | serviceKey, MobileOS, MobileApp, contentId                |
| 소개정보 조회 | `/detailIntro2`   | 상세페이지 운영정보 | serviceKey, MobileOS, MobileApp, contentId, contentTypeId |
| 이미지 조회   | `/detailImage2`   | 상세페이지 갤러리   | serviceKey, MobileOS, MobileApp, contentId                |

### 4.2 Base URL

```
https://apis.data.go.kr/B551011/KorService2
```

### 4.3 공통 파라미터

- `serviceKey`: 인증키 (환경변수)
- `MobileOS`: "ETC"
- `MobileApp`: "MyTrip"
- `_type`: "json"
- `numOfRows`: 10-20 (목록 조회 시)
- `pageNo`: 1, 2, 3... (페이지네이션)

### 4.4 Content Type ID (관광 타입)

- `12`: 관광지
- `14`: 문화시설
- `15`: 축제/행사
- `25`: 여행코스
- `28`: 레포츠
- `32`: 숙박
- `38`: 쇼핑
- `39`: 음식점

---

## 5. 데이터 구조

### 5.1 관광지 목록 응답 예시 (areaBasedList2)

```typescript
interface TourItem {
  addr1: string; // 주소
  addr2?: string; // 상세주소
  areacode: string; // 지역코드
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  tel?: string; // 전화번호
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  modifiedtime: string; // 수정일
}
```

### 5.2 상세정보 응답 예시 (detailCommon2)

```typescript
interface TourDetail {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  homepage?: string;
  overview?: string; // 개요 (긴 설명)
  firstimage?: string;
  firstimage2?: string;
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
}
```

### 5.3 좌표 변환

한국관광공사 API는 KATEC 좌표계를 사용하며, Naver 지도도 KATEC 좌표계를 직접 지원합니다. 따라서 좌표 변환이 불필요합니다.

**좌표 변환 예시**:

```typescript
// 1. KATEC 좌표를 실수형으로 변환
const katecX = parseFloat(mapx) / 10000000; // 경도 (X)
const katecY = parseFloat(mapy) / 10000000; // 위도 (Y)

// 2. Naver Maps에 직접 사용 (KATEC 좌표계 지원)
// Naver Maps는 KATEC 좌표계를 직접 지원하므로 변환 불필요
const naverLatLng = new naver.maps.LatLng(katecY, katecX); // 위도, 경도 순서
```

**참고**:

- KATEC 좌표계: 한국 측지계 (TM 좌표계)
- Naver Maps는 KATEC 좌표계를 직접 지원하므로 별도 변환 라이브러리 불필요
- 좌표 변환 라이브러리 (`proj4`) 사용 불필요

### 5.4 소개정보 응답 예시 (detailIntro2)

```typescript
interface TourIntro {
  contentid: string;
  contenttypeid: string;
  // 타입별로 필드가 다름
  usetime?: string; // 이용시간
  restdate?: string; // 휴무일
  infocenter?: string; // 문의처
  parking?: string; // 주차 가능
  chkpet?: string; // 반려동물 동반
  // ... 기타 타입별 필드
}
```

---

## 6. 페이지 구조

### 6.1 페이지 목록

```
/                          # 홈페이지 (관광지 목록)
/places/[contentId]        # 상세페이지
/search?keyword=xxx        # 검색 결과 (선택 사항, 홈에서 처리 가능)
/bookmarks                 # 내 북마크 목록 (선택 사항)
```

### 6.2 컴포넌트 구조

#### 네이밍 규칙 (Guideline 준수)

- **컴포넌트 파일**: PascalCase (예: `TourCard.tsx`, `NaverMap.tsx`)
- **컴포넌트 네이밍**: `[Domain][Role][Variant]` 패턴
  - 예: `TourCard`, `TourList`, `TourFilter`, `TourDetailModal`
- **훅 파일**: camelCase, `use` 접두사 (예: `useTourList.ts`, `useBookmark.ts`)
- **유틸리티 파일**: kebab-case (예: `coordinate-converter.ts`, `tour-transform.ts`)
- **타입 파일**: kebab-case (예: `tour.ts`, `bookmark.ts`)

#### Export 규칙

- **단일 컴포넌트**: `export default` 사용
- **다중 export**: named export 사용 (훅, 유틸리티, 타입)
- **페이지 컴포넌트**: 항상 `export default` (Next.js 요구사항)

```
app/
├── page.tsx                    # 홈 (목록 + 필터 + 지도)
├── places/
│   └── [contentId]/
│       └── page.tsx            # 상세페이지
└── bookmarks/
    └── page.tsx                # 북마크 목록 (선택 사항)

components/
├── TourCard.tsx                # 관광지 카드 (단일 export default)
├── TourList.tsx                # 관광지 목록
├── TourFilter.tsx              # 필터 (지역/타입)
├── TourSearch.tsx              # 검색창
├── NaverMap.tsx                # Naver 지도
├── tour-detail/
│   ├── TourDetailInfo.tsx      # 기본정보
│   ├── TourDetailIntro.tsx     # 운영정보
│   ├── TourDetailGallery.tsx   # 이미지 갤러리
│   ├── TourDetailMap.tsx       # 지도
│   └── ShareButton.tsx         # URL 복사 공유 버튼
├── bookmarks/
│   ├── BookmarkButton.tsx      # 북마크 버튼 (별 아이콘)
│   └── BookmarkList.tsx        # 북마크 목록
└── ui/                         # shadcn 컴포넌트 (자동 생성)

hooks/
├── useTourList.ts              # 관광지 목록 훅
├── useTourDetail.ts            # 관광지 상세 훅
├── useTourFilter.ts            # 필터링 로직 훅
├── useBookmark.ts              # 북마크 훅
└── useNaverMap.ts              # Naver 지도 훅

lib/
├── api/
│   ├── tour-api.ts             # 한국관광공사 API 호출 함수들
│   └── supabase-api.ts         # Supabase 쿼리 함수들 (북마크)
├── utils/
│   ├── coordinate-converter.ts # 좌표 변환 유틸리티 (KATEC 좌표 정규화)
│   └── tour-transform.ts       # 관광지 데이터 변환 유틸리티
└── types/
    ├── tour.ts                 # 관광지 타입 정의
    └── bookmark.ts             # 북마크 타입 정의
```

---

## 7. UI/UX 요구사항

### 7.1 디자인 원칙

- **모바일 우선**: 반응형 디자인
- **직관성**: 명확한 네비게이션과 정보 계층
- **성능**: 빠른 로딩 (이미지 최적화, 레이지 로딩)
- **접근성**: ARIA 라벨, 키보드 네비게이션

### 7.2 스타일링 시스템 (Guideline 준수)

#### Tailwind CSS 원칙

- **Tailwind 유틸리티 우선 사용**: 인라인 `style={{ }}` 사용 금지
- **Spacing-First 정책**: 외곽 여백은 `padding`, 형제 요소 간격은 `gap` 사용
  - ❌ 금지: `margin` 사용 (특히 `mt-4`, `mb-4` 등)
  - ✅ 권장: `p-4 md:p-6` (외곽), `gap-4` (형제 간격)
- **배경 이미지**: `next/image` 컴포넌트 + 오버레이 사용
  - ❌ 금지: 인라인 `backgroundImage` 스타일
  - ✅ 권장: `Image` 컴포넌트 + `bg-gradient-to-b` 클래스

```jsx
// ✅ 좋은 예: Spacing-First 정책
<div className="p-6 md:p-8">
  <div className="flex flex-col gap-4">
    <TourCard />
    <TourCard />
  </div>
</div>

// ❌ 나쁜 예: margin 사용
<div>
  <TourCard />
  <TourCard className="mt-4" />
</div>
```

#### 배경 이미지 처리

```jsx
// ✅ 좋은 예: Image 컴포넌트 + 오버레이
<Image src={detailImage} alt="" fill priority className="object-cover" />
<div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />

// ❌ 나쁜 예: 인라인 스타일
<div style={{ backgroundImage: `url(${detailImage})` }} />
```

#### 컴포넌트 추상화 원칙

- **불필요한 추상화 금지**: 단순 스타일링 래퍼 컴포넌트 지양
- **추상화 허용 기준**:
  - 로직이 포함된 경우 (상태 관리, 데이터 변환)
  - 3곳 이상에서 재사용되는 경우
  - 복잡한 조건부 렌더링 (10줄 이상)
  - 외부 라이브러리 래핑

```jsx
// ❌ 나쁜 예: 불필요한 추상화
function TourCardWrapper({ children }) {
  return <div className="p-6 rounded-xl bg-white">{children}</div>;
}

// ✅ 좋은 예: 직접 스타일링
<div className="p-6 rounded-xl bg-white">
  <TourCard />
</div>;
```

### 7.3 컬러 스킴

- 다크/라이트 모드 지원 (`next-themes` 활용)
- Primary 색상: 관광/여행 느낌 (청록색, 파란색 계열 추천)
- 디자인 시스템 컬러 팔레트 활용 (Tailwind 커스텀 컬러)

### 7.4 타이포그래피

- Display & Heading: `text-display-1`, `text-h1`, `text-h2` 등
- Body: `text-body-1`, `text-body-2`, `text-body-2-bold` 등
- 디자인 시스템 타이포그래피 클래스 사용

### 7.5 로딩 상태

- 리스트 로딩: 스켈레톤 UI (Skeleton 컴포넌트)
- 지도 로딩: 스피너 또는 로딩 오버레이
- 이미지 로딩: Placeholder 이미지 + `next/image` `loading="lazy"`

### 7.6 에러 처리

- API 에러: 에러 메시지 표시 + 재시도 버튼
- 네트워크 에러: 오프라인 안내
- 404: 페이지를 찾을 수 없음 (`app/not-found.tsx`)

---

## 8. 제약사항 및 고려사항

### 8.1 API 제약사항

- **Rate Limit**: 공공 API 호출 제한 (확인 필요)
- **데이터 품질**: 일부 관광지는 이미지/정보 누락 가능
- **응답 속도**: API 응답 시간 고려 (캐싱 전략 필요)

### 8.2 Naver 지도 제약사항

- **무료 할당량**: 월 30,000회 지도 로드
- **Client ID 필요**: Naver Cloud Platform에서 발급 (무료 회원가입)
- **필수 API 활성화**:
  - Maps JavaScript API
  - Maps Embed API (길찾기 링크용, 선택 사항)
- **사용량 초과 시**: 유료 플랜 전환 또는 사용량 제한 (도메인 제한 설정 권장)
- **좌표 변환**: KATEC 좌표계 직접 지원 (변환 불필요)

### 8.3 DB 고려사항

- 공공 API는 읽기 전용 → 리뷰/평점 등은 supabase DB 필요
- Supabase 활용하여 북마크, 조회수, 랭킹 등 구현 가능

### 8.4 Naver Maps API 고급 설정

- **Client ID 제한 설정**:

  - HTTP 리퍼러 제한: 특정 도메인에서만 API 사용 가능하도록 설정
  - 서비스 URL 제한: Maps JavaScript API만 허용하도록 설정
  - IP 주소 제한 (선택 사항): 개발 환경용

- **성능 최적화**:

  - 지도 로딩: 동적 로딩 (필요할 때만 로드)
  - 마커 최적화: 많은 마커는 클러스터링 사용
  - 지도 재사용: 동일한 지도 인스턴스 재사용

- **에러 처리**:
  - Client ID 오류: 사용자 친화적 메시지 표시
  - 할당량 초과: 사용량 모니터링 및 알림 설정
  - 네트워크 오류: 재시도 로직 구현

### 8.5 보안 및 환경변수

- API 키는 환경변수로 관리 (`.env`)
- `NEXT_PUBLIC_` 접두사로 클라이언트 노출 허용
- Naver Maps Client ID는 도메인 제한 설정 필수 (보안 강화)

**필수 환경변수**:

```bash
# 한국관광공사 API
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key

# 한국 관광공사 에러가 난다면? NEXT_PUBLIC_TOUR_API_KEY 가 인식안될때?
TOUR_API_KEY=your_tour_api_key

# Naver Maps
NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID=your_naver_maps_client_id

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=uploads

# Site URL (선택 사항, robots.txt, sitemap.xml, manifest.json에서 사용)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 9. 성공 지표 (KPI)

### 9.1 기능적 지표

- ✅ MVP 4가지 핵심 기능 모두 정상 작동 (목록/지도/검색/상세)
- ✅ API 응답 성공률 > 95%
- ✅ 페이지 로딩 시간 < 3초
- 북마크 데이터 정확도 > 99% (선택 사항)
- URL 복사 성공률 > 95%

---

## 10. 개발 일정 (페이지 중심)

### Phase 1: 기본 구조 & 공통 설정

- [ ] 프로젝트 셋업
- [ ] Development Guidelines 숙지 및 검토
- [ ] API 클라이언트 구현 (`app/api/tour/route.ts`)
- [ ] 기본 타입 정의 (`lib/types/tour.ts`, `lib/types/bookmark.ts`)
- [ ] 좌표 변환 유틸리티 구현 (`lib/utils/coordinate-converter.ts`)
- [ ] Naver Maps Client ID 환경변수 설정
- [ ] 레이아웃 구조 업데이트 (`app/layout.tsx`)
  - React Query Provider 설정
  - Theme Provider 설정 (next-themes)
- [ ] 공통 컴포넌트 (로딩, 에러 처리)
- [ ] `cn` 유틸리티 함수 설정 (`lib/utils.ts`)

### Phase 2: 홈페이지 (`/`) - 관광지 목록

#### 2.1 페이지 기본 구조

- [ ] `app/page.tsx` 생성 (빈 레이아웃)
- [ ] 기본 UI 구조 확인 (헤더, 메인 영역, 푸터)

#### 2.2 관광지 목록 기능 (MVP 2.1)

- [ ] `components/TourCard.tsx` (관광지 카드 - 기본 정보만)
  - Guideline 준수: PascalCase 네이밍, `export default`
  - Spacing-First 정책: `padding` + `gap` 사용
  - Tailwind CSS 유틸리티 우선 사용
- [ ] `components/TourList.tsx` (목록 표시 - 하드코딩 데이터로 테스트)
  - React Query 훅 연동 (`useTourList`)
- [ ] API 연동하여 실제 데이터 표시
- [ ] 페이지 확인 및 스타일링 조정 (반응형 검증)

#### 2.3 필터 기능 추가

- [ ] `components/TourFilter.tsx` (지역/타입 필터 UI)
  - Guideline 준수: 불필요한 추상화 금지
  - shadcn/ui Select/Radio 컴포넌트 활용
- [ ] `hooks/useTourFilter.ts` (필터링 로직 훅)
  - 필터 상태 관리 및 필터링 로직 분리
- [ ] 필터 동작 연결 (React Query와 연동)
- [ ] 필터링된 결과 표시
- [ ] 페이지 확인 및 UX 개선

#### 2.4 검색 기능 추가 (MVP 2.3)

- [ ] `components/TourSearch.tsx` (검색창 UI)
  - shadcn/ui Input 컴포넌트 활용
  - 검색 아이콘 (lucide-react)
- [ ] `hooks/useTourSearch.ts` (검색 로직 훅)
- [ ] 검색 API 연동 (`searchKeyword2`)
- [ ] 검색 결과 표시 (React Query 활용)
- [ ] 검색 + 필터 조합 동작
- [ ] 페이지 확인 및 UX 개선

#### 2.5 지도 연동 (MVP 2.2)

- [ ] `components/NaverMap.tsx` (기본 지도 표시)
  - Guideline 준수: PascalCase 네이밍
  - 동적 로딩: `next/dynamic` 활용 (필요할 때만 로드)
- [ ] `hooks/useNaverMap.ts` (지도 초기화 및 상태 관리 훅)
- [ ] Naver Maps JavaScript API 로드
- [ ] 좌표 변환 유틸리티 활용 (`lib/utils/coordinate-converter.ts`)
- [ ] 관광지 마커 표시
- [ ] 마커 클릭 시 정보창(InfoWindow)
- [ ] 리스트-지도 연동 (클릭/호버)
- [ ] 마커 클러스터링 (`@navermaps/marker-clusterer` 라이브러리)
- [ ] 반응형 레이아웃 (데스크톱: 분할, 모바일: 탭)
  - Spacing-First 정책: `gap` 사용
- [ ] 페이지 확인 및 인터랙션 테스트

#### 2.6 정렬 & 페이지네이션

- [ ] 정렬 옵션 추가 (최신순, 이름순)
- [ ] 페이지네이션 또는 무한 스크롤
- [ ] 로딩 상태 개선 (Skeleton UI)
- [ ] 최종 페이지 확인

### Phase 3: 상세페이지 (`/places/[contentId]`)

#### 3.1 페이지 기본 구조

- [ ] `app/places/[contentId]/page.tsx` 생성
  - Next.js 15: `await params` 사용 필수
  - `generateMetadata` 함수로 SEO 최적화
- [ ] 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분)
  - Spacing-First 정책 준수
- [ ] 라우팅 테스트 (홈에서 클릭 시 이동)

#### 3.2 기본 정보 섹션 (MVP 2.4.1)

- [ ] `components/tour-detail/TourDetailInfo.tsx`
  - Guideline 준수: PascalCase 네이밍
  - `next/image` 사용 (이미지 최적화)
  - Spacing-First 정책 준수
- [ ] `hooks/useTourDetail.ts` (상세 데이터 페칭 훅)
- [ ] `detailCommon2` API 연동 (React Query 활용)
- [ ] 관광지명, 이미지, 주소, 전화번호, 홈페이지, 개요 표시
- [ ] 주소 복사 기능 (`navigator.clipboard.writeText`)
- [ ] 전화번호 클릭 시 전화 연결 (`tel:` 링크)
- [ ] 페이지 확인 및 스타일링 (반응형 검증)

#### 3.3 지도 섹션 (MVP 2.4.4)

- [ ] `components/tour-detail/TourDetailMap.tsx`
  - Guideline 준수: PascalCase 네이밍
  - `NaverMap` 컴포넌트 재사용
- [ ] 해당 관광지 위치 표시 (마커 1개)
- [ ] "길찾기" 버튼 (Naver Maps 길찾기 링크)
- [ ] "지도에서 보기" 버튼 (Naver Maps 웹/앱 연동)
- [ ] 페이지 확인 (반응형 검증)

#### 3.4 공유 기능 (MVP 2.4.5)

- [ ] `components/tour-detail/ShareButton.tsx`
  - Guideline 준수: PascalCase 네이밍
  - shadcn/ui Button 컴포넌트 활용
- [ ] URL 복사 기능 (`navigator.clipboard.writeText`)
- [ ] 복사 완료 토스트 메시지 (shadcn/ui Toast)
- [ ] Open Graph 메타태그 동적 생성 (`generateMetadata`)
- [ ] 페이지 확인 및 공유 테스트

#### 3.5 추가 정보 섹션 (향후 구현)

- [ ] `components/tour-detail/TourDetailIntro.tsx` (운영 정보)
  - Guideline 준수: PascalCase 네이밍
- [ ] `detailIntro2` API 연동 (React Query 활용)
- [ ] `components/tour-detail/TourDetailGallery.tsx` (이미지 갤러리)
  - `next/image` 사용 (이미지 최적화)
  - Swiper 또는 캐러셀 컴포넌트 활용
- [ ] `detailImage2` API 연동
- [ ] 페이지 확인 (반응형 검증)

### Phase 4: 북마크 페이지 (`/bookmarks`) - 선택 사항

#### 4.1 Supabase 설정

- [ ] `supabase/migrations/` 마이그레이션 파일
- [ ] `bookmarks` 테이블 생성
- [ ] RLS 정책 설정

#### 4.2 북마크 기능 구현

- [ ] `components/bookmarks/BookmarkButton.tsx`
  - Guideline 준수: PascalCase 네이밍
  - shadcn/ui Button 컴포넌트 활용
- [ ] `hooks/useBookmark.ts` (북마크 로직 훅)
  - React Query mutation 활용
  - Supabase 클라이언트 연동
- [ ] 상세페이지에 북마크 버튼 추가
- [ ] Supabase DB 연동 (Server Actions 또는 API Route)
- [ ] 인증된 사용자 확인 (Clerk)
- [ ] 로그인하지 않은 경우 로그인 유도 모달
- [ ] 상세페이지에서 북마크 동작 확인

#### 4.3 북마크 목록 페이지

- [ ] `app/bookmarks/page.tsx` 생성
  - Next.js 15: `await params` 사용 (필요시)
  - `generateMetadata` 함수로 SEO 최적화
- [ ] `components/bookmarks/BookmarkList.tsx`
  - `TourCard` 컴포넌트 재사용
  - Guideline 준수: Spacing-First 정책
- [ ] `hooks/useBookmarkList.ts` (북마크 목록 훅)
- [ ] 북마크한 관광지 목록 표시 (React Query 활용)
- [ ] 정렬 옵션 (최신순, 이름순, 지역별)
- [ ] 일괄 삭제 기능
- [ ] 페이지 확인 (반응형 검증)

### Phase 5: 최적화 & 배포

- [ ] 이미지 최적화 (`next.config.ts` 외부 도메인 설정)
  - 한국관광공사 이미지 도메인 허용
  - `next/image` 사용 확인
- [ ] 전역 에러 핸들링 개선
  - Error Boundary 구현
  - API 에러 처리 통일
- [ ] 404 페이지 (`app/not-found.tsx`)
  - Guideline 준수: Tailwind CSS 스타일링
- [ ] SEO 최적화
  - 메타태그 (`generateMetadata`)
  - sitemap.xml 생성
  - robots.txt 설정
- [ ] 성능 최적화
  - 동적 import (`next/dynamic`) 활용
  - React Query 캐싱 전략
  - 이미지 lazy loading
- [ ] 성능 측정 (Lighthouse 점수 > 80)
- [ ] 환경변수 보안 검증
- [ ] Guideline 준수 최종 검토
  - [ ] 컴포넌트 네이밍 규칙 확인
  - [ ] Export 규칙 확인
  - [ ] Spacing-First 정책 확인
  - [ ] 불필요한 추상화 제거 확인
- [ ] Vercel 배포 및 테스트

---

## 12. 참고 자료

### API 문서

- 한국관광공사 API: https://www.data.go.kr/data/15101578/openapi.do

### 기술 문서

- Next.js: https://nextjs.org/docs
- Naver Maps JavaScript API: https://navermaps.github.io/maps.js.ncp/
- Naver Maps Marker Clustering: https://github.com/navermaps/marker-clusterer
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/

---
