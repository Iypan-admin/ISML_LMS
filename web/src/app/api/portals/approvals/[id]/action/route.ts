import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getApprovalsFilePath() {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'lib', 'realDbApprovals.json'),
    path.join(process.cwd(), 'web', 'src', 'lib', 'realDbApprovals.json'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return candidatePaths[1] || candidatePaths[0];
}

function loadApprovals(): any[] {
  try {
    const filePath = getApprovalsFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load approvals:', e);
  }
  return [];
}

function saveApprovals(items: any[]) {
  try {
    const filePath = getApprovalsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save approvals:', e);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const approvals = loadApprovals();

    const idx = approvals.findIndex((a) => a.id === id);
    if (idx !== -1) {
      approvals[idx].currentStatus = body.action;
      approvals[idx].reviewerRemarks = body.remarks;
      approvals[idx].reviewedAt = new Date().toISOString();
      saveApprovals(approvals);

      // If approved and entityType is TIMETABLE, activate slot in realDbTimetable or notify
      if (body.action === 'APPROVED' && (approvals[idx].entityType === 'TIMETABLE' || approvals[idx].requestType === 'TIMETABLE_SLOT')) {
        try {
          const slots =
            approvals[idx].submittedPayload?.details?.slotsInstances ||
            approvals[idx].submittedPayload?.slotsInstances ||
            approvals[idx].details?.slotsInstances;
          const itemsToSave = Array.isArray(slots) && slots.length > 0 
            ? slots 
            : [
                approvals[idx].submittedPayload?.details?.timetablePayload ||
                approvals[idx].submittedPayload?.timetablePayload ||
                approvals[idx].submittedPayload?.slotInstance
              ].filter(Boolean);

          if (itemsToSave.length > 0) {
            const ttPaths = [
              path.join(process.cwd(), 'src', 'lib', 'realDbTimetable.json'),
              path.join(process.cwd(), 'web', 'src', 'lib', 'realDbTimetable.json'),
            ];
            for (const tp of ttPaths) {
              let ttItems: any[] = [];
              if (fs.existsSync(tp)) {
                try { ttItems = JSON.parse(fs.readFileSync(tp, 'utf8')); } catch {}
              }
              itemsToSave.forEach((item: any) => {
                if (item && !ttItems.some((s) => s.id === item.id)) {
                  ttItems.unshift(item);
                }
              });
              fs.writeFileSync(tp, JSON.stringify(ttItems, null, 2), 'utf8');

              // Also update faculty allocation schedule slots so Tutor Dashboard reflects the approved timing immediately
              try {
                const allocPaths = [
                  path.join(process.cwd(), 'src', 'lib', 'realDbFacultyAllocations.json'),
                  path.join(process.cwd(), 'web', 'src', 'lib', 'realDbFacultyAllocations.json'),
                ];
                for (const ap of allocPaths) {
                  if (fs.existsSync(ap)) {
                    const allocs = JSON.parse(fs.readFileSync(ap, 'utf8'));
                    if (Array.isArray(allocs) && itemsToSave.length > 0) {
                      const sample = itemsToSave[0];
                      const matchedAlloc = allocs.find(
                        (a: any) =>
                          (sample.batchName && a.batchName?.toLowerCase().trim() === sample.batchName.toLowerCase().trim()) ||
                          (sample.facultyName && a.facultyName?.toLowerCase().trim() === sample.facultyName.toLowerCase().trim())
                      );
                      if (matchedAlloc) {
                        const daysFormatted = approvals[idx].submittedPayload?.daysFormatted || approvals[idx].details?.daysFormatted || 'Mon, Wed, Fri';
                        matchedAlloc.scheduleSlots = [`${daysFormatted} ${sample.timeSlot}`];
                        fs.writeFileSync(ap, JSON.stringify(allocs, null, 2), 'utf8');
                      }
                    }
                  }
                }
              } catch (e) {
                console.warn('Sync to faculty allocations notice:', e);
              }
            }
          }
        } catch (err) {
          console.warn('Error activating timetable slot in DB:', err);
        }
      }
      // If approved and entityType is ASSIGNMENT, record in realDbAssignments or mark published
      if (body.action === 'APPROVED' && (approvals[idx].entityType === 'ASSIGNMENT' || approvals[idx].requestType === 'ASSIGNMENT_CREATION')) {
        try {
          const asgPayload = approvals[idx].submittedPayload?.assignmentPayload || approvals[idx].submittedPayload;
          if (asgPayload) {
            const asgPaths = [
              path.join(process.cwd(), 'src', 'lib', 'realDbAssignments.json'),
              path.join(process.cwd(), 'web', 'src', 'lib', 'realDbAssignments.json'),
            ];
            for (const ap of asgPaths) {
              let asgItems: any[] = [];
              if (fs.existsSync(ap)) {
                try { asgItems = JSON.parse(fs.readFileSync(ap, 'utf8')); } catch {}
              }
              const item = { ...asgPayload, status: 'ACTIVE', approvedAt: new Date().toISOString() };
              const existingIdx = asgItems.findIndex((a: any) => a.id === item.id);
              if (existingIdx !== -1) {
                asgItems[existingIdx] = { ...asgItems[existingIdx], ...item, status: 'ACTIVE' };
              } else {
                asgItems.unshift(item);
              }
              fs.writeFileSync(ap, JSON.stringify(asgItems, null, 2), 'utf8');
            }
          }
        } catch (err) {
          console.warn('Error activating assignment in DB:', err);
        }
      }

      // If approved and entityType is FeeStructure, activate fee structure and update course fee in DB
      if (body.action === 'APPROVED' && (approvals[idx].entityType === 'FeeStructure' || approvals[idx].requestType === 'FEE_SCHEDULE_CREATION' || approvals[idx].requestType === 'Fee Schedule Revision')) {
        try {
          const feePaths = [
            path.join(process.cwd(), 'src', 'lib', 'realDbFeeStructures.json'),
            path.join(process.cwd(), 'web', 'src', 'lib', 'realDbFeeStructures.json'),
          ];
          const coursePaths = [
            path.join(process.cwd(), 'src', 'lib', 'realDbCourses.json'),
            path.join(process.cwd(), 'web', 'src', 'lib', 'realDbCourses.json'),
          ];

          const feePayload = approvals[idx].submittedPayload;
          const targetCourseId = feePayload?.courseId || approvals[idx].entityId;
          const totalAmount = feePayload?.totalAmount || feePayload?.totalFeeAmount;

          for (const fp of feePaths) {
            if (fs.existsSync(fp)) {
              try {
                const feeList = JSON.parse(fs.readFileSync(fp, 'utf8'));
                let found = false;
                for (let f of feeList) {
                  if (f.id === approvals[idx].entityId || f.courseId === targetCourseId) {
                    f.approvalStatus = 'APPROVED';
                    f.status = 'APPROVED';
                    f.reviewedAt = new Date().toISOString();
                    if (totalAmount) f.totalFeeAmount = totalAmount;
                    found = true;
                  }
                }
                if (!found && feePayload) {
                  feeList.unshift({
                    id: approvals[idx].entityId || `fee-${Date.now()}`,
                    code: `FEESTR-${Date.now().toString().slice(-6)}`,
                    structureName: approvals[idx].entityName || 'Course Fee Package',
                    courseId: targetCourseId,
                    totalFeeAmount: totalAmount || 18500,
                    approvalStatus: 'APPROVED',
                    status: 'APPROVED',
                    createdAt: new Date().toISOString(),
                    components: feePayload.components || [],
                    installments: feePayload.installments || [],
                  });
                }
                fs.writeFileSync(fp, JSON.stringify(feeList, null, 2), 'utf8');
              } catch {}
            }
          }

          // Also reflect the active fee in Courses database
          if (targetCourseId && totalAmount) {
            for (const cp of coursePaths) {
              if (fs.existsSync(cp)) {
                try {
                  const courses = JSON.parse(fs.readFileSync(cp, 'utf8'));
                  let courseChanged = false;
                  for (let c of courses) {
                    if (c.id === targetCourseId || (approvals[idx].entityName && approvals[idx].entityName.includes(c.name))) {
                      c.courseFee = totalAmount;
                      courseChanged = true;
                    }
                  }
                  if (courseChanged) {
                    fs.writeFileSync(cp, JSON.stringify(courses, null, 2), 'utf8');
                  }
                } catch {}
              }
            }
          }
        } catch (err) {
          console.warn('Error activating fee structure in DB:', err);
        }
      }

      return NextResponse.json({
        status: 'success',
        message: `Approval request ${body.action}`,
        data: approvals[idx],
      });
    }

    return NextResponse.json(
      { status: 'error', message: 'Approval request not found' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

