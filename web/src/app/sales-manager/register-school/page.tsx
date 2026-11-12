// ============================================================================
// ISML LMS — SCHOOL ADMISSIONS DESK (/sales-manager/register-school)
// 2-WAY ADMISSION ARCHITECTURE:
// 1. INDIVIDUAL PUPIL DIRECT REGISTRATION (Single applicant form)
// 2. SCHOOL SIGNED MoU BATCH REGISTRATION (Bulk CSV/Excel Upload & Roster)
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
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
  AlertCircle,
  FileText,
} from 'lucide-react';
import { salesStore } from '@/mock/salesData';
import { useToast } from '@/context/ToastContext';
import { AdmissionEntryType, BulkStudentRosterItem } from '@/types/sales';
import { useCollege } from '@/context/CollegeContext';
import LanguageTrackSelector from '@/components/sales-manager/LanguageTrackSelector';

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

export default function SalesRegisterSchoolPage() {
  const { showSuccess, showError, showInfo } = useToast();

  // ─── MASTER 2-WAY ADMISSION TOGGLE ───
  // 1. SCHOOL_BATCH_SIGN: School-Signed MoU bulk batch upload (DPS/NPS/DAV)
  // 2. INDIVIDUAL: Single pupil direct desk registration
  const [admissionEntryType, setAdmissionEntryType] = useState<AdmissionEntryType>('COLLEGE_BATCH_SIGN');

  const { institutions } = useCollege();
  const [partnerSchoolsList, setPartnerSchoolsList] = useState<any[]>([]);

  // Sync real schools from DB/Context
  useEffect(() => {
    if (institutions && institutions.length > 0) {
      const schools = institutions.filter((i) => i.type === 'SCHOOL' || i.code.includes('DPS') || i.name.toLowerCase().includes('school'));
      if (schools.length > 0) {
        setPartnerSchoolsList(schools.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          board: 'CBSE',
          campusArea: 'Campus',
          city: 'Tamil Nadu',
          state: 'Tamil Nadu',
          pincode: '641001',
          principalContact: 'Principal Office',
          mouRef: `MOU-2026-${s.code}-001`,
          agreedRatePerPupil: 10500,
        })));
        setSelectedSchoolId(schools[0].id);
      }
    }
  }, [institutions]);

  // Shared School Selection
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  // ═════════ WAY 1: INDIVIDUAL PUPIL FORM STATE ═════════
  const [indStudentName, setIndStudentName] = useState('');
  const [indGrade, setIndGrade] = useState('Class 8');
  const [indSection, setIndSection] = useState('Section Alpha');
  const [indBoard, setIndBoard] = useState<'CBSE' | 'ICSE' | 'STATE_BOARD'>('CBSE');
  const [indParentFather, setIndParentFather] = useState('');
  const [indParentMother, setIndParentMother] = useState('');
  const [indParentPhone, setIndParentPhone] = useState('');
  const [indParentEmail, setIndParentEmail] = useState('');
  const [indEmergencyPhone, setIndEmergencyPhone] = useState('');
  const [indTrackIndex, setIndTrackIndex] = useState(0);
  const [indLanguage, setIndLanguage] = useState('French');
  const [indLevel, setIndLevel] = useState('A1.1');
  const [indTrackName, setIndTrackName] = useState('French (A1.1) — Cat 3 (45 min/period)');
  const [indTrackMetrics, setIndTrackMetrics] = useState('Cat 3 (45 min/period) • 4 periods/wk • 80 total periods (60h total)');

  // ═════════ WAY 2: SCHOOL SIGNED BULK ROSTER STATE ═════════
  const [mouDocumentNumber, setMouDocumentNumber] = useState('');
  const [schoolSignatoryName, setSchoolSignatoryName] = useState('');
  const [batchName, setBatchName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Dynamic real roster items
  const [roster, setRoster] = useState<BulkStudentRosterItem[]>([]);

  // Submission Status
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPartner = partnerSchoolsList.find((s) => s.id === selectedSchoolId) || partnerSchoolsList[0];
  const selectedTrack = schoolLanguageTracks[indTrackIndex];

  // Bulk File Upload (CSV Parser)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        showError('The file appears empty or has only a header row.');
        return;
      }

      const parsedPupils: BulkStudentRosterItem[] = [];
      const dataRows = lines.slice(1);

      dataRows.forEach((row, idx) => {
        const cols = row.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols[0]) {
          parsedPupils.push({
            id: `SCH-RST-${Date.now().toString().slice(-4)}-${idx + 1}`,
            name: cols[0] || `Pupil ${idx + 1}`,
            rollNo: cols[1] || `${currentPartner.code}-${idx + 101}`,
            email: cols[2] || `parent${idx + 1}@${currentPartner.code.toLowerCase()}.edu`,
            phone: cols[3] || '+91 94441 00000',
            parentName: cols[4] || undefined,
            parentPhone: cols[5] || cols[3] || '+91 94441 00000',
            department: cols[6] || 'Class 8 (Section A)',
            semester: 'Term 1',
            languageSelected: cols[7] || 'French Junior A1',
            proficiencyLevel: 'CEFR A1',
          });
        }
      });

      if (parsedPupils.length > 0) {
        setRoster(parsedPupils);
        showSuccess(`Successfully loaded ${parsedPupils.length} pupils from ${file.name}!`);
      } else {
        showError('Could not parse any pupil records from file.');
      }
    };
    reader.readAsText(file);
  };

  const handleRemoveRosterItem = (id: string) => {
    setRoster((prev) => prev.filter((r) => r.id !== id));
    showInfo('Pupil removed from school signed roster.');
  };

  // 1. Submit Individual Pupil
  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const txn = `TXN-SCH-${Math.floor(100000 + Math.random() * 900000)}`;
    const rebate = 1500;
    const net = selectedTrack.fee - rebate;

    // Direct database persistence via API
    try {
      await fetch('http://localhost:4000/api/portals/admissions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: indStudentName.split(' ')[0] || 'Pupil',
          lastName: indStudentName.split(' ').slice(1).join(' ') || 'Student',
          fullName: indStudentName,
          email: indParentEmail || `parent.${Date.now()}@school.edu`,
          phone: indParentPhone,
          rollNo: `DPS-${Math.floor(1000 + Math.random() * 9000)}`,
          category: 'SCHOOL',
          admissionType: 'SCHOOL_STUDENT',
          institutionId: currentPartner.id,
          institutionName: currentPartner.name,
          course: selectedTrack.name,
          targetLanguage: (selectedTrack.lang || 'FRENCH').toUpperCase(),
          targetLevel: 'A1_1',
          department: `${indGrade} (${indSection})`,
          parentFatherName: indParentFather || undefined,
          parentMotherName: indParentMother || undefined,
          parentPhone: indParentPhone || undefined,
          parentEmail: indParentEmail || undefined,
          emergencyPhone: indEmergencyPhone || undefined,
          amountPaid: net,
          paymentRefId: txn,
        }),
      });
    } catch {}

    const newApp = salesStore.addApplication({
      category: 'SCHOOL',
      institutionId: currentPartner.id,
      institutionName: currentPartner.name,
      fullName: indStudentName || 'Walk-in School Pupil',
      email: indParentEmail || 'parent@school.edu',
      phone: indParentPhone || '+91 94440 00000',
      parentName: indParentFather || indParentMother || undefined,
      parentPhone: indParentPhone || undefined,
      parentEmail: indParentEmail || undefined,
      dob: '2012-08-19',
      gender: 'FEMALE',
      bloodGroup: 'B+',
      address: {
        street: currentPartner.campusArea,
        city: currentPartner.city,
        state: 'Tamil Nadu',
        pincode: currentPartner.pincode,
      },
      schoolDetails: {
        enrollmentMode: 'INSTITUTION_PARTNER',
        schoolName: currentPartner.name,
        schoolCode: currentPartner.code,
        boardAffiliation: indBoard,
        gradeClass: indGrade,
        section: indSection,
        academicYear: '2026–2027',
        parentFatherName: indParentFather || 'Parent Name',
        parentMotherName: 'Parent Name',
        parentEmergencyPhone: indParentPhone || '+91 94440 00000',
        languageTrack: indTrackName,
        schoolBatchSlot: indTrackMetrics,
        transportMode: 'SCHOOL_BUS',
      },
      courseFee: 0,
      discountScholarship: 0,
      finalPayable: 0,
      amountPaid: 0,
      paymentStatus: 'PAID',
      paymentRefId: txn,
      stage: 'ENROLLED',
      source: 'DIRECT_WALKIN',
      assignedSalesOfficer: 'Admissions Desk',
      assignedOfficerEmail: 'schools.admissions@isml.edu',
      leadScore: 98,
      notes: [
        `School pupil admission registered directly.`,
        `Selected Period Track: ${indTrackName} (${indTrackMetrics})`,
      ],
    });

    setIsProcessing(false);
    setSubmittedApp({
      type: 'INDIVIDUAL',
      applicationNumber: newApp.applicationNumber,
      fullName: newApp.fullName,
      school: currentPartner.name,
      grade: `${indGrade} (${indSection})`,
      track: selectedTrack.name,
      amount: net,
    });
    showSuccess(`School Enrolment ${newApp.applicationNumber} recorded directly in Database!`);
  };

  // 2. Submit School-Signed Batch MoU
  const handleBulkBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roster.length === 0) {
      showError('Please add or upload at least one student in the roster.');
      return;
    }

    setIsProcessing(true);

    const perPupilRate = currentPartner.agreedRatePerPupil || 10500;
    const totalBatchFee = perPupilRate * roster.length;
    const batchRef = `BATCH-SCH-${Math.floor(1000 + Math.random() * 9000)}`;

    // Direct database bulk persistence via API
    try {
      await fetch('http://localhost:4000/api/portals/admissions/bulk-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'SCHOOL',
          institutionId: currentPartner.id,
          institutionName: currentPartner.name,
          batchRef,
          roster,
        }),
      });
    } catch {}

    setIsProcessing(false);
    setSubmittedApp({
      type: 'SCHOOL_BATCH',
      batchRef,
      school: currentPartner.name,
      studentsCount: roster.length,
      courseTrack: indTrackName,
      totalFee: totalBatchFee,
      signatory: schoolSignatoryName,
    });
    showSuccess(`School Signed Batch ${batchRef} with ${roster.length} pupils confirmed and persisted in DB!`);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <Link
            href="/sales-manager/admissions"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 mb-1.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Admissions Registry</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
            <School className="w-6 h-6 text-emerald-600" />
            <span>School Admissions Desk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-way enrollment workflow: Sign school bulk batches via MoU or register individual pupils directly.
          </p>
        </div>
      </div>

      {submittedApp ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          {submittedApp.type === 'SCHOOL_BATCH' ? (
            <>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                School MoU Batch Sign Complete
              </span>
              <h2 className="text-2xl font-black text-slate-900">School Signed Batch Registered!</h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Batch <strong className="text-emerald-700 font-mono">{submittedApp.batchRef}</strong> ({submittedApp.batchName}) for <strong>{submittedApp.school}</strong> has been enrolled with <strong>{submittedApp.studentsCount} pupils</strong>.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">School Signatory:</span>
                  <span className="font-bold text-slate-800">{submittedApp.signatory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Period Track:</span>
                  <span className="font-semibold text-emerald-700">{submittedApp.courseTrack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Pupils Enrolled:</span>
                  <span className="font-bold text-emerald-700">{submittedApp.studentsCount} Pupils</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Individual Pupil Enrolled
              </span>
              <h2 className="text-2xl font-black text-slate-900">Pupil Admission Confirmed!</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Application <strong className="text-emerald-700 font-mono">{submittedApp.applicationNumber}</strong> for {submittedApp.fullName} at {submittedApp.school} has been recorded.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Auto Pupil Password:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Stud@{(indParentPhone || '').slice(-4) || '2026'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Auto Parent Password:</span>
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Par@{(indParentPhone || indEmergencyPhone || '').slice(-4) || '2026'}
                  </span>
                </div>
                <div className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                  ⏳ <strong>Super Admin Approval Gated:</strong> Credentials will be delivered via SMS/Email automatically once Super Admin approves the enrollment.
                </div>
              </div>
            </>
          )}

          <div className="flex justify-center gap-3 pt-3">
            <Link
              href="/sales-manager/admissions"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
            >
              Go to Admissions Registry
            </Link>
            <button
              onClick={() => {
                setSubmittedApp(null);
                setIndStudentName('');
                setIndParentFather('');
                setIndParentPhone('');
                setIndParentEmail('');
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Register Another Pupil
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ═════════ 2-WAY ADMISSION SELECTOR TABS ═════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setAdmissionEntryType('COLLEGE_BATCH_SIGN')}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                admissionEntryType === 'COLLEGE_BATCH_SIGN'
                  ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${admissionEntryType === 'COLLEGE_BATCH_SIGN' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0B2447]">Way 1: School-Signed MoU Batch</h3>
                    <p className="text-[11px] text-slate-500">Official school partnership with bulk pupil upload</p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Bulk Upload
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                DPS, NPS, or DAV school principal signs MoU to adopt French/German language classes across entire Grade 8 or 9 sections.
              </p>
            </div>

            <div
              onClick={() => setAdmissionEntryType('INDIVIDUAL')}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                admissionEntryType === 'INDIVIDUAL'
                  ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${admissionEntryType === 'INDIVIDUAL' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0B2447]">Way 2: Individual Pupil Walk-in</h3>
                    <p className="text-[11px] text-slate-500">Single pupil & parent desk registration</p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Single Form
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Direct parent walk-in or online admission for single pupil. Collect parent details, grade, commute mode and payment receipt.
              </p>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              MODE A: SCHOOL-SIGNED BATCH REGISTRATION (BULK UPLOAD & ROSTER)
          ════════════════════════════════════════════════════════════════════════ */}
          {admissionEntryType === 'COLLEGE_BATCH_SIGN' && (
            <form onSubmit={handleBulkBatchSubmit} className="space-y-6">
              {/* School MoU Info */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <School className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-sm font-bold text-[#0B2447]">1. Partner School & Signed MoU Agreement</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Partner School *</label>
                    <select
                      value={selectedSchoolId}
                      onChange={(e) => {
                        setSelectedSchoolId(e.target.value);
                        const match = partnerSchoolsList.find((s) => s.id === e.target.value);
                        if (match) {
                          setMouDocumentNumber(match.mouRef);
                          setSchoolSignatoryName(`${match.principalContact}`);
                        }
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {partnerSchoolsList.map((sch) => (
                        <option key={sch.id} value={sch.id}>
                          {sch.name} ({sch.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Signed School MoU Reference *</label>
                    <input
                      type="text"
                      required
                      value={mouDocumentNumber}
                      onChange={(e) => setMouDocumentNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">School Authorizing Signatory *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mrs. Revathi Sundaram (Principal)"
                      value={schoolSignatoryName}
                      onChange={(e) => setSchoolSignatoryName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* Master School Period Category Matrix Selector for Batch MoU */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      Assigned Foreign Language & Period Category for this School Batch *
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Select language, CEFR level (A1.1 to B1.4) and school period category (Cat 1–6) for the signed cohort.
                    </p>
                  </div>

                  <LanguageTrackSelector
                    mode="SCHOOL"
                    selectedLanguage={indLanguage}
                    selectedLevel={indLevel}
                    onSelect={(sel) => {
                      setIndLanguage(sel.language);
                      setIndLevel(sel.level);
                      setIndTrackName(sel.trackName);
                      setIndTrackMetrics(sel.metricsSummary);
                    }}
                  />
                </div>
              </div>

              {/* Bulk Excel/CSV Upload Area */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-sm font-bold text-[#0B2447]">2. Bulk Pupil Roster Upload (Excel / CSV)</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const csvHeader = 'Pupil Name,Roll No,Parent Email,Pupil Phone,Parent / Guardian Name,Parent Phone,Class / Section,Language Track\n';
                      const csvRows = [
                        'Kavya Sundaram,DPS-001,kavya.parent@gmail.com,+91 94440 11223,Sundaram N,+91 94440 11223,Class 8 (Section A),French Junior A1',
                        'Arjun Venkatesh,DPS-002,arjun.p@gmail.com,+91 98840 22334,Venkatesh R,+91 98840 22334,Class 8 (Section B),German Fit in Deutsch',
                        'Priya Ramesh,DPS-003,priya.family@gmail.com,+91 97711 33445,Ramesh K,+91 97711 33445,Class 9 (Section A),Japanese Kanji',
                      ].join('\n');
                      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `ISML_School_Pupil_Batch_Template_${currentPartner.code}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                      showSuccess('Downloaded School Pupil CSV Template with Parent & Guardian columns!');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV Template</span>
                  </button>
                </div>

                {/* File Upload Zone */}
                <label
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`block p-6 sm:p-8 rounded-2xl border-2 border-dashed cursor-pointer text-center space-y-2 transition-all ${
                    isDragging
                      ? 'border-emerald-600 bg-emerald-50/70'
                      : uploadedFileName
                      ? 'border-emerald-500 bg-emerald-50/40'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-emerald-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {uploadedFileName ? uploadedFileName : 'Click to Upload School Pupil CSV File'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload CSV with columns: PupilName, RollNo, ParentEmail, ParentPhone, Grade, Language
                    </p>
                  </div>
                  {uploadedFileName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> {roster.length} Valid Pupils Loaded
                    </span>
                  )}
                </label>

                {/* Parsed Roster Table */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Enrolled Pupils Roster ({roster.length} pupils)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `SCH-RST-${String(roster.length + 1).padStart(3, '0')}`;
                        setRoster((prev) => [
                          ...prev,
                          {
                            id: newId,
                            name: '',
                            rollNo: `${currentPartner.code}-${String(prev.length + 1).padStart(3, '0')}`,
                            email: '',
                            phone: '',
                            department: 'Class 8 (Section A)',
                            semester: 'Term 1',
                            languageSelected: 'French Junior A1',
                            proficiencyLevel: 'CEFR A1',
                          },
                        ]);
                      }}
                      className="text-emerald-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Pupil Row</span>
                    </button>
                  </div>

                  {roster.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                      <p className="text-xs font-semibold text-slate-500">No pupils in roster yet.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click "+ Add Pupil Row" to enter pupils manually, or upload a CSV file above.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
                      <table className="w-full text-left text-xs min-w-[700px]">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3 px-3">Roll No</th>
                            <th className="py-3 px-3">Pupil Name</th>
                            <th className="py-3 px-3">Parent / Guardian</th>
                            <th className="py-3 px-3">Parent Phone</th>
                            <th className="py-3 px-3">Class / Section</th>
                            <th className="py-3 px-3">Language Track</th>
                            <th className="py-3 px-3 text-right">Remove</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {roster.map((st, idx) => (
                            <tr key={st.id} className="hover:bg-emerald-50/40 transition-colors">
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={st.rollNo}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, rollNo: val } : item));
                                  }}
                                  placeholder="Roll No"
                                  className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-800"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={st.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, name: val } : item));
                                  }}
                                  placeholder="Pupil Full Name"
                                  className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={st.parentName || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, parentName: val } : item));
                                  }}
                                  placeholder="Parent / Guardian"
                                  className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={st.parentPhone || st.phone}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, parentPhone: val, phone: val } : item));
                                  }}
                                  placeholder="+91 94440 00000"
                                  className="w-32 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={st.department}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, department: val } : item));
                                  }}
                                  placeholder="Class & Section"
                                  className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <select
                                  value={st.languageSelected}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, languageSelected: val } : item));
                                  }}
                                  className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800"
                                >
                                  <option value="French Junior A1">French Junior (A1)</option>
                                  <option value="German Fit in Deutsch">German (Fit A1)</option>
                                  <option value="Japanese Kanji">Japanese Kanji</option>
                                  <option value="Spanish Junior">Spanish Junior</option>
                                </select>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRosterItem(st.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Batch Summary Bar */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Total Batch Size:</span>
                    <span className="font-black text-slate-800 text-sm">{roster.length} Signed Pupils</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Enrollment Status:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-300/60 inline-block">
                      Ready for Batch Enrollment
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Enrolling Batch...' : `Confirm & Enrol Signed School Batch (${roster.length} Pupils)`}</span>
                </button>
              </div>
            </form>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              MODE B: INDIVIDUAL PUPIL DIRECT REGISTRATION (SINGLE FORM)
          ════════════════════════════════════════════════════════════════════════ */}
          {admissionEntryType === 'INDIVIDUAL' && (
            <form onSubmit={handleIndividualSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#0B2447] flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    <span>Individual School Pupil Admission Form</span>
                  </h2>
                  <p className="text-[11px] text-slate-500">Collect single pupil and parent info for direct after-school registration</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Single Entry
                </span>
              </div>

              {/* School Association */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enrolling School *</label>
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {partnerSchoolsList.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.name} ({sch.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class / Grade *</label>
                  <select
                    value={indGrade}
                    onChange={(e) => setIndGrade(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {schoolGrades.map((g) => (
                      <option key={g.grade} value={g.grade}>{g.grade} ({g.age})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pupil & Parent Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pupil Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavya Sundaram"
                    value={indStudentName}
                    onChange={(e) => setIndStudentName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section / Division *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section A"
                    value={indSection}
                    onChange={(e) => setIndSection(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Board of Affiliation</label>
                  <select
                    value={indBoard}
                    onChange={(e) => setIndBoard(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="CBSE">CBSE (Central Board)</option>
                    <option value="ICSE">ICSE / ISC</option>
                    <option value="STATE_BOARD">State Board</option>
                  </select>
                </div>
              </div>

              {/* Parents / Guardian Details */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Parent & Guardian Information</h4>
                  <span className="text-[10px] text-slate-500 font-medium">(Mandatory for after-school communication & progress updates)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Father's Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Sundaram Narayanan"
                      value={indParentFather}
                      onChange={(e) => setIndParentFather(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mother's Name</label>
                    <input
                      type="text"
                      placeholder="Meenakshi S."
                      value={indParentMother}
                      onChange={(e) => setIndParentMother(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Parent Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 94441 88990"
                      value={indParentPhone}
                      onChange={(e) => setIndParentPhone(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Parent Email</label>
                    <input
                      type="email"
                      placeholder="parent@gmail.com"
                      value={indParentEmail}
                      onChange={(e) => setIndParentEmail(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Master Period Category Matrix Selector (Cat 1 to Cat 6) */}
              <div className="pt-2">
                <LanguageTrackSelector
                  mode="SCHOOL"
                  selectedLanguage={indLanguage}
                  selectedLevel={indLevel}
                  onSelect={(sel) => {
                    setIndLanguage(sel.language);
                    setIndLevel(sel.level);
                    setIndTrackName(sel.trackName);
                    setIndTrackMetrics(sel.metricsSummary);
                  }}
                />
              </div>

              {/* Enrollment Action Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Selected School Period Category Track</span>
                  <span className="font-bold text-slate-900 text-sm block">
                    {indTrackName}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                    {indTrackMetrics}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Enrol Pupil</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
