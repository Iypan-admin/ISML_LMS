import { NextResponse } from 'next/server';
import realDbFaculty from '@/lib/realDbFaculty.json';
import realDbFacultyAllocations from '@/lib/realDbFacultyAllocations.json';
import fs from 'fs';
import path from 'path';

// Helper to get freshest data
function getFacultyDb() {
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'lib', 'realDbFaculty.json'),
      path.join(process.cwd(), 'web', 'src', 'lib', 'realDbFaculty.json'),
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    }
  } catch {}
  return [...realDbFaculty];
}

function getAllocationsDb() {
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'lib', 'realDbFacultyAllocations.json'),
      path.join(process.cwd(), 'web', 'src', 'lib', 'realDbFacultyAllocations.json'),
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    }
  } catch {}
  return [...realDbFacultyAllocations];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionType = searchParams.get('institutionType') || '';
    const collegeId = searchParams.get('collegeId') || '';

    const facultyDatabase = getFacultyDb();
    const allocationsDatabase = getAllocationsDb();

    let filtered = [...facultyDatabase];

    if (collegeId && collegeId !== 'ALL') {
      const isSchoolId = /lion|siva|dps|sch/i.test(collegeId);
      const isAmerId = /amer/i.test(collegeId);

      if (isSchoolId) {
        filtered = filtered.filter((f) =>
          f.assignedInstitutionType === 'SCHOOL' ||
          f.assignedInstitutionType === 'BOTH' ||
          f.assignedInstitutions?.some((i: any) => /lion|siva|dps|sch/i.test(i.code) || /lion|siva/i.test(i.id))
        );
      } else if (isAmerId) {
        filtered = filtered.filter((f) =>
          f.assignedInstitutionType === 'COLLEGE' ||
          f.assignedInstitutionType === 'BOTH' ||
          f.assignedInstitutions?.some((i: any) => /amer/i.test(i.code) || /amer/i.test(i.id))
        );
      } else {
        filtered = filtered.filter((f) =>
          f.assignedInstitutions?.some((i: any) => i.id === collegeId || i.code === collegeId)
        );
      }
    } else if (institutionType === 'COLLEGE') {
      filtered = filtered.filter(
        (f) =>
          f.assignedInstitutionType === 'COLLEGE' ||
          f.assignedInstitutionType === 'BOTH'
      );
    } else if (institutionType === 'SCHOOL') {
      filtered = filtered.filter(
        (f) =>
          f.assignedInstitutionType === 'SCHOOL' ||
          f.assignedInstitutionType === 'BOTH'
      );
    }

    return NextResponse.json({
      status: 'success',
      total: filtered.length,
      data: filtered,
      allocations: allocationsDatabase,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message, data: [], allocations: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const isAssignAction = body.action === 'ASSIGN' || body.tutorRole;
    let facultyDatabase = getFacultyDb();
    let allocationsDatabase = getAllocationsDb();

    if (isAssignAction) {
      // Upsert: If allocation already exists for this batch, update it instead of creating duplicates
      const existingIdx = allocationsDatabase.findIndex(
        (a: any) =>
          a.batchName &&
          body.batchName &&
          a.batchName.toLowerCase().trim() === body.batchName.toLowerCase().trim()
      );

      const targetAlloc = existingIdx !== -1 ? allocationsDatabase[existingIdx] : null;

      const newAlloc = {
        id: targetAlloc?.id || `alloc-${Date.now().toString().slice(-4)}`,
        facultyId: body.facultyId || targetAlloc?.facultyId || 'fac-201834',
        facultyName: body.facultyName || targetAlloc?.facultyName || 'Joy JK',
        avatarUrl: body.avatarUrl || targetAlloc?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        tutorRole: body.tutorRole || targetAlloc?.tutorRole || 'LEAD_TRAINER',
        institutionType: body.institutionType || targetAlloc?.institutionType || 'COLLEGE',
        institutionId: body.institutionId || targetAlloc?.institutionId || '521323cd-00da-49a6-98ed-6b7918d181b4',
        institutionName: body.institutionName || targetAlloc?.institutionName || 'The American College',
        courseId: body.courseId || targetAlloc?.courseId || '',
        courseName: body.courseName || targetAlloc?.courseName || '',
        subjectCode: body.subjectCode || targetAlloc?.subjectCode || 'ET',
        subjectName: body.subjectName || targetAlloc?.subjectName || body.courseName || 'testtt',
        batchId: body.batchId || targetAlloc?.batchId || 'batch-4168',
        batchName: body.batchName || targetAlloc?.batchName || 'MRNG BATCH',
        languageFamily: body.languageFamily || targetAlloc?.languageFamily || 'FRENCH',
        scheduleSlots: body.scheduleSlots || targetAlloc?.scheduleSlots || ['Mon, Wed, Fri 07:30 PM - 09:00 PM'],
        status: body.tutorRole === 'SUBSTITUTE_TUTOR' ? 'SUBSTITUTE_STANDBY' : 'ACTIVE',
        effectiveFrom: targetAlloc?.effectiveFrom || body.effectiveFrom || '2026-10-14',
        notes: body.notes || targetAlloc?.notes || `Assigned to ${body.institutionName || 'Campus'}.`,
      };

      if (existingIdx !== -1) {
        allocationsDatabase[existingIdx] = newAlloc;
      } else {
        allocationsDatabase.unshift(newAlloc);
      }

      try {
        const candidatePaths = [
          path.join(process.cwd(), 'src', 'lib', 'realDbFacultyAllocations.json'),
          path.join(process.cwd(), 'web', 'src', 'lib', 'realDbFacultyAllocations.json')
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            fs.writeFileSync(p, JSON.stringify(allocationsDatabase, null, 2), 'utf8');
            break;
          }
        }
      } catch (err) {
        console.warn('Could not persist allocations to file:', err);
      }

      const faculty = facultyDatabase.find((f: any) => f.id === body.facultyId);
      if (faculty) {
        if (!faculty.assignedInstitutions) faculty.assignedInstitutions = [];
        if (body.institutionId && !faculty.assignedInstitutions.some((i: any) => i.id === body.institutionId)) {
          faculty.assignedInstitutions.push({
            id: body.institutionId,
            name: body.institutionName,
            code: body.institutionCode || 'CAMPUS',
            type: body.institutionType || 'COLLEGE',
          });
        }
      }

      return NextResponse.json({
        status: 'success',
        message: 'Faculty allocated successfully.',
        data: newAlloc,
      });
    }

    const newFaculty = {
      id: `fac-${Date.now().toString().slice(-4)}`,
      name: body.name,
      designation: body.designation || 'Foreign Language Faculty',
      email: body.email,
      mobile: body.mobile || '+91 90000 00000',
      avatarUrl: body.avatarUrl || '/avatars/default.png',
      primaryLanguage: body.primaryLanguage || 'FRENCH',
      qualification: body.qualification || 'Certified Language Instructor',
      experienceYears: Number(body.experienceYears) || 3,
      nativeCountry: body.nativeCountry || 'India',
      status: 'ACTIVE',
      activeBatchesCount: 1,
      assignedRoles: body.assignedRoles || ['LEAD_TRAINER'],
      weeklyHoursLimit: 20,
      allocatedHours: 6,
      assignedInstitutionType: body.assignedInstitutionType || 'COLLEGE',
      assignedInstitutionName: body.assignedInstitutionName || 'Affiliated Campus',
      assignedInstitutions: body.assignedInstitutions || [],
    };

    facultyDatabase.unshift(newFaculty as any);

    return NextResponse.json({
      status: 'success',
      message: 'Tutor profile created successfully.',
      data: newFaculty,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
