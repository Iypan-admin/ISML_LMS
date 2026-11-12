// ============================================================================
// ISML COLLEGE LMS — MASTER FEE STRUCTURES & SCHEDULES
// Live Data Driven / Zero Mock Data / Real-time API Synchronized
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Plus,
  Coins,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { FeeStructure, CourseSummary } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';
import CreateFeeStructureDrawer from '@/components/super-admin/finance/CreateFeeStructureDrawer';

export default function FeeStructuresPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();

  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [courseList, setCourseList] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real fee structures and courses from backend API
  const fetchFeesAndCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      // 1. Fetch fee structures
      try {
        const resFees = await fetch('http://localhost:4000/api/portals/finance/fee-structures');
        if (resFees.ok) {
          const data = await resFees.json();
          const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          setStructures(list);
        } else {
          setStructures([]);
        }
      } catch {
        setStructures([]);
      }

      // 2. Fetch live courses
      try {
        const resCourses = await fetch('http://localhost:4000/api/portals/courses');
        if (resCourses.ok) {
          const data = await resCourses.json();
          const list = Array.isArray(data) ? data : (data.courses || []);
          setCourseList(list);
        } else {
          setCourseList([]);
        }
      } catch {
        setCourseList([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeesAndCourses();
  }, [fetchFeesAndCourses]);

  const filteredStructures = useMemo(() => {
    return structures.filter((s: any) => {
      if (!isOverall && s.institutionId && s.institutionId !== selectedCollegeId) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          (s.name || s.code)?.toLowerCase().includes(q) ||
          s.programName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [structures, isOverall, selectedCollegeId, searchQuery]);

  return (
    <div className="space-y-6 pb-8 font-sans">
      <Breadcrumbs
        items={[
          { label: 'Finance', href: '/super-admin/finance' },
          { label: 'Fee Schedules & Courses' },
        ]}
      />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B2447]">
            Fee Schedules & Course Pricing
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Institutional oversight of tuition fee matrices, language program rates, and installment plans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFeesAndCourses}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Fee Schedule</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search fee schedule by name, code, or course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <div>Loading institutional fee structures...</div>
        </div>
      ) : filteredStructures.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Fee Schedules Configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            There are currently no tuition pricing schedules registered. Click &apos;Create Fee Schedule&apos; to initialize one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStructures.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-600">{s.code}</span>
                <StatusBadge status={s.status} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{(s as any).name || s.programName || s.code}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{s.programName || 'Standard Language Program'}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Fee</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{Number(s.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateFeeStructureDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onFeeStructureCreated={() => {
          showSuccess('Fee schedule initialized successfully.');
          fetchFeesAndCourses();
        }}
      />
    </div>
  );
}
