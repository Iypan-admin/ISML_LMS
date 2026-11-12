import { NextResponse } from 'next/server';
import realDbInstitutions from '@/lib/realDbInstitutions.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';

    let data = [...realDbInstitutions];

    if (type) {
      data = data.filter((i) => i.type === type.toUpperCase());
    }

    return NextResponse.json({
      status: 'success',
      total: data.length,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message, data: [] },
      { status: 500 }
    );
  }
}

