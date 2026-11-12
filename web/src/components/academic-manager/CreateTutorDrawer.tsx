// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: CREATE TUTOR & ISSUE CREDENTIALS DRAWER
// Academic Manager creates Tutor profiles, assigns courses & generates credentials
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Lock,
  Phone,
  Globe2,
  BookOpen,
  Award,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  KeyRound,
  GraduationCap
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { TutorRoleType } from '@/mock/facultyAssignments';

interface CourseOption {
  id: string;
  name: string;
  code: string;
  facultyName?: string;
}

interface BatchOption {
  id: string;
  name: string;
  courseNames?: string[];
}

interface CreateTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTutorCreated: (tutor: any) => void;
}

export default function CreateTutorDrawer({
  isOpen,
  onClose,
  onTutorCreated,
}: CreateTutorDrawerProps) {
  const { showSuccess, showError } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState<'FRENCH' | 'GERMAN' | 'SPANISH' | 'JAPANESE' | 'KOREAN'>('FRENCH');
  const [designation, setDesignation] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [nativeCountry, setNativeCountry] = useState('');
  const [assignedRole, setAssignedRole] = useState<TutorRoleType>('LEAD_TRAINER');
  
  // Password setup
  const [customPassword, setCustomPassword] = useState('Tutor@2026!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Credentials modal state
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    role: string;
    portalRoute: string;
    loginUrl: string;
    status: string;
    approvalId?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Form validation errors state
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Name change handler (No auto email typing - user types their own email)
  const handleNameChange = (val: string) => {
    setFullName(val);
    if (formErrors.fullName) {
      setFormErrors((prev) => ({ ...prev, fullName: '' }));
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handleMobileChange = (val: string) => {
    setMobile(val);
    if (formErrors.mobile) {
      setFormErrors((prev) => ({ ...prev, mobile: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { [key: string]: string } = {};

    // 1. Full Name Validation
    if (!fullName.trim()) {
      errors.fullName = 'Full Name is required';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Please enter a valid full name (minimum 2 characters)';
    }

    // 2. Email Strict Regex Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      errors.email = 'Login Email is required';
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address (e.g. tutor@isml.edu)';
    }

    // 3. Mobile Number Validation (Strict 10+ digits)
    const digitsOnly = mobile.replace(/\D/g, '');
    if (!digitsOnly) {
      errors.mobile = 'Contact Mobile number is required';
    } else if (digitsOnly.length < 10) {
      errors.mobile = 'Mobile number must be at least 10 digits';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showError('Please correct the highlighted form errors.');
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const last4 = digitsOnly.slice(-4) || '2026';
    const autoPassword = `Tut@${last4}`;

    const payload = {
      name: fullName.trim(),
      email: cleanEmail,
      password: autoPassword,
      mobile: mobile.trim(),
      primaryLanguage,
      designation,
      qualification,
      experienceYears: Number(experienceYears) || 0,
      nativeCountry,
      assignedRoles: [assignedRole],
      courseId: '',
      courseName: '',
      batchId: '',
      batchName: '',
    };

    try {
      const res = await fetch('http://localhost:4000/api/portals/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // If email already exists, highlight on the email input field directly
        if (data.message && data.message.toLowerCase().includes('already')) {
          setFormErrors((prev) => ({ ...prev, email: data.message }));
        }
        throw new Error(data.message || 'Failed to create tutor profile');
      }

      showSuccess('Tutor profile submitted for Super Admin Approval.');
      onTutorCreated(data.data);

      // Clean, professional state: do NOT show passwords or credential passes to the submitter
      setCreatedCredentials({
        name: payload.name,
        email: payload.email,
        role: 'TUTOR',
        portalRoute: '/tutor/dashboard',
        loginUrl: 'http://localhost:3000/auth/login',
        status: 'PENDING_APPROVAL',
        approvalId: data.approvalId,
      });
    } catch (err: any) {
      showError(err.message || 'Error creating tutor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setCreatedCredentials(null);
    setFullName('');
    setEmail('');
    setMobile('');
    setDesignation('');
    setQualification('');
    setExperienceYears('');
    setNativeCountry('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Tutor (Faculty)</h2>
              <p className="text-xs text-slate-500">Create login account, allocate course & issue credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {createdCredentials ? (
            /* Clean Professional Submission Status - No Password Displayed */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#0052CC] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2447]">
                    Submitted for Super Admin Authorization
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Faculty profile for <strong className="font-bold text-slate-900">{createdCredentials.name}</strong> ({createdCredentials.email}) has been submitted to the Super Admin Governance Center.
                  </p>
                  <p className="text-[11px] text-blue-900 font-semibold mt-2">
                    Request ID: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{createdCredentials.approvalId || 'Pending'}</span>
                  </p>
                </div>
              </div>

              {/* Security Delivery Notice */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Automated Credential Dispatch Protocol
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  For institutional security and data protection, access credentials are not displayed in the console. Upon Super Admin authorization, system credentials will be securely dispatched directly to the tutor&apos;s verified inbox via official onboarding notice.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Tutor Email:</span>
                    <span className="font-mono font-bold text-slate-900">{createdCredentials.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Assigned Role:</span>
                    <span className="font-bold text-slate-900">{createdCredentials.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Authorization Status:</span>
                    <span className="font-bold text-amber-700">Pending Super Admin Review</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Done & Return to Faculty Hub
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>1. Faculty Profile Details</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name & Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madame Claire Dubois / Dr. Anandhakumar V."
                    value={fullName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 ${
                      formErrors.fullName
                        ? 'border-rose-400 bg-rose-50/50 focus:ring-rose-500 text-rose-900'
                        : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Login Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="tutor@isml.edu"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 ${
                          formErrors.email
                            ? 'border-rose-400 bg-rose-50/50 focus:ring-rose-500 text-rose-900'
                            : 'border-slate-200 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Mobile <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        maxLength={15}
                        placeholder="e.g. 9840122334"
                        value={mobile}
                        onChange={(e) => handleMobileChange(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 ${
                          formErrors.mobile
                            ? 'border-rose-400 bg-rose-50/50 focus:ring-rose-500 text-rose-900'
                            : 'border-slate-200 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {formErrors.mobile ? (
                      <p className="text-[11px] text-rose-600 font-medium mt-1">
                        {formErrors.mobile}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Password auto-generated as Tut@(last 4 digits)
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Language
                    </label>
                    <select
                      value={primaryLanguage}
                      onChange={(e) => setPrimaryLanguage(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="FRENCH">French (Français)</option>
                      <option value="GERMAN">German (Deutsch)</option>
                      <option value="SPANISH">Spanish (Español)</option>
                      <option value="JAPANESE">Japanese (日本語)</option>
                      <option value="KOREAN">Korean (한국어)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Native Country / Origin
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. France, Germany, Japan"
                      value={nativeCountry}
                      onChange={(e) => setNativeCountry(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Language Instructor"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      placeholder="e.g. 5"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tutor Role
                    </label>
                    <select
                      value={assignedRole}
                      onChange={(e) => setAssignedRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="LEAD_TRAINER">Lead Native Trainer</option>
                      <option value="SUBSTITUTE_TUTOR">Substitute Tutor</option>
                      <option value="DOUBT_SOLVING_TUTOR">Doubt Solver & Support</option>
                      <option value="ASSISTANT_TUTOR">Assistant Tutor (TA)</option>
                      <option value="ORAL_EXAMINER">Speaking & Oral Examiner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic Qualification & Certifications
                    </label>
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. M.A. Linguistics / Goethe C2 / DELF DALF certified"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Automated Credentials Notice */}
              <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Governance & Super Admin Sign-off Workflow</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    Once submitted, this new tutor profile is routed directly to the Super Admin Approval Center. Upon executive approval, the user account is activated and official login credentials will be dispatched to the tutor automatically.
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting for Approval...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Submit Tutor for Approval</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
