flowchart TD
  %% top: actors & infra
  A[사용자] -->|요청| Front[Next.js Frontend]
  Front -->|API 호출| Kor["KorService2 (한국관광공사)"]
  Front -->|지도 렌더링| GMaps[Google Maps API]
  Front -->|인증| Clerk[Clerk Auth]
  Front -->|데이터 저장| Supabase[Supabase DB]

  %% ERD-ish block (as grouped nodes)
  subgraph DB_Schema["DB Schema (ERD-like)"]
    direction TB
    U[USERS\n- id PK\n- clerk_user_id UK\n- email\n- name] 
    T[TOURS\n- content_id PK\n- title\n- mapx/mapy] 
    B[BOOKMARKS\n- id PK\n- user_id FK\n- content_id FK\n- title]
    U -->|creates| B
    T -->|has| B
  end

  %% user flow block
  subgraph User_Flow["User Flow"]
    HF1[홈: 목록 조회] --> HF2[필터 선택]
    HF1 --> HF3[키워드 검색]
    HF2 --> HF4[목록 표시]
    HF3 --> HF4
    HF4 --> HF5[지도에 마커 표시]
    HF5 --> HF6[목록 클릭 -> 마커 이동]
    HF4 --> HF7[상세페이지 이동]
    HF7 --> HF8[상세 조회 & 북마크]
    HF8 -->|저장| Supabase
  end

  %% components area
  subgraph Components["Components"]
    TC[TourCard] --> TL[TourList]
    TF[TourFilter] --> TL
    TS[TourSearch] --> TL
    GM[GoogleMap] --> TL
    TD[TourDetail*] --> GM
    BL[BookmarkList] --> TD
  end

  %% links between areas
  Front --> Components
  Front --> User_Flow
  Front --> DB_Schema
  Kor --> Front
  GMaps --> Front
  Supabase --> DB_Schema
