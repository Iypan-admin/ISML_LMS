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

function getTimetable(): any[] {
  try {
    const p = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbTimetable.json');
    const altP = path.join(process.cwd(), 'src', 'lib', 'realDbTimetable.json');
    const target = fs.existsSync(p) ? p : fs.existsSync(altP) ? altP : null;
    if (target) {
      return JSON.parse(fs.readFileSync(target, 'utf8'));
    }
  } catch {}
  return [];
}

function getApprovals(): any[] {
  try {
    const p = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbApprovals.json');
    const altP = path.join(process.cwd(), 'src', 'lib', 'realDbApprovals.json');
    const target = fs.existsSync(p) ? p : fs.existsSync(altP) ? altP : null;
    if (target) {
      return JSON.parse(fs.readFileSync(target, 'utf8'));
    }
  } catch {}
  return [];
}

function parseTimeSlotHours(timeSlot: string) {
  const timeMatch = timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let sH = 18, sM = 30, eH = 21, eM = 0;
  if (timeMatch) {
    let h1 = parseInt(timeMatch[1], 10);
    const m1 = parseInt(timeMatch[2], 10);
    const ampm1 = timeMatch[3].toUpperCase();
    if (ampm1 === 'PM' && h1 < 12) h1 += 12;
    if (ampm1 === 'AM' && h1 === 12) h1 = 0;
    sH = h1; sM = m1;

    let h2 = parseInt(timeMatch[4], 10);
    const m2 = parseInt(timeMatch[5], 10);
    const ampm2 = timeMatch[6].toUpperCase();
    if (ampm2 === 'PM' && h2 < 12) h2 += 12;
    if (ampm2 === 'AM' && h2 === 12) h2 = 0;
    eH = h2; eM = m2;
  }
  return { sH, sM, eH, eM, durationMinutes: Math.max(30, (eH * 60 + eM) - (sH * 60 + sM)) };
}

export async function GET(request: Request) {
  try {
    const batches = getBatches();
    const timetable = getTimetable();
    const approvals = getApprovals();
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const daysMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const currentDayIdx = now.getDay();
    const currentDayName = daysMap[currentDayIdx];

    // Merge any approved timetable slots from approvals if not already in timetable
    const allSlots = [...timetable];
    approvals
      .filter((a) => (a.requestType === 'TIMETABLE_SLOT' || a.entityType === 'TIMETABLE') && a.currentStatus === 'APPROVED')
      .forEach((a) => {
        const slots = a.submittedPayload?.details?.slotsInstances || a.submittedPayload?.slotsInstances;
        if (Array.isArray(slots)) {
          slots.forEach((s: any) => {
            // Deduplicate by slot id OR by same batch + day + matching time window
            const isDuplicate = allSlots.some((existing) => {
              if (existing.id === s.id) return true;
              const sameBatch = String(existing.batchName || '').toLowerCase().trim() === String(s.batchName || '').toLowerCase().trim();
              const sameDay = String(existing.day || '').toUpperCase().trim() === String(s.day || '').toUpperCase().trim();
              const cleanTime1 = String(existing.timeSlot || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
              const cleanTime2 = String(s.timeSlot || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
              const sameTime = cleanTime1 === cleanTime2;
              return sameBatch && sameDay && sameTime;
            });
            if (!isDuplicate) {
              allSlots.push(s);
            }
          });
        }
      });

    const liveClassItems: any[] = [];

    // Build map of batch info for quick metadata enrichment
    const batchMap = new Map<string, any>();
    batches.forEach((b) => {
      if (b.name) batchMap.set(b.name.toLowerCase().trim(), b);
      if (b.code) batchMap.set(b.code.toLowerCase().trim(), b);
    });

    // 1. Process EVERY schedule slot directly from the timetable
    allSlots.forEach((slot) => {
      const slotDay = String(slot.day || 'THURSDAY').toUpperCase().trim();
      const slotDayIdx = daysMap.indexOf(slotDay);
      const isToday = slotDay === currentDayName;

      const batchMeta = batchMap.get((slot.batchName || '').toLowerCase().trim()) || {};
      const batchCode = batchMeta.code || (slot.batchName ? `BAT-${slot.batchName.replace(/\s+/g, '-').toUpperCase()}` : 'BAT-01');
      const institutionName = slot.institutionName || batchMeta.institutionName || 'The American College';
      const institutionId = slot.institutionId || batchMeta.institutionId || '521323cd-00da-49a6-98ed-6b7918d181b4';
      const studentsCount = slot.maxAttendees || batchMeta.studentsCount || 10;

      const { sH, sM, eH, eM, durationMinutes } = parseTimeSlotHours(slot.timeSlot || '09:00 AM - 10:30 AM');

      // Calculate schedule date
      let classDate = new Date();
      if (isToday) {
        // Today
        classDate.setHours(sH, sM, 0, 0);
      } else if (slotDayIdx !== -1) {
        // Days difference relative to today
        let dayDiff = slotDayIdx - currentDayIdx;
        if (dayDiff < -1) dayDiff += 7; // Future day next week
        classDate.setDate(now.getDate() + dayDiff);
        classDate.setHours(sH, sM, 0, 0);
      }

      const startTime = new Date(classDate);
      const endTime = new Date(classDate.getTime() + durationMinutes * 60000);

      const startMinutes = sH * 60 + sM;
      const endMinutes = eH * 60 + eM;

      let status = 'UPCOMING';
      let isBroadcastingNow = false;
      let recordingAvailable = false;

      if (isToday) {
        if (currentMins >= startMinutes && currentMins <= endMinutes) {
          // Exactly within live session window
          status = 'LIVE';
          isBroadcastingNow = true;
        } else if (currentMins > endMinutes) {
          // Completed session today
          status = 'COMPLETED';
          recordingAvailable = true;
        } else {
          // Scheduled for later today
          status = 'TODAY';
        }
      } else if (classDate.getTime() < now.getTime()) {
        status = 'COMPLETED';
        recordingAvailable = true;
      } else {
        status = 'UPCOMING';
      }

      liveClassItems.push({
        id: `live-${slot.id || (slot.batchName ? slot.batchName.replace(/\s+/g, '-').toLowerCase() : 'slot')}-${slotDay.toLowerCase()}`,
        title: `${slot.subjectName || 'Sample Course'} — Live Interactive Studio`,
        language: 'French / International',
        level: 'A1',
        courseName: slot.subjectName || 'Sample Course',
        batchName: slot.batchName || 'Interactive Batch',
        batchCode: batchCode,
        tutorName: slot.facultyName || 'Joy JK',
        tutorId: 'fac-201834',
        scheduledStartTime: startTime.toISOString(),
        scheduledEndTime: endTime.toISOString(),
        timeSlot: slot.timeSlot,
        durationMinutes: durationMinutes,
        meetingUrl: slot.meetingUrl || `https://meet.isml.edu/live-${batchCode.toLowerCase()}`,
        roomName: `isml-room-${batchCode.toLowerCase()}`,
        status: status,
        isBroadcastingNow: isBroadcastingNow,
        tutorJoined: isBroadcastingNow,
        isScheduledToday: isToday,
        enrolledStudentsCount: studentsCount,
        attendedStudentsCount: isBroadcastingNow ? Math.max(1, Math.floor(studentsCount * 0.8)) : (recordingAvailable ? studentsCount : 0),
        recordingAvailable: recordingAvailable,
        recordingUrl: '/recordings',
        institutionId: institutionId,
        campusName: institutionName,
      });
    });

    return NextResponse.json({
      status: 'success',
      total: liveClassItems.length,
      data: liveClassItems,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message, data: [] },
      { status: 500 }
    );
  }
}
