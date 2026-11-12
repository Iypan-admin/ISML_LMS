// ============================================================================
// ISML LMS — FULL-SCREEN 4-STEP COLLEGE ADMISSION WIZARD FORM (/register/college)
// Step 1: Admission Mode & College Campus Address / Institution Details
// Step 2: Department, Degree, Semester & Student Personal Details
// Step 3: Foreign Language Track, Batch Timing & Materials
// Step 4: Fees Summary, Instant Gateway Simulation & Confirmation
// Supports both Institutional Campus Partner & Individual Direct Students!
// ============================================================================

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
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
  DollarSign,
  UserCheck,
  Sparkles,
  Award,
  Lock,
  QrCode,
  Check,
} from 'lucide-react';
import { salesStore } from '@/mock/salesData';
import { EnrollmentMode } from '@/types/sales';

const partnerColleges = [
  {
    id: 'inst-01',
    name: 'Loyola College (Autonomous)',
    code: 'LOYOLA-CHE',
    campusArea: 'Sterling Road, Nungambakkam',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600034',
    coordinator: 'Dr. K. Sivakumar (Language Dean)',
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
  },
];

const departmentPrograms: Record<string, string[]> = {
  'Computer Science & Engineering': [
    'B.Sc Computer Science & Data Analytics',
    'B.Tech Information Technology',
    'BCA — Bachelor of Computer Applications',
    'M.Sc Data Science',
  ],
  'Commerce & Management Studies': [
    'B.Com General',
    'B.Com Corporate Secretaryship',
    'B.Com Accounting & Finance',
    'BBA — Business Administration',
  ],
  'English & Foreign Languages': [
    'B.A English Literature',
    'M.A Linguistics & Translation',
  ],
  'Physical & Applied Sciences': [
    'B.Sc Mathematics',
    'B.Sc Physics',
    'B.Sc Chemistry',
  ],
};

const languagesOffered = [
  {
    lang: 'French',
    level: 'CEFR A1 (Beginner to DELF A1)',
    fee: 18500,
    time: 'Mon/Wed/Fri — 6:00 PM to 7:30 PM IST',
    benefits: 'DELF A1 Exam Voucher + 2 Printed Books + LMS Recording 1-Yr Access',
  },
  {
    lang: 'German',
    level: 'Fit in Deutsch / Goethe A1 Standard',
    fee: 19500,
    time: 'Mon/Wed/Fri — 7:00 PM to 8:30 PM IST',
    benefits: 'Goethe Zertifikat A1 Mock Tests + Audio Flashcards + European Grammar Lab',
  },
  {
    lang: 'Japanese',
    level: 'JLPT N5 Elementary Foundations',
    fee: 19000,
    time: 'Tue/Thu/Sat — 6:30 PM to 8:00 PM IST',
    benefits: 'Hiragana & Katakana Stroke Mastery + Kanji Workbooks + JLPT Model Exams',
  },
  {
    lang: 'Spanish',
    level: 'DELE A1 Diploma Certification',
    fee: 17500,
    time: 'Sat/Sun Weekend — 10:00 AM to 1:00 PM IST',
    benefits: 'Cervantes Institute Curriculum + Oral Accent Training + Digital Certificate',
  },
];

export default function CollegeRegistrationPage() {
  const router = useRouter();

  // Wizard Step: 1 = Institution, 2 = Student & Degree, 3 = Language Course, 4 = Fees & Pay, 5 = Done
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [submittedAppNumber, setSubmittedAppNumber] = useState<string | null>(null);

  // 1. Enrollment Mode & Institution Details
  const [enrollmentMode, setEnrollmentMode] = useState<EnrollmentMode>('INSTITUTION_PARTNER');
  const [selectedCollegeId, setSelectedCollegeId] = useState('inst-01');
  const [customCollegeName, setCustomCollegeName] = useState('');
  const [collegeCampusAddress, setCollegeCampusAddress] = useState('');
  const [collegeCity, setCollegeCity] = useState('Chennai');
  const [collegeState, setCollegeState] = useState('Tamil Nadu');
  const [collegePincode, setCollegePincode] = useState('600034');
  const [collegeContactPerson, setCollegeContactPerson] = useState('');

  // 2. Academic & Student Personal Details
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [degreeProgram, setDegreeProgram] = useState('B.Sc Computer Science & Data Analytics');
  const [semester, setSemester] = useState('Semester 1');
  const [currentRollNumber, setCurrentRollNumber] = useState('');
  const [hostelDayScholar, setHostelDayScholar] = useState<'DAY_SCHOLAR' | 'HOSTELER'>('DAY_SCHOLAR');
  const [cgpaPercentage, setCgpaPercentage] = useState('85%');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('2005-04-12');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [personalStreet, setPersonalStreet] = useState('');
  const [personalCity, setPersonalCity] = useState('Chennai');
  const [personalPincode, setPersonalPincode] = useState('600034');

  // 3. Language Selection
  const [selectedLanguage, setSelectedLanguage] = useState('French');

  // 4. Payment Simulation
  const [paymentOption, setPaymentOption] = useState<'FULL_PAYMENT' | 'SEAT_ADVANCE'>('FULL_PAYMENT');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NET_BANKING' | 'CARD' | 'COLLEGE_CHALLAN'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Resolved College Object
  const currentPartner = partnerColleges.find((c) => c.id === selectedCollegeId) || partnerColleges[0];
  const collegeNameResolved = enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.name : (customCollegeName || 'Independent College');
  const collegeCodeResolved = enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.code : 'IND-COL';
  const selectedLangData = languagesOffered.find((l) => l.lang === selectedLanguage) || languagesOffered[0];

  const institutionalRebate = enrollmentMode === 'INSTITUTION_PARTNER' ? 2000 : 1000;
  const netPayable = selectedLangData.fee - institutionalRebate;
  const amountToChargeNow = paymentOption === 'FULL_PAYMENT' ? netPayable : 5000;

  // Final Submission Handler
  const handleFinalSubmitAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      const generatedTxn = `TXN-${paymentMethod}-${Math.floor(100000 + Math.random() * 900000)}`;

      const newApp = salesStore.addApplication({
        category: 'COLLEGE',
        institutionId: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.id : 'ind-college',
        institutionName: collegeNameResolved,
        fullName: fullName || 'College Applicant',
        email: email || 'student@college.edu',
        phone: phone || '+91 98840 00000',
        dob,
        gender,
        bloodGroup,
        address: {
          street: personalStreet || 'Residential Address',
          city: personalCity,
          state: 'Tamil Nadu',
          pincode: personalPincode,
        },
        collegeDetails: {
          enrollmentMode,
          collegeName: collegeNameResolved,
          collegeCode: collegeCodeResolved,
          collegeAddress: {
            campusArea: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.campusArea : collegeCampusAddress,
            city: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.city : collegeCity,
            state: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.state : collegeState,
            pincode: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.pincode : collegePincode,
          },
          collegeContactPerson: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.coordinator : collegeContactPerson,
          department,
          degreeProgram,
          semester,
          currentRollNumber: currentRollNumber || 'REG-2026',
          languageSelected: selectedLangData.lang,
          proficiencyLevel: selectedLangData.level,
          preferredBatchTiming: selectedLangData.time,
          hostelDayScholar,
          cgpaPercentage,
        },
        courseFee: selectedLangData.fee,
        discountScholarship: institutionalRebate,
        finalPayable: netPayable,
        amountPaid: amountToChargeNow,
        paymentStatus: amountToChargeNow >= netPayable ? 'PAID' : 'PARTIAL',
        paymentRefId: generatedTxn,
        stage: amountToChargeNow >= netPayable ? 'ENROLLED' : 'SEAT_OFFERED',
        source: enrollmentMode === 'INSTITUTION_PARTNER' ? 'COLLEGE_PARTNER' : 'WEBSITE_FORM',
        assignedSalesOfficer: 'Priya Dharshini',
        assignedOfficerEmail: 'priya.sales@isml.edu',
        leadScore: 95,
        notes: [
          `Admission registered via Full-Screen Wizard (${enrollmentMode}).`,
          `Paid ₹${amountToChargeNow.toLocaleString()} via ${paymentMethod} (Ref: ${generatedTxn}).`,
          `College: ${collegeNameResolved}. Course: ${selectedLangData.lang} ${selectedLangData.level}.`,
        ],
      });

      // Sync with backend & Super Admin Approval Center
      fetch('http://localhost:4000/api/portals/admissions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationNumber: newApp.applicationNumber,
          fullName: newApp.fullName,
          firstName: fullName.split(' ')[0] || 'College',
          lastName: fullName.split(' ').slice(1).join(' ') || 'Student',
          email: email || 'student@college.edu',
          phone: phone || '+91 98840 00000',
          mobileNumber: phone || '+91 98840 00000',
          category: 'COLLEGE',
          institutionId: enrollmentMode === 'INSTITUTION_PARTNER' ? currentPartner.id : 'ind-college',
          institutionName: collegeNameResolved,
          course: `${selectedLangData.lang} ${selectedLangData.level}`,
          targetLanguage: selectedLangData.lang.toUpperCase(),
          targetLevel: selectedLangData.level,
          amountPaid: amountToChargeNow,
          admissionType: 'COLLEGE_STUDENT',
        }),
      }).catch(() => null);

      setIsProcessingPayment(false);
      setSubmittedAppNumber(newApp.applicationNumber);
      setStep(5);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* ─── Top Navbar ─── */}
      <header className="h-16 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0052CC] to-blue-400 p-1 flex items-center justify-center shadow-lg">
            <Image src="/logo.png" alt="ISML Logo" width={28} height={28} className="object-contain" priority />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white uppercase">ISML ADMISSIONS</h1>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                College Enrolment
              </span>
            </div>
            <p className="text-[10px] text-blue-200/60 hidden sm:block">UG/PG Autonomous Foreign Language Certification</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/register/school"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20"
          >
            <span>Switch to School Form</span>
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
                { s: 1, title: 'Institution Info', sub: 'Campus & Address' },
                { s: 2, title: 'Student Profile', sub: 'Degree & Contact' },
                { s: 3, title: 'Language Track', sub: 'Course & Timings' },
                { s: 4, title: 'Fees & Payment', sub: 'Gateway & Confirm' },
              ].map((item) => {
                const isPassed = step > item.s;
                const isCurrent = step === item.s;
                return (
                  <div
                    key={item.s}
                    className={`p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-600/20 border-blue-400 text-white shadow-lg'
                        : isPassed
                        ? 'bg-white/5 border-emerald-500/50 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent ? 'bg-blue-500 text-white' : isPassed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
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
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* ═════════ STEP 1: INSTITUTION & CAMPUS ADDRESS ═════════ */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Step 1 of 4</span>
                <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-blue-400" />
                  <span>College Campus & Address Details</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Choose whether you are enrolling through an affiliated institutional partner or applying as an individual college student.
                </p>
              </div>

              {/* Mode Toggle: Institutional Partner vs Individual Student */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setEnrollmentMode('INSTITUTION_PARTNER')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    enrollmentMode === 'INSTITUTION_PARTNER'
                      ? 'bg-blue-600/25 border-blue-400 ring-2 ring-blue-500 shadow-md'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">Affiliated Partner College</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                      MoU Campus
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Enrolling under Loyola, MCC, Stella Maris, PSG, or Anna University partner centers with ₹2,000 campus rebate.
                  </p>
                </div>

                <div
                  onClick={() => setEnrollmentMode('INDIVIDUAL_STUDENT')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    enrollmentMode === 'INDIVIDUAL_STUDENT'
                      ? 'bg-blue-600/25 border-blue-400 ring-2 ring-blue-500 shadow-md'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">Individual College Student</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      Direct Online
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Enrolling from any other recognized university/college across India for online evening/weekend batches.
                  </p>
                </div>
              </div>

              {/* Conditional Campus Fields */}
              {enrollmentMode === 'INSTITUTION_PARTNER' ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Select Partner Institution *
                    </label>
                    <select
                      value={selectedCollegeId}
                      onChange={(e) => setSelectedCollegeId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      {partnerColleges.map((col) => (
                        <option key={col.id} value={col.id} className="bg-slate-950 text-white">
                          {col.name} ({col.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campus Address Card (Auto-filled) */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Campus Address:</span>
                      <span className="font-bold text-white text-right">{currentPartner.campusArea}, {currentPartner.city} - {currentPartner.pincode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Institutional Coordinator:</span>
                      <span className="font-bold text-blue-300 text-right">{currentPartner.coordinator}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">MoU Scholarship:</span>
                      <span className="font-bold text-emerald-400">₹2,000 Institutional Tuition Subsidy</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      College / University Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SRM Institute of Science & Technology"
                      value={customCollegeName}
                      onChange={(e) => setCustomCollegeName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Campus Address / Area *
                      </label>
                      <input
                        type="text"
                        placeholder="Kattankulathur Campus Road"
                        value={collegeCampusAddress}
                        onChange={(e) => setCollegeCampusAddress(e.target.value)}
                        className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        placeholder="603203"
                        value={collegePincode}
                        onChange={(e) => setCollegePincode(e.target.value)}
                        className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-3 rounded-xl bg-[#0052CC] hover:bg-blue-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>Next: Student Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════ STEP 2: STUDENT PROFILE & DEGREE ═════════ */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Step 2 of 4</span>
                <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-400" />
                  <span>Student Academic & Personal Details</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Provide your department, ongoing degree, roll number, and residential contact address.
                </p>
              </div>

              <div className="space-y-4">
                {/* Academic Stream */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Academic Department *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        setDegreeProgram(departmentPrograms[e.target.value]?.[0] || '');
                      }}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      {Object.keys(departmentPrograms).map((dept) => (
                        <option key={dept} value={dept} className="bg-slate-950 text-white">
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Degree Program *
                    </label>
                    <select
                      value={degreeProgram}
                      onChange={(e) => setDegreeProgram(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      {(departmentPrograms[department] || []).map((prog) => (
                        <option key={prog} value={prog} className="bg-slate-950 text-white">
                          {prog}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Current Semester
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Semester 1">Semester 1 (Freshman)</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3 (Sophomore)</option>
                      <option value="Semester 4">Semester 4</option>
                      <option value="Semester 5">Semester 5 (Final Year)</option>
                      <option value="Semester 6">Semester 6</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      College Roll No / Reg ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 26-CS-042"
                      value={currentRollNumber}
                      onChange={(e) => setCurrentRollNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Accommodation Mode
                    </label>
                    <select
                      value={hostelDayScholar}
                      onChange={(e) => setHostelDayScholar(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DAY_SCHOLAR">Day Scholar (Commuter)</option>
                      <option value="HOSTELER">Hostel Resident</option>
                    </select>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Bharath Kumar S."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="bharath.k@loyolacollege.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Mobile No (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98840 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Permanent Residential Address
                    </label>
                    <input
                      type="text"
                      placeholder="Door no, Street name, Area"
                      value={personalStreet}
                      onChange={(e) => setPersonalStreet(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      placeholder="600034"
                      value={personalPincode}
                      onChange={(e) => setPersonalPincode(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-8 py-3 rounded-xl bg-[#0052CC] hover:bg-blue-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
                >
                  <span>Next: Choose Language</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════ STEP 3: LANGUAGE TRACK & BATCH TIMINGS ═════════ */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Step 3 of 4</span>
                <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                  <span>Choose Foreign Language Course Track</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Courses include international certification vouchers, printed book packages, live webinar access, and recordings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {languagesOffered.map((item) => {
                  const isSelected = selectedLanguage === item.lang;
                  return (
                    <div
                      key={item.lang}
                      onClick={() => setSelectedLanguage(item.lang)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500 shadow-xl'
                          : 'bg-white/5 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-base text-white">{item.lang} Program</span>
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          ₹{item.fee.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-semibold mb-2">{item.level}</p>
                      <p className="text-[11px] text-blue-200/80 mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-blue-300" />
                        <span>{item.time}</span>
                      </p>
                      <div className="text-[10px] text-emerald-300/90 bg-emerald-500/10 p-2 rounded-xl border border-emerald-400/20">
                        ✨ {item.benefits}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Course Selection Recap Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Selected Foreign Language:</span>
                  <span className="font-black text-white text-sm">{selectedLangData.lang} ({selectedLangData.level})</span>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-slate-400 block">Applicable Rebate:</span>
                  <span className="font-bold text-emerald-400">-₹{institutionalRebate.toLocaleString()} {enrollmentMode === 'INSTITUTION_PARTNER' ? 'MoU Subsidy' : 'Student Scholar'}</span>
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
                  className="px-8 py-3 rounded-xl bg-[#0052CC] hover:bg-blue-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
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
                  <span>Tuition Fee Payment & Seat Confirmation</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Complete fee settlement to generate your official Student LMS Credentials and batch assignment.
                </p>
              </div>

              {/* Complete Fee Breakdown Card */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-blue-300">Application Financial Ledger</h3>
                <div className="space-y-2 pt-1 border-t border-white/10">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Standard Course Fee ({selectedLangData.lang}):</span>
                    <span className="font-semibold text-white">₹{selectedLangData.fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      {enrollmentMode === 'INSTITUTION_PARTNER' ? `Institutional Partner MoU Rebate (${currentPartner.code})` : 'Online Applicant Scholar Discount'}:
                    </span>
                    <span className="font-bold text-emerald-400">-₹{institutionalRebate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">2 Printed Textbooks & Kit Delivery:</span>
                    <span className="font-semibold text-emerald-400">FREE (Included)</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-sm">
                    <span className="font-bold text-white">Net Total Payable:</span>
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
                      <span>Full Tuition Settlement</span>
                      <span className="text-emerald-400">₹{netPayable.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Immediate final confirmation & roll number lock.</p>
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
                      <span className="text-emerald-400">₹5,000</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Remaining ₹{(netPayable - 5000).toLocaleString()} payable before batch launch.</p>
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
                    { id: 'COLLEGE_CHALLAN', label: 'Campus Challan', icon: FileCheck },
                  ].map((m) => {
                    const isSelected = paymentMethod === m.id;
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer text-center space-y-1.5 transition-all ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto text-blue-400" />
                        <span className="block font-bold text-[11px]">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center gap-3 text-xs text-slate-300">
                <Lock className="w-5 h-5 text-blue-400 shrink-0" />
                <span>
                  Encrypted 256-bit Institutional Payment Gateway. Official GST Invoice & Fee Receipt will be dispatched immediately.
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
                <h3 className="text-3xl font-black text-white">College Enrollment Confirmed</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your foreign language program seat at {collegeNameResolved} has been allocated.
                </p>
              </div>

              {/* Receipt Ticket Box */}
              <div className="bg-white/5 border border-white/15 rounded-3xl p-6 max-w-lg mx-auto text-left space-y-3 text-xs">
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-slate-400">Official Application No:</span>
                  <span className="font-mono font-bold text-blue-300 text-sm">{submittedAppNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Name:</span>
                  <span className="font-bold text-white">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">College / Campus:</span>
                  <span className="font-bold text-white truncate max-w-[240px]">{collegeNameResolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Course:</span>
                  <span className="font-bold text-emerald-400">{selectedLangData.lang} ({selectedLangData.level})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Batch Timing:</span>
                  <span className="font-semibold text-slate-200">{selectedLangData.time}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2.5">
                  <span className="text-slate-400">Fees Paid:</span>
                  <span className="font-black text-emerald-400 text-sm">₹{amountToChargeNow.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/sales-manager/admissions"
                  className="px-6 py-3 rounded-xl bg-[#0052CC] hover:bg-blue-600 text-white font-bold text-xs shadow-lg"
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
                  Register Another Student
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-white/10">
        ISML Foreign Language Learning Management System • Autonomous College Admissions Desk 2026–2027
      </footer>
    </div>
  );
}
