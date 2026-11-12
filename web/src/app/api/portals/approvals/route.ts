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

export async function GET(request: Request) {
  try {
    const approvals = loadApprovals();
    return NextResponse.json({
      status: 'success',
      total: approvals.length,
      data: approvals,
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
    const approvals = loadApprovals();

    // Check if review action on specific approval (e.g. { id, action: 'APPROVED' | 'REJECTED' })
    if (body.action && body.id) {
      const idx = approvals.findIndex((a) => a.id === body.id);
      if (idx !== -1) {
        approvals[idx].currentStatus = body.action;
        approvals[idx].reviewerRemarks = body.remarks;
        approvals[idx].reviewedAt = new Date().toISOString();
        saveApprovals(approvals);
        return NextResponse.json({
          status: 'success',
          message: `Approval request ${body.action}`,
          data: approvals[idx],
        });
      }
    }

    // Submit new approval request
    const newApproval = {
      id: body.id || `REQ-${Date.now().toString().slice(-6)}`,
      requestType: body.requestType || 'COURSE_CREATION',
      module: body.module || 'Academic',
      title: body.title || 'Academic Request',
      description: body.description || '',
      entityType: body.entityType || 'COURSE',
      entityId: body.entityId || `ent-${Date.now().toString().slice(-4)}`,
      requestedByUserId: body.requestedByUserId || body.submittedBy?.name || 'Academic Manager',
      priority: body.priority || body.urgency || 'NORMAL',
      institutionId: body.institutionId || 'inst-01',
      currentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      submittedPayload: body,
    };

    approvals.unshift(newApproval);
    saveApprovals(approvals);

    return NextResponse.json({
      status: 'success',
      message: 'Approval submitted successfully',
      data: newApproval,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

