// ============================================================================
// ISML COLLEGE LMS — REPORTS & ANALYTICS
// Permission-Gated Export Capabilities (REPORT_EXPORT)
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  BookOpen,
  Award,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Can } from '@/context/AuthRbacContext';
import { useToast } from '@/context/ToastContext';

interface ReportCard {
  id: string;
  category: string;
  title: string;
  description: string;
  format: 'CSV' | 'XLSX' | 'PDF';
  lastGenerated: string;
}

const availableReports: ReportCard[] = [
  {
    id: 'rep-01',
    category: 'Academic Reports',
    title: 'Department Curriculum & Syllabus Compliance Audit',
    description: 'Complete breakdown of modules, topics, and mapped LSRW skills per subject.',
    format: 'PDF',
    lastGenerated: 'Yesterday, 04:30 PM',
  },
  {
    id: 'rep-02',
    category: 'Attendance Reports',
    title: 'Cohort-Wise NAAC Minimum Attendance Roster (< 75% Risk)',
    description: 'Detailed student list with individual lecture attendance percentages.',
    format: 'XLSX',
    lastGenerated: 'Today, 09:15 AM',
  },
  {
    id: 'rep-03',
    category: 'Result Reports',
    title: 'CIA-1 Mid-Term Grade Distribution & Class Performance',
    description: 'Statistical distribution of marks, top scorers, and failure analytics.',
    format: 'CSV',
    lastGenerated: '06 Oct 2026',
  },
  {
    id: 'rep-04',
    category: 'User Reports',
    title: 'Faculty Active Teaching Hours & Class Delivery Log',
    description: 'Session logs, scheduled vs completed lecture hours per faculty member.',
    format: 'XLSX',
    lastGenerated: '05 Oct 2026',
  },
];

export default function ReportsPage() {
  const { showSuccess } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleExport = (report: ReportCard) => {
    setDownloadingId(report.id);
    setTimeout(() => {
      setDownloadingId(null);
      showSuccess(`Exporting ${report.title} (${report.format}) generated successfully.`);
    }, 700);
  };

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Monitoring' }, { label: 'Reports & Exports' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Institutional Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Export official college rosters, attendance audits, and assessment results.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableReports.map((report) => (
          <div
            key={report.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] border border-blue-200">
                  {report.category}
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {report.format}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#0B2447]">{report.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {report.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Generated: {report.lastGenerated}
              </span>

              <Can
                permission="REPORT_EXPORT"
                fallback={
                  <span className="text-[11px] font-bold text-slate-400 italic">
                    Export restricted to authorized roles
                  </span>
                }
              >
                <button
                  onClick={() => handleExport(report)}
                  disabled={downloadingId === report.id}
                  className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {downloadingId === report.id ? 'Exporting...' : `Export ${report.format}`}
                  </span>
                </button>
              </Can>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
