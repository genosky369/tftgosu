import { NextResponse } from 'next/server';
import type { MetaCompsResponse } from '@/types/meta';

// 메타 조합 데이터 (JSON 파일에서 로드)
// 실제로는 scripts/analyze-meta-comps.js 실행 후 생성되는 파일 사용
let cachedData: MetaCompsResponse | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

async function loadMetaComps(): Promise<MetaCompsResponse | null> {
  try {
    // 동적으로 JSON 파일 로드
    const data = await import('@/data/meta-comps.json');
    return data.default as MetaCompsResponse;
  } catch {
    console.error('메타 조합 데이터 로드 실패 - 파일이 없거나 잘못됨');
    return null;
  }
}

async function getMetaCompsWithCache(): Promise<MetaCompsResponse | null> {
  const now = Date.now();

  if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedData;
  }

  cachedData = await loadMetaComps();
  cacheTimestamp = now;
  return cachedData;
}

// GET /api/meta/comps
export async function GET() {
  try {
    const data = await getMetaCompsWithCache();

    if (!data) {
      return NextResponse.json(
        {
          error: '메타 조합 데이터가 아직 생성되지 않았습니다.',
          message: 'scripts/analyze-meta-comps.js 를 먼저 실행해주세요.'
        },
        { status: 404 }
      );
    }

    // 응답 헤더에 캐시 설정
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
