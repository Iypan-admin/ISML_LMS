// ============================================================================
// ISML LMS — SCHOOL ADMISSIONS & ENROLLMENT DESK (/sales-manager/register-school)
// Professional, Clean Single & Bulk Enrollment Workflow:
// 1. Basic Pupil & Academic Information Collection
// 2. Parent / Guardian Contact Details
// 3. Foreign Language Track Selection
// 4. Automatic Super Admin Approval Queue Integration (/api/portals/approvals)
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
  FileCheck,
  Upload,
  FileSpreadsheet,
  Download,
  Trash2,
  Plus,
  AlertCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useCollege } from '@/context/CollegeContext';

const schoolGrades = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10 (Board Exam)',
  'Class 11',
  'Class 12',
];

const availableLanguages = [
  { name: 'French', code: 'FR', level: 'Junior CEFR A1 / A2' },
  { name: 'German', code: 'DE', level: 'Fit in Deutsch A1' },
  { name: 'Spanish', code: 'ES', level: 'Junior DELE A1' },
  { name: 'Korean', code: 'KO', level: 'TOPIK Foundation Track' },
  { name: 'Japanese', code: 'JA', level: 'Junior JLPT N5 Track' },
];

export default function SalesRegisterSchoolPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const { institutions } = useCollege();

  // Mode: BATCH or INDIVIDUAL
  const [enrollmentMode, setEnrollmentMode] = useState<'BATCH' | 'INDIVIDUAL'>('INDIVIDUAL');
  const [partnerSchools, setPartnerSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');

  // Individual Form Fields
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('Class 8');
  const [section, setSection] = useState('Section A');
  const [rollNo, setRollNo] = useState('');
  const [board, setBoard] = useState('CBSE');
  const [language, setLanguage] = useState('French');

  // Parent Info
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  // Bulk Roster state
  const [roster, setRoster] = useState<any[]>([]);
  const [mouDocumentNumber, setMouDocumentNumber] = useState('');
  const [schoolSignatoryName, setSchoolSignatoryName] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  useEffect(() => {
    // Fetch institutions
    fetch('/api/portals/institutions')
      .then((r) => r.json())
      .then((json) => {
        if (json && json.data) {
          const schs = json.data.filter((i: any) => i.type === 'SCHOOL' || i.name?.toLowerCase().includes('school') || i.code?.includes('SIVA'));
          setPartnerSchools(schs);
          if (schs.length > 0) setSelectedSchoolId(schs[0].id || schs[0].code);
        }
      })
      .catch(() => {
        const defaultSchool = [
          {
            id: 'c37b62d5-6ca4-47cb-bed7-899ad75a3144',
            code: 'SIVA-LIONS',
            name: 'Sivakasi Lions Matriculation Higher Secondary School',
          },
        ];
        setPartnerSchools(defaultSchool);
        setSelectedSchoolId(defaultSchool[0].id);
      });
  }, []);

  const currentSchool = partnerSchools.find((s) => s.id === selectedSchoolId || s.code === selectedSchoolId) || partnerSchools[0] || {
    id: 'c37b62d5-6ca4-47cb-bed7-899ad75a3144',
    code: 'SIVA-LIONS',
    name: 'Sivakasi Lions Matriculation Higher Secondary School',
  };

  // Submit Individual Pupil
  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !parentPhone.trim()) {
      showError('Please enter pupil name and parent contact number.');
      return;
    }

    setIsProcessing(true);
    const generatedRollNo = rollNo.trim() || `SLS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const applicationId = `APP-SCH-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. Submit to Super Admin Approvals Queue
      await fetch('/api/portals/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: applicationId,
          requestType: 'STUDENT_ADMISSION',
          module: 'Admissions Desk',
          title: `School Admission Approval: ${fullName} (${grade})`,
          description: `New pupil admission registration for ${currentSchool.name}. Language Track: ${language}. Parent Contact: ${parentPhone}.`,
          entityType: 'PUPIL_ADMISSION',
          entityId: generatedRollNo,
          requestedByUserId: 'Sales & Admissions Desk',
          priority: 'NORMAL',
          institutionId: currentSchool.id,
          details: {
            fullName,
            rollNo: generatedRollNo,
            grade,
            section,
            board,
            language,
            schoolName: currentSchool.name,
            schoolCode: currentSchool.code,
            parentName,
            parentPhone,
            parentEmail,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      // 2. Direct database record
      await fetch('/api/portals/admissions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email: parentEmail || `parent.${Date.now()}@school.edu`,
          phone: parentPhone,
          rollNo: generatedRollNo,
          category: 'SCHOOL',
          admissionType: 'SCHOOL_STUDENT',
          institutionId: currentSchool.id,
          institutionName: currentSchool.name,
          course: `${language} Junior Foundation Track`,
          targetLanguage: language.toUpperCase(),
          department: `${grade} (${section})`,
          parentFatherName: parentName,
          parentPhone,
          parentEmail,
          status: 'PENDING_APPROVAL',
        }),
      }).catch(() => {});

      setSubmittedApp({
        type: 'INDIVIDUAL',
        applicationNumber: applicationId,
        fullName,
        rollNo: generatedRollNo,
        school: currentSchool.name,
        grade: `${grade} - ${section}`,
        language,
        parentPhone,
      });

      showSuccess(`Application ${applicationId} submitted! Dispatched to Super Admin for approval.`);
    } catch (err: any) {
      showError(err?.message || 'Failed to submit admission application.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Bulk Batch
  const handleBulkBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roster.length === 0) {
      showError('Please add at least one pupil to the roster.');
      return;
    }

    setIsProcessing(true);
    const batchRef = `BATCH-SCH-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // Dispatch Batch Approval to Super Admin
      await fetch('/api/portals/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `REQ-${batchRef}`,
          requestType: 'BATCH_ONBOARDING',
          module: 'Admissions Desk',
          title: `School Batch Approval: ${currentSchool.name} (${roster.length} Pupils)`,
          description: `Bulk school enrollment batch under MoU Ref: ${mouDocumentNumber || 'MOU-2026'}. Language: ${language}. Signatory: ${schoolSignatoryName || 'Principal'}.`,
          entityType: 'SCHOOL_BATCH',
          entityId: batchRef,
          requestedByUserId: 'Sales & Admissions Desk',
          priority: 'HIGH',
          institutionId: currentSchool.id,
          details: {
            batchRef,
            schoolName: currentSchool.name,
            signatory: schoolSignatoryName,
            mouRef: mouDocumentNumber,
            language,
            pupilCount: roster.length,
            roster,
          },
        }),
      });

      setSubmittedApp({
        type: 'BATCH',
        batchRef,
        school: currentSchool.name,
        studentsCount: roster.length,
        language,
        signatory: schoolSignatoryName || 'Principal Desk',
      });

      showSuccess(`Batch ${batchRef} submitted! Super Admin notified for approval.`);
    } catch (err: any) {
      showError(err?.message || 'Failed to submit batch.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-900">
      {/* ─── Header ─── */}
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
            <span>School Admissions & Pupil Enrollment</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect school pupil details and submit directly into the Super Admin approval workflow.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setEnrollmentMode('INDIVIDUAL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              enrollmentMode === 'INDIVIDUAL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Pupil Form
          </button>
          <button
            type="button"
            onClick={() => setEnrollmentMode('BATCH')}
            className={`px-3 py-1.5 rounded-lg transition ${
              enrollmentMode === 'BATCH'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            School Batch MoU
          </button>
        </div>
      </div>

      {submittedApp ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
            Application Dispatched
          </span>

          <h2 className="text-2xl font-black text-slate-900">
            {submittedApp.type === 'BATCH' ? 'School Batch Submitted!' : 'Pupil Admission Submitted!'}
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed">
            {submittedApp.type === 'BATCH'
              ? `Batch ${submittedApp.batchRef} (${submittedApp.studentsCount} Pupils) for ${submittedApp.school} has been routed to the Super Admin approvals desk.`
              : `Application ${submittedApp.applicationNumber} for ${submittedApp.fullName} (${submittedApp.grade}) has been successfully submitted for approval.`}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-xs space-y-2 mt-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Super Admin Approval Status: PENDING</span>
            </div>
            <p className="text-[11px] text-amber-700">
              An approval notification has been generated in the Super Admin console. Student and Parent login credentials will automatically be dispatched once approved.
            </p>
          </div>

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
                setFullName('');
                setRollNo('');
                setParentName('');
                setParentPhone('');
                setParentEmail('');
                setRoster([]);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Enroll Another
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ════════════════════════════════════════════════════════════════════════
              MODE A: INDIVIDUAL PUPIL DIRECT REGISTRATION
          ════════════════════════════════════════════════════════════════════════ */}
          {enrollmentMode === 'INDIVIDUAL' && (
            <form onSubmit={handleIndividualSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {/* Institution and Language */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <School className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">1. School & Program Selection</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target School *</label>
                    <select
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {partnerSchools.map((sch) => (
                        <option key={sch.id} value={sch.id}>
                          {sch.name} ({sch.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Foreign Language Track *</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {availableLanguages.map((l) => (
                        <option key={l.code} value={l.name}>
                          {l.name} — {l.level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pupil Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">2. Pupil Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pupil Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sridhar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Class *</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      {schoolGrades.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Section / Division</label>
                    <input
                      type="text"
                      placeholder="e.g. Section A"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pupil Roll / Admission No (Optional)</label>
                    <input
                      type="text"
                      placeholder="Auto-generated if left blank"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Board of Affiliation</label>
                    <select
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="CBSE">CBSE (Central Board)</option>
                      <option value="MATRICULATION">Matriculation (Tamil Nadu)</option>
                      <option value="ICSE">ICSE / ISC</option>
                      <option value="STATE_BOARD">State Board</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent & Contact Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">3. Parent / Guardian Contact Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sridhar B."
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 94440 00000"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent Email</label>
                    <input
                      type="email"
                      placeholder="parent@gmail.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Workflow Summary</span>
                  <span className="font-bold text-slate-900 text-sm block">
                    {fullName || 'New Pupil'} • {language} Track ({grade})
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                    Will be sent to Super Admin for authorization
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Submitting...' : 'Submit Admission for Approval'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              MODE B: SCHOOL BATCH MoU (BULK ENROLLMENT)
          ════════════════════════════════════════════════════════════════════════ */}
          {enrollmentMode === 'BATCH' && (
            <form onSubmit={handleBulkBatchSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <School className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">1. Partner School Agreement</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Partner School *</label>
                    <select
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {partnerSchools.map((sch) => (
                        <option key={sch.id} value={sch.id}>
                          {sch.name} ({sch.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">MoU Document Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. MOU-2026-SLS-01"
                      value={mouDocumentNumber}
                      onChange={(e) => setMouDocumentNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Authorizing Principal / Head</label>
                    <input
                      type="text"
                      placeholder="e.g. Mrs. Revathi (Principal)"
                      value={schoolSignatoryName}
                      onChange={(e) => setSchoolSignatoryName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Batch Language Track *</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      {availableLanguages.map((l) => (
                        <option key={l.code} value={l.name}>
                          {l.name} — {l.level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Roster Input Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900">2. Enrolled Pupils Roster ({roster.length} Pupils)</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newId = `SCH-RST-${String(roster.length + 1).padStart(3, '0')}`;
                      setRoster((prev) => [
                        ...prev,
                        {
                          id: newId,
                          name: '',
                          rollNo: `SLS-2026-${String(prev.length + 1).padStart(3, '0')}`,
                          grade: 'Class 8',
                          parentName: '',
                          parentPhone: '',
                        },
                      ]);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Pupil</span>
                  </button>
                </div>

                {roster.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-xs font-semibold text-slate-600">No pupils added yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Click &quot;+ Add Pupil&quot; to begin building the cohort roster.</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Roll No</th>
                          <th className="py-2.5 px-3">Pupil Name</th>
                          <th className="py-2.5 px-3">Grade</th>
                          <th className="py-2.5 px-3">Parent Name</th>
                          <th className="py-2.5 px-3">Parent Phone</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {roster.map((p, idx) => (
                          <tr key={p.id}>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={p.rollNo}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, rollNo: val } : item));
                                }}
                                className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-800"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Pupil Name"
                                value={p.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, name: val } : item));
                                }}
                                className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={p.grade}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, grade: val } : item));
                                }}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                              >
                                {schoolGrades.map((g) => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Parent Name"
                                value={p.parentName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, parentName: val } : item));
                                }}
                                className="w-32 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="tel"
                                placeholder="+91 94440 00000"
                                value={p.parentPhone}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, parentPhone: val } : item));
                                }}
                                className="w-32 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setRoster((prev) => prev.filter((r) => r.id !== p.id))}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
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

              {/* Action Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Batch Roster Summary</span>
                  <span className="font-bold text-slate-900 text-sm block">
                    {roster.length} Pupils • {language} Cohort
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                    Will be submitted to Super Admin approval queue
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || roster.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Submitting Batch...' : `Submit Batch (${roster.length} Pupils)`}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
