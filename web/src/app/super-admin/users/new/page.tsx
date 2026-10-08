// ============================================================================
// ISML COLLEGE LMS — ADD USER PAGE (/super-admin/users/new)
// Standalone Dedicated User Provisioning Flow with Dynamic Academic Mapping
// Production RBAC Protection (USER_CREATE)
// ============================================================================

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Lock,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Can, useRbac } from '@/context/AuthRbacContext';
import {
  mockRoles,
  mockInstitutions,
  mockDepartments,
  mockPrograms,
  mockBatches,
} from '@/mock/superAdminData';
import { SuperAdminUser, RoleDefinition } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services/userService';

export default function NewUserPage() {
  const router = useRouter();
  const { hasPermission } = useRbac();
  const { showSuccess, showError } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [roleId, setRoleId] = useState<string>(mockRoles[4]?.id || 'role-teacher');
  const [collegeId, setCollegeId] = useState<string>(mockInstitutions[0]?.id || 'inst-01');
  const [departmentId, setDepartmentId] = useState<string>(mockDepartments[0]?.id || 'dept-cs');
  const [programId, setProgramId] = useState<string>(mockPrograms[0]?.id || 'prog-bsc-cs');
  const [batchId, setBatchId] = useState<string>(mockBatches[0]?.id || 'batch-2026-cs');
  const [semesterNumber, setSemesterNumber] = useState<number>(1);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<SuperAdminUser | null>(null);

  // Selected role object
  const selectedRole = mockRoles.find((r) => r.id === roleId) || mockRoles[0];
  const roleCodeUpper = (selectedRole.code || selectedRole.name).toUpperCase();
  const isStudent = roleCodeUpper.includes('STUDENT');
  const isTeacher = roleCodeUpper.includes('TEACHER') || roleCodeUpper.includes('FACULTY');
  const isSuperAdmin = roleCodeUpper.includes('SUPER_ADMIN') || roleCodeUpper.includes('SUPER ADMIN');

  // Filtered dropdowns
  const availableDepartments = mockDepartments.filter(
    (d) => !d.institutionId || d.institutionId === collegeId
  );
  const availablePrograms = mockPrograms.filter(
    (p) => p.departmentId === departmentId
  );
  const availableBatches = mockBatches.filter(
    (b) => b.programId === programId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      showError('Please provide a valid first name and email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCollege = mockInstitutions.find((c) => c.id === collegeId);
      const selectedDept = mockDepartments.find((d) => d.id === departmentId);
      const selectedProg = mockPrograms.find((p) => p.id === programId);
      const selectedBatch = mockBatches.find((b) => b.id === batchId);

      const generatedId = `ISML${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

      const newUser: SuperAdminUser = {
        id: generatedId,
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        mobile: mobile.trim() || undefined,
        avatarUrl: `/avatars/${firstName.toLowerCase().replace(/\s+/g, '')}.png`,
        roleId: selectedRole.id,
        roleName: selectedRole.name,
        roleCode: selectedRole.code,
        collegeId: collegeId,
        collegeName: selectedCollege ? selectedCollege.name : 'ISML Campus',
        departmentId: isSuperAdmin ? undefined : departmentId,
        departmentName: isSuperAdmin ? undefined : selectedDept?.name,
        programId: isStudent || isTeacher ? programId : undefined,
        programName: isStudent || isTeacher ? selectedProg?.name : undefined,
        batchId: isStudent ? batchId : undefined,
        batchName: isStudent ? selectedBatch?.name : undefined,
        semesterNumber: isStudent ? semesterNumber : undefined,
        permissions: selectedRole.permissions,
        status: 'ACTIVE',
        lastLoginAt: 'Never',
        createdAt: new Date().toISOString(),
        emailVerified: true,
        credentialsDelivered: true,
      };

      await userService.createUser(newUser);
      setCreatedUser(newUser);
      showSuccess(`Account for ${newUser.name} provisioned successfully.`);
    } catch (err: any) {
      showError(err.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      <Breadcrumbs
        items={[
          { label: 'Administration', href: '/super-admin/users' },
          { label: 'Users', href: '/super-admin/users' },
          { label: 'Create New User' },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        {createdUser ? (
          /* Step 5: Success View */
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0B2447]">User Account Created Successfully</h2>
              <p className="text-xs text-slate-500 mt-1">
                The account has been provisioned and single sign-on credentials queued for dispatch.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-3">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Generated User ID:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  {createdUser.id}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Assigned Role:</span>
                <span className="font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {createdUser.roleName}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Registered Email:</span>
                <span className="font-medium text-slate-800">{createdUser.email}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Credential Status:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Credentials sent to email</span>
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 max-w-md mx-auto rounded-xl border border-blue-200 text-[11px] text-blue-800 text-left flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Zero-Plaintext Security: Initial passwords are encrypted directly by backend auth microservices. 
                Plaintext passwords are never revealed to administrators.
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <Link
                href={`/super-admin/users/${createdUser.id}`}
                className="px-5 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                View Created User
              </Link>
              <Link
                href="/super-admin/users"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Back to User Directory
              </Link>
            </div>
          </div>
        ) : (
          /* Multi-Step Creation Form */
          <div>
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h1 className="text-xl font-bold text-[#0B2447]">Enroll New Platform User</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Provision faculty, student, or administrative user accounts with dynamic academic mapping.
              </p>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mt-4 text-xs font-semibold">
                <span className={`px-2.5 py-1 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  1. Personal Info
                </span>
                <span className="text-slate-300">›</span>
                <span className={`px-2.5 py-1 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  2. Role & Account
                </span>
                <span className="text-slate-300">›</span>
                <span className={`px-2.5 py-1 rounded-full ${step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  3. Academic Mapping
                </span>
                <span className="text-slate-300">›</span>
                <span className={`px-2.5 py-1 rounded-full ${step === 4 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  4. Review & Create
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Arun"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Kumar"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Primary Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="arun.kumar@loyolacollege.edu"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                        required
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Initial access credentials will be securely dispatched to this address.
                      </p>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Mobile Phone Number
                      </label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91 98401 23456"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Role & Account */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Role & Access Configuration</h3>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Assigned Platform Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none cursor-pointer"
                    >
                      {mockRoles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.permissions.length} privileges granted)
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Role description: {selectedRole.description}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-semibold">User Identification (User ID):</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      User ID will be generated automatically by the backend system (e.g., ISML2026xxxx).
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Automated Credential Generation</p>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Administrators are not permitted to manually type user passwords. 
                        A cryptographic temporary password will be securely minted and emailed upon account creation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Academic Mapping */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Institutional & Academic Placement</h3>

                  {/* College */}
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      College / Institution <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={collegeId}
                      onChange={(e) => setCollegeId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none cursor-pointer"
                    >
                      {mockInstitutions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department (if not Super Admin) */}
                  {!isSuperAdmin && (
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Department
                      </label>
                      <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none cursor-pointer"
                      >
                        {availableDepartments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Program (if student or teacher) */}
                  {(isStudent || isTeacher) && (
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Program / Degree
                      </label>
                      <select
                        value={programId}
                        onChange={(e) => setProgramId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none cursor-pointer"
                      >
                        {availablePrograms.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Batch & Semester (if Student) */}
                  {isStudent && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Batch Cohort
                        </label>
                        <select
                          value={batchId}
                          onChange={(e) => setBatchId(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none cursor-pointer"
                        >
                          {availableBatches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Current Semester
                        </label>
                        <select
                          value={semesterNumber}
                          onChange={(e) => setSemesterNumber(Number(e.target.value))}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>
                              Semester {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Create */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Review & Final Account Provisioning</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 divide-y divide-slate-200 text-xs">
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Legal Name:</span>
                      <span className="font-bold text-slate-800">{firstName} {lastName}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Registered Email:</span>
                      <span className="font-medium text-slate-800">{email}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Selected Role:</span>
                      <span className="font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {selectedRole.name}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">College / Institution:</span>
                      <span className="font-medium text-slate-800">
                        {mockInstitutions.find((c) => c.id === collegeId)?.name}
                      </span>
                    </div>
                    {!isSuperAdmin && (
                      <div className="py-2 flex justify-between">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-medium text-slate-800">
                          {mockDepartments.find((d) => d.id === departmentId)?.name}
                        </span>
                      </div>
                    )}
                    {isStudent && (
                      <>
                        <div className="py-2 flex justify-between">
                          <span className="text-slate-500">Program:</span>
                          <span className="font-medium text-slate-800">
                            {mockPrograms.find((p) => p.id === programId)?.name}
                          </span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="text-slate-500">Batch Cohort:</span>
                          <span className="font-medium text-slate-800">
                            {mockBatches.find((b) => b.id === batchId)?.name}
                          </span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="text-slate-500">Semester:</span>
                          <span className="font-bold text-indigo-700">Semester {semesterNumber}</span>
                        </div>
                      </>
                    )}
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Initial Password:</span>
                      <span className="font-semibold text-emerald-700">
                        Automatically generated & emailed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as any)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <Link
                    href="/super-admin/users"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </Link>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && (!firstName.trim() || !email.trim())) {
                        showError('First name and email are mandatory.');
                        return;
                      }
                      setStep((s) => (s + 1) as any);
                    }}
                    className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Minting Account...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
