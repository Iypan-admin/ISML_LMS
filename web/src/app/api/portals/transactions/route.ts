import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getTransactionsFilePath(): string {
  const p1 = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbTransactions.json');
  const p2 = path.join(process.cwd(), 'src', 'lib', 'realDbTransactions.json');
  return fs.existsSync(p1) ? p1 : fs.existsSync(p2) ? p2 : p1;
}

function getStudentFeesFilePath(): string {
  const p1 = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbStudentFees.json');
  const p2 = path.join(process.cwd(), 'src', 'lib', 'realDbStudentFees.json');
  return fs.existsSync(p1) ? p1 : fs.existsSync(p2) ? p2 : p1;
}

function loadTransactions(): any[] {
  try {
    const filePath = getTransactionsFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading realDbTransactions:', e);
  }
  return [];
}

function saveTransactions(items: any[]): void {
  try {
    const filePath = getTransactionsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving realDbTransactions:', e);
  }
}

function updateStudentFeesOnPayment(studentIds: string[], amountPerStudent: number, receiptNo: string): void {
  try {
    const filePath = getStudentFeesFilePath();
    if (fs.existsSync(filePath)) {
      const studentFees = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(studentFees)) {
        let changed = false;
        studentFees.forEach((sf: any) => {
          if (studentIds.includes(sf.id) || studentIds.includes(sf.studentId) || studentIds.includes(sf.rollNo)) {
            sf.paidAmount = (sf.paidAmount || 0) + amountPerStudent;
            sf.outstandingBalance = Math.max(0, (sf.netPayable || sf.totalFees || 0) - sf.paidAmount);
            if (Array.isArray(sf.installments)) {
              sf.installments.forEach((inst: any) => {
                if (inst.status !== 'PAID') {
                  inst.status = 'PAID';
                  inst.paidDate = new Date().toISOString().split('T')[0];
                  inst.receiptNo = receiptNo;
                }
              });
            }
            changed = true;
          }
        });
        if (changed) {
          fs.writeFileSync(filePath, JSON.stringify(studentFees, null, 2), 'utf8');
        }
      }
    }
  } catch (e) {
    console.warn('Notice: updating student fees:', e);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const channelType = searchParams.get('channelType');

    let list = loadTransactions();

    if (collegeId && collegeId !== 'ALL') {
      list = list.filter((t) => t.collegeId === collegeId || t.collegeName?.toLowerCase().includes(collegeId.toLowerCase()));
    }
    if (channelType && channelType !== 'ALL') {
      list = list.filter((t) => t.channelType === channelType);
    }

    return NextResponse.json({
      status: 'success',
      total: list.length,
      data: list,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transactions = loadTransactions();

    const timestamp = new Date().toISOString();
    const receiptNo = body.receiptNo || `RCP-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newTx = {
      id: body.id || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      receiptNo,
      studentId: body.studentId || (body.selectedStudentIds?.[0] || 'BULK-STUDENT-IDS'),
      studentName: body.studentName || `${body.collegeName || 'Campus'} (${body.selectedStudentIds?.length || 1} Students)`,
      rollNo: body.rollNo || (body.isBulkChallanBatch ? `BULK-${body.selectedStudentIds?.length || 0}-STUDENTS` : 'BULK-PAY'),
      collegeId: body.collegeId || '521323cd-00da-49a6-98ed-6b7918d181b4',
      collegeName: body.collegeName || 'The American College',
      program: body.program || body.courseName || 'French Certification',
      semester: body.semester || 1,
      amount: Number(body.amount || 0),
      paymentMethod: body.paymentMethod || 'BANK_CHALLAN',
      channelType: body.channelType || 'BANK_CHALLAN_BULK',
      gatewayRef: body.gatewayRef || body.referenceNumber || `CHL-${Date.now().toString().slice(-6)}`,
      challanNumber: body.challanNumber || body.referenceNumber,
      status: body.status || 'SUCCESS',
      isBulkChallanBatch: Boolean(body.isBulkChallanBatch ?? true),
      assignedStudentsCount: body.selectedStudentIds?.length || body.assignedStudentsCount || 1,
      selectedStudentIds: body.selectedStudentIds || [],
      bankName: body.bankName || 'State Bank of India / HDFC CMS',
      branchName: body.branchName || 'Campus Branch',
      depositDate: body.depositDate || timestamp.split('T')[0],
      offlineProofDocument: body.offlineProofDocument || null,
      remarks: body.remarks || `Institutional Bulk Fee Payment via ${body.paymentMethod || 'Bank Challan'}`,
      timestamp,
    };

    transactions.unshift(newTx);
    saveTransactions(transactions);

    // Also update student fees table if student IDs provided
    if (Array.isArray(body.selectedStudentIds) && body.selectedStudentIds.length > 0) {
      const perStudent = Math.round(newTx.amount / body.selectedStudentIds.length);
      updateStudentFeesOnPayment(body.selectedStudentIds, perStudent, receiptNo);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Transaction recorded and assigned successfully',
      data: newTx,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

