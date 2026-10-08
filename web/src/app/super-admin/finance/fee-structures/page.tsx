// ============================================================================
// ISML COLLEGE LMS — FEE STRUCTURES MANAGEMENT
// Versioned Fee Schedules, Component Line Items, Effective Dates & Approvals
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  History,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { mockFeeStructures, mockPrograms, mockDepartments } from '@/mock/superAdminData';
import { FeeStructure } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { Modal } from '@/components/common/Modal';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import { useToast } from '@/context/ToastContext';
import { useRBAC } from '@/context/AuthRbacContext';
import CreateFeeStructureDrawer from '@/components/super-admin/finance/CreateFeeStructureDrawer';

export default function FeeStructuresPage() {
  const { hasPermission } = useRBAC();
  const { showSuccess, showInfo } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();

  const [structures, setStructures] = useState<FeeStructure[]>(mockFeeStructures);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeStructure | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('fee-bsc-s1');

  const handleFeeStructureCreated = (newStructure: FeeStructure) => {
    setStructures((prev) => [newStructure, ...prev]);
    setExpandedId(newStructure.id);
  };

  const handleFeeStructureUpdated = (updatedStructure: FeeStructure) => {
    setStructures((prev) =>
      prev.map((s) => (s.id === updatedStructure.id ? updatedStructure : s))
    );
    setEditingStructure(null);
  };

  const handleDeleteFeeStructure = () => {
    if (!deleteTarget) return;
    setStructures((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    showSuccess(`Fee schedule ${deleteTarget.code} deleted successfully.`);
    setDeleteTarget(null);
  };

  // Detail Modal for Version History & Audit Trail
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null);

  // Filtered Structures
  const filtered = structures.filter((item) => {
    const matchesSearch =
      item.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSemester =
      selectedSemester === 'ALL' || item.semesterNumber.toString() === selectedSemester;

    if (!isOverall) {
      const prog = mockPrograms.find((p) => p.name.toLowerCase() === item.programName.toLowerCase());
      const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
      if (dept?.institutionId && dept.institutionId !== selectedCollegeId) {
        return false;
      }
    }

    return matchesSearch && matchesSemester;
  });

  const handleOpenDetails = (structure: FeeStructure) => {
    setSelectedStructure(structure);
    setDetailModalOpen(true);
  };

  const handleRequestNewVersion = (structure: FeeStructure) => {
    showInfo(
      `New revision request logged for ${structure.code}. A notification has been dispatched to the Finance Manager to prepare Version ${structure.version + 1}.`
    );
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      <Breadcrumbs
        items={[{ label: 'Finance', href: '/super-admin/finance' }, { label: 'Fee Structures' }]}
      />

      <CollegeFilterBar />

      {/* ─── 1. Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Institutional Fee Structures
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Version-controlled term fee schedules with granular component breakdowns and authorization audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/super-admin/finance/approvals"
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Finance Approvals</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setEditingStructure(null);
              setIsCreateOpen(true);
            }}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Fee Schedule</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Search & Filters ─── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by program, schedule code, or cohort batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:ring-1 focus:ring-[#0052CC] font-medium"
          >
            <option value="ALL">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
          </select>
        </div>
      </div>

      {/* ─── 3. Fee Structure Cards with Expandable Components Breakdown ─── */}
      <div className="space-y-4">
        {filtered.map((structure) => {
          const isExpanded = expandedId === structure.id;

          return (
            <div
              key={structure.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
            >
              {/* Card Header Summary */}
              <div
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer bg-slate-50/40 hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : structure.id)}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                      {structure.code}
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] border border-blue-200">
                      Version {structure.version}.0
                    </span>
                    <StatusBadge status={structure.status} />
                  </div>

                  <h2 className="text-sm font-bold text-slate-900 mt-1">
                    {structure.programName} — Semester {structure.semesterNumber}
                  </h2>

                  <p className="text-xs text-slate-500">
                    Department: <span className="text-slate-700 font-semibold">{structure.departmentName}</span> • Cohort: {structure.batchName} ({structure.academicYear})
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Effective: {structure.effectiveFrom} to {structure.effectiveTo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-400 font-medium">Total Term Fee</div>
                    <div className="text-lg font-black text-slate-900">
                      ₹{structure.totalAmount.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(structure)}
                      className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingStructure(structure)}
                      className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Edit Fee Schedule"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRequestNewVersion(structure)}
                      className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Request Finance Manager to draft a new version"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Revise</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(structure)}
                      className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Fee Schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : structure.id)}
                      className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                      aria-label="Toggle components view"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Components Breakdown Table (Rule #25) */}
              {isExpanded && (
                <div className="border-t border-slate-200 p-4 sm:p-5 bg-white">
                  <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                    <Receipt className="w-4 h-4 text-[#0052CC]" />
                    Component Itemization Breakdown ({structure.components.length} Line Items)
                  </h3>

                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="py-2.5 px-3">Component Name</th>
                          <th className="py-2.5 px-3">Component Code</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {structure.components.map((comp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {comp.componentName}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                              {comp.componentCode}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  comp.isOptional
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {comp.isOptional ? 'Optional' : 'Mandatory'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              ₹{comp.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50/80 font-black border-t border-slate-200">
                          <td colSpan={3} className="py-2.5 px-3 text-slate-700">
                            Total Approved Fee per Student
                          </td>
                          <td className="py-2.5 px-3 text-right text-sm text-[#0052CC]">
                            ₹{structure.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                    <div>
                      Submitted by: <strong>{structure.submittedBy}</strong>
                      {structure.submittedAt && ` on ${new Date(structure.submittedAt).toLocaleDateString()}`}
                    </div>
                    {structure.approvedBy && (
                      <div className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Authorized by: {structure.approvedBy}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Detail & Version History Modal ─── */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedStructure?.code || 'Fee Schedule Details'}
        description={`${selectedStructure?.programName} • Semester ${selectedStructure?.semesterNumber}`}
        maxWidth="lg"
      >
        {selectedStructure && (
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Academic Year</span>
                <p className="font-semibold text-slate-800">{selectedStructure.academicYear}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Target Cohort</span>
                <p className="font-semibold text-slate-800">{selectedStructure.batchName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Effective Window</span>
                <p className="font-semibold text-slate-800">
                  {selectedStructure.effectiveFrom} to {selectedStructure.effectiveTo}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Current Version</span>
                <p className="font-semibold text-slate-800">Version {selectedStructure.version}.0</p>
              </div>
            </div>

            {/* Version History Table (Rule #30) */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                Version Audit History
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="p-3 bg-white flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">v{selectedStructure.version}.0 (Current)</span>
                    <p className="text-[11px] text-slate-500">
                      Total: ₹{selectedStructure.totalAmount.toLocaleString()} • Approved & Active
                    </p>
                  </div>
                  <StatusBadge status={selectedStructure.status} />
                </div>
                {selectedStructure.version > 1 && (
                  <div className="p-3 bg-slate-50 flex items-center justify-between text-slate-500">
                    <div>
                      <span className="font-bold text-slate-700">v1.0 (Archived Revision)</span>
                      <p className="text-[11px] text-slate-400">
                        Total: ₹{(selectedStructure.totalAmount - 3000).toLocaleString()} • Replaced by v2.0
                      </p>
                    </div>
                    <StatusBadge status="ARCHIVED" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Right-Side Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteFeeStructure}
        entityType="Institutional Fee Schedule"
        entityName={deleteTarget?.code}
      />

      {/* Create / Edit Fee Schedule Right-Side Drawer */}
      <CreateFeeStructureDrawer
        isOpen={isCreateOpen || !!editingStructure}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingStructure(null);
        }}
        onFeeStructureCreated={handleFeeStructureCreated}
        editFeeStructure={editingStructure}
        onFeeStructureUpdated={handleFeeStructureUpdated}
      />
    </div>
  );
}
