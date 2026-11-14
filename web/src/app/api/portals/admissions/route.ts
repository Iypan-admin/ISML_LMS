import { NextResponse } from 'next/server';
import realDbStudents from '@/lib/realDbStudents.json';

// In-memory runtime store for new admissions submitted through forms
let submittedAdmissions: any[] = [];

// Transform real database students into admissions registry format
const studentAdmissions = realDbStudents.map((s: any) => {
  const isSchool = 
    s.studentId?.startsWith('SLS') || 
    s.tenantCode === 'SIVA-LIONS' || 
    s.collegeName?.toLowerCase().includes('school') ||
    s.collegeId === 'c37b62d5-6ca4-47cb-bed7-899ad75a3144';

  const langCode = (s.enrolledCourseCode || s.enrolledCourseName || '').toUpperCase();
  let lang = 'FRENCH';
  let level = 'A1.1';
  if (langCode.includes('DE') || langCode.includes('GERMAN')) lang = 'GERMAN';
  else if (langCode.includes('JA') || langCode.includes('JAPANESE')) lang = 'JAPANESE';
  else if (langCode.includes('ES') || langCode.includes('SPANISH')) lang = 'SPANISH';
  else if (langCode.includes('KO') || langCode.includes('KOREAN')) lang = 'KOREAN';

  return {
    id: s.id,
    applicationNumber: `ADM-${s.studentId || s.id}`,
    firstName: s.firstName || s.name?.split(' ')[0] || '',
    lastName: s.lastName || s.name?.split(' ').slice(1).join(' ') || '',
    fullName: s.name,
    email: s.email,
    phone: s.mobile || '+91 98401 22334',
    admissionType: isSchool ? 'SCHOOL_STUDENT' : 'COLLEGE_STUDENT',
    institutionId: s.collegeId || s.tenantId || (isSchool ? 'c37b62d5-6ca4-47cb-bed7-899ad75a3144' : '521323cd-00da-49a6-98ed-6b7918d181b4'),
    institutionName: s.collegeName || (isSchool ? 'Sivakasi Lions Matriculation Higher Secondary School' : 'The American College'),
    courseName: s.enrolledCourseName || (isSchool ? 'French A1.1 School Foundation Course' : 'Sample Course Program Track'),
    targetLanguage: lang,
    targetLevel: level,
    leadStage: 'ENROLLED',
    currentStatus: 'ENROLLED',
    paymentStatus: s.paymentStatus || (s.amountPaid > 0 ? 'PARTIAL' : 'UNPAID'),
    amountPaid: s.amountPaid || 0,
    pendingAmount: s.outstandingBalance || 18500,
    leadSource: 'CAMPUS_DRIVE',
    createdAt: s.createdDate || '2026-11-12T07:20:30.584Z',
    department: s.departmentName || (isSchool ? 'Secondary School Foreign Languages' : 'Department of Foreign Languages'),
  };
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const institutionId = searchParams.get('institutionId') || '';

    let combined = [...submittedAdmissions, ...studentAdmissions];

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
      paymentStatus: Number(body.amountPaid) > 0 ? 'PAID' : 'UNPAID',
      amountPaid: Number(body.amountPaid) || 0,
      pendingAmount: Math.max(0, 18500 - (Number(body.amountPaid) || 0)),
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
