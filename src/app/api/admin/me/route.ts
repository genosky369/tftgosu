import { NextResponse } from 'next/server';
import { getAdminFromCookie } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookie();

  if (!admin) {
    return NextResponse.json({ error: '인증되지 않음' }, { status: 401 });
  }

  return NextResponse.json({ admin });
}
