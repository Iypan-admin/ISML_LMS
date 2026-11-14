// ============================================================================
// ISML LMS — COLLEGE ADMISSIONS & ENROLLMENT DESK (/sales-manager/register-college)
// Clean & Professional Enrollment Workflow:
// 1. Basic Student & Academic Profile (Department, Program, Year)
// 2. Parent / Guardian Contact Details
// 3. Foreign Language Track Selection
// 4. Automatic Super Admin Approval Queue Integration (/api/portals/approvals)
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
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

const collegeDepartments = [
  'Department of Foreign Languages',
  'Computer Science & Engineering',
  'Commerce & Business Administration',
  'English Literature & Linguistics',
  'Physical & Applied Sciences',
];

const availableLanguages = [
  { name: 'French', code: 'FR', level: 'DELF A1 / A2 / B1' },
  { name: 'German', code: 'DE', level: 'Goethe Zertifikat A1 / A2' },
  { name: 'Spanish', code: 'ES', level: 'DELE A1 / A2' },
  { name: 'Korean', code: 'KO', level: 'TOPIK Level 1 / 2' },
  { name: 'Japanese', code: 'JA', level: 'JLPT N5 / N4' },
];

export default function SalesRegisterCollegePage() {
  const { showSuccess, showError } = useToast();

  const [enrollmentMode, setEnrollmentMode] = useState<'INDIVIDUAL' | 'BATCH'>('INDIVIDUAL');
  const [partnerColleges, setPartnerColleges] = useState<any[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');

  // Individual Form Fields
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Department of Foreign Languages');
  const [semester, setSemester] = useState('Semester 1');
  const [rollNo, setRollNo] = useState('');
  const [language, setLanguage] = useState('French');

  // Contact info
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Bulk Batch Roster state
  const [roster, setRoster] = useState<any[]>([]);
  const [mouDocumentNumber, setMouDocumentNumber] = useState('');
  const [collegeSignatoryName, setCollegeSignatoryName] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/portals/institutions')
      .then((r) => r.json())
      .then((json) => {
        if (json && json.data) {
          const cols = json.data.filter((i: any) => i.type === 'COLLEGE' || i.name?.toLowerCase().includes('college') || i.code?.includes('AMER'));
          setPartnerColleges(cols);
          if (cols.length > 0) setSelectedCollegeId(cols[0].id || cols[0].code);
        }
      })
      .catch(() => {
        const defaultCol = [
          {
            id: '521323cd-00da-49a6-98ed-6b7918d181b4',
            code: 'AMER-COL',
            name: 'The American College',
          },
        ];
        setPartnerColleges(defaultCol);
        setSelectedCollegeId(defaultCol[0].id);
      });
  }, []);

  const currentCol = partnerColleges.find((c) => c.id === selectedCollegeId || c.code === selectedCollegeId) || partnerColleges[0] || {
    id: '521323cd-00da-49a6-98ed-6b7918d181b4',
    code: 'AMER-COL',
    name: 'The American College',
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentPhone.trim()) {
      showError('Please enter student full name and contact number.');
      return;
    }

    setIsProcessing(true);
    const generatedRollNo = rollNo.trim() || `AMER-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const applicationId = `APP-COL-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. Submit to Super Admin Approvals Queue
      await fetch('/api/portals/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: applicationId,
          requestType: 'STUDENT_ADMISSION',
          module: 'Admissions Desk',
          title: `Collegiate Admission Approval: ${fullName} (${department})`,
          description: `Direct collegiate applicant enrollment for ${currentCol.name}. Language Track: ${language}. Phone: ${studentPhone}.`,
          entityType: 'STUDENT_ADMISSION',
          entityId: generatedRollNo,
          requestedByUserId: 'Sales & Admissions Desk',
          priority: 'NORMAL',
          institutionId: currentCol.id,
          details: {
            fullName,
            rollNo: generatedRollNo,
            department,
            semester,
            language,
            collegeName: currentCol.name,
            collegeCode: currentCol.code,
            studentEmail,
            studentPhone,
            parentName,
            parentPhone,
            amountPaid: 0,
            courseFee: 18500,
            paymentStatus: 'UNPAID',
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
          email: studentEmail || `student.${Date.now()}@campus.edu`,
          phone: studentPhone,
          rollNo: generatedRollNo,
          category: 'COLLEGE',
          admissionType: 'COLLEGE_STUDENT',
          institutionId: currentCol.id,
          institutionName: currentCol.name,
          course: `${language} Higher Education Track`,
          targetLanguage: language.toUpperCase(),
          department,
          parentFatherName: parentName,
          parentPhone,
          amountPaid: 0,
          paymentStatus: 'UNPAID',
          status: 'PENDING_APPROVAL',
        }),
      }).catch(() => {});

      // 3. Register fee ledger as UNPAID
      await fetch('/api/portals/student-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNo: generatedRollNo,
          name: fullName,
          email: studentEmail,
          collegeId: currentCol.id,
          collegeName: currentCol.name,
          program: `${language} Higher Education Track`,
          department,
          courseFee: 18500,
          amountPaid: 0,
        }),
      }).catch(() => {});

      setSubmittedApp({
        type: 'INDIVIDUAL',
        applicationNumber: applicationId,
        fullName,
        rollNo: generatedRollNo,
        college: currentCol.name,
        department,
        language,
        studentPhone,
      });

      showSuccess(`Application ${applicationId} submitted! Dispatched to Super Admin for approval.`);
    } catch (err: any) {
      showError(err?.message || 'Failed to submit admission application.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roster.length === 0) {
      showError('Please add at least one student to the roster.');
      return;
    }

    setIsProcessing(true);
    const batchRef = `BATCH-COL-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await fetch('/api/portals/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `REQ-${batchRef}`,
          requestType: 'BATCH_ONBOARDING',
          module: 'Admissions Desk',
          title: `Collegiate Batch Approval: ${currentCol.name} (${roster.length} Candidates)`,
          description: `Bulk collegiate enrollment batch under MoU Ref: ${mouDocumentNumber || 'MOU-2026'}. Language: ${language}. Signatory: ${collegeSignatoryName || 'Principal Desk'}.`,
          entityType: 'COLLEGE_BATCH',
          entityId: batchRef,
          requestedByUserId: 'Sales & Admissions Desk',
          priority: 'HIGH',
          institutionId: currentCol.id,
          details: {
            batchRef,
            collegeName: currentCol.name,
            signatory: collegeSignatoryName,
            mouRef: mouDocumentNumber,
            language,
            studentCount: roster.length,
            roster,
          },
        }),
      });

      setSubmittedApp({
        type: 'BATCH',
        batchRef,
        college: currentCol.name,
        studentsCount: roster.length,
        language,
        signatory: collegeSignatoryName || 'Principal Desk',
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
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 mb-1.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Admissions Registry</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <span>College Admissions & Student Enrollment</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect collegiate student details and submit directly into the Super Admin approval workflow.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setEnrollmentMode('INDIVIDUAL')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              enrollmentMode === 'INDIVIDUAL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Student Form
          </button>
          <button
            type="button"
            onClick={() => setEnrollmentMode('BATCH')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              enrollmentMode === 'BATCH'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            College Batch MoU
          </button>
        </div>
      </div>

      {submittedApp ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
            Application Dispatched
          </span>

          <h2 className="text-2xl font-black text-slate-900">
            {submittedApp.type === 'BATCH' ? 'Collegiate Batch Submitted!' : 'Student Admission Submitted!'}
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed">
            {submittedApp.type === 'BATCH'
              ? `Batch ${submittedApp.batchRef} (${submittedApp.studentsCount} Students) for ${submittedApp.college} has been routed to the Super Admin approvals desk.`
              : `Application ${submittedApp.applicationNumber} for ${submittedApp.fullName} (${submittedApp.department}) has been successfully submitted for approval.`}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-xs space-y-2 mt-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Super Admin Approval Status: PENDING</span>
            </div>
            <p className="text-[11px] text-amber-700">
              An approval notification has been generated in the Super Admin console. Student and LMS login credentials will automatically be dispatched once approved.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-3">
            <Link
              href="/sales-manager/admissions"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
            >
              Go to Admissions Registry
            </Link>
            <button
              onClick={() => {
                setSubmittedApp(null);
                setFullName('');
                setRollNo('');
                setStudentEmail('');
                setStudentPhone('');
                setParentName('');
                setParentPhone('');
                setRoster([]);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Enroll Another
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ════════════════════════════════════════════════════════════════════════
              MODE A: INDIVIDUAL STUDENT DIRECT REGISTRATION
          ════════════════════════════════════════════════════════════════════════ */}
          {enrollmentMode === 'INDIVIDUAL' && (
            <form onSubmit={handleIndividualSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {/* Institution and Language */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">1. College & Program Track</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target College *</label>
                    <select
                      value={selectedCollegeId}
                      onChange={(e) => setSelectedCollegeId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {partnerColleges.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name} ({col.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Foreign Language Track *</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Student Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">2. Student Profile</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muthu Pandian"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department / Discipline *</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      {collegeDepartments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Semester / Year</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="Semester 1">Semester 1 (Year 1)</option>
                      <option value="Semester 2">Semester 2 (Year 1)</option>
                      <option value="Semester 3">Semester 3 (Year 2)</option>
                      <option value="Semester 4">Semester 4 (Year 2)</option>
                      <option value="Semester 5">Semester 5 (Year 3)</option>
                      <option value="Semester 6">Semester 6 (Year 3)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Roll / Register No (Optional)</label>
                    <input
                      type="text"
                      placeholder="Auto-generated if left blank"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 97890 00000"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student College Email</label>
                    <input
                      type="email"
                      placeholder="student@americancollege.edu.in"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Parent & Contact Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">3. Parent / Guardian Contact Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Pandian Parent"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent Phone / Emergency Contact</label>
                    <input
                      type="tel"
                      placeholder="+91 97890 11000"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
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
                    {fullName || 'New Candidate'} • {language} Track ({department})
                  </span>
                  <span className="text-[11px] text-blue-700 font-semibold block mt-0.5">
                    Will be routed to Super Admin approval desk
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Submitting...' : 'Submit Admission for Approval'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              MODE B: COLLEGE BATCH MoU (BULK ENROLLMENT)
          ════════════════════════════════════════════════════════════════════════ */}
          {enrollmentMode === 'BATCH' && (
            <form onSubmit={handleBulkBatchSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">1. Partner College Agreement</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Partner College *</label>
                    <select
                      value={selectedCollegeId}
                      onChange={(e) => setSelectedCollegeId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {partnerColleges.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name} ({col.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">MoU Document Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. MOU-2026-AMER-01"
                      value={mouDocumentNumber}
                      onChange={(e) => setMouDocumentNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Authorizing Principal / Dean</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Sundararajan (Principal)"
                      value={collegeSignatoryName}
                      onChange={(e) => setCollegeSignatoryName(e.target.value)}
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
                    <Users className="w-5 h-5 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900">2. Enrolled Students Roster ({roster.length} Candidates)</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newId = `COL-RST-${String(roster.length + 1).padStart(3, '0')}`;
                      setRoster((prev) => [
                        ...prev,
                        {
                          id: newId,
                          name: '',
                          rollNo: `AMER-2026-${String(prev.length + 1).padStart(3, '0')}`,
                          department: 'Department of Foreign Languages',
                          phone: '',
                          email: '',
                        },
                      ]);
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Student</span>
                  </button>
                </div>

                {roster.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-xs font-semibold text-slate-600">No students added to the roster yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Click &quot;+ Add Student&quot; to begin building the cohort roster.</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Roll No</th>
                          <th className="py-2.5 px-3">Student Name</th>
                          <th className="py-2.5 px-3">Department</th>
                          <th className="py-2.5 px-3">Mobile No</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {roster.map((s, idx) => (
                          <tr key={s.id}>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={s.rollNo}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, rollNo: val } : item));
                                }}
                                className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-800"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Student Full Name"
                                value={s.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, name: val } : item));
                                }}
                                className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={s.department}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, department: val } : item));
                                }}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                              >
                                {collegeDepartments.map((d) => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="tel"
                                placeholder="+91 97890 00000"
                                value={s.phone}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, phone: val } : item));
                                }}
                                className="w-32 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="email"
                                placeholder="student@campus.edu"
                                value={s.email}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRoster((prev) => prev.map((item, i) => i === idx ? { ...item, email: val } : item));
                                }}
                                className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setRoster((prev) => prev.filter((r) => r.id !== s.id))}
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
                    {roster.length} Candidates • {language} Cohort
                  </span>
                  <span className="text-[11px] text-blue-700 font-semibold block mt-0.5">
                    Will be submitted to Super Admin approval queue
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || roster.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Submitting Batch...' : `Submit Batch (${roster.length} Candidates)`}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
