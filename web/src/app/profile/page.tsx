"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, LogOut, AlertTriangle, LogOut as LogOutIcon } from 'lucide-react';
import { currentStudent } from '@/mock/students';

export default function ProfilePage() {
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  return (
    <div className="space-y-6 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <User className="w-4 h-4 text-[#0052CC]" />
          <span>Student Account Profile & Settings</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Student Profile</h1>
        <p className="text-xs text-slate-600">
          Manage your personal details, academic enrollment credentials, active devices, and account security.
        </p>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-[#0052CC] shadow-md">
            <Image src={currentStudent.avatarUrl} alt={currentStudent.name} fill className="object-cover" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#0B2447]">{currentStudent.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{currentStudent.rollNo}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-[#0052CC] text-xs font-bold rounded-full border border-blue-200">
              {currentStudent.enrolledCourse} ({currentStudent.subLevel})
            </span>
          </div>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-2 text-left">
            <p className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-800">{currentStudent.email}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500">Academic Year:</span>
              <span className="font-semibold text-slate-800">{currentStudent.academicYear}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500">Main Tutor:</span>
              <span className="font-semibold text-[#0052CC]">{currentStudent.mainTutor}</span>
            </p>
          </div>

          {/* Relative Button Container for Floating Popover */}
          <div className="relative">
            <button
              onClick={() => setShowSignOutModal(!showSignOutModal)}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out of Portal
            </button>

            {/* 🔴 COMPACT FLOATING SIGN OUT POPOVER */}
            {showSignOutModal && (
              <div className="absolute bottom-full left-0 right-0 mb-2.5 p-4 bg-white rounded-2xl border border-rose-200 shadow-2xl z-40 space-y-3 font-sans animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-extrabold text-[#0B2447]">Sign Out of Portal?</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Are you sure you want to log out?</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => setShowSignOutModal(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <LogOutIcon className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Academic Tenant Details & Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* College Tenant Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#0B2447] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0052CC]" /> Your Institution & Campus
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-0.5">
                <span className="text-slate-500 font-medium">Institution Name</span>
                <p className="font-bold text-slate-800 text-sm">{currentStudent.collegeName}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-0.5">
                <span className="text-slate-500 font-medium">Physical Campus</span>
                <p className="font-bold text-slate-800">{currentStudent.campusName}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-0.5">
                <span className="text-slate-500 font-medium">Department</span>
                <p className="font-bold text-slate-800">{currentStudent.department}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-0.5">
                <span className="text-slate-500 font-medium">Assigned Batch</span>
                <p className="font-bold text-[#0052CC]">{currentStudent.batchName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
