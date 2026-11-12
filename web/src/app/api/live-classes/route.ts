import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getBatches(): any[] {
  try {
    const p = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbBatches.json');
    const altP = path.join(process.cwd(), 'src', 'lib', 'realDbBatches.json');
    const target = fs.existsSync(p) ? p : fs.existsSync(altP) ? altP : null;
    if (target) {
      return JSON.parse(fs.readFileSync(target, 'utf8'));
    }
  } catch {}
  return [];
}

export async function GET(request: Request) {
  try {
    const batches = getBatches();
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Distinct batches
    const distinctBatches = batches.filter(
      (b: any, index: number, self: any[]) =>
        index === self.findIndex((t: any) => t.code === b.code || t.name === b.name)
    );

    const data: any[] = [];

    // Helper to format Date: "Nov 12, 2026"
    const formatDate = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    distinctBatches.forEach((batch: any, index: number) => {
      const isMorning = batch.name?.toLowerCase().includes('morning') || batch.code?.includes('MRNG');
      const timeSlot = isMorning ? '09:00 AM – 10:30 AM' : '06:00 PM – 07:30 PM';
      const [sH, sM] = isMorning ? [9, 0] : [18, 0];
      const [eH, eM] = isMorning ? [10, 30] : [19, 30];
      const startMinutes = sH * 60 + sM;
      const endMinutes = eH * 60 + eM;

      // 1. TODAY'S CLASS
      const todayStart = new Date();
      todayStart.setHours(sH, sM, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(eH, eM, 0, 0);

      const isLiveNow = currentMins >= startMinutes - 15 && currentMins <= endMinutes;
      const isPastToday = currentMins > endMinutes;

      data.push({
        id: `live-${batch.code?.toLowerCase()}-today`,
        title: `${batch.programName || 'Sample Course'} — Live Lecture: Module Foundations`,
        language: 'French / International',
        level: 'A1',
        courseName: batch.programName || 'Sample Course',
        batchName: batch.name || 'Batch Cohort',
        batchCode: batch.code || 'BAT-01',
        tutorName: batch.assignedFacultyName || 'Joy JK',
        tutorId: 'fac-201834',
        scheduledStartTime: todayStart.toISOString(),
        scheduledEndTime: todayEnd.toISOString(),
        timeSlot,
        durationMinutes: 90,
        meetingUrl: `https://meet.isml.edu/live-${batch.code?.toLowerCase()}`,
        roomName: `isml-room-${batch.code?.toLowerCase()}`,
        status: isLiveNow ? 'LIVE' : isPastToday ? 'ENDED' : 'SCHEDULED',
        isBroadcastingNow: isLiveNow,
        isScheduledToday: true,
        enrolledStudentsCount: batch.studentsCount || 10,
        attendedStudentsCount: isLiveNow ? 8 : isPastToday ? 10 : 0,
        institutionId: batch.institutionId || '521323cd-00da-49a6-98ed-6b7918d181b4',
        campusName: batch.institutionName || 'The American College',
      });

      // 2. UPCOMING CLASS (Tomorrow or next scheduled session)
      const upcomingStart = new Date();
      upcomingStart.setDate(now.getDate() + 2);
      upcomingStart.setHours(sH, sM, 0, 0);
      const upcomingEnd = new Date(upcomingStart.getTime() + 90 * 60000);

      data.push({
        id: `live-${batch.code?.toLowerCase()}-upcoming`,
        title: `${batch.programName || 'Sample Course'} — Live Lecture: LSRW Practical Workshop`,
        language: 'French / International',
        level: 'A1',
        courseName: batch.programName || 'Sample Course',
        batchName: batch.name || 'Batch Cohort',
        batchCode: batch.code || 'BAT-01',
        tutorName: batch.assignedFacultyName || 'Joy JK',
        tutorId: 'fac-201834',
        scheduledStartTime: upcomingStart.toISOString(),
        scheduledEndTime: upcomingEnd.toISOString(),
        timeSlot,
        durationMinutes: 90,
        meetingUrl: `https://meet.isml.edu/live-${batch.code?.toLowerCase()}-up`,
        roomName: `isml-room-${batch.code?.toLowerCase()}-up`,
        status: 'UPCOMING',
        isBroadcastingNow: false,
        isScheduledToday: false,
        enrolledStudentsCount: batch.studentsCount || 10,
        attendedStudentsCount: 0,
        institutionId: batch.institutionId || '521323cd-00da-49a6-98ed-6b7918d181b4',
        campusName: batch.institutionName || 'The American College',
      });

      // 3. COMPLETED CLASS (Previous session with recording available)
      const completedStart = new Date();
      completedStart.setDate(now.getDate() - 2);
      completedStart.setHours(sH, sM, 0, 0);
      const completedEnd = new Date(completedStart.getTime() + 90 * 60000);

      data.push({
        id: `live-${batch.code?.toLowerCase()}-completed`,
        title: `${batch.programName || 'Sample Course'} — Live Lecture: Phonetics & Vocabulary Drill`,
        language: 'French / International',
        level: 'A1',
        courseName: batch.programName || 'Sample Course',
        batchName: batch.name || 'Batch Cohort',
        batchCode: batch.code || 'BAT-01',
        tutorName: batch.assignedFacultyName || 'Joy JK',
        tutorId: 'fac-201834',
        scheduledStartTime: completedStart.toISOString(),
        scheduledEndTime: completedEnd.toISOString(),
        timeSlot,
        durationMinutes: 90,
        meetingUrl: `https://meet.isml.edu/live-${batch.code?.toLowerCase()}-comp`,
        roomName: `isml-room-${batch.code?.toLowerCase()}-comp`,
        status: 'ENDED',
        isBroadcastingNow: false,
        isScheduledToday: false,
        recordingAvailable: true,
        recordingUrl: '/recordings',
        enrolledStudentsCount: batch.studentsCount || 10,
        attendedStudentsCount: 10,
        institutionId: batch.institutionId || '521323cd-00da-49a6-98ed-6b7918d181b4',
        campusName: batch.institutionName || 'The American College',
      });
    });

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
