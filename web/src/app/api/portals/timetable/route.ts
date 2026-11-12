import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getTimetableFilePath() {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'lib', 'realDbTimetable.json'),
    path.join(process.cwd(), 'web', 'src', 'lib', 'realDbTimetable.json'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return candidatePaths[1] || candidatePaths[0];
}

function loadTimetable(): any[] {
  try {
    const filePath = getTimetableFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.error('Failed to load timetable:', e);
  }
  return [];
}

function saveTimetable(items: any[]) {
  try {
    const filePath = getTimetableFilePath();
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save timetable:', e);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');
    const campusId = searchParams.get('campusId');

    let filtered = loadTimetable();

    if (day) {
      filtered = filtered.filter((s) => s.day.toUpperCase() === day.toUpperCase());
    }

    return NextResponse.json({
      status: 'success',
      total: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const timetableDatabase = loadTimetable();

    const newSlot = {
      id: payload.id || `tt-real-${Date.now()}`,
      day: payload.day || 'MONDAY',
      timeSlot: payload.timeSlot || '10:00 AM - 11:30 AM',
      subjectName: payload.subjectName || 'Language Session',
      subjectCode: payload.subjectCode || 'LAN',
      facultyName: payload.facultyName || 'Joy JK',
      batchName: payload.batchName || 'Executive Cohort',
      sessionFormat: payload.sessionFormat || 'GROUP_WEBINAR',
      targetStudentName: payload.targetStudentName,
      targetCollege: payload.targetCollege,
      oneOnOnePurpose: payload.oneOnOnePurpose,
      room: payload.room || 'Live Online Studio',
      deliveryMode: payload.deliveryMode || 'ONLINE',
      meetingUrl: payload.meetingUrl || `https://live.isml.edu/livekit-room/isml-${Date.now()}`,
      department: payload.department || 'Foreign Languages & Linguistics',
      program: payload.program || 'Language Certification Program',
      semester: payload.semester || 1,
      recurrenceType: payload.recurrenceType || 'WEEKLY',
      specificDate: payload.specificDate,
      cycleIntervalWeeks: payload.cycleIntervalWeeks || 2,
      maxAttendees: payload.maxAttendees || 50,
      status: payload.status || 'ACTIVE',
    };

    const existingIdx = timetableDatabase.findIndex((s) => s.id === newSlot.id);
    if (existingIdx !== -1) {
      timetableDatabase[existingIdx] = newSlot;
    } else {
      timetableDatabase.unshift(newSlot);
    }

    saveTimetable(timetableDatabase);

    return NextResponse.json({
      status: 'success',
      message: 'Timetable slot created successfully',
      data: newSlot,
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    if (!payload.id) {
      return NextResponse.json({ status: 'error', message: 'Slot ID is required for update' }, { status: 400 });
    }

    const timetableDatabase = loadTimetable();
    const index = timetableDatabase.findIndex((s) => s.id === payload.id);
    if (index === -1) {
      return NextResponse.json({ status: 'error', message: 'Slot not found' }, { status: 404 });
    }

    timetableDatabase[index] = {
      ...timetableDatabase[index],
      ...payload,
    };

    saveTimetable(timetableDatabase);

    // Synchronize corresponding faculty allocations (Schedule Days & Slot Timing)
    try {
      const allocPath = path.join(process.cwd(), 'src', 'lib', 'realDbFacultyAllocations.json');
      const allocAltPath = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbFacultyAllocations.json');
      const targetPath = fs.existsSync(allocPath) ? allocPath : fs.existsSync(allocAltPath) ? allocAltPath : null;

      if (targetPath) {
        const allocs = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        if (Array.isArray(allocs)) {
          let updated = false;
          allocs.forEach((a: any) => {
            const matchBatch = payload.batchName && a.batchName?.toLowerCase().trim() === payload.batchName.toLowerCase().trim();
            const matchFaculty = payload.facultyName && a.facultyName?.toLowerCase().trim() === payload.facultyName.toLowerCase().trim();
            const matchCourse = payload.subjectName && (a.courseName?.toLowerCase().trim() === payload.subjectName.toLowerCase().trim() || a.subjectName?.toLowerCase().trim() === payload.subjectName.toLowerCase().trim());

            if (matchBatch || (matchFaculty && matchCourse)) {
              if (payload.timeSlot) {
                const daysLabel = payload.day ? payload.day.slice(0, 3) : 'Mon, Wed, Fri';
                a.scheduleSlots = [`${daysLabel} ${payload.timeSlot}`];
                updated = true;
              }
            }
          });

          if (updated) {
            fs.writeFileSync(targetPath, JSON.stringify(allocs, null, 2), 'utf8');
          }
        }
      }
    } catch (e) {
      console.warn('Faculty allocation sync notice:', e);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Timetable slot updated successfully',
      data: timetableDatabase[index],
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'Slot ID is required' }, { status: 400 });
    }

    let timetableDatabase = loadTimetable();
    timetableDatabase = timetableDatabase.filter((s) => s.id !== id);
    saveTimetable(timetableDatabase);

    return NextResponse.json({
      status: 'success',
      message: 'Timetable slot deleted successfully',
      id,
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

