import { NextResponse } from 'next/server';
import realDbStudents from '@/lib/realDbStudents.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId') || '';
    const batchId = searchParams.get('batchId') || '';
    const batchName = searchParams.get('batchName') || '';

    let data = realDbStudents.map((s, index) => ({
      id: (s as any).id || (s as any).studentId || `std-${index + 1}`,
      ...s,
    }));

    if (batchName) {
      const bLower = batchName.toLowerCase();
      data = data.filter((s) => s.batchName?.toLowerCase().includes(bLower) || bLower.includes(s.batchName?.toLowerCase() || ''));
    }

    if (collegeId && collegeId !== 'ALL') {
      const isSchool = /lion|siva|dps|sch/i.test(collegeId);
      const isAmer = /amer/i.test(collegeId);

      if (isSchool) {
        data = data.filter(
          (s) =>
            s.tenantId === collegeId ||
            s.tenantCode === 'SIVA-LIONS' ||
            (s.tenantName && /lion|siva|school/i.test(s.tenantName))
        );
      } else if (isAmer) {
        data = data.filter(
          (s) =>
            s.tenantId === collegeId ||
            s.tenantCode === 'AMER-COL' ||
            (s.tenantName && /american/i.test(s.tenantName))
        );
      } else {
        data = data.filter(
          (s) =>
            s.tenantId === collegeId ||
            s.tenantCode === collegeId ||
            (s.tenantName && s.tenantName.toLowerCase().includes(collegeId.toLowerCase()))
        );
      }
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
