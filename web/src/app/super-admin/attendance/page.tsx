// ============================================================================
// ISML COLLEGE LMS — ATTENDANCE MONITORING
// Department, Program & Cohort-wise Attendance Rates
// ============================================================================

"use client";

import React, { useState } from 'react';
import { UserCheck, Users, Calendar, Filter, ArrowUpRight } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatCard from '@/components/common/StatCard';
import { AttendanceRecord } from '@/types/rbac';
import { mockAttendanceRecords } from '@/mock/superAdminData';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';

export default function AttendancePage() {
  const { selectedCollegeId, isOverall } = useCollege();
  const [records] = useState<AttendanceRecord[]>(mockAttendanceRecords);

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'program',
      header: 'Program & Cohort',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs">{row.program}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.batch}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => <span className="text-xs font-semibold text-slate-700">{row.department}</span>,
    },
    {
      key: 'totalStudents',
      header: 'Enrolled',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-800 text-xs">{row.totalStudents}</span>,
    },
    {
      key: 'presentCount',
      header: 'Present / Absent',
      render: (row) => (
        <span className="text-xs">
          <strong className="text-emerald-600">{row.presentCount}</strong> /{' '}
          <span className="text-rose-600 font-medium">{row.absentCount}</span>
        </span>
      ),
    },
    {
      key: 'attendancePercentage',
      header: 'Attendance %',
      sortable: true,
      render: (row) => {
        const isGood = row.attendancePercentage >= 90;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-bold text-xs ${
                isGood ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
              } px-2 py-0.5 rounded-full border ${isGood ? 'border-emerald-200' : 'border-amber-200'}`}
            >
              {row.attendancePercentage}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'lastUpdated',
      header: 'Recorded At',
      render: (row) => (
        <span className="text-[11px] text-slate-400">
          {new Date(row.lastUpdated).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Monitoring' }, { label: 'Attendance' }]} />

      <CollegeFilterBar />

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
          College Attendance Tracker
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          High-level institutional monitoring for college regulatory & NAAC attendance benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Overall Attendance"
          value="91.2%"
          icon={UserCheck}
          subtext="Campus Average This Term"
          trend={{ value: '+1.8%', isPositive: true }}
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Total Headcount"
          value="3,840"
          icon={Users}
          subtext="Students on roster"
          iconColor="text-[#0052CC]"
        />
        <StatCard
          title="Present Today"
          value="3,502"
          icon={UserCheck}
          subtext="Verified in live classes"
          iconColor="text-cyan-600"
        />
        <StatCard
          title="Attendance Risk"
          value="48"
          icon={Users}
          subtext="Students < 75% threshold"
          trend={{ value: 'NAAC Review', isPositive: false }}
          iconColor="text-rose-600"
        />
      </div>

      <DataTable
        data={records}
        columns={columns}
        rowKey={(row) => `${row.program}-${row.batch}`}
        searchPlaceholder="Search cohort, department, program..."
        searchKey={(row) => `${row.program} ${row.batch} ${row.department}`}
      />
    </div>
  );
}
