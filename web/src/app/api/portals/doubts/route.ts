import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getDoubtsFilePath() {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'lib', 'realDbDoubts.json'),
    path.join(process.cwd(), 'web', 'src', 'lib', 'realDbDoubts.json'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return candidatePaths[1] || candidatePaths[0];
}

function loadDoubts(): any[] {
  try {
    const filePath = getDoubtsFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load doubts:', e);
  }
  return [];
}

function saveDoubts(items: any[]) {
  try {
    const filePath = getDoubtsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save doubts:', e);
  }
}

export async function GET() {
  try {
    const items = loadDoubts();
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
    const items = loadDoubts();

    // 1. Reply to existing doubt thread
    if (body.action === 'REPLY' && body.threadId) {
      const idx = items.findIndex((t: any) => t.id === body.threadId);
      if (idx !== -1) {
        if (!items[idx].messages) items[idx].messages = [];
        items[idx].messages.push(body.message);
        if (body.status) items[idx].status = body.status;
        saveDoubts(items);
        return NextResponse.json({
          status: 'success',
          message: 'Reply added',
          data: items[idx],
        });
      }
    }

    // 2. Create new doubt ticket from Student
    const newThread = {
      id: body.id || `dt-${Date.now().toString().slice(-6)}`,
      ticketNo: body.ticketNo || `TKT-${Date.now().toString().slice(-4)}`,
      topicTitle: body.topicTitle || 'Doubt Inquiry',
      category: body.category || 'Grammar',
      batchId: body.batchId || 'batch-all',
      batchName: body.batchName || 'MRNG BATCH',
      courseName: body.courseName || 'German A1 Fast-Track Immersion',
      studentId: body.studentId || 'std-current',
      studentName: body.studentName || 'Muthu Pandian',
      studentRollNo: body.studentRollNo || 'AMER-COL-STD-23',
      collegeName: body.collegeName || 'The American College',
      assignedTutorName: body.assignedTutorName || 'Joy JK',
      assignedTutorRole: body.assignedTutorRole || 'Main Tutor',
      status: 'OPEN',
      priority: body.priority || 'HIGH',
      createdAt: body.createdAt || new Date().toISOString(),
      messages: body.messages || [],
    };

    items.unshift(newThread);
    saveDoubts(items);

    return NextResponse.json({
      status: 'success',
      message: 'Doubt created successfully',
      data: newThread,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

