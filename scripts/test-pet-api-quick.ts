/**
 * 반려동물 API 빠른 테스트 스크립트
 *
 * API를 직접 호출해서 반려동물 동반 가능한 관광지가 있는지 확인합니다.
 */

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const API_KEY =
  "637bda9c5cbfe57e5f9bd8d403344dc96c3b8ec57e6ad52c980a355a554cffcc";

/**
 * 관광지 목록 조회
 */
async function getTourList(
  areaCode?: string,
  contentTypeId?: string,
  numOfRows: number = 100,
) {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    MobileOS: "ETC",
    MobileApp: "MyTrip",
    _type: "json",
    numOfRows: numOfRows.toString(),
    pageNo: "1",
  });

  if (areaCode) params.append("areaCode", areaCode);
  if (contentTypeId) params.append("contentTypeId", contentTypeId);

  const url = `${BASE_URL}/areaBasedList2?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.response.header.resultCode !== "0000") {
    throw new Error(
      `API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`,
    );
  }

  const items = data.response.body.items?.item;
  return Array.isArray(items) ? items : items ? [items] : [];
}

/**
 * 반려동물 정보 조회
 */
async function getPetInfo(contentId: string) {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    MobileOS: "ETC",
    MobileApp: "MyTrip",
    _type: "json",
    contentId,
  });

  const url = `${BASE_URL}/detailPetTour2?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.response.header.resultCode !== "0000") {
    return null;
  }

  // 응답 구조 확인 (처음 3개만 상세 로그)
  if (
    contentId === "2750144" ||
    contentId === "2805408" ||
    contentId === "2750143"
  ) {
    console.log(`\n[${contentId}] 응답 구조:`, {
      resultCode: data.response.header.resultCode,
      totalCount: data.response.body.totalCount,
      hasItems: !!data.response.body.items,
      itemsType: typeof data.response.body.items,
      itemsValue: data.response.body.items,
    });
  }

  // items가 빈 문자열이거나 null인 경우
  if (
    !data.response.body.items ||
    data.response.body.items === "" ||
    data.response.body.items === null
  ) {
    return null;
  }

  // items가 객체가 아닌 경우
  if (typeof data.response.body.items !== "object") {
    return null;
  }

  const items = data.response.body.items.item;
  if (!items) {
    return null;
  }

  return Array.isArray(items) ? items[0] : items;
}

/**
 * 메인 테스트 함수
 */
async function main() {
  console.log("=".repeat(60));
  console.log("🐾 반려동물 동반 가능한 관광지 확인 테스트");
  console.log("=".repeat(60));
  console.log(`🔑 API 키: ${API_KEY.substring(0, 20)}...\n`);

  // 1단계: 다양한 지역의 관광지 조회
  const testConfigs = [
    { areaCode: "1", contentTypeId: "12", name: "서울 관광지" },
    { areaCode: "6", contentTypeId: "12", name: "부산 관광지" },
    { areaCode: "39", contentTypeId: "12", name: "제주 관광지" },
    { areaCode: "1", contentTypeId: "14", name: "서울 문화시설" },
    { areaCode: "1", contentTypeId: "28", name: "서울 레포츠" },
  ];

  let totalChecked = 0;
  let totalFound = 0;
  const foundTours: Array<{ contentId: string; title: string; petInfo: any }> =
    [];

  for (const config of testConfigs) {
    console.log(`\n📋 ${config.name} 테스트 중...`);

    try {
      const tours = await getTourList(
        config.areaCode,
        config.contentTypeId,
        100,
      );
      console.log(`   ✅ ${tours.length}개 관광지 조회됨`);

      // 처음 50개만 테스트 (너무 많은 API 호출 방지)
      for (const tour of tours.slice(0, 50)) {
        totalChecked++;
        const petInfo = await getPetInfo(tour.contentid);

        if (petInfo) {
          // 반려동물 정보가 있는지 확인
          const hasPetInfo =
            petInfo.acmpyTypeCd ||
            petInfo.acmpyPsblCpam ||
            petInfo.acmpyNeedMtr ||
            petInfo.etcAcmpyInfo;

          if (hasPetInfo) {
            // "불가능" 체크
            const isAvailable =
              !petInfo.acmpyTypeCd ||
              (!petInfo.acmpyTypeCd.includes("불가") &&
                petInfo.acmpyTypeCd !== "불가능");

            if (isAvailable) {
              totalFound++;
              foundTours.push({
                contentId: tour.contentid,
                title: tour.title,
                petInfo,
              });

              console.log(`\n   ✅ 발견! ${tour.title} (${tour.contentid})`);
              console.log(
                `      - acmpyTypeCd: ${petInfo.acmpyTypeCd || "없음"}`,
              );
              console.log(
                `      - acmpyPsblCpam: ${petInfo.acmpyPsblCpam || "없음"}`,
              );
              console.log(
                `      - acmpyNeedMtr: ${petInfo.acmpyNeedMtr || "없음"}`,
              );
              console.log(
                `      - etcAcmpyInfo: ${petInfo.etcAcmpyInfo || "없음"}`,
              );

              // 5개 찾으면 충분
              if (foundTours.length >= 5) {
                break;
              }
            }
          }
        }

        // API 호출 간격
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (foundTours.length >= 5) {
        break;
      }
    } catch (error) {
      console.error(`   ❌ 에러:`, error);
    }
  }

  // 결과 출력
  console.log("\n" + "=".repeat(60));
  console.log("📊 최종 결과");
  console.log("=".repeat(60));
  console.log(`   총 확인한 관광지: ${totalChecked}개`);
  console.log(`   반려동물 동반 가능한 관광지: ${totalFound}개\n`);

  if (foundTours.length > 0) {
    console.log("✅ 반려동물 동반 가능한 관광지가 있습니다!");
    console.log("\n📋 발견된 관광지 목록:");
    foundTours.forEach((tour, index) => {
      console.log(`\n${index + 1}. ${tour.title} (ID: ${tour.contentId})`);
      console.log(`   반려동물 정보:`, JSON.stringify(tour.petInfo, null, 2));
    });
  } else {
    console.log("⚠️  반려동물 동반 가능한 관광지를 찾지 못했습니다.");
    console.log(
      "   - API에 반려동물 정보가 있는 관광지가 매우 적을 수 있습니다.",
    );
    console.log("   - 또는 API 응답 구조가 예상과 다를 수 있습니다.");
  }
}

main().catch(console.error);
