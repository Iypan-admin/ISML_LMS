import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getAssignmentsFilePath() {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'lib', 'realDbAssignments.json'),
    path.join(process.cwd(), 'web', 'src', 'lib', 'realDbAssignments.json'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return candidatePaths[1] || candidatePaths[0];
}

function loadAssignments(): any[] {
  try {
    const filePath = getAssignmentsFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load assignments:', e);
  }
  return [];
}

function saveAssignments(items: any[]) {
  try {
    const filePath = getAssignmentsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save assignments:', e);
  }
}

export async function GET(request: Request) {
  try {
    const items = loadAssignments();
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
    const items = loadAssignments();

    // Check if this is a student submission to an existing assignment
    if (body.action === 'SUBMIT' && body.assignmentId) {
      const idx = items.findIndex((a: any) => a.id === body.assignmentId);
      if (idx !== -1) {
        if (!items[idx].submissions) items[idx].submissions = [];
        const submission = {
          id: body.submission?.id || `sub-${Date.now().toString().slice(-6)}`,
          studentId: body.submission?.studentId || 'std-current',
          studentName: body.submission?.studentName || 'Active Student',
          studentRollNo: body.submission?.studentRollNo || 'ISML-STD-001',
          submittedAt: new Date().toISOString(),
          status: 'PENDING_REVIEW',
          submissionType: body.submission?.submissionType || 'PDF',
          fileName: body.submission?.fileName,
          fileSize: body.submission?.fileSize,
          fileUrl: body.submission?.fileUrl,
          fileDataUrl: body.submission?.fileDataUrl,
          studentNotes: body.submission?.studentNotes || '',
          maxScore: items[idx].maxScore || 100,
        };
        items[idx].submissions = items[idx].submissions.filter(
          (s: any) => s.studentId !== submission.studentId
        );
        items[idx].submissions.push(submission);
        saveAssignments(items);
        return NextResponse.json({
          status: 'success',
          message: 'Submission recorded in database successfully',
          data: submission,
        });
      }
    }

    const newAssignment = {
      id: body.id || `asg-${Date.now().toString().slice(-6)}`,
      title: body.title || 'Homework Assignment',
      courseId: body.courseId || 'crs-01',
      courseName: body.courseName || 'Course Track',
      batchId: body.batchId || 'batch-01',
      batchName: body.batchName || 'Default Batch',
      subjectCode: body.subjectCode || 'LANG-101',
      subjectName: body.subjectName || 'Foreign Language',
      languageFamily: body.languageFamily || 'FRENCH',
      lsrwSkill: body.lsrwSkill || 'INTEGRATED',
      moduleCode: body.moduleCode,
      moduleName: body.moduleName,
      dueDate: body.dueDate,
      status: body.status || 'ACTIVE',
      instructions: body.instructions || '',
      maxScore: body.maxScore || 100,
      assignedTutorName: body.assignedTutorName || 'Assigned Course Tutor',
      attachedFile: body.attachedFile,
      submissions: body.submissions || [],
      createdAt: new Date().toISOString(),
    };

    items.unshift(newAssignment);
    saveAssignments(items);

    return NextResponse.json({
      status: 'success',
      message: 'Assignment saved successfully',
      data: newAssignment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

