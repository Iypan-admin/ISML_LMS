import { NextResponse } from 'next/server';
import realDbAdmissions from '@/lib/realDbAdmissions.json';

// In-memory runtime store for new admissions submitted through forms
let submittedAdmissions: any[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const institutionId = searchParams.get('institutionId') || '';

    let combined = [...submittedAdmissions, ...realDbAdmissions];

    if (category === 'SCHOOL') {
      combined = combined.filter((a) => a.admissionType === 'SCHOOL_STUDENT');
    } else if (category === 'COLLEGE') {
      combined = combined.filter((a) => a.admissionType !== 'SCHOOL_STUDENT');
    }

    if (institutionId && institutionId !== 'ALL') {
      combined = combined.filter(
        (a) => a.institutionId === institutionId || a.institutionName?.toLowerCase().includes(institutionId.toLowerCase())
      );
    }

    return NextResponse.json({
      status: 'success',
      total: combined.length,
      data: combined,
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
    const isSchool = body.category === 'SCHOOL' || body.admissionType === 'SCHOOL_STUDENT';
    const newEntry = {
      id: `adm-new-${Date.now().toString().slice(-5)}`,
      applicationNumber: `ISML-ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: body.firstName || 'New',
      lastName: body.lastName || 'Student',
      fullName: body.fullName || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      email: body.email,
      phone: body.phone || '+91 90000 00000',
      admissionType: isSchool ? 'SCHOOL_STUDENT' : 'COLLEGE_STUDENT',
      institutionId: body.institutionId || '',
      institutionName: body.institutionName || 'Affiliated Campus',
      courseName: body.course || body.courseName || 'Foreign Language Track',
      targetLanguage: (body.targetLanguage || 'FRENCH').toUpperCase(),
      targetLevel: body.targetLevel || 'A1.1',
      leadStage: 'ENROLLED',
      currentStatus: 'ENROLLED',
      paymentStatus: body.amountPaid > 0 ? 'PAID' : 'DUE',
      amountPaid: Number(body.amountPaid) || 0,
      pendingAmount: 0,
      leadSource: 'DIRECT_ENROLLMENT',
      createdAt: new Date().toISOString(),
      department: body.department || 'Enrolled',
    };

    submittedAdmissions.unshift(newEntry);

    return NextResponse.json({
      status: 'success',
      message: 'Admission submitted successfully.',
      data: newEntry,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
