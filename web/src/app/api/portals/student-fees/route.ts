import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getStudentFeesFilePath(): string {
  const p1 = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbStudentFees.json');
  const p2 = path.join(process.cwd(), 'src', 'lib', 'realDbStudentFees.json');
  return fs.existsSync(p1) ? p1 : fs.existsSync(p2) ? p2 : p1;
}

function loadStudentFees(): any[] {
  try {
    const filePath = getStudentFeesFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading realDbStudentFees:', e);
  }
  return [];
}

function saveStudentFees(data: any[]): void {
  try {
    const p1 = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbStudentFees.json');
    const p2 = path.join(process.cwd(), 'src', 'lib', 'realDbStudentFees.json');
    if (fs.existsSync(p1)) fs.writeFileSync(p1, JSON.stringify(data, null, 2), 'utf8');
    if (fs.existsSync(p2)) fs.writeFileSync(p2, JSON.stringify(data, null, 2), 'utf8');
    if (!fs.existsSync(p1) && !fs.existsSync(p2)) {
      fs.writeFileSync(p1, JSON.stringify(data, null, 2), 'utf8');
    }
  } catch (e) {
    console.error('Error saving realDbStudentFees:', e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const list = loadStudentFees();

    // 1. Pay Fee Action
    if (body.action === 'PAY_FEE' || body.action === 'PAY') {
      const studentIdentifier = (body.studentId || body.rollNo || '').toString().toLowerCase();
      const studentName = (body.studentName || '').toString().toLowerCase();
      const amountPaid = Number(body.amountPaid || body.amount) || 0;

      const idx = list.findIndex(
        (s) =>
          (s.rollNo && s.rollNo.toLowerCase() === studentIdentifier) ||
          (s.studentId && s.studentId.toLowerCase() === studentIdentifier) ||
          (s.name && s.name.toLowerCase() === studentName)
      );

      const receiptNo = body.receiptNo || `RCP-${Date.now().toString().slice(-6)}`;
      const paymentRef = body.paymentRefId || `TXN-RPY-${Date.now()}`;

      if (idx !== -1) {
        const item = list[idx];
        const newPaid = (item.paidAmount || 0) + amountPaid;
        const total = item.totalFees || 18500;
        const remaining = Math.max(0, total - newPaid);

        item.paidAmount = newPaid;
        item.outstandingBalance = remaining;
        item.paymentStatus = remaining === 0 ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'UNPAID';
        item.lastPaymentDate = new Date().toISOString().split('T')[0];

        // Update installment
        if (Array.isArray(item.installments)) {
          let unpaidFound = false;
          item.installments = item.installments.map((inst: any) => {
            if (!unpaidFound && (inst.status === 'PENDING' || inst.status === 'OVERDUE')) {
              unpaidFound = true;
              return { ...inst, status: 'PAID', paidDate: new Date().toISOString().split('T')[0], receiptNo };
            }
            return inst;
          });
        }

        saveStudentFees(list);

        return NextResponse.json({
          status: 'success',
          message: 'Payment recorded successfully',
          data: item,
          receiptNo,
          paymentRef,
        });
      } else {
        // Create new paid/partial ledger
        const newRecord = {
          id: `fee-${body.rollNo || Date.now()}`,
          studentId: body.studentId || `std-${Date.now()}`,
          rollNo: body.rollNo || 'AMER-NEW',
          name: body.studentName || 'Enrolled Student',
          email: body.studentEmail || 'student@isml.edu',
          avatar: '/avatars/default.png',
          collegeId: body.collegeId || '521323cd-00da-49a6-98ed-6b7918d181b4',
          collegeName: body.collegeName || 'The American College',
          program: body.program || 'French Language Track',
          department: body.department || 'Department of Foreign Languages',
          batch: body.batch || 'Morning Batch',
          currentSemester: 1,
          totalFees: 18500,
          concessionAmount: 0,
          netPayable: 18500,
          paidAmount: amountPaid,
          outstandingBalance: Math.max(0, 18500 - amountPaid),
          paymentStatus: amountPaid >= 18500 ? 'PAID' : amountPaid > 0 ? 'PARTIAL' : 'UNPAID',
          lastPaymentDate: new Date().toISOString().split('T')[0],
          installments: [
            {
              number: 1,
              title: 'Installment 1 (At Admission)',
              amount: amountPaid,
              dueDate: new Date().toISOString().split('T')[0],
              status: amountPaid >= 7500 ? 'PAID' : 'PARTIAL',
              paidDate: new Date().toISOString().split('T')[0],
              receiptNo,
            },
          ],
        };
        list.unshift(newRecord);
        saveStudentFees(list);

        return NextResponse.json({
          status: 'success',
          message: 'Fee ledger created & paid',
          data: newRecord,
          receiptNo,
          paymentRef,
        });
      }
    }

    // 2. Default: Create New Unpaid Student Fee Ledger
    const rollNo = body.rollNo || `AMER-${Date.now().toString().slice(-4)}`;
    const totalFees = Number(body.totalFees || body.courseFee) || 18500;
    const amountPaid = Number(body.amountPaid) || 0;
    const outstanding = Math.max(0, totalFees - amountPaid);
    const paymentStatus = amountPaid >= totalFees ? 'PAID' : amountPaid > 0 ? 'PARTIAL' : 'UNPAID';

    const newLedger = {
      id: `fee-${rollNo}`,
      studentId: body.studentId || `std-${rollNo}`,
      rollNo,
      name: body.name || body.fullName || 'Student',
      email: body.email || 'student@isml.edu',
      avatar: '/avatars/default.png',
      collegeId: body.collegeId || '521323cd-00da-49a6-98ed-6b7918d181b4',
      collegeName: body.collegeName || 'The American College',
      program: body.program || body.courseName || 'French Language Certification',
      department: body.department || 'Department of Foreign Languages',
      batch: body.batch || 'Morning Batch',
      currentSemester: 1,
      totalFees,
      concessionAmount: Number(body.discountScholarship) || 0,
      netPayable: totalFees,
      paidAmount: amountPaid,
      outstandingBalance: outstanding,
      paymentStatus,
      lastPaymentDate: amountPaid > 0 ? new Date().toISOString().split('T')[0] : null,
      installments: [
        {
          number: 1,
          title: 'Full Course Tuition Fee',
          amount: totalFees,
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: paymentStatus,
          paidDate: amountPaid > 0 ? new Date().toISOString().split('T')[0] : null,
        },
      ],
    };

    // Remove old matching if exists and prepend
    const existingIdx = list.findIndex((s) => s.rollNo === rollNo);
    if (existingIdx !== -1) {
      list[existingIdx] = { ...list[existingIdx], ...newLedger };
    } else {
      list.unshift(newLedger);
    }

    saveStudentFees(list);

    return NextResponse.json({
      status: 'success',
      message: 'Student fee ledger registered',
      data: newLedger,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    let list = loadStudentFees();

    if (collegeId && collegeId !== 'ALL') {
      const isSchool = /lion|siva|sls|sch/i.test(collegeId);
      const isAmer = /amer/i.test(collegeId) || collegeId === '521323cd-00da-49a6-98ed-6b7918d181b4';

      if (isSchool) {
        list = list.filter(
          (s) =>
            s.collegeId === collegeId ||
            s.rollNo?.startsWith('SLS-') ||
            (s.collegeName && /lion|siva|school/i.test(s.collegeName))
        );
      } else if (isAmer) {
        list = list.filter(
          (s) =>
            s.collegeId === collegeId ||
            s.rollNo?.startsWith('AMER-') ||
            (s.collegeName && /american/i.test(s.collegeName))
        );
      }
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

