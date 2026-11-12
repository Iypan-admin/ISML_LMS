import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getBatchesFilePath() {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'lib', 'realDbBatches.json'),
    path.join(process.cwd(), 'web', 'src', 'lib', 'realDbBatches.json'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return candidatePaths[1] || candidatePaths[0];
}

function loadBatches(): any[] {
  try {
    const filePath = getBatchesFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load batches:', e);
  }
  return [];
}

function saveBatches(items: any[]) {
  try {
    const filePath = getBatchesFilePath();
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save batches:', e);
  }
}

export async function GET(request: Request) {
  try {
    const batches = loadBatches();
    return NextResponse.json({
      status: 'success',
      total: batches.length,
      data: batches,
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
    const batches = loadBatches();

    // Check if updating existing batch status (e.g. from DRAFT to ACTIVE)
    const existingIdx = batches.findIndex((b) => b.id === body.id || (body.name && b.name === body.name));
    if (existingIdx !== -1) {
      batches[existingIdx] = {
        ...batches[existingIdx],
        ...body,
        updatedAt: new Date().toISOString(),
      };
      saveBatches(batches);
      return NextResponse.json({
        status: 'success',
        message: 'Batch updated successfully',
        data: batches[existingIdx],
      });
    }

    const newBatch = {
      id: body.id || `batch-${Date.now().toString().slice(-4)}`,
      name: body.name,
      code: body.code || `BAT-${Date.now().toString().slice(-4)}`,
      institutionId: body.institutionId || '521323cd-00da-49a6-98ed-6b7918d181b4',
      institutionName: body.institutionName || 'The American College',
      programId: body.programId || body.courseId || '',
      programName: body.programName || body.courseNames?.[0] || 'Language Course',
      departmentName: body.departmentName || 'Foreign Languages & Linguistics',
      academicYear: body.academicYear || '2026–2027',
      admissionYear: Number(body.admissionYear) || 2026,
      graduationYear: Number(body.graduationYear) || 2027,
      currentSemesterNumber: 1,
      sectionsCount: Number(body.sectionsCount) || 1,
      studentsCount: Number(body.studentsCount) || 35,
      courseIds: body.courseIds || (body.courseId ? [body.courseId] : []),
      courseNames: body.courseNames || (body.programName ? [body.programName] : []),
      batchTiming: body.batchTiming || '09:00 AM – 10:30 AM',
      scheduleDays: body.scheduleDays || ['MON', 'WED', 'FRI'],
      assignedFacultyName: body.assignedFacultyName || 'Joy JK',
      assignedStaffNames: body.assignedStaffNames || [],
      leadFacultyId: body.leadFacultyId || '',
      leadFacultyName: body.leadFacultyName || body.assignedFacultyName || 'Joy JK',
      substituteFacultyId: body.substituteFacultyId || '',
      substituteFacultyName: body.substituteFacultyName || '',
      doubtFacultyId: body.doubtFacultyId || '',
      doubtFacultyName: body.doubtFacultyName || '',
      studentIds: body.studentIds || [],
      status: body.status || 'DRAFT',
      createdAt: new Date().toISOString(),
    };

    batches.unshift(newBatch);
    saveBatches(batches);

    return NextResponse.json({
      status: 'success',
      message: 'Batch created successfully in DRAFT mode',
      data: newBatch,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
