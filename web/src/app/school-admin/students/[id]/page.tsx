'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  School,
  Mail,
  Phone,
  Clock,
  BookOpen,
  ArrowLeft,
  Award,
  Layers,
  HeartHandshake,
  CreditCard,
  HelpCircle,
  Lock,
} from 'lucide-react';

export default function SchoolAdminPupilProfilePage() {
  const params = useParams();
  const studentIdParam = params?.id as string;

  const [activeTab, setActiveTab] = useState<
    'ACADEMIC' | 'COURSES' | 'ATTENDANCE' | 'ASSESSMENTS' | 'DOUBTS' | 'PARENT' | 'SECURITY'
  >('ACADEMIC');

  const [pupil, setPupil] = useState<any>({
    name: 'Loading Pupil...',
    studentId: studentIdParam || 'PUPIL-01',
    email: '',
    phone: '',
    status: 'ACTIVE',
  });

  React.useEffect(() => {
    if (studentIdParam) {
      fetch('/api/portals/students?collegeId=SIVA-LIONS')
        .then((r) => r.json())
        .then((json) => {
          if (json && json.data) {
            const found = json.data.find(
              (s: any) =>
                s.id === studentIdParam ||
                s.studentId === studentIdParam ||
                s.studentId?.toLowerCase() === studentIdParam?.toLowerCase()
            );
            if (found) {
              setPupil(found);
            }
          }
        })
        .catch(() => {});
    }
  }, [studentIdParam]);

  const s = pupil;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans px-2 sm:px-0">
      {/* Top Breadcrumb & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/school-admin/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pupil Roster</span>
        </Link>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
          K-12 Pupil Academic Dossier
        </span>
      </div>

      {/* Main Pupil Header Card */}
      <div className="bg-white rounded-3xl border border-emerald-200/90 p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {s.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-emerald-950">{s.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {s.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-1 font-mono">
                <span>Admission: {s.studentId}</span>
                <span>•</span>
                <span className="text-emerald-700 font-sans font-medium">{s.email}</span>
                <span>•</span>
                <span className="text-slate-600 font-sans">{s.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/school-admin/fees"
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Term Fee Clearance</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Counters (All 0) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="p-3.5 sm:p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <span className="text-slate-400 font-bold block text-[11px]">Pupil Attendance</span>
            <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">0%</p>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">0 Periods</span>
          </div>

          <div className="p-3.5 sm:p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <span className="text-slate-400 font-bold block text-[11px]">Enrolled Language</span>
            <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">0</p>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">0 Tracks</span>
          </div>

          <div className="p-3.5 sm:p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <span className="text-slate-400 font-bold block text-[11px]">Section / Grade</span>
            <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">0</p>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">0 Sections</span>
          </div>

          <div className="p-3.5 sm:p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <span className="text-slate-400 font-bold block text-[11px]">Term Tuition Fee</span>
            <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">₹0</p>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">0 Fee Due</span>
          </div>
        </div>

        {/* Responsive Horizontal Navigation Tabs */}
        <div className="flex border-b border-emerald-100 mt-6 gap-2 sm:gap-6 text-xs font-semibold overflow-x-auto scrollbar-none pb-1">
          {[
            { id: 'ACADEMIC', label: 'Academic Hierarchy (0)', icon: Layers },
            { id: 'COURSES', label: 'Courses (0)', icon: BookOpen },
            { id: 'ATTENDANCE', label: 'Attendance Breakdown (0)', icon: Clock },
            { id: 'ASSESSMENTS', label: 'Assessments & Marks (0)', icon: Award },
            { id: 'DOUBTS', label: 'Doubt Clearing Activity (0)', icon: HelpCircle },
            { id: 'PARENT', label: 'Parent & Guardian Portal (0)', icon: HeartHandshake },
            { id: 'SECURITY', label: 'Account Security (0)', icon: Lock },
          ].map((tab) => {
            const IconC = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 px-2 transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <IconC className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── TAB 1: ACADEMIC HIERARCHY ─── */}
      {activeTab === 'ACADEMIC' && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-10 text-center shadow-xs">
          <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Academic Hierarchy (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 academic divisions assigned.
          </p>
        </div>
      )}

      {/* ─── TAB 2: ENROLLED COURSES ─── */}
      {activeTab === 'COURSES' && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-10 text-center shadow-xs">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Courses (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 language courses enrolled for this pupil.
          </p>
        </div>
      )}

      {/* ─── TAB 3: ATTENDANCE BREAKDOWN ─── */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-10 text-center shadow-xs">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Attendance Breakdown (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 periods attended. 0% attendance.
          </p>
        </div>
      )}

      {/* ─── TAB 4: ASSESSMENTS & MARKS ─── */}
      {activeTab === 'ASSESSMENTS' && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-10 text-center shadow-xs">
          <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Assessments & Marks (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 assessments taken. 0 marks recorded.
          </p>
        </div>
      )}

      {/* ─── TAB 5: DOUBT CLEARING ACTIVITY ─── */}
      {activeTab === 'DOUBTS' && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-10 text-center shadow-xs">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Doubt Clearing Activity (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 homework doubts submitted.
          </p>
        </div>
      )}

      {/* ─── TAB 6: PARENT & GUARDIAN PORTAL ─── */}
      {activeTab === 'PARENT' && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-10 text-center shadow-xs">
          <HeartHandshake className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Parent & Guardian Portal (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 parents connected.
          </p>
        </div>
      )}

      {/* ─── TAB 7: ACCOUNT SECURITY ─── */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-10 text-center shadow-xs">
          <Lock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Account Security (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 security flags. 0 locked accounts.
          </p>
        </div>
      )}
    </div>
  );
}
