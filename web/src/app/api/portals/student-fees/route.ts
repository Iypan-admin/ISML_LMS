import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getStudentFeesFilePath(): string {
  const p1 = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbStudentFees.json');
  const p2 = path.join(process.cwd(), 'src', 'lib', 'realDbStudentFees.json');
  return fs.existsSync(p1) ? p1 : fs.existsSync(p2) ? p2 : p1;
}

function loadStudentFees(): any[] {
  try {
    const filePath = getStudentFeesFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading realDbStudentFees:', e);
  }
  return [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    let list = loadStudentFees();

    if (collegeId && collegeId !== 'ALL') {
      const isSchool = /lion|siva|sls|sch/i.test(collegeId);
      const isAmer = /amer/i.test(collegeId) || collegeId === '521323cd-00da-49a6-98ed-6b7918d181b4';

      if (isSchool) {
        list = list.filter(
          (s) =>
            s.collegeId === collegeId ||
            s.rollNo?.startsWith('SLS-') ||
            (s.collegeName && /lion|siva|school/i.test(s.collegeName))
        );
      } else if (isAmer) {
        list = list.filter(
          (s) =>
            s.collegeId === collegeId ||
            s.rollNo?.startsWith('AMER-') ||
            (s.collegeName && /american/i.test(s.collegeName))
        );
      }
    }

    return NextResponse.json({
      status: 'success',
      total: list.length,
      data: list,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message, data: [] }, { status: 500 });
  }
}

