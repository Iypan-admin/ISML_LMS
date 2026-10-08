// ============================================================================
// ISML COLLEGE LMS — ADD USER MODAL
// Multi-Section User Provisioning with Dynamic Role-Based Academic Mapping
// Zero Plaintext Passwords — System Generated & Emailed Credentials
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  User,
  Phone,
  Building2,
  GraduationCap,
  Layers,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  KeyRound,
  X,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import {
  mockRoles,
  mockInstitutions,
  mockDepartments,
  mockPrograms,
  mockBatches,
} from '@/mock/superAdminData';
import { SuperAdminUser, RoleDefinition } from '@/types/rbac';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (newUser: SuperAdminUser) => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: AddUserModalProps) {
  // Stepper: 1: Personal Info, 2: Role & Account, 3: Academic Mapping, 4: Review
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [roleId, setRoleId] = useState<string>(mockRoles[4]?.id || 'role-teacher'); // Teacher default
  const [collegeId, setCollegeId] = useState<string>(mockInstitutions[0]?.id || 'inst-01');
  const [departmentId, setDepartmentId] = useState<string>(mockDepartments[0]?.id || 'dept-cs');
  const [programId, setProgramId] = useState<string>(mockPrograms[0]?.id || 'prog-bsc-cs');
  const [batchId, setBatchId] = useState<string>(mockBatches[0]?.id || 'batch-2026-cs');
  const [semesterNumber, setSemesterNumber] = useState<number>(1);
  const [subjectsAssigned, setSubjectsAssigned] = useState<string>('CS-101, CS-102');

  // Success Confirmation State
  const [createdUserResult, setCreatedUserResult] = useState<SuperAdminUser | null>(null);

  if (!isOpen) return null;

  const selectedRole = mockRoles.find((r) => r.id === roleId) || mockRoles[0];
  const isStudent = selectedRole.code === 'STUDENT';
  const isTeacher = selectedRole.code === 'TEACHER' || selectedRole.code === 'ASST_TEACHER' || selectedRole.code === 'DOUBT_TEACHER';
  const isAcademic = selectedRole.code === 'ACADEMIC_COORD';
  const isSuperAdmin = selectedRole.code === 'SUPER_ADMIN';

  // Cascading lists
  const availablePrograms = mockPrograms.filter((p) => p.departmentId === departmentId);
  const availableBatches = mockBatches.filter((b) => b.programId === programId);

  const resetForm = () => {
    setStep(1);
    setFirstName('');
    setLastName('');
    setEmail('');
    setMobile('');
    setRoleId(mockRoles[4]?.id || 'role-teacher');
    setCreatedUserResult(null);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleCreate = () => {
    const generatedId = `ISML2026${Math.floor(1000 + Math.random() * 9000)}`;
    const college = mockInstitutions.find((c) => c.id === collegeId) || mockInstitutions[0];
    const dept = mockDepartments.find((d) => d.id === departmentId);
    const prog = mockPrograms.find((p) => p.id === programId);
    const batch = mockBatches.find((b) => b.id === batchId);

    const newUser: SuperAdminUser = {
      id: `usr-${Date.now()}`,
      name: `${firstName.trim()} ${lastName.trim()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim() || '+91 98000 00000',
      avatarUrl: isStudent ? '/avatars/student.png' : '/avatars/default.png',
      roleId: selectedRole.id,
      roleName: selectedRole.name,
      roleCode: selectedRole.code,
      collegeId: college.id,
      collegeName: college.name,
      departmentId: isSuperAdmin ? undefined : dept?.id,
      departmentName: isSuperAdmin ? undefined : dept?.name,
      programId: isStudent || isTeacher ? prog?.id : undefined,
      programName: isStudent || isTeacher ? prog?.name : undefined,
      batchId: isStudent ? batch?.id : undefined,
      batchName: isStudent ? batch?.name : undefined,
      semesterNumber: isStudent ? semesterNumber : undefined,
      subjects: isTeacher ? subjectsAssigned.split(',').map((s) => s.trim()) : undefined,
      permissions: selectedRole.permissions,
      status: 'ACTIVE',
      lastLoginAt: 'Never logged in',
      createdAt: new Date().toISOString(),
      emailVerified: false,
      credentialsDelivered: true,
    };

    setCreatedUserResult(newUser);
    onUserCreated(newUser);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={createdUserResult ? 'Account Provisioned Successfully' : 'Provision New Platform User'}
      description={
        createdUserResult
          ? 'Secure temporary credentials dispatched to registered email address.'
          : 'Create user account, assign enterprise RBAC role, and configure academic mapping.'
      }
      maxWidth="lg"
    >
      {/* ─── Success View (Rule #20 & #36: Zero Plaintext Password) ─── */}
      {createdUserResult ? (
        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>User Account Created Successfully</span>
            </div>
            <p className="text-emerald-700 leading-relaxed text-[11px]">
              The user profile and RBAC entitlements are active immediately. Initial sign-in instructions and a cryptographically generated temporary password have been dispatched.
            </p>

            <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">System User ID:</span>
                <span className="font-bold text-[#0052CC]">{createdUserResult.id.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Role:</span>
                <span className="font-bold text-slate-800">{createdUserResult.roleName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Email:</span>
                <span className="font-bold text-slate-800">{createdUserResult.email}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500">Credential Delivery:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Sent to registered email
                </span>
              </div>
            </div>
          </div>

          {/* Security Guarantee Note */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-slate-600 text-[11px]">
            <KeyRound className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Zero Plaintext Password Policy:</strong> For platform compliance, temporary passwords are never exposed to administrators or stored in plaintext. The user will be required to change their password upon first login.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              Done & Return to Directory
            </button>
          </div>
        </div>
      ) : (
        /* ─── Multi-Step Form ─── */
        <div className="space-y-5 text-xs font-sans">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between px-2 text-[11px] font-bold border-b border-slate-100 pb-3">
            <span className={step >= 1 ? 'text-[#0052CC]' : 'text-slate-400'}>
              1. Personal Details
            </span>
            <span className="text-slate-300">→</span>
            <span className={step >= 2 ? 'text-[#0052CC]' : 'text-slate-400'}>
              2. Role & Account
            </span>
            <span className="text-slate-300">→</span>
            <span className={step >= 3 ? 'text-[#0052CC]' : 'text-slate-400'}>
              3. Academic Context
            </span>
            <span className="text-slate-300">→</span>
            <span className={step === 4 ? 'text-[#0052CC]' : 'text-slate-400'}>
              4. Review & Confirm
            </span>
          </div>

          {/* ─── Step 1: Personal Information ─── */}
          {step === 1 && (
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0052CC]" /> Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Arun"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Kumar"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Institutional Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. arun.kumar@loyolacollege.edu"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Credentials and login activation links will be sent here.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mobile Contact (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. +91 98401 23456"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  disabled={!firstName.trim() || !lastName.trim() || !email.trim()}
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Next: Role & Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 2: Role Selection & Account Info ─── */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0052CC]" /> Account & Role Assignment
              </h3>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Role *</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC] font-semibold"
                >
                  {mockRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {selectedRole.description}
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <span className="font-bold text-blue-900 text-xs">Generated Entitlements</span>
                <p className="text-blue-800 text-[11px]">
                  Assigned {selectedRole.permissions.length} granular system capabilities across academic and operational modules.
                </p>
              </div>

              {/* Password notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-slate-600 text-[11px]">
                <KeyRound className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Password Generation:</strong> The platform will automatically generate a secure one-time temporary password. You do not need to manually enter or remember a password.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next: Academic Mapping</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Dynamic Academic Mapping ─── */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#0052CC]" />
                Academic Association ({selectedRole.name})
              </h3>

              {/* College Selection (Always present) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">College / Institution *</label>
                <select
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  {mockInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role-Specific Fields */}
              {isSuperAdmin ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs">
                  <p className="font-semibold text-slate-800">Campus-Wide Access</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Super Administrators hold unrestricted access across all departments, batches, and programs. No specific batch mapping is required.
                  </p>
                </div>
              ) : (
                <>
                  {/* Department */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Academic Department *</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      {mockDepartments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Program */}
                  {(isStudent || isTeacher || isAcademic) && (
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Target Degree Program *</label>
                      <select
                        value={programId}
                        onChange={(e) => setProgramId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                      >
                        {availablePrograms.map((prog) => (
                          <option key={prog.id} value={prog.id}>
                            {prog.name} ({prog.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Batch & Semester for Students */}
                  {isStudent && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Cohort Batch *</label>
                        <select
                          value={batchId}
                          onChange={(e) => setBatchId(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                        >
                          {availableBatches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Current Semester *</label>
                        <select
                          value={semesterNumber}
                          onChange={(e) => setSemesterNumber(Number(e.target.value))}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                        >
                          <option value={1}>Semester 1 (Odd Term)</option>
                          <option value={2}>Semester 2 (Even Term)</option>
                          <option value={3}>Semester 3 (Odd Term)</option>
                          <option value={4}>Semester 4 (Even Term)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Subjects for Teachers */}
                  {isTeacher && (
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Teaching Subjects / Papers</label>
                      <input
                        type="text"
                        value={subjectsAssigned}
                        onChange={(e) => setSubjectsAssigned(e.target.value)}
                        placeholder="e.g. CS-101, CS-DSA-201"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Review & Create</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 4: Review Before Create (Rule #49) ─── */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Review Account Configuration
              </h3>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                <div className="p-3 bg-slate-50 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Full Name:</span>
                  <span className="font-bold text-slate-900">{firstName} {lastName}</span>
                </div>

                <div className="p-3 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Email Address:</span>
                  <span className="font-mono text-slate-900">{email}</span>
                </div>

                <div className="p-3 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Assigned Role:</span>
                  <span className="px-2 py-0.5 rounded font-bold text-xs bg-blue-50 text-[#0052CC]">
                    {selectedRole.name}
                  </span>
                </div>

                <div className="p-3 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Institution:</span>
                  <span className="text-slate-800 font-semibold truncate max-w-xs">
                    {mockInstitutions.find((c) => c.id === collegeId)?.name}
                  </span>
                </div>

                {isStudent && (
                  <>
                    <div className="p-3 flex justify-between items-center">
                      <span className="font-bold text-slate-700">Academic Track:</span>
                      <span className="text-slate-800">
                        {mockPrograms.find((p) => p.id === programId)?.name} (Sem {semesterNumber})
                      </span>
                    </div>

                    <div className="p-3 flex justify-between items-center">
                      <span className="font-bold text-slate-700">Cohort Batch:</span>
                      <span className="text-slate-800">
                        {mockBatches.find((b) => b.id === batchId)?.name}
                      </span>
                    </div>
                  </>
                )}

                <div className="p-3 bg-emerald-50/50 flex justify-between items-center text-emerald-900">
                  <span className="font-bold">Credential Protocol:</span>
                  <span className="font-semibold text-[11px]">System Generated & Emailed</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Confirm & Create Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
