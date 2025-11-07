import { MetadataRoute } from "next";

/**
 * @file manifest.ts
 * @description PWA 매니페스트
 *
 * Progressive Web App (PWA) 기능을 위한 웹 앱 매니페스트를 생성합니다.
 *
 * @see {@link /docs/prd.md#31-frontend} - PRD 문서의 기술 스택 섹션
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Trip - 한국 관광지 정보 서비스",
    short_name: "My Trip",
    description: "전국 관광지 정보를 검색하고 지도에서 확인할 수 있는 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      // 향후 추가 아이콘 파일 생성 시 아래 주석 해제
      // {
      //   src: "/icon-192.png",
      //   sizes: "192x192",
      //   type: "image/png",
      // },
      // {
      //   src: "/icon-512.png",
      //   sizes: "512x512",
      //   type: "image/png",
      // },
    ],
  };
}
