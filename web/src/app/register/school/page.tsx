// ============================================================================
// ISML LMS — FULL-SCREEN 4-STEP SCHOOL ADMISSION WIZARD FORM (/register/school)
// Step 1: Admission Mode, School Campus Name & Address Details
// Step 2: Pupil Grade, Board & Parent / Guardian Contact Details
// Step 3: Foreign Language Program Track & Schedule Slots
// Step 4: Fees Breakdown, Instant Payment Gateway & Confirmation
// Supports both Institutional MoU Schools (DPS, NPS, DAV) & Individual Students!
// ============================================================================

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  School,
  Building2,
  BookOpen,
  Calendar,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  FileCheck,
  MapPin,
  ChevronLeft,
  Users,
  Bus,
  Lock,
  QrCode,
  DollarSign,
  Sparkles,
  Award,
} from 'lucide-react';
import { salesStore } from '@/mock/salesData';
import { EnrollmentMode } from '@/types/sales';

const partnerSchools = [
  {
    id: 'school-01',
    name: 'Delhi Public School (DPS International Campus)',
    code: 'DPS-INT-CHE',
    board: 'CBSE',
    campusArea: 'Greenways Road, R.A. Puram',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600028',
    principalContact: 'Mrs. Radhika Sundaram (Vice Principal)',
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
  },
];

const schoolGrades = [
  { grade: 'Class 6', age: '11–12 Yrs', slot: 'Slot S1 — Tue/Thu — 08:30 AM to 09:30 AM' },
  { grade: 'Class 7', age: '12–13 Yrs', slot: 'Slot S1 — Tue/Thu — 08:30 AM to 09:30 AM' },
  { grade: 'Class 8', age: '13–14 Yrs', slot: 'Slot S2 — Mon/Wed — 09:45 AM to 10:45 AM' },
  { grade: 'Class 9', age: '14–15 Yrs', slot: 'Slot S2 — Mon/Wed — 09:45 AM to 10:45 AM' },
  { grade: 'Class 10 (Board Exam)', age: '15–16 Yrs', slot: 'Slot S3 — Tue/Fri — 01:30 PM to 02:30 PM' },
];

const schoolLanguageTracks = [
  {
    name: 'French Junior CEFR A1 Track',
    lang: 'French',
    boardAligned: 'CBSE Class 8–10 French Syllabus & DELF Junior Exam',
    fee: 12000,
    desc: 'Includes 2 printed workbooks, listening labs, vocabulary flashcards & board exam test series.',
  },
  {
    name: 'German Fit in Deutsch A1 Track',
    lang: 'German',
    boardAligned: 'Goethe-Institut Fit in Deutsch 1 Certification',
    fee: 13500,
    desc: 'Audio tracks, interactive grammar drills, and European cultural immersion webinars.',
  },
  {
    name: 'Japanese Elementary Kanji & Culture',
    lang: 'Japanese',
    boardAligned: 'Japan Foundation Junior Standard',
    fee: 14000,
    desc: 'Hiragana/Katakana stroke mastery, anime/manga dialogue reading & Junior JLPT foundations.',
  },
];

export default function SchoolRegistrationPage() {
  const router = useRouter();

  // Wizard Step: 1 = School & Address, 2 = Pupil & Parent Details, 3 = Language Track, 4 = Fees & Pay, 5 = Done
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [submittedAppNumber, setSubmittedAppNumber] = useState<string | null>(null);

  // 1. Enrollment Mode & School Campus Details
  const [enrollmentMode, setEnrollmentMode] = useState<EnrollmentMode>('INSTITUTION_PARTNER');
  const [selectedSchoolId, setSelectedSchoolId] = useState('school-01');
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [schoolCampusAddress, setSchoolCampusAddress] = useState('');
  const [schoolCity, setSchoolCity] = useState('Chennai');
  const [schoolState, setSchoolState] = useState('Tamil Nadu');
  const [schoolPincode, setSchoolPincode] = useState('600028');
  const [schoolPrincipalContact, setSchoolPrincipalContact] = useState('');

  // 2. Pupil & Parent Info
  const [gradeClass, setGradeClass] = useState('Class 8');
  const [section, setSection] = useState('Section Alpha');
  const [boardAffiliation, setBoardAffiliation] = useState<'CBSE' | 'ICSE' | 'STATE_BOARD' | 'IB'>('CBSE');
  const [transportMode, setTransportMode] = useState<'SCHOOL_BUS' | 'PARENT_DROP' | 'OWN_CYCLE_WALK'>('SCHOOL_BUS');

  const [studentName, setStudentName] = useState('');
  const [dob, setDob] = useState('2012-07-20');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [bloodGroup, setBloodGroup] = useState('B+');

  const [parentFatherName, setParentFatherName] = useState('');
  const [parentMotherName, setParentMotherName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentEmergencyPhone, setParentEmergencyPhone] = useState('');
  const [parentOccupation, setParentOccupation] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [homePincode, setHomePincode] = useState('600028');

  // 3. Language Selection
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);

  // 4. Payment Simulation
  const [paymentOption, setPaymentOption] = useState<'FULL_PAYMENT' | 'SEAT_ADVANCE'>('FULL_PAYMENT');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NET_BANKING' | 'CARD' | 'SCHOOL_CHALLAN'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Resolved School Object
  const currentPartner = partnerSchools.find((s) => s.id === selectedSchoolId) || partnerSchools[0];
  const schoolNameResolved = enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.name : (customSchoolName || 'Independent School');
  const schoolCodeResolved = enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.code : 'IND-SCH';
  const selectedTrack = schoolLanguageTracks[selectedTrackIndex];
  const currentGradeObj = schoolGrades.find((g) => g.grade === gradeClass) || schoolGrades[2];

  const institutionalRebate = enrollmentMode === 'INSTITUTION_PARTNER' ? 1500 : 1000;
  const netPayable = selectedTrack.fee - institutionalRebate;
  const amountToChargeNow = paymentOption === 'FULL_PAYMENT' ? netPayable : 4000;

  // Final Submission Handler
  const handleFinalSubmitAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      const generatedTxn = `TXN-${paymentMethod}-${Math.floor(100000 + Math.random() * 900000)}`;

      const newApp = salesStore.addApplication({
        category: 'SCHOOL',
        institutionId: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.id : 'ind-school',
        institutionName: schoolNameResolved,
        fullName: studentName || 'School Pupil',
        email: parentEmail || 'parent@school.edu',
        phone: parentEmergencyPhone || '+91 94441 88990',
        dob,
        gender,
        bloodGroup,
        address: {
          street: homeAddress || 'Residential Colony',
          city: schoolCity,
          state: 'Tamil Nadu',
          pincode: homePincode,
        },
        schoolDetails: {
          enrollmentMode,
          schoolName: schoolNameResolved,
          schoolCode: schoolCodeResolved,
          schoolAddress: {
            campusArea: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.campusArea : schoolCampusAddress,
            city: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.city : schoolCity,
            state: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.state : schoolState,
            pincode: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.pincode : schoolPincode,
          },
          schoolPrincipalContact: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.principalContact : schoolPrincipalContact,
          boardAffiliation,
          gradeClass,
          section,
          academicYear: '2026–2027',
          parentFatherName: parentFatherName || 'Parent Name',
          parentMotherName: parentMotherName || 'Parent Name',
          parentOccupation: parentOccupation || 'Professional',
          parentEmergencyPhone: parentEmergencyPhone || '+91 94441 88990',
          languageTrack: selectedTrack.name,
          schoolBatchSlot: currentGradeObj.slot,
          transportMode,
        },
        courseFee: selectedTrack.fee,
        discountScholarship: institutionalRebate,
        finalPayable: netPayable,
        amountPaid: amountToChargeNow,
        paymentStatus: amountToChargeNow >= netPayable ? 'PAID' : 'PARTIAL',
        paymentRefId: generatedTxn,
        stage: amountToChargeNow >= netPayable ? 'ENROLLED' : 'SEAT_OFFERED',
        source: enrollmentMode === 'INSTITUTION_PARTNER' ? 'SCHOOL_MOU' : 'WEBSITE_FORM',
        assignedSalesOfficer: 'Arun Kumar V.',
        assignedOfficerEmail: 'arun.schools@isml.edu',
        leadScore: 96,
        notes: [
          `Pupil enrolled via Full-Screen School Wizard (${enrollmentMode}).`,
          `Paid ₹${amountToChargeNow.toLocaleString()} via ${paymentMethod} (Ref: ${generatedTxn}).`,
          `School: ${schoolNameResolved}. Track: ${selectedTrack.name} for ${gradeClass}.`,
        ],
      });

      // Sync with backend & Super Admin Approval Center
      fetch('https://ismllms-production.up.railway.app/api/portals/admissions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationNumber: newApp.applicationNumber,
          fullName: newApp.fullName,
          firstName: (studentName || 'School Pupil').split(' ')[0] || 'Pupil',
          lastName: (studentName || '').split(' ').slice(1).join(' ') || 'Student',
          email: parentEmail || 'parent@school.edu',
          phone: parentEmergencyPhone || '+91 94441 88990',
          mobileNumber: parentEmergencyPhone || '+91 94441 88990',
          category: 'SCHOOL',
          institutionId: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.id : 'ind-school',
          institutionName: schoolNameResolved,
          course: `${selectedTrack.name} (${gradeClass})`,
          targetLanguage: selectedTrack.name.toUpperCase(),
          targetLevel: 'A1_1',
          amountPaid: amountToChargeNow,
          admissionType: 'SCHOOL_STUDENT',
        }),
      }).catch(() => null);

      setIsProcessingPayment(false);
      setSubmittedAppNumber(newApp.applicationNumber);
      setStep(5);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-600 selection:text-white">
      {/* ─── Top Navbar ─── */}
      <header className="h-16 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-1 flex items-center justify-center shadow-lg">
            <Image src="/logo.png" alt="ISML Logo" width={28} height={28} className="object-contain" priority />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white uppercase">ISML ADMISSIONS</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                School Enrolment
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/60 hidden sm:block">K-12 School Language Curriculum & Board Exams</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/register/college"
            className="text-xs text-blue-400 hover:text-blue-300 font-bold hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-400/20"
          >
            <span>Switch to College Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/sales-manager/admissions"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Staff Portal</span>
          </Link>
        </div>
      </header>

      {/* ─── Main Wizard Container ─── */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Wizard Stepper Bar (1 to 4) */}
        {step < 5 && (
          <div className="mb-8">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-xs font-bold">
              {[
                { s: 1, title: 'School & Campus', sub: 'School Address & MoU' },
                { s: 2, title: 'Pupil & Parents', sub: 'Grade & Family Info' },
                { s: 3, title: 'Language Track', sub: 'Curriculum & Slot' },
                { s: 4, title: 'Fee & Payment', sub: 'Gateway & Receipt' },
              ].map((item) => {
                const isPassed = step > item.s;
                const isCurrent = step === item.s;
                return (
                  <div
                    key={item.s}
                    className={`p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-600/20 border-emerald-400 text-white shadow-lg'
                        : isPassed
                        ? 'bg-white/5 border-emerald-500/50 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent ? 'bg-emerald-500 text-white' : isPassed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
                      }`}>
                        {isPassed ? '✓' : item.s}
                      </span>
                      <span className="text-xs truncate">{item.title}</span>
                    </div>
                    <p className="text-[10px] font-normal text-slate-400 hidden sm:block">{item.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Wizard Card Body */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* ═════════ STEP 1: SCHOOL CAMPUS & ADDRESS DETAILS ═════════ */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Step 1 of 4</span>
                <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <School className="w-6 h-6 text-emerald-400" />
                  <span>School Campus & Institutional Details</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Select your school campus or register as an independent school pupil seeking foreign language certification.
                </p>
              </div>

              {/* Mode Toggle: Partner School vs Individual Student */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setEnrollmentMode('INSTITUTION_PARTNER')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    enrollmentMode === 'INSTITUTION_PARTNER'
                      ? 'bg-emerald-600/25 border-emerald-400 ring-2 ring-emerald-500 shadow-md'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">Partner School (MoU Campus)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      School Integrated
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Enrolling under Delhi Public School, NPS, or DAV Academy campus programs with ₹1,500 school subsidy.
                  </p>
                </div>

                <div
                  onClick={() => setEnrollmentMode('INDIVIDUAL_STUDENT')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    enrollmentMode === 'INDIVIDUAL_STUDENT'
                      ? 'bg-emerald-600/25 border-emerald-400 ring-2 ring-emerald-500 shadow-md'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">Individual School Student</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                      Direct Pupil
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Enrolling individually from any ICSE/CBSE school across India for after-school online junior batches.
                  </p>
                </div>
              </div>

              {/* Conditional School Fields */}
              {enrollmentMode === 'INSTITUTION_PARTNER' ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Select Enrolling School Campus *
                    </label>
                    <select
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      {partnerSchools.map((sch) => (
                        <option key={sch.id} value={sch.id} className="bg-slate-950 text-white">
                          {sch.name} ({sch.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* School Address Card (Auto-filled) */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">School Campus Address:</span>
                      <span className="font-bold text-white text-right">{currentPartner.campusArea}, {currentPartner.city} - {currentPartner.pincode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Principal / Academic Lead:</span>
                      <span className="font-bold text-emerald-300 text-right">{currentPartner.principalContact}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">School Partnership Rebate:</span>
                      <span className="font-bold text-emerald-400">₹1,500 Annual Course Fee Subsidy</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      School Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBOA School & Junior College"
                      value={customSchoolName}
                      onChange={(e) => setCustomSchoolName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        School Campus Area / Road *
                      </label>
                      <input
                        type="text"
                        placeholder="Anna Nagar West Extension"
                        value={schoolCampusAddress}
                        onChange={(e) => setSchoolCampusAddress(e.target.value)}
                        className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        School Pincode *
                      </label>
                      <input
                        type="text"
                        placeholder="600101"
                        value={schoolPincode}
                        onChange={(e) => setSchoolPincode(e.target.value)}
                        className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>Next: Pupil & Parent Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════ STEP 2: PUPIL & PARENT PROFILE ═════════ */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Step 2 of 4</span>
                <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <Users className="w-6 h-6 text-emerald-400" />
                  <span>Pupil Grade & Parent Contact Details</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Required for student ID badge generation, teacher reports, and parent WhatsApp updates.
                </p>
              </div>

              <div className="space-y-4">
                {/* Grade & Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Pupil Class / Grade *
                    </label>
                    <select
                      value={gradeClass}
                      onChange={(e) => setGradeClass(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      {schoolGrades.map((g) => (
                        <option key={g.grade} value={g.grade} className="bg-slate-950 text-white">
                          {g.grade} ({g.age})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Class Section *
                    </label>
                    <input
                      type="text"
                      placeholder="Section Alpha / B"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Board Curriculum
                    </label>
                    <select
                      value={boardAffiliation}
                      onChange={(e) => setBoardAffiliation(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="CBSE">CBSE Board</option>
                      <option value="ICSE">ICSE Board</option>
                      <option value="STATE_BOARD">Tamil Nadu State Board</option>
                      <option value="IB">IB / Cambridge</option>
                    </select>
                  </div>
                </div>

                {/* Student Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Student Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kavya Sundaram"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Parents Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Father / Primary Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sundaram Narayanan"
                      value={parentFatherName}
                      onChange={(e) => setParentFatherName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Mother Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Radhika Sundaram"
                      value={parentMotherName}
                      onChange={(e) => setParentMotherName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Parent Mobile (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 94441 88990"
                      value={parentEmergencyPhone}
                      onChange={(e) => setParentEmergencyPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Parent Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="parent@gmail.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      School Commute Mode
                    </label>
                    <select
                      value={transportMode}
                      onChange={(e) => setTransportMode(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="SCHOOL_BUS">School Bus</option>
                      <option value="PARENT_DROP">Parent Drop / Carpool</option>
                      <option value="OWN_CYCLE_WALK">Bicycle / Walking</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Home Address
                    </label>
                    <input
                      type="text"
                      placeholder="24 Greenways Road, R.A. Puram"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Home Pincode
                    </label>
                    <input
                      type="text"
                      placeholder="600028"
                      value={homePincode}
                      onChange={(e) => setHomePincode(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
                >
                  <span>Next: Select Language Track</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════ STEP 3: SCHOOL LANGUAGE PROGRAM ═════════ */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Step 3 of 4</span>
                <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-emerald-400" />
                  <span>Choose School Language Program Track</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  All tracks include 2 physical workbooks delivered to school, digital vocabulary labs, and board exam series.
                </p>
              </div>

              <div className="space-y-3.5">
                {schoolLanguageTracks.map((item, idx) => {
                  const isSelected = selectedTrackIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedTrackIndex(idx)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-500 shadow-xl'
                          : 'bg-white/5 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-base text-white">{item.name}</span>
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          ₹{item.fee.toLocaleString()} / Academic Year
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300 font-semibold mb-2">{item.boardAligned}</p>
                      <p className="text-xs text-slate-300 mb-3">{item.desc}</p>
                      <div className="text-[11px] text-emerald-200/90 flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-xl">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                        <span>Timetable Slot: {currentGradeObj.slot}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Course Selection Recap Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Selected Language Program:</span>
                  <span className="font-black text-white text-sm">{selectedTrack.name} ({gradeClass})</span>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-slate-400 block">Applicable Rebate:</span>
                  <span className="font-bold text-emerald-400">-₹{institutionalRebate.toLocaleString()} {enrollmentMode === 'INSTITUTION_PARTNER' ? 'School MoU Subsidy' : 'Student Rebate'}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
                >
                  <span>Next: Fee Payment & Gateway</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════ STEP 4: FEES LEDGER & PAYMENT GATEWAY ═════════ */}
          {step === 4 && (
            <form onSubmit={handleFinalSubmitAndPay} className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Step 4 of 4 — Final Step</span>
                <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-emerald-400" />
                  <span>School Enrolment Fee Payment & Confirmation</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Complete annual course fee settlement to generate official student ID and language workbook kit dispatch.
                </p>
              </div>

              {/* Complete Fee Breakdown Card */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-emerald-300">Enrolment Financial Ledger</h3>
                <div className="space-y-2 pt-1 border-t border-white/10">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Annual Language Course Fee ({selectedTrack.name}):</span>
                    <span className="font-semibold text-white">₹{selectedTrack.fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      {enrollmentMode === 'INSTITUTION_PARTNER' ? `School Campus MoU Rebate (${currentPartner.code})` : 'Online Pupil Scholar Discount'}:
                    </span>
                    <span className="font-bold text-emerald-400">-₹{institutionalRebate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Physical Workbooks & Audio Kit:</span>
                    <span className="font-semibold text-emerald-400">FREE (Included)</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-sm">
                    <span className="font-bold text-white">Net Annual Payable:</span>
                    <span className="font-black text-emerald-400 text-base">₹{netPayable.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Choose Payment Term */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Payment Option
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentOption('FULL_PAYMENT')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentOption === 'FULL_PAYMENT'
                        ? 'bg-emerald-600/20 border-emerald-400 ring-2 ring-emerald-500'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between font-bold text-white text-xs mb-1">
                      <span>Full Annual Payment</span>
                      <span className="text-emerald-400">₹{netPayable.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Instant confirmation & priority language workbook kit dispatch.</p>
                  </div>

                  <div
                    onClick={() => setPaymentOption('SEAT_ADVANCE')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentOption === 'SEAT_ADVANCE'
                        ? 'bg-emerald-600/20 border-emerald-400 ring-2 ring-emerald-500'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between font-bold text-white text-xs mb-1">
                      <span>Seat Booking Deposit</span>
                      <span className="text-emerald-400">₹4,000</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Remaining ₹{(netPayable - 4000).toLocaleString()} payable before term start.</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Payment Gateway / Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { id: 'UPI', label: 'UPI / QR Code', icon: QrCode },
                    { id: 'NET_BANKING', label: 'Net Banking', icon: Building2 },
                    { id: 'CARD', label: 'Debit / Credit Card', icon: CreditCard },
                    { id: 'SCHOOL_CHALLAN', label: 'School Fee Counter', icon: FileCheck },
                  ].map((m) => {
                    const isSelected = paymentMethod === m.id;
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer text-center space-y-1.5 transition-all ${
                          isSelected
                            ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto text-emerald-400" />
                        <span className="block font-bold text-[11px]">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center gap-3 text-xs text-slate-300">
                <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Encrypted 256-bit School Fee Gateway. Official Tax Invoice & Student Admission Ticket dispatched immediately.
                </span>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-emerald-900/50 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Gateway Authorization...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Pay ₹{amountToChargeNow.toLocaleString()} & Confirm Admission</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ═════════ STEP 5: SUCCESS / TICKET RECEIPT ═════════ */}
          {step === 5 && (
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto shadow-2xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Admission & Payment Verified</span>
                <h3 className="text-3xl font-black text-white">School Pupil Enrolment Confirmed</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Language curriculum seat for {studentName} at {schoolNameResolved} has been allocated.
                </p>
              </div>

              {/* Receipt Ticket Box */}
              <div className="bg-white/5 border border-white/15 rounded-3xl p-6 max-w-lg mx-auto text-left space-y-3 text-xs">
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-slate-400">Official Application No:</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm">{submittedAppNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Pupil Name:</span>
                  <span className="font-bold text-white">{studentName} ({gradeClass} - {section})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">School / Campus:</span>
                  <span className="font-bold text-white truncate max-w-[240px]">{schoolNameResolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Language Program:</span>
                  <span className="font-bold text-emerald-400">{selectedTrack.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timetable Schedule Slot:</span>
                  <span className="font-semibold text-slate-200">{currentGradeObj.slot}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2.5">
                  <span className="text-slate-400">Fees Paid:</span>
                  <span className="font-black text-emerald-400 text-sm">₹{amountToChargeNow.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/sales-manager/admissions"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
                >
                  View in Sales Manager Portal
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSubmittedAppNumber(null);
                  }}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  Register Another Pupil
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-white/10">
        ISML Foreign Language Learning Management System • K-12 School Admissions Desk 2026–2027
      </footer>
    </div>
  );
}
