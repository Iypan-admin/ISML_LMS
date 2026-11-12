// ============================================================================
// ISML LMS — PUBLIC MULTI-TIER REGISTRATION HUB (/register)
// Clean, Bright, Premium Professional SaaS Theme (White & Slate Blue)
// 2-WAY ARCHITECTURE:
// 1. INSTITUTIONAL MoUs (College Deans & School Admins Bulk Batch Upload)
// 2. INDIVIDUAL DIRECT APPLICANTS (Student & Parent Direct Enrolment)
// Supports Instant School vs College Scope Switching + Live Invoice Breakdown
// ============================================================================

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  School,
  Building2,
  BookOpen,
  User,
  Users,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  CreditCard,
  Lock,
  Clock,
  Sparkles,
  MapPin,
  QrCode,
  FileCheck,
  Upload,
  FileSpreadsheet,
  Download,
  Trash2,
  Plus,
  ShieldCheck,
  Mail,
  Phone,
  Printer,
  Copy,
  Check,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { salesStore } from '@/mock/salesData';

const colleges = [
  {
    id: 'inst-01',
    name: 'Loyola College (Autonomous)',
    code: 'LOYOLA-CHE',
    campusArea: 'Sterling Road, Nungambakkam',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600034',
    coordinator: 'Dr. K. Sivakumar (Language Dean)',
    mouRef: 'MOU-2026-LOY-004',
    agreedRate: 14500,
  },
  {
    id: 'inst-02',
    name: 'Madras Christian College (Autonomous)',
    code: 'MCC-CHE',
    campusArea: 'Tambaram East Main Campus',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600059',
    coordinator: 'Prof. Mary Joseph (Dean of Humanities)',
    mouRef: 'MOU-2026-MCC-012',
    agreedRate: 15000,
  },
  {
    id: 'inst-03',
    name: 'Stella Maris College (Autonomous)',
    code: 'SMC-CHE',
    campusArea: 'Cathedral Road, Teynampet',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600086',
    coordinator: 'Dr. Sr. Rosy (Academic VP)',
    mouRef: 'MOU-2026-SMC-008',
    agreedRate: 14000,
  },
  {
    id: 'inst-04',
    name: 'PSG College of Technology',
    code: 'PSG-CBE',
    campusArea: 'Avinashi Road, Peelamedu',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641004',
    coordinator: 'Dr. R. Venkatraman (International Cell)',
    mouRef: 'MOU-2026-PSG-019',
    agreedRate: 15500,
  },
];

const schools = [
  {
    id: 'school-01',
    name: 'Delhi Public School (DPS International Campus)',
    code: 'DPS-INT-CHE',
    campusArea: 'Greenways Road, R.A. Puram',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600028',
    principalContact: 'Mrs. Radhika Sundaram (Vice Principal)',
    mouRef: 'MOU-2026-DPS-007',
    agreedRate: 10500,
  },
  {
    id: 'school-02',
    name: 'National Public School (NPS Senior Wing)',
    code: 'NPS-SR-CHE',
    board: 'CBSE',
    campusArea: 'Harrington Road, Chetpet',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600031',
    principalContact: 'Mr. Venkatesh Raghavan (Academic Coordinator)',
    mouRef: 'MOU-2026-NPS-014',
    agreedRate: 11000,
  },
  {
    id: 'school-03',
    name: 'DAV Senior Secondary Academy',
    code: 'DAV-SSA-CHE',
    board: 'CBSE',
    campusArea: 'Anna Nagar West 2nd Avenue',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600040',
    principalContact: 'Dr. Anandhakumar V. (Head of Languages)',
    mouRef: 'MOU-2026-DAV-022',
    agreedRate: 11500,
  },
];

const collegeLanguages = [
  { lang: 'French', level: 'CEFR A1 (Beginner to DELF A1)', fee: 18500, time: 'Mon/Wed/Fri — 6:00 PM IST' },
  { lang: 'German', level: 'Goethe A1 Prep', fee: 19500, time: 'Mon/Wed/Fri — 7:00 PM IST' },
  { lang: 'Japanese', level: 'JLPT N5 Elementary', fee: 19000, time: 'Tue/Thu/Sat — 6:30 PM IST' },
  { lang: 'Spanish', level: 'DELE A1 Diploma', fee: 17500, time: 'Sat/Sun Weekend — 10:00 AM IST' },
];

const schoolTracks = [
  { name: 'French Junior CEFR A1 Track', fee: 12000, desc: 'CBSE Class 8–10 French Syllabus & DELF Junior Exam' },
  { name: 'German Fit in Deutsch A1 Track', fee: 13500, desc: 'Goethe-Institut Fit in Deutsch 1 Certification' },
  { name: 'Japanese Elementary Kanji & Culture', fee: 14000, desc: 'Japan Foundation Junior Standard' },
];

export default function PublicRegistrationPage() {
  const router = useRouter();

  // 1. Institution Category: College vs School
  const [category, setCategory] = useState<'COLLEGE' | 'SCHOOL'>('COLLEGE');

  // 2. Admission Entry Type: Institutional Partner MoU (Bulk) vs Individual Direct Student
  const [entryType, setEntryType] = useState<'INSTITUTION_BATCH' | 'INDIVIDUAL_STUDENT'>('INSTITUTION_BATCH');

  // Shared Institution Selection
  const [selectedCollegeId, setSelectedCollegeId] = useState('inst-01');
  const [selectedSchoolId, setSelectedSchoolId] = useState('school-01');

  // Individual Student State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [deptOrGrade, setDeptOrGrade] = useState('Computer Science');
  const [parentName, setParentName] = useState('');
  const [selectedLang, setSelectedLang] = useState('French');

  // Institutional Admin Batch State (No dummy students in public page)
  const [mouRefNumber, setMouRefNumber] = useState('MOU-2026-LOY-004');
  const [signatoryName, setSignatoryName] = useState('Dr. K. Sivakumar (Dean of Academics)');
  const [adminOfficialEmail, setAdminOfficialEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [batchCount, setBatchCount] = useState<number>(60);
  const [batchDepartment, setBatchDepartment] = useState('Computer Science & IT');
  const [batchProgramTrack, setBatchProgramTrack] = useState('French Language (CEFR A1)');
  const [uploadedRosterName, setUploadedRosterName] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const activeCollege = colleges.find((c) => c.id === selectedCollegeId) || colleges[0];
  const activeSchool = schools.find((s) => s.id === selectedSchoolId) || schools[0];
  const activeLangObj = collegeLanguages.find((l) => l.lang === selectedLang) || collegeLanguages[0];

  // File Upload Handler (Simulated)
  const handleUploadRoster = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedRosterName(e.target.files[0].name);
    } else {
      setUploadedRosterName(category === 'COLLEGE' ? 'College_Student_Roster_2026.xlsx' : 'School_Pupil_Roster_2026.xlsx');
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const isCollege = category === 'COLLEGE';
      const instName = isCollege ? activeCollege.name : activeSchool.name;
      const instId = isCollege ? activeCollege.id : activeSchool.id;
      const instRate = isCollege ? activeCollege.agreedRate : activeSchool.agreedRate;

      if (entryType === 'INSTITUTION_BATCH') {
        const batchRef = `BATCH-PUB-${Math.floor(1000 + Math.random() * 9000)}`;

        // Register batch intake record in sales store
        salesStore.addApplication({
          category,
          institutionId: instId,
          institutionName: instName,
          fullName: `${instName} Cohort - ${signatoryName}`,
          email: adminOfficialEmail || 'coordinator@institution.edu',
          phone: adminPhone || '+91 98401 22334',
          dob: isCollege ? '2005-04-12' : '2012-07-20',
          gender: 'MALE',
          bloodGroup: 'B+',
          address: {
            street: isCollege ? activeCollege.campusArea : activeSchool.campusArea,
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: isCollege ? activeCollege.pincode : activeSchool.pincode,
          },
          collegeDetails: isCollege ? {
            enrollmentMode: 'INSTITUTION_PARTNER',
            collegeName: instName,
            collegeCode: activeCollege.code,
            department: batchDepartment,
            degreeProgram: 'Institutional Batch Program',
            semester: 'Semester 1',
            currentRollNumber: `BATCH-${batchCount}-ROSTER`,
            languageSelected: batchProgramTrack,
            proficiencyLevel: 'CEFR A1',
            preferredBatchTiming: 'Integrated Timetable Period',
            hostelDayScholar: 'DAY_SCHOLAR',
          } : undefined,
          schoolDetails: !isCollege ? {
            enrollmentMode: 'INSTITUTION_PARTNER',
            schoolName: instName,
            schoolCode: activeSchool.code,
            boardAffiliation: 'CBSE',
            gradeClass: batchDepartment,
            section: 'Cohort Alpha',
            academicYear: '2026–2027',
            parentFatherName: signatoryName,
            parentMotherName: 'Institutional Head',
            parentEmergencyPhone: adminPhone || '+91 98401 22334',
            languageTrack: batchProgramTrack,
            schoolBatchSlot: 'School Integrated Slot',
            transportMode: 'SCHOOL_BUS',
          } : undefined,
          courseFee: (isCollege ? 18500 : 12000) * batchCount,
          discountScholarship: (isCollege ? 4000 : 1500) * batchCount,
          finalPayable: instRate * batchCount,
          amountPaid: instRate * batchCount,
          paymentStatus: 'PAID',
          paymentRefId: `MOU-TXN-${batchRef}`,
          stage: 'ENROLLED',
          source: isCollege ? 'COLLEGE_PARTNER' : 'SCHOOL_MOU',
          assignedSalesOfficer: isCollege ? 'Priya Dharshini' : 'Arun Kumar V.',
          assignedOfficerEmail: isCollege ? 'priya.sales@isml.edu' : 'arun.schools@isml.edu',
          leadScore: 100,
          notes: [
            `Public Institutional Batch registered by ${signatoryName} (${adminOfficialEmail}).`,
            `Batch Reference: ${batchRef}. Enrolled Total: ${batchCount} students.`,
            `Attached Roster: ${uploadedRosterName || 'Institutional Signed Roster Attachment'}.`,
          ],
        });

        // Dispatch Institutional Onboarding Request to Super Admin
        fetch('https://ismllms-production.up.railway.app/api/portals/institutions/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category,
            type: category,
            code: isCollege ? activeCollege.code : activeSchool.code,
            name: instName,
            institutionName: instName,
            adminName: signatoryName,
            adminEmail: adminOfficialEmail,
            adminMobile: adminPhone,
            studentsTarget: batchCount,
            batchProgramTrack,
            batchDepartment,
            mouRefNumber,
          }),
        }).catch(() => null);

        setIsSubmitting(false);
        setSubmittedData({
          mode: 'BATCH',
          batchRef,
          institution: instName,
          count: batchCount,
          signatory: signatoryName,
          totalAmount: instRate * batchCount,
        });
      } else {
        const txn = `TXN-PUB-${Math.floor(100000 + Math.random() * 900000)}`;
        const baseFee = isCollege ? activeLangObj.fee : 12000;
        const rebate = isCollege ? 2000 : 1500;
        const net = baseFee - rebate;

        const newApp = salesStore.addApplication({
          category,
          institutionId: instId,
          institutionName: instName,
          fullName: fullName || 'Direct Applicant',
          email: email || 'applicant@isml.edu',
          phone: phone || '+91 98840 00000',
          dob: isCollege ? '2005-04-12' : '2012-07-20',
          gender: 'MALE',
          bloodGroup: 'B+',
          address: {
            street: 'Permanent Residential Address',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600034',
          },
          collegeDetails: isCollege ? {
            enrollmentMode: 'INDIVIDUAL_STUDENT',
            collegeName: instName,
            collegeCode: activeCollege.code,
            department: deptOrGrade,
            degreeProgram: 'Degree Program',
            semester: 'Semester 1',
            currentRollNumber: rollNo || 'REG-2026',
            languageSelected: selectedLang,
            proficiencyLevel: activeLangObj.level,
            preferredBatchTiming: activeLangObj.time,
            hostelDayScholar: 'DAY_SCHOLAR',
          } : undefined,
          schoolDetails: !isCollege ? {
            enrollmentMode: 'INDIVIDUAL_STUDENT',
            schoolName: instName,
            schoolCode: activeSchool.code,
            boardAffiliation: 'CBSE',
            gradeClass: deptOrGrade || 'Class 8',
            section: 'Section Alpha',
            academicYear: '2026–2027',
            parentFatherName: parentName || 'Parent Name',
            parentMotherName: 'Parent Name',
            parentEmergencyPhone: phone || '+91 98840 00000',
            languageTrack: selectedLang,
            schoolBatchSlot: 'Slot S1 (08:30 AM to 09:30 AM)',
            transportMode: 'SCHOOL_BUS',
          } : undefined,
          courseFee: baseFee,
          discountScholarship: rebate,
          finalPayable: net,
          amountPaid: net,
          paymentStatus: 'PAID',
          paymentRefId: txn,
          stage: 'ENROLLED',
          source: 'WEBSITE_FORM',
          assignedSalesOfficer: isCollege ? 'Priya Dharshini' : 'Arun Kumar V.',
          assignedOfficerEmail: isCollege ? 'priya.sales@isml.edu' : 'arun.schools@isml.edu',
          leadScore: 95,
          notes: [
            `Direct individual registration via Public Enrolment Portal.`,
            `Paid ₹${net.toLocaleString()} via Instant Online Gateway (Ref: ${txn}).`,
          ],
        });

        // Dispatch student registration request to Super Admin
        fetch('https://ismllms-production.up.railway.app/api/portals/admissions/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationNumber: newApp.applicationNumber,
            fullName: newApp.fullName,
            email: newApp.email,
            phone: newApp.phone,
            mobileNumber: newApp.phone,
            category,
            institutionId: instId,
            institutionName: instName,
            course: selectedLang,
            targetLanguage: selectedLang.toUpperCase(),
            amountPaid: net,
            admissionType: isCollege ? 'COLLEGE_STUDENT' : 'SCHOOL_STUDENT',
          }),
        }).catch(() => null);

        setIsSubmitting(false);
        setSubmittedData({
          mode: 'INDIVIDUAL',
          appNo: newApp.applicationNumber,
          fullName: newApp.fullName,
          institution: instName,
          course: selectedLang,
          amountPaid: net,
        });
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 text-slate-900 flex flex-col justify-between font-sans selection:bg-[#0052CC] selection:text-white">
      {/* ─── Top Public Navigation (Clean White Bar) ─── */}
      <header className="h-16 border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0052CC] to-blue-500 p-1 flex items-center justify-center shadow-xs">
            <Image src="/logo.png" alt="ISML Logo" width={28} height={28} className="object-contain" priority />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-[#0B2447] uppercase">ISML ADMISSIONS</h1>
              <span className="text-[10px] bg-blue-50 text-[#0052CC] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                Official Registration
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">Indian School for Modern Languages • Public Enrolment Hub 2026–2027</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs text-slate-700 hover:text-[#0052CC] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold transition-all"
          >
            <span>Staff / Student Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ─── Main Public Form Hub (Full-Screen Fluid Layout) ─── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col justify-start">
        {submittedData ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center space-y-5 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            {submittedData.mode === 'BATCH' ? (
              <>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Institutional MoU Batch Confirmed
                </span>
                <h2 className="text-3xl font-black text-[#0B2447]">{submittedData.institution} Batch Registered!</h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Batch reference <strong className="text-blue-700 font-mono">{submittedData.batchRef}</strong> with <strong>{submittedData.count} students</strong> has been enrolled and authorized by <strong>{submittedData.signatory}</strong>.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-sm mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Students:</span>
                    <span className="font-bold text-slate-900">{submittedData.count}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-500">Total Billed:</span>
                    <span className="font-black text-emerald-700 text-sm">₹{submittedData.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Individual Student Enrolled
                </span>
                <h2 className="text-3xl font-black text-[#0B2447]">Admission & Seat Confirmed!</h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Application <strong className="text-blue-700 font-mono">{submittedData.appNo}</strong> for {submittedData.fullName} at {submittedData.institution} has been confirmed.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-sm mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Course Track:</span>
                    <span className="font-bold text-slate-900">{submittedData.course}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-500">Fees Paid:</span>
                    <span className="font-black text-emerald-700 text-sm">₹{submittedData.amountPaid.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  setFullName('');
                  setEmail('');
                  setPhone('');
                  setRollNo('');
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Submit Another Registration
              </button>
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                Go to Portal Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ─── 1. TOP SWITCHER: COLLEGE vs SCHOOL (Bright Clean Pill) ─── */}
            <div className="flex items-center justify-center">
              <div className="bg-white p-1 rounded-2xl border border-slate-200 flex items-center gap-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setCategory('COLLEGE');
                    setMouRefNumber(activeCollege.mouRef);
                    setSignatoryName(activeCollege.coordinator);
                  }}
                  className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                    category === 'COLLEGE'
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>College Admission</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCategory('SCHOOL');
                    setMouRefNumber(activeSchool.mouRef);
                    setSignatoryName(activeSchool.principalContact);
                  }}
                  className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                    category === 'SCHOOL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <School className="w-4 h-4" />
                  <span>School Admission</span>
                </button>
              </div>
            </div>

            {/* ─── 2. TWO-WAY SELECTOR: INSTITUTIONAL SIGNED BATCH vs INDIVIDUAL STUDENT ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setEntryType('INSTITUTION_BATCH')}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                  entryType === 'INSTITUTION_BATCH'
                    ? category === 'COLLEGE'
                      ? 'bg-blue-50/70 border-[#0052CC] ring-2 ring-[#0052CC] shadow-md'
                      : 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${
                      entryType === 'INSTITUTION_BATCH'
                        ? category === 'COLLEGE' ? 'bg-[#0052CC] text-white' : 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0B2447]">
                        {category === 'COLLEGE' ? 'College-Signed MoU Batch' : 'School-Signed MoU Batch'}
                      </h3>
                      <p className="text-[11px] text-slate-500">Official institutional batch with bulk Excel upload</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    category === 'COLLEGE' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Bulk Roster
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  College Dean / School Principal signs batch authorization with bulk student Excel upload and institutional invoice.
                </p>
              </div>

              <div
                onClick={() => setEntryType('INDIVIDUAL_STUDENT')}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                  entryType === 'INDIVIDUAL_STUDENT'
                    ? category === 'COLLEGE'
                      ? 'bg-blue-50/70 border-[#0052CC] ring-2 ring-[#0052CC] shadow-md'
                      : 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${
                      entryType === 'INDIVIDUAL_STUDENT'
                        ? category === 'COLLEGE' ? 'bg-[#0052CC] text-white' : 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0B2447]">
                        {category === 'COLLEGE' ? 'Individual College Student' : 'Individual School Pupil'}
                      </h3>
                      <p className="text-[11px] text-slate-500">Direct student / parent online admission</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    Single Form
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Single applicant self-enrollment for live webinar classes, printed workbook kits, and instant gateway fee settlement.
                </p>
              </div>
            </div>

            {/* ─── 3. FORM CONTAINER (Crisp White Card with Clean Inputs) ─── */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Institution Select */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#0B2447] flex items-center gap-2">
                    <Building2 className={`w-4 h-4 ${category === 'COLLEGE' ? 'text-blue-600' : 'text-emerald-600'}`} />
                    <span>Select {category === 'COLLEGE' ? 'Partner College Campus' : 'Partner School Campus'}</span>
                  </h2>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    category === 'COLLEGE' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    MoU Rate: ₹{(category === 'COLLEGE' ? activeCollege.agreedRate : activeSchool.agreedRate).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {category === 'COLLEGE' ? 'Affiliated College *' : 'Affiliated School *'}
                    </label>
                    <select
                      value={category === 'COLLEGE' ? selectedCollegeId : selectedSchoolId}
                      onChange={(e) => {
                        if (category === 'COLLEGE') {
                          setSelectedCollegeId(e.target.value);
                          const col = colleges.find((c) => c.id === e.target.value);
                          if (col) {
                            setMouRefNumber(col.mouRef);
                            setSignatoryName(col.coordinator);
                          }
                        } else {
                          setSelectedSchoolId(e.target.value);
                          const sch = schools.find((s) => s.id === e.target.value);
                          if (sch) {
                            setMouRefNumber(sch.mouRef);
                            setSignatoryName(sch.principalContact);
                          }
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      {category === 'COLLEGE' ? (
                        colleges.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.name} ({col.code})
                          </option>
                        ))
                      ) : (
                        schools.map((sch) => (
                          <option key={sch.id} value={sch.id}>
                            {sch.name} ({sch.code})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <span className="text-slate-500 block">Campus Address:</span>
                    <span className="font-bold text-slate-800 block">
                      {category === 'COLLEGE'
                        ? `${activeCollege.campusArea}, ${activeCollege.city} - ${activeCollege.pincode}`
                        : `${activeSchool.campusArea}, ${activeSchool.city} - ${activeSchool.pincode}`}
                    </span>
                    <span className="text-emerald-700 text-[11px] block pt-0.5 font-semibold">
                      ✓ Authorized MoU Campus Center
                    </span>
                  </div>
                </div>
              </div>

              {/* ══════════ OPTION A: INSTITUTIONAL MoU BATCH UPLOAD (No dummy records exposed) ══════════ */}
              {entryType === 'INSTITUTION_BATCH' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        MoU Reference Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={mouRefNumber}
                        onChange={(e) => setMouRefNumber(e.target.value)}
                        placeholder="MOU-2026-LOY-004"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Authorizing Dean / Principal *
                      </label>
                      <input
                        type="text"
                        required
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                        placeholder="Dr. Name / Principal"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Official Campus Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={adminOfficialEmail}
                        onChange={(e) => setAdminOfficialEmail(e.target.value)}
                        placeholder="dean.academics@institution.edu"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Coordinator Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        placeholder="+91 98401 22334"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {category === 'COLLEGE' ? 'Department / Faculty' : 'Target Grades / Classes'}
                      </label>
                      <input
                        type="text"
                        value={batchDepartment}
                        onChange={(e) => setBatchDepartment(e.target.value)}
                        placeholder={category === 'COLLEGE' ? 'e.g. B.Sc CS, BCA & B.Com' : 'Classes 6 to 9'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Foreign Language Track *
                      </label>
                      <select
                        value={batchProgramTrack}
                        onChange={(e) => setBatchProgramTrack(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      >
                        <option value="French Language (CEFR A1)">French Language (CEFR A1)</option>
                        <option value="German (Goethe A1)">German (Goethe A1)</option>
                        <option value="Japanese (JLPT N5)">Japanese (JLPT N5)</option>
                        <option value="Spanish (DELE A1)">Spanish (DELE A1)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Enrolled Students Count *
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={1000}
                        required
                        value={batchCount}
                        onChange={(e) => setBatchCount(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>
                  </div>

                  {/* Clean File Upload Box (Supports Excel/CSV without exposing mock data to public) */}
                  <label className="block p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0052CC] bg-slate-50/70 text-center cursor-pointer space-y-2 transition-all">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,.pdf"
                      onChange={handleUploadRoster}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0052CC] border border-blue-100 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {uploadedRosterName ? (
                          <span className="text-emerald-700 font-mono">✓ {uploadedRosterName} (Attached)</span>
                        ) : (
                          'Click to Attach Institutional Student Roster (Excel / CSV / PDF)'
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Student credentials and roll rosters will be processed securely inside the College Admin & Sales CRM portal.
                      </p>
                    </div>
                  </label>

                  {/* Summary Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Total MoU Institutional Billing ({batchCount} Enrollees):</span>
                      <span className="font-black text-emerald-700 text-sm">
                        ₹{((category === 'COLLEGE' ? activeCollege.agreedRate : activeSchool.agreedRate) * batchCount).toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        category === 'COLLEGE' ? 'bg-[#0052CC] hover:bg-blue-700 shadow-blue-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? 'Registering...' : `Submit Institutional MoU Batch (${batchCount} Students)`}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ══════════ OPTION B: INDIVIDUAL DIRECT STUDENT ══════════ */}
              {entryType === 'INDIVIDUAL_STUDENT' && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Applicant Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bharathi M."
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="student@isml.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        WhatsApp Mobile No *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98840 12345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {category === 'COLLEGE' ? 'College Roll No' : 'Class Roll / Section'}
                      </label>
                      <input
                        type="text"
                        placeholder="26-CS-042"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {category === 'COLLEGE' ? 'Department / Stream' : 'Pupil Grade (6–10)'}
                      </label>
                      <input
                        type="text"
                        placeholder={category === 'COLLEGE' ? 'Computer Science' : 'Class 8'}
                        value={deptOrGrade}
                        onChange={(e) => setDeptOrGrade(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Foreign Language Track
                      </label>
                      <select
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      >
                        <option value="French">French Language (CEFR A1)</option>
                        <option value="German">German (Goethe A1)</option>
                        <option value="Japanese">Japanese (JLPT N5)</option>
                        <option value="Spanish">Spanish (DELE A1)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block">Net Admission Fee:</span>
                      <span className="font-black text-emerald-700 text-sm">
                        ₹{(category === 'COLLEGE' ? activeLangObj.fee - 2000 : 12000 - 1500).toLocaleString()} (Rebate Applied)
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-8 py-3 rounded-xl font-bold text-xs text-white shadow-md flex items-center gap-2 cursor-pointer ${
                        category === 'COLLEGE' ? 'bg-[#0052CC] hover:bg-blue-700 shadow-blue-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? 'Confirming...' : 'Pay Fee & Enrol Now'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ─── 4. PROMINENT BOTTOM LOGIN REDIRECT CARD ─── */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0052CC] border border-blue-100 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Already registered or have an account?</h4>
                  <p className="text-xs text-slate-500">Sign in to your Student, College Admin, Teacher, or Staff portal</p>
                </div>
              </div>
              <Link
                href="/login"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#0052CC] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Go to Login Screen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-200/80 bg-white">
        <div className="flex items-center justify-center gap-4 text-slate-500 mb-1">
          <span>ISML Learning Management System © 2026–2027</span>
          <span>•</span>
          <Link href="/login" className="font-semibold text-slate-700 hover:text-[#0052CC] underline">
            Direct Portal Login
          </Link>
          <span>•</span>
          <a href="tel:+919840122334" className="hover:text-slate-700">Admissions Helpdesk: +91 98401 22334</a>
        </div>
        <p className="text-[11px] text-slate-400">Official Public Enrollment Center for Colleges & Partner Schools</p>
      </footer>
    </div>
  );
}
