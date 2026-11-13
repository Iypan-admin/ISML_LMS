import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getAttendanceFilePath() {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'lib', 'realDbAttendance.json'),
    path.join(process.cwd(), 'web', 'src', 'lib', 'realDbAttendance.json'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return candidatePaths[1] || candidatePaths[0];
}

function loadAttendance(): any[] {
  try {
    const filePath = getAttendanceFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load attendance:', e);
  }
  return [];
}

function saveAttendance(items: any[]) {
  try {
    const filePath = getAttendanceFilePath();
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save attendance:', e);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const batchName = searchParams.get('batchName');
    const sessionId = searchParams.get('sessionId');

    let items = loadAttendance();

    if (studentId) {
      items = items.filter(
        (it: any) =>
          it.studentId?.toLowerCase() === studentId.toLowerCase() ||
          it.studentRollNo?.toLowerCase() === studentId.toLowerCase()
      );
    }

    if (batchName && batchName !== 'ALL') {
      const bLower = batchName.toLowerCase();
      items = items.filter(
        (it: any) =>
          it.batchName?.toLowerCase().includes(bLower) ||
          it.batchCode?.toLowerCase().includes(bLower)
      );
    }

    if (sessionId && sessionId !== 'ALL') {
      items = items.filter((it: any) => it.sessionId === sessionId);
    }

    return NextResponse.json({
      status: 'success',
      total: items.length,
      data: items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message, data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let items = loadAttendance();

    if (body.action === 'SAVE_ROLL_CALL' && Array.isArray(body.records)) {
      body.records.forEach((newRec: any) => {
        const existingIdx = items.findIndex((it: any) => it.id === newRec.id);
        if (existingIdx !== -1) {
          items[existingIdx] = { ...items[existingIdx], ...newRec };
        } else {
          items.unshift(newRec);
        }
      });
      saveAttendance(items);
      return NextResponse.json({
        status: 'success',
        message: 'Roll call saved to database',
        total: items.length,
      });
    }

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
