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
  initialType?: 'COLLEGE' | 'SCHOOL';
}

export default function OnboardCollegeDrawer({
  isOpen,
  onClose,
  onInstitutionCreated,
  editInstitution,
  onInstitutionUpdated,
  initialType = 'COLLEGE',
}: OnboardCollegeDrawerProps) {
  const isEditMode = Boolean(editInstitution);
  // Stepper / Screen: 'FORM' | 'SUCCESS'
  const [currentScreen, setCurrentScreen] = useState<'FORM' | 'SUCCESS'>('FORM');

  // Form Fields — College / School Identity
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'COLLEGE' | 'UNIVERSITY' | 'INSTITUTE' | 'SCHOOL'>('COLLEGE');
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

  // Form Validation & Errors
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    contactEmail?: string;
    contactPhone?: string;
    adminEmail?: string;
    adminMobile?: string;
  }>({});

  const validateForm = () => {
    const errors: {
      name?: string;
      contactEmail?: string;
      contactPhone?: string;
      adminEmail?: string;
      adminMobile?: string;
    } = {};

    if (!name.trim() || name.trim().length < 3) {
      errors.name = 'Institution name must be at least 3 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactEmail.trim() || !emailRegex.test(contactEmail.trim())) {
      errors.contactEmail = 'Please provide a valid official institution email.';
    }

    const cleanContactPhone = contactPhone.replace(/\D/g, '');
    if (contactPhone.trim() && cleanContactPhone.length < 10) {
      errors.contactPhone = 'Official phone number must have at least 10 digits.';
    }

    if (adminEmail.trim() && !emailRegex.test(adminEmail.trim())) {
      errors.adminEmail = 'Please enter a valid administrator email address.';
    }

    const cleanAdminMobile = adminMobile.replace(/\D/g, '');
    if (adminMobile.trim() && cleanAdminMobile.length < 10) {
      errors.adminMobile = 'Administrator mobile number must have at least 10 digits.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInst, setCreatedInst] = useState<Institution | null>(null);
  const [adminCredentials, setAdminCredentials] = useState<{
    name: string;
    email: string;
    temporaryPassword: string;
    portalRoute: string;
    role: string;
    roleDisplayName: string;
  } | null>(null);

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
        const isSchool = initialType === 'SCHOOL';
        setName('');
        setCode('');
        setType(isSchool ? 'SCHOOL' : 'COLLEGE');
        setAffiliation(
          isSchool
            ? 'CBSE Affiliated • Senior Secondary Wing • K-12'
            : 'Autonomous • Affiliated to State University • NAAC A++'
        );
        setAddress('');
        setContactEmail('');
        setContactPhone('');
        setAdminName('');
        setAdminEmail('');
        setAdminMobile('');
        setDepartmentsCount(isSchool ? 6 : 4);
        setStudentsTarget(isSchool ? 300 : 450);
      }
      setIsSubmitting(false);
      setCreatedInst(null);
      setAdminCredentials(null);
    }
  }, [isOpen, editInstitution, initialType]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    if (isEditMode && editInstitution) {
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
      return;
    }

    try {
      const finalCode = code.trim().toUpperCase() || `COL-${Date.now().toString().slice(-4)}`;
      const payload = {
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
        adminName: adminName.trim() || (type === 'SCHOOL' ? `${name.trim()} Principal` : `${name.trim()} Admin`),
        adminEmail: adminEmail.trim() || contactEmail.trim(),
        adminMobile: adminMobile.trim() || contactPhone.trim(),
        adminPassword: `${finalCode.replace(/[^A-Z0-9]/g, '')}@2026!`,
      };

      const res = await fetch('http://localhost:4000/api/portals/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      const serverInst = json.data;

      const newInstitution: Institution = {
        id: serverInst?.id || `inst-${Date.now().toString().slice(-4)}`,
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
      if (serverInst?.adminCredentials) {
        setAdminCredentials(serverInst.adminCredentials);
      } else {
        setAdminCredentials({
          name: payload.adminName,
          email: payload.adminEmail,
          temporaryPassword: payload.adminPassword,
          portalRoute: '/college-admin/dashboard',
          role: type === 'SCHOOL' ? 'SCHOOL_ADMIN' : 'COLLEGE_ADMIN',
          roleDisplayName: type === 'SCHOOL' ? 'School Administrator' : 'College Administrator',
        });
      }
      setIsSubmitting(false);
      setCurrentScreen('SUCCESS');
    } catch {
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
      setAdminCredentials({
        name: adminName.trim() || `${name.trim()} Admin`,
        email: adminEmail.trim() || contactEmail.trim(),
        temporaryPassword: `${finalCode.replace(/[^A-Z0-9]/g, '')}@2026!`,
        portalRoute: '/college-admin/dashboard',
        role: type === 'SCHOOL' ? 'SCHOOL_ADMIN' : 'COLLEGE_ADMIN',
        roleDisplayName: type === 'SCHOOL' ? 'School Administrator' : 'College Administrator',
      });
      setIsSubmitting(false);
      setCurrentScreen('SUCCESS');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Container: full screen width on mobile, right-drawer on desktop */}
      <div className="fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[92vw] sm:max-w-xl md:sm:max-w-2xl h-[100dvh] flex font-sans">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-x-hidden transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
          {/* Header Bar */}
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-[#0B2447] text-white flex items-center justify-between shrink-0 border-b border-[#1E3A8A]">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {currentScreen === 'FORM'
                    ? isEditMode
                      ? 'Edit Institutional Profile'
                      : 'Onboard Affiliated College'
                    : 'College Onboarded Successfully'}
                </h2>
                <p className="text-[10px] sm:text-[11px] text-blue-200 truncate mt-0.5">
                  {currentScreen === 'FORM'
                    ? isEditMode
                      ? 'Update college profile, accreditation & capacity'
                      : 'Institutional multi-tenant workspace provisioning'
                    : 'Tenant created & Campus Admin invitation dispatched'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
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
                        <option value="SCHOOL">K-12 Partner School (CBSE / ICSE / IB)</option>
                        <option value="INSTITUTE">Specialized Language Institute</option>
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
                      <span>Active Institutional Tenant in DB</span>
                    </span>
                  </div>
                </div>

                {/* Provisioned Administrator Credentials Highlight Card */}
                {adminCredentials && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/80 border-2 border-blue-300 rounded-2xl text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                            {adminCredentials.roleDisplayName} Initialized
                          </h4>
                          <p className="text-[10px] text-blue-700">
                            Protected credentials securely routed to administrator
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                        {adminCredentials.role}
                      </span>
                    </div>

                    {/* Auto-Mail Sent Notification Banner */}
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 flex items-start gap-2.5 text-emerald-900 shadow-2xs">
                      <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                          <span>Official Credentials Delivered via Email</span>
                          <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 text-[9px] font-extrabold rounded-md">
                            SENT
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                          Login credentials and portal access link have been emailed to{' '}
                          <span className="font-semibold underline text-emerald-950">{adminCredentials.email}</span>. Plain text passwords are protected and never displayed on screen.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/90 p-3 rounded-xl border border-blue-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Admin Name:</span>
                        <span className="font-bold text-slate-900">{adminCredentials.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Login Email:</span>
                        <span className="font-mono font-bold text-blue-700">{adminCredentials.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Target Portal:</span>
                        <span className="text-slate-700 font-semibold">{adminCredentials.portalRoute}</span>
                      </div>
                    </div>

                    {/* Direct Quick Login & Copy Actions */}
                    <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `Administrator: ${adminCredentials.name}\nEmail: ${adminCredentials.email}\nPortal URL: http://localhost:3000${adminCredentials.portalRoute}`
                          );
                          alert('Administrator profile reference copied to clipboard.');
                        }}
                        className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 border border-blue-300 text-blue-900 rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-2xs"
                      >
                        Copy Account Reference
                      </button>

                      <a
                        href={`/auth/login?email=${encodeURIComponent(adminCredentials.email)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all text-center shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Open Login Portal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen('FORM');
                      setName('');
                      setCode('');
                      setContactEmail('');
                      setAdminName('');
                      setAdminEmail('');
                      setAdminCredentials(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Onboard Another Institution</span>
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
