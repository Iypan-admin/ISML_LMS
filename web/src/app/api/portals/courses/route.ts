import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getCoursesFilePath() {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'lib', 'realDbCourses.json'),
    path.join(process.cwd(), 'web', 'src', 'lib', 'realDbCourses.json'),
    path.join(__dirname, '..', '..', '..', '..', 'lib', 'realDbCourses.json')
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return candidatePaths[1] || candidatePaths[0];
}

function loadCourses(): any[] {
  try {
    const filePath = getCoursesFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load courses:', e);
  }
  return [];
}

function saveCourses(courses: any[]) {
  try {
    const filePath = getCoursesFilePath();
    fs.writeFileSync(filePath, JSON.stringify(courses, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save courses:', e);
  }
}

export async function GET(request: Request) {
  try {
    const data = loadCourses();
    return NextResponse.json({ status: 'success', total: data.length, data });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const courses = loadCourses();

    if (body.action === 'DELETE' && body.id) {
      const filtered = courses.filter((c: any) => c.id !== body.id);
      saveCourses(filtered);
      return NextResponse.json({ status: 'success', message: 'Course deleted', data: filtered });
    }

    if (body.action === 'UPDATE' && body.id) {
      const idx = courses.findIndex((c: any) => c.id === body.id);
      if (idx !== -1) {
        courses[idx] = { ...courses[idx], ...body.course };
        saveCourses(courses);
        return NextResponse.json({ status: 'success', message: 'Course updated', data: courses[idx] });
      }
    }

    const newCourse = {
      id: body.id || `crs-${Date.now()}`,
      code: body.code || `CRS-${Date.now().toString().slice(-4)}`,
      name: body.name || 'New Course',
      displayName: body.displayName || body.name || 'New Course',
      collegeId: body.collegeId || '521323cd-00da-49a6-98ed-6b7918d181b4',
      collegeName: body.collegeName || 'The American College',
      department: body.department || 'Department of Foreign Languages',
      program: body.program || 'Certificate Program Track',
      semester: body.semester || 1,
      academicYear: body.academicYear || '2026–2027',
      duration: body.duration || '80 Hours',
      durationDays: Number(body.durationDays) || 120,
      durationType: body.durationType || '4_MONTHS',
      facultyName: body.facultyName || 'Lead Academic Faculty',
      substituteTutors: body.substituteTutors || [],
      enrolledStudents: body.enrolledStudents || 0,
      completionRate: body.completionRate || 0,
      courseFee: Number(body.courseFee) || 18500,
      status: body.status || 'PUBLISHED',
      createdAt: new Date().toISOString()
    };

    courses.push(newCourse);
    saveCourses(courses);

    return NextResponse.json({ status: 'success', message: 'Course created', data: newCourse });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
