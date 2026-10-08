// ============================================================================
// ISML COLLEGE LMS — SCHOLARSHIPS & DISCOUNTS MANAGEMENT
// Merit Waivers, Early Bird Concessions & Category Discounts
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  Percent,
  Search,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { mockScholarships } from '@/mock/superAdminData';
import { ScholarshipDiscount } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/context/ToastContext';
import { useRBAC } from '@/context/AuthRbacContext';

export default function ScholarshipsDiscountsPage() {
  const { hasPermission } = useRBAC();
  const { showSuccess, showInfo } = useToast();

  const [discounts, setDiscounts] = useState<ScholarshipDiscount[]>(mockScholarships);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New discount proposal state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [value, setValue] = useState(20);
  const [eligibility, setEligibility] = useState('');
  const [applicableProgram, setApplicableProgram] = useState('All Degree Programs');
  const [applicableBatch, setApplicableBatch] = useState('Cohort 2026');
  const [validUntil, setValidUntil] = useState('2027-06-30');

  const filtered = discounts.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.eligibility.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProposeDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const newPolicy: ScholarshipDiscount = {
      id: `sch-${Date.now()}`,
      name,
      code: code.toUpperCase().replace(/\s+/g, '-'),
      type,
      value,
      eligibility,
      applicableProgram,
      applicableBatch,
      validUntil,
      status: 'APPROVED',
    };

    setDiscounts((prev) => [newPolicy, ...prev]);
    setModalOpen(false);
    showSuccess(`Scholarship policy "${name}" created and authorized.`);
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* ─── 1. Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
              <Percent className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Scholarships & Fee Discounts
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional fee concessions, merit waivers, and eligibility terms governing enrollment billing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Scholarship Policy</span>
        </button>
      </div>

      {/* ─── 2. Search Bar ─── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search scholarship name, policy code, or criteria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>
      </div>

      {/* ─── 3. Cards Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                {item.code}
              </span>
              <StatusBadge status={item.status} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">{item.name}</h2>
              <div className="text-xs font-black text-emerald-600 mt-1">
                {item.type === 'PERCENTAGE' ? `${item.value}% Tuition Waiver` : `₹${item.value.toLocaleString()} Fixed Concession`}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="font-semibold text-slate-700">Eligibility Criteria:</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{item.eligibility}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Cohort: {item.applicableBatch}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Valid Until: {item.validUntil}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Add Modal ─── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Propose Scholarship / Discount Scheme"
        description="Establish criteria for institutional fee waivers."
        maxWidth="md"
      >
        <form onSubmit={handleProposeDiscount} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Scheme Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sports Excellence Tuition Waiver"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Unique Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SPORTS-30"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Concession Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-[#0052CC]"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Waiver Value *</label>
              <input
                type="number"
                required
                min={1}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Valid Until</label>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Eligibility Criteria *</label>
            <textarea
              required
              rows={2}
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="e.g. State / National representation in recognized university athletic events..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-2xs cursor-pointer"
            >
              Authorize Scheme
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
