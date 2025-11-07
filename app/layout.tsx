import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Trip - 한국 관광지 정보 서비스",
  description: "전국 관광지 정보를 검색하고 지도에서 확인할 수 있는 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 환경 변수 체크 및 에러 방지
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  // 환경 변수가 없으면 에러 메시지 표시
  if (!clerkPublishableKey || !clerkSecretKey) {
    return (
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="text-2xl font-bold">환경 변수 설정 필요</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                필수 환경 변수가 설정되지 않았습니다.
                <br />
                .env.local 파일에 다음 환경 변수를 설정해주세요:
              </p>
              <div className="mt-4 rounded-lg bg-muted p-4 text-left">
                <code className="text-sm">
                  {!clerkPublishableKey && (
                    <div>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here</div>
                  )}
                  {!clerkSecretKey && (
                    <div>CLERK_SECRET_KEY=your_secret_here</div>
                  )}
                </code>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactQueryProvider>
              <SyncUserProvider>
                <Navbar />
                {children}
                <Toaster />
              </SyncUserProvider>
            </ReactQueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
