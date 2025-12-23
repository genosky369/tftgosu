import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/visitors - 방문 기록
export async function POST(request: NextRequest) {
  try {
    // IP 주소 가져오기
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // 오늘 날짜 (UTC 기준)
    const today = new Date().toISOString().split('T')[0];

    // 방문 기록 (중복 시 무시)
    const { error } = await supabase
      .from('visitors')
      .upsert(
        { ip_address: ip, visit_date: today },
        { onConflict: 'ip_address,visit_date', ignoreDuplicates: true }
      );

    if (error) {
      console.error('방문 기록 실패:', error);
      // 에러가 나도 사용자 경험에 영향 없도록 성공 반환
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}

// GET /api/visitors - 통계 조회
export async function GET() {
  try {
    // 오늘 날짜 (UTC 기준)
    const today = new Date().toISOString().split('T')[0];

    // 오늘 방문자 수
    const { count: todayCount, error: todayError } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true })
      .eq('visit_date', today);

    if (todayError) {
      console.error('오늘 방문자 조회 실패:', todayError);
    }

    // 전체 방문자 수
    const { count: totalCount, error: totalError } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('전체 방문자 조회 실패:', totalError);
    }

    return NextResponse.json({
      today: todayCount ?? 0,
      total: totalCount ?? 0,
    });
  } catch {
    return NextResponse.json({ today: 0, total: 0 });
  }
}
