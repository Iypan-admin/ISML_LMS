// ============================================================================
// ISML LMS — INDIVIDUAL STUDENT ADMISSIONS DESK (/sales-manager/enroll-student)
// Dedicated Comprehensive Admission Form:
// 1. Applicant Personal Identity & Demographic Details
// 2. Parents / Guardian Contact & Residential Details
// 3. Academic Profile (College Student / School Pupil / Working Professional)
// 4. Foreign Language & Pacing / Period Curriculum Track Selection
// 5. Automatic Super Admin Approval Dispatch
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Users,
  GraduationCap,
  School,
  Building2,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Briefcase,
  HeartHandshake,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useCollege } from '@/context/CollegeContext';
import LanguageTrackSelector from '@/components/sales-manager/LanguageTrackSelector';

export default function IndividualStudentEnrollmentPage() {
  const { institutions } = useCollege();
  const { showSuccess, showError, showInfo } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  // ─── APPLICANT TYPE ───
  // 'COLLEGE_STUDENT' | 'SCHOOL_PUPIL' | 'DIRECT_INDIVIDUAL'
  const [applicantType, setApplicantType] = useState<'COLLEGE_STUDENT' | 'SCHOOL_PUPIL' | 'DIRECT_INDIVIDUAL'>('COLLEGE_STUDENT');

  // Direct Walk-in Student Sub-type: College Higher Ed vs School K-12
  const [directTrackType, setDirectTrackType] = useState<'COLLEGE' | 'SCHOOL'>('COLLEGE');

  // ─── 1. STUDENT PERSONAL DETAILS ───
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('2005-04-12');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // ─── 2. PARENTS / GUARDIAN DETAILS ───
  const [fatherName, setFatherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherPhone, setMotherPhone] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');

  // ─── 3. RESIDENTIAL ADDRESS ───
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Coimbatore');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('641014');

  // ─── 4. ACADEMIC / INSTITUTION DETAILS ───
  const [selectedInstId, setSelectedInstId] = useState<string>('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [degreeProgram, setDegreeProgram] = useState('B.Sc Computer Science');
  const [schoolGrade, setSchoolGrade] = useState('Grade 9');
  const [schoolSection, setSchoolSection] = useState('A');
  const [schoolBoard, setSchoolBoard] = useState('CBSE');

  // Filter available institutions based on applicant type
  const availableColleges = institutions.filter((i) => i.type !== 'SCHOOL');
  const availableSchools = institutions.filter((i) => i.type === 'SCHOOL' || i.code.includes('DPS') || i.name.toLowerCase().includes('school'));

  useEffect(() => {
    if (applicantType === 'COLLEGE_STUDENT' && availableColleges.length > 0) {
      setSelectedInstId(availableColleges[0].id);
    } else if (applicantType === 'SCHOOL_PUPIL' && availableSchools.length > 0) {
      setSelectedInstId(availableSchools[0].id);
    } else {
      setSelectedInstId('DIRECT_ISML_CENTER');
    }
  }, [applicantType, institutions]);

  // ─── 5. FOREIGN LANGUAGE & PACING CURRICULUM TRACK ───
  const [selectedLanguage, setSelectedLanguage] = useState('French');
  const [selectedLevel, setSelectedLevel] = useState(applicantType === 'SCHOOL_PUPIL' ? 'A1.1' : 'A1 / L1');
  const [trackName, setTrackName] = useState('French A1 / L1 — Intensive (90 min/session)');
  const [trackMetrics, setTrackMetrics] = useState('90m/session • 54 sessions • 2x/wk • 7 months (80h total)');

  // ─── FORM SUBMIT HANDLER ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || firstName.trim().length < 2) {
      showError('Student first name must have at least 2 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      showError('Please enter a valid student email address.');
      return;
    }

    const cleanStudentPhone = phone.replace(/\D/g, '');
    if (cleanStudentPhone.length < 10) {
      showError('Student mobile number must be at least 10 digits.');
      return;
    }

    if (!fatherName.trim() && !motherName.trim()) {
      showError("Please enter at least one parent's name (Father or Mother).");
      return;
    }

    if (parentEmail.trim() && !emailRegex.test(parentEmail.trim())) {
      showError('Please enter a valid parent/guardian email address.');
      return;
    }

    if (parentEmail.trim().toLowerCase() === email.trim().toLowerCase()) {
      showError('Student email and parent email cannot be the same address.');
      return;
    }

    const parentPhoneCandidate = fatherPhone || motherPhone || emergencyContactNumber;
    const cleanParentPhone = parentPhoneCandidate.replace(/\D/g, '');
    if (parentPhoneCandidate.trim() && cleanParentPhone.length < 10) {
      showError('Parent mobile number must have at least 10 digits.');
      return;
    }

    setIsSubmitting(true);

    const resolvedInst = institutions.find((i) => i.id === selectedInstId);
    const institutionName = resolvedInst?.name || (applicantType === 'DIRECT_INDIVIDUAL' ? 'ISML Language Center (Direct Applicant)' : 'Partner Campus');
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const effectiveMode = applicantType === 'SCHOOL_PUPIL' || (applicantType === 'DIRECT_INDIVIDUAL' && directTrackType === 'SCHOOL') ? 'SCHOOL' : 'COLLEGE';

    const payload = {
      category: effectiveMode,
      admissionType: effectiveMode === 'SCHOOL' ? 'SCHOOL_STUDENT' : 'COLLEGE_STUDENT',
      institutionId: selectedInstId,
      institutionName,
      fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      mobileNumber: phone.trim(),
      gender,
      dob,
      bloodGroup,
      // Parent / Guardian Info
      parentFatherName: fatherName.trim(),
      parentMotherName: motherName.trim(),
      parentOrGuardianName: fatherName.trim() || motherName.trim(),
      fatherPhone: fatherPhone.trim(),
      motherPhone: motherPhone.trim(),
      parentEmergencyPhone: emergencyContactNumber.trim() || fatherPhone.trim() || phone.trim(),
      parentEmail: parentEmail.trim(),
      fatherOccupation: fatherOccupation.trim(),
      motherOccupation: motherOccupation.trim(),
      // Address
      address: {
        street: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      // Academic
      rollNo: rollNo.trim() || `ROLL-${Date.now().toString().slice(-4)}`,
      department: department.trim(),
      degree: degreeProgram.trim(),
      gradeClass: schoolGrade,
      section: schoolSection,
      boardAffiliation: schoolBoard,
      // Language Track Selection
      targetLanguage: selectedLanguage,
      targetLevel: selectedLevel,
      course: trackName,
      metricsSummary: trackMetrics,
      preferredBatchTiming: trackName,
      leadSource: 'DIRECT_WALKIN',
    };

    try {
      const res = await fetch('https://ismllms-production.up.railway.app/api/portals/admissions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      setIsSubmitting(false);

      if (json.status === 'success') {
        setSubmittedApp({
          ...payload,
          applicationNumber: json.data?.applicationNumber || json.data?.entityId || `ISML-ADM-${Date.now().toString().slice(-4)}`,
          approvalId: json.approvalId,
        });
        showSuccess(`Individual Student Enrolment submitted! Super Admin Approval Request generated.`);
      } else {
        showError(json.message || 'Failed to submit student application.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      showError('Connection to server failed. Please try again.');
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ─── Breadcrumb & Top Bar ─── */}
      <div>
        <Link
          href="/sales-manager/admissions"
          className="text-xs font-semibold text-slate-500 hover:text-[#0052CC] inline-flex items-center gap-1.5 mb-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Admissions Registry</span>
        </Link>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0052CC] border border-blue-100 flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Individual Student Enrollment Desk
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete single-student admission form with student demographics, parents/guardian information, and curriculum track.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#0052CC] text-xs font-bold border border-blue-100 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin Approval Gated</span>
          </div>
        </div>
      </div>

      {/* ─── SUCCESS SCREEN ─── */}
      {submittedApp ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Application Submitted & Pending Approval
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">Student Enrolment Registered!</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              Admission application for <strong>{submittedApp.fullName}</strong> has been saved with application ID{' '}
              <strong className="text-blue-700 font-mono">{submittedApp.applicationNumber}</strong>.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 max-w-lg mx-auto text-left text-xs space-y-2.5">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Applicant Name:</span>
              <span className="font-bold text-slate-900">{submittedApp.fullName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Institution / Center:</span>
              <span className="font-semibold text-slate-800">{submittedApp.institutionName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Parents / Guardian:</span>
              <span className="font-medium text-slate-800">
                {submittedApp.parentFatherName || submittedApp.parentMotherName} ({submittedApp.parentEmergencyPhone})
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Curriculum Track:</span>
              <span className="font-bold text-blue-700">{submittedApp.course}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Auto-Credentials (On Super Admin Approval):</span>
              <div className="text-right">
                <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block">
                  Student: Stud@{(submittedApp.phone || '').slice(-4) || '2026'}
                </span>
                <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block mt-1">
                  Parent: Par@{(submittedApp.parentEmergencyPhone || submittedApp.fatherPhone || submittedApp.phone || '').slice(-4) || '2026'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Super Admin Approval:</span>
              <span className="font-mono text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Pending ({submittedApp.approvalId})
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/sales-manager/admissions"
              className="px-5 py-2.5 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              View in Admissions Registry
            </Link>
            <button
              onClick={() => {
                setSubmittedApp(null);
                setFirstName('');
                setLastName('');
                setEmail('');
                setPhone('');
                setFatherName('');
                setMotherName('');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              + Register Another Student
            </button>
          </div>
        </div>
      ) : (
        /* ─── MAIN COMPREHENSIVE ADMISSION FORM ─── */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: APPLICANT CATEGORY SELECTOR */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Enrolment Category & Admission Stream
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'COLLEGE_STUDENT',
                  title: 'College / University Student',
                  desc: 'Undergraduate or Postgraduate student enrolling via partner or direct',
                  icon: GraduationCap,
                  color: 'text-blue-600',
                },
                {
                  id: 'SCHOOL_PUPIL',
                  title: 'School Pupil (K-12)',
                  desc: 'High school or middle school pupil (Grade 5 to Grade 12)',
                  icon: School,
                  color: 'text-emerald-600',
                },
                {
                  id: 'DIRECT_INDIVIDUAL',
                  title: 'Direct Walk-in / Working Professional',
                  desc: 'Direct learner studying independently at ISML center',
                  icon: Briefcase,
                  color: 'text-purple-600',
                },
              ].map((cat) => {
                const isSelected = applicantType === cat.id;
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setApplicantType(cat.id as any)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#0052CC] ring-2 ring-[#0052CC]/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${cat.color}`} />
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            isSelected ? 'border-[#0052CC] bg-[#0052CC] text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">{cat.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{cat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: STUDENT PERSONAL IDENTITY */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                2. Student Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bharath"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student Last Name / Initial <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kumar S."
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="bharath.kumar@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98840 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other / Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: PARENTS & GUARDIAN INFORMATION */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                3. Parents / Guardian Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Father's Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Sundaram"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Father's Contact Number</label>
                <input
                  type="tel"
                  placeholder="+91 94440 98765"
                  value={fatherPhone}
                  onChange={(e) => setFatherPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Father's Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Mechanical Engineer / Business"
                  value={fatherOccupation}
                  onChange={(e) => setFatherOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mother's Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Lakshmi"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mother's Contact Number</label>
                <input
                  type="tel"
                  placeholder="+91 94440 12345"
                  value={motherPhone}
                  onChange={(e) => setMotherPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mother's Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Professor / Homemaker"
                  value={motherOccupation}
                  onChange={(e) => setMotherOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Parent Official Email Address
                </label>
                <input
                  type="email"
                  placeholder="parents@gmail.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Emergency Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94440 99999"
                  value={emergencyContactNumber}
                  onChange={(e) => setEmergencyContactNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: RESIDENTIAL ADDRESS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                4. Permanent Residential Address
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Door No, Street & Area</label>
              <input
                type="text"
                placeholder="e.g. 14/2, Bharathi Street, Peelamedu"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">City / District</label>
                <input
                  type="text"
                  placeholder="Coimbatore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">State</label>
                <input
                  type="text"
                  placeholder="Tamil Nadu"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">PIN / Postal Code</label>
                <input
                  type="text"
                  placeholder="641014"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: ACADEMIC DETAILS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                5. Academic & Institution Enrollment Specs
              </h3>
            </div>

            {applicantType === 'COLLEGE_STUDENT' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Enrolling College Campus <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedInstId}
                      onChange={(e) => setSelectedInstId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                    >
                      {availableColleges.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name} ({col.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      College Roll No / Student ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 26-CS-042"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
                    <input
                      type="text"
                      placeholder="Computer Science & Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Degree Program</label>
                    <input
                      type="text"
                      placeholder="B.Sc Computer Science & Data Analytics"
                      value={degreeProgram}
                      onChange={(e) => setDegreeProgram(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                    />
                  </div>
                </div>
              </div>
            )}

            {applicantType === 'SCHOOL_PUPIL' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Enrolling Partner School <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedInstId}
                      onChange={(e) => setSelectedInstId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                    >
                      {availableSchools.map((sch) => (
                        <option key={sch.id} value={sch.id}>
                          {sch.name} ({sch.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pupil Roll No / Admission ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DPS-2026-042"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Class / Grade</label>
                    <select
                      value={schoolGrade}
                      onChange={(e) => setSchoolGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                    >
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Section</label>
                    <input
                      type="text"
                      placeholder="e.g. A"
                      value={schoolSection}
                      onChange={(e) => setSchoolSection(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Board Affiliation</label>
                    <select
                      value={schoolBoard}
                      onChange={(e) => setSchoolBoard(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                    >
                      <option value="CBSE">CBSE Board</option>
                      <option value="ICSE">ICSE / ISC</option>
                      <option value="STATE_BOARD">Tamil Nadu State Board</option>
                      <option value="IB">International Baccalaureate (IB)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {applicantType === 'DIRECT_INDIVIDUAL' && (
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-3">
                <div>
                  <span className="font-bold block">ISML Center Direct Enrollment Track</span>
                  <p className="text-[11px] text-purple-700">
                    Learner will be registered directly under the ISML Center umbrella with personalized LMS dashboard and 1:1 speaking sessions.
                  </p>
                </div>

                {/* Sub-selector: College Level vs School Level for Direct Walk-in */}
                <div className="pt-2 border-t border-purple-200/80">
                  <label className="block text-xs font-bold text-purple-950 mb-1.5">
                    Select Target Stream for this Individual Student: <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div
                      onClick={() => {
                        setDirectTrackType('COLLEGE');
                        setSelectedLevel('A1 / L1');
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        directTrackType === 'COLLEGE'
                          ? 'bg-white border-[#0052CC] ring-2 ring-[#0052CC]/20 shadow-xs'
                          : 'bg-purple-100/40 border-purple-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${directTrackType === 'COLLEGE' ? 'bg-[#0052CC] text-white' : 'bg-purple-200/60 text-purple-800'}`}>
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">College / Adult Pacing Track</h4>
                          <p className="text-[10px] text-slate-500">Standard (60m) • Intensive (90m) • Super (120m)</p>
                        </div>
                      </div>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        directTrackType === 'COLLEGE' ? 'bg-[#0052CC] text-white' : 'border border-slate-300'
                      }`}>
                        {directTrackType === 'COLLEGE' && '✓'}
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        setDirectTrackType('SCHOOL');
                        setSelectedLevel('A1.1');
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        directTrackType === 'SCHOOL'
                          ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                          : 'bg-purple-100/40 border-purple-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${directTrackType === 'SCHOOL' ? 'bg-emerald-600 text-white' : 'bg-purple-200/60 text-purple-800'}`}>
                          <School className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">School / Junior Period Track</h4>
                          <p className="text-[10px] text-slate-500">School Period Categories: Cat 1 to Cat 6 (35m–60m/period)</p>
                        </div>
                      </div>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        directTrackType === 'SCHOOL' ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                      }`}>
                        {directTrackType === 'SCHOOL' && '✓'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 6: LANGUAGE CURRICULUM SELECTION */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  6. Foreign Language & Pacing Delivery Track
                </h3>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {(applicantType === 'SCHOOL_PUPIL' || (applicantType === 'DIRECT_INDIVIDUAL' && directTrackType === 'SCHOOL'))
                  ? 'School Period Matrix (Cat 1–6)'
                  : 'College Pacing Matrix'}
              </span>
            </div>

            <LanguageTrackSelector
              mode={(applicantType === 'SCHOOL_PUPIL' || (applicantType === 'DIRECT_INDIVIDUAL' && directTrackType === 'SCHOOL')) ? 'SCHOOL' : 'COLLEGE'}
              selectedLanguage={selectedLanguage}
              selectedLevel={selectedLevel}
              onSelect={(sel) => {
                setSelectedLanguage(sel.language);
                setSelectedLevel(sel.level);
                setTrackName(sel.trackName);
                setTrackMetrics(sel.metricsSummary);
              }}
            />

            {/* Confirmation Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Selected Enrollment Curriculum</span>
                <span className="font-bold text-slate-900 text-sm block">{trackName}</span>
                <span className="text-[11px] text-blue-700 font-semibold block mt-0.5">{trackMetrics}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering Student...' : 'Submit & Enrol Student'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

