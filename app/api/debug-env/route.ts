/**
 * @file route.ts
 * @description 환경 변수 디버깅용 임시 API 라우트
 * 
 * 배포 환경에서 환경 변수가 제대로 로드되는지 확인하기 위한 임시 엔드포인트입니다.
 * 문제 해결 후 이 파일을 삭제하세요.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  // 환경 변수 상태 확인 (키 값은 노출하지 않고 설정 여부만 확인)
  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    TOUR_API_KEY: process.env.TOUR_API_KEY ? '✅ 설정됨' : '❌ 미설정',
    TOUR_API_KEY_LENGTH: process.env.TOUR_API_KEY?.length || 0,
    NEXT_PUBLIC_TOUR_API_KEY: process.env.NEXT_PUBLIC_TOUR_API_KEY ? '✅ 설정됨' : '❌ 미설정',
    NEXT_PUBLIC_TOUR_API_KEY_LENGTH: process.env.NEXT_PUBLIC_TOUR_API_KEY?.length || 0,
    TOUR_PET_API_KEY: process.env.TOUR_PET_API_KEY ? '✅ 설정됨' : '❌ 미설정',
    TOUR_PET_API_KEY_LENGTH: process.env.TOUR_PET_API_KEY?.length || 0,
    NEXT_PUBLIC_TOUR_PET_API_KEY: process.env.NEXT_PUBLIC_TOUR_PET_API_KEY ? '✅ 설정됨' : '❌ 미설정',
    NEXT_PUBLIC_TOUR_PET_API_KEY_LENGTH: process.env.NEXT_PUBLIC_TOUR_PET_API_KEY?.length || 0,
    // 환경 변수 키 목록 확인
    AVAILABLE_ENV_KEYS: Object.keys(process.env)
      .filter(key => key.includes('TOUR'))
      .map(key => `${key}: ${process.env[key]?.length || 0} chars`),
  };

  console.log('[Debug Env] 환경 변수 상태:', envStatus);

  return Response.json({
    success: true,
    message: '환경 변수 디버깅 정보',
    data: envStatus,
  });
}

