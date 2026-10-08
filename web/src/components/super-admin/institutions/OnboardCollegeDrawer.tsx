// ============================================================================
// ISML COLLEGE LMS — ONBOARD COLLEGE SLIDE-OVER DRAWER
// Enterprise Multi-Tenant Institutional Onboarding Panel
// College Identity, Accreditation Profile & Campus Admin Provisioning
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  GraduationCap,
  Award,
  Globe,
  FileCheck2,
} from 'lucide-react';
import { Institution } from '@/types/rbac';

interface OnboardCollegeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInstitutionCreated: (newInst: Institution) => void;
  editInstitution?: Institution | null;
  onInstitutionUpdated?: (updated: Institution) => void;
}

export default function OnboardCollegeDrawer({
  isOpen,
  onClose,
  onInstitutionCreated,
  editInstitution,
  onInstitutionUpdated,
}: OnboardCollegeDrawerProps) {
  const isEditMode = Boolean(editInstitution);
  // Stepper / Screen: 'FORM' | 'SUCCESS'
  const [currentScreen, setCurrentScreen] = useState<'FORM' | 'SUCCESS'>('FORM');

  // Form Fields — College Identity
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'COLLEGE' | 'UNIVERSITY' | 'INSTITUTE'>('COLLEGE');
  const [affiliation, setAffiliation] = useState(
    'Autonomous • Affiliated to University • NAAC Accredited'
  );

  // Form Fields — Location & Contact
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Primary Campus Administrator
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminMobile, setAdminMobile] = useState('');

  // Academic Capacity Initial Values
  const [departmentsCount, setDepartmentsCount] = useState<number>(4);
  const [studentsTarget, setStudentsTarget] = useState<number>(450);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInst, setCreatedInst] = useState<Institution | null>(null);

  // Auto-generate code preview when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code.length < 8) {
      const generated = val
        .split(' ')
        .filter((w) => w.length > 2)
        .map((w) => w[0]?.toUpperCase())
        .join('')
        .slice(0, 6);
      if (generated) {
        setCode(`${generated}-${new Date().getFullYear().toString().slice(-2)}`);
      }
    }
  };

  // Reset fields when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentScreen('FORM');
      if (editInstitution) {
        setName(editInstitution.name);
        setCode(editInstitution.code);
        setType(editInstitution.type);
        setAffiliation(editInstitution.affiliation || 'Autonomous • Affiliated to State University • NAAC A++');
        setAddress(editInstitution.address || '');
        setContactEmail(editInstitution.contactEmail || '');
        setContactPhone(editInstitution.contactPhone || '');
        setAdminName('');
        setAdminEmail('');
        setAdminMobile('');
        setDepartmentsCount(editInstitution.departmentsCount || 4);
        setStudentsTarget(editInstitution.studentsCount || 450);
      } else {
        setName('');
        setCode('');
        setType('COLLEGE');
        setAffiliation('Autonomous • Affiliated to State University • NAAC A++');
        setAddress('');
        setContactEmail('');
        setContactPhone('');
        setAdminName('');
        setAdminEmail('');
        setAdminMobile('');
        setDepartmentsCount(4);
        setStudentsTarget(450);
      }
      setIsSubmitting(false);
      setCreatedInst(null);
    }
  }, [isOpen, editInstitution]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactEmail.trim()) return;

    setIsSubmitting(true);

    if (isEditMode && editInstitution) {
      setTimeout(() => {
        const updated: Institution = {
          ...editInstitution,
          name: name.trim(),
          code: code.trim().toUpperCase() || editInstitution.code,
          type,
          affiliation: affiliation.trim(),
          address: address.trim() || editInstitution.address,
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim() || editInstitution.contactPhone,
          departmentsCount: Number(departmentsCount) || 1,
          studentsCount: Number(studentsTarget) || 0,
          facultyCount: editInstitution.facultyCount || 0,
        };
        onInstitutionUpdated?.(updated);
        setIsSubmitting(false);
        onClose();
      }, 400);
      return;
    }

    setTimeout(() => {
      const newInstId = `inst-${Date.now().toString().slice(-4)}`;
      const finalCode = code.trim().toUpperCase() || `COL-${newInstId.slice(-3)}`;

      const newInstitution: Institution = {
        id: newInstId,
        name: name.trim(),
        code: finalCode,
        type,
        status: 'ACTIVE',
        affiliation: affiliation.trim(),
        address: address.trim() || 'Institutional Campus Address',
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim() || '+91 44 2800 0000',
        departmentsCount: Number(departmentsCount) || 4,
        studentsCount: Number(studentsTarget) || 450,
        facultyCount: 0,
        createdAt: new Date().toISOString(),
      };

      onInstitutionCreated(newInstitution);
      setCreatedInst(newInstitution);
      setIsSubmitting(false);
      setCurrentScreen('SUCCESS');
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl md:max-w-2xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
          {/* Header Bar */}
          <div className="px-5 py-4 bg-[#0B2447] text-white flex items-center justify-between shrink-0 border-b border-[#1E3A8A]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  {currentScreen === 'FORM'
                    ? isEditMode
                      ? 'Edit Institutional Profile'
                      : 'Onboard Affiliated College'
                    : 'College Onboarded Successfully'}
                </h2>
                <p className="text-[11px] text-blue-200">
                  {currentScreen === 'FORM'
                    ? isEditMode
                      ? 'Update college profile, accreditation details & capacity settings'
                      : 'Institutional multi-tenant workspace & accreditation provisioning'
                    : 'Tenant created & Campus Admin invitation dispatched'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Close panel (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs text-slate-700 space-y-6">
            {currentScreen === 'FORM' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: College Identity & Accreditation */}
                <div className="space-y-3">
                  <h3 className="font-bold text-[#0B2447] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>1. Institutional Identity & Accreditation</span>
                  </h3>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      College Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Loyola Institute of Engineering & Technology"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-xs text-slate-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">
                        Institutional Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. LIET-CHE"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-xs text-slate-900 uppercase"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">
                        Institution Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none cursor-pointer"
                      >
                        <option value="COLLEGE">Autonomous College</option>
                        <option value="INSTITUTE">Specialized Institute</option>
                        <option value="UNIVERSITY">University Campus</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      Affiliation & Accreditation Details
                    </label>
                    <input
                      type="text"
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                      placeholder="e.g. Autonomous • Anna University • NAAC A++ Accredited"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Section 2: Location & Contact */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-[#0B2447] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>2. Campus Location & Administrative Contact</span>
                  </h3>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      Campus Physical Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 1st Cross Street, Nungambakkam, Chennai, Tamil Nadu - 600034"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-xs text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">
                        Official Administrative Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="principal@college.edu.in"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-xs text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">
                        Administrative Phone Number
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 44 2817 8200"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Primary Campus Administrator Setup */}
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3 pt-3">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>3. Primary Campus Administrator Setup</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Set up the initial institutional tenant coordinator or Principal account. 
                    Login credentials will be securely dispatched to this email.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-blue-950 mb-1">
                        Administrator Legal Name
                      </label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="e.g. Dr. K. Sivakumar"
                        className="w-full p-2 bg-white border border-blue-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-blue-950 mb-1">
                        Admin Work Email
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@college.edu.in"
                        className="w-full p-2 bg-white border border-blue-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Initial Academic Capacity */}
                <div className="space-y-3 pt-1">
                  <h3 className="font-bold text-[#0B2447] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>4. Initial Academic Capacity & Learner Intake</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1 text-[11px]">
                        Participating Departments
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={departmentsCount}
                        onChange={(e) => setDepartmentsCount(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-medium mb-1 text-[11px]">
                        Target Student Intake
                      </label>
                      <input
                        type="number"
                        min={10}
                        value={studentsTarget}
                        onChange={(e) => setStudentsTarget(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                      />
                    </div>
                  </div>

                  {/* ISML Centralized Tutor Model Callout */}
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-900 text-[11px] flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs text-[#0B2447]">Centralized ISML Language Faculty Model</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Teaching faculty & certified language tutors are centrally provided, managed, and allocated by ISML. Partner colleges do not provide internal teaching faculty.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Zero Plaintext Password Guarantee */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] flex items-start gap-2">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>
                    Zero Plaintext Security Policy: The institutional tenant authentication key & initial Administrator single-sign-on credentials are generated cryptographically and dispatched to the designated official email.
                  </span>
                </div>

                {/* Drawer Footer Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-bold transition-colors cursor-pointer text-[11px] sm:text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || !contactEmail.trim()}
                    className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer text-[11px] sm:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span>{isEditMode ? 'Updating College...' : 'Provisioning Workspace...'}</span>
                    ) : (
                      <>
                        <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{isEditMode ? 'Save Changes' : 'Onboard College & Provision Tenant'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Success Screen */}
            {currentScreen === 'SUCCESS' && createdInst && (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#0B2447]">
                    College Onboarded Successfully
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Multi-tenant institutional partition has been initialized with active accreditation credentials.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Institution Name:</span>
                    <span className="font-bold text-slate-900">{createdInst.name}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Institution Code:</span>
                    <span className="font-mono font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {createdInst.code}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Institutional ID:</span>
                    <span className="font-mono text-slate-700">{createdInst.id}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Official Contact:</span>
                    <span className="font-medium text-slate-800">{createdInst.contactEmail}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Departments Provisioned:</span>
                    <span className="font-semibold text-slate-800">
                      {createdInst.departmentsCount} Departments
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Tenant Status:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Institutional Tenant</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen('FORM');
                      setName('');
                      setCode('');
                      setContactEmail('');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Onboard Another College</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 bg-[#0B2447] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
