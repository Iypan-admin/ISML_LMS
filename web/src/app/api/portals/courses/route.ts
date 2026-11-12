import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'lib', 'realDbCourses.json'),
      path.join(process.cwd(), 'web', 'src', 'lib', 'realDbCourses.json'),
      path.join(__dirname, '..', '..', '..', '..', 'lib', 'realDbCourses.json')
    ];
    for (const filePath of candidatePaths) {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return NextResponse.json({ status: 'success', total: data.length, data });
      }
    }
    return NextResponse.json({ status: 'success', total: 0, data: [] });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message, data: [] }, { status: 500 });
  }
}
