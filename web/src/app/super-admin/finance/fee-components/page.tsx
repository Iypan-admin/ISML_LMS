// ============================================================================
// ISML COLLEGE LMS — MASTER FEE COMPONENTS
// Centralized Catalog: Tuition, Lab, Exam, Library, Technology, and Transport
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  Coins,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Tag,
  Layers,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { mockFeeComponents } from '@/mock/superAdminData';
import { FeeComponent } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/context/ToastContext';
import { useRBAC } from '@/context/AuthRbacContext';

export default function FeeComponentsPage() {
  const { hasPermission } = useRBAC();
  const { showSuccess, showWarning, showError } = useToast();

  const [components, setComponents] = useState<FeeComponent[]>(mockFeeComponents);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<FeeComponent | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [defaultAmount, setDefaultAmount] = useState<number>(5000);
  const [frequency, setFrequency] = useState<'SEMESTER' | 'ANNUAL' | 'ONE_TIME'>('SEMESTER');
  const [isMandatory, setIsMandatory] = useState(true);

  const canCreate = hasPermission('FEE_COMPONENT_CREATE');
  const canUpdate = hasPermission('FEE_COMPONENT_UPDATE');

  const filteredComponents = components.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingComponent(null);
    setName('');
    setCode('');
    setDescription('');
    setDefaultAmount(5000);
    setFrequency('SEMESTER');
    setIsMandatory(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (comp: FeeComponent) => {
    setEditingComponent(comp);
    setName(comp.name);
    setCode(comp.code);
    setDescription(comp.description);
    setDefaultAmount(comp.defaultAmount);
    setFrequency(comp.frequency);
    setIsMandatory(comp.isMandatory);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      showError('Please provide both component name and unique code.');
      return;
    }

    if (editingComponent) {
      setComponents((prev) =>
        prev.map((c) =>
          c.id === editingComponent.id
            ? {
                ...c,
                name,
                code: code.toUpperCase().replace(/\s+/g, '_'),
                description,
                defaultAmount,
                frequency,
                isMandatory,
              }
            : c
        )
      );
      showSuccess(`Fee component "${name}" updated successfully.`);
    } else {
      const newComp: FeeComponent = {
        id: `comp-${Date.now()}`,
        code: code.toUpperCase().replace(/\s+/g, '_'),
        name,
        description,
        defaultAmount,
        frequency,
        isMandatory,
        status: 'ACTIVE',
      };
      setComponents((prev) => [newComp, ...prev]);
      showSuccess(`Fee component "${name}" added to master catalog.`);
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* ─── 1. Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Coins className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Master Fee Components Catalog
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Standardized line items reused across institutional program fee schedules.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Fee Component</span>
          </button>
        )}
      </div>

      {/* ─── 2. Search Bar ─── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by component title, code (e.g. TUITION_FEE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>
      </div>

      {/* ─── 3. Components Table ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">Component Code</th>
                <th className="py-3 px-4">Component Name & Purpose</th>
                <th className="py-3 px-4">Billing Frequency</th>
                <th className="py-3 px-4">Requirement</th>
                <th className="py-3 px-4 text-right">Default Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComponents.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                      {comp.code}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{comp.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed max-w-md">
                      {comp.description}
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0052CC]">
                      {comp.frequency}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        comp.isMandatory
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {comp.isMandatory ? 'Mandatory' : 'Optional'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                    ₹{comp.defaultAmount.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={comp.status} />
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {canUpdate && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(comp)}
                        className="p-1.5 text-slate-600 hover:text-[#0052CC] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit component"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add/Edit Modal (Zero Native Alerts) ─── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingComponent ? 'Edit Fee Component' : 'Add Master Fee Component'}
        description="Configure standardized billing component line items for college programs."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Component Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Continuous Internal Assessment Fee"
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
                placeholder="e.g., CIA_EXAM_FEE"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Default Amount (INR) *</label>
              <input
                type="number"
                required
                min={0}
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Billing Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-[#0052CC]"
              >
                <option value="SEMESTER">Per Semester</option>
                <option value="ANNUAL">Per Academic Year</option>
                <option value="ONE_TIME">One Time (Admission)</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                  className="rounded text-[#0052CC] focus:ring-[#0052CC]"
                />
                <span className="font-semibold text-slate-700">Mandatory Line Item</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Description & Purpose</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what campus facility, lab, or academic service this component covers..."
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
              {editingComponent ? 'Save Changes' : 'Create Component'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
