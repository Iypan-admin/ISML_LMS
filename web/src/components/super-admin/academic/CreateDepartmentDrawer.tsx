// ============================================================================
// ISML COLLEGE LMS — CREATE DEPARTMENT DRAWER
// Academic Department Provisioning & HOD Allocation
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { Network, X, Plus, Sparkles, User, Mail, Hash, Users, Building2 } from 'lucide-react';
import { Department } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';

interface CreateDepartmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onDepartmentCreated: (newDept: Department) => void;
  editDepartment?: Department | null;
  onDepartmentUpdated?: (dept: Department) => void;
}

export default function CreateDepartmentDrawer({
  isOpen,
  onClose,
  onDepartmentCreated,
  editDepartment,
  onDepartmentUpdated,
}: CreateDepartmentDrawerProps) {
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hodName, setHodName] = useState('');
  const [hodEmail, setHodEmail] = useState('');
  const [facultyCount, setFacultyCount] = useState(8);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const isEditMode = Boolean(editDepartment);

  useEffect(() => {
    if (isOpen) {
      if (editDepartment) {
        setName(editDepartment.name || '');
        setCode(editDepartment.code || '');
        setHodName(editDepartment.hodName || '');
        setHodEmail(editDepartment.hodEmail || '');
        setFacultyCount(editDepartment.facultyCount || 8);
        setStatus(editDepartment.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');
      } else {
        setName('');
        setCode('');
        setHodName('');
        setHodEmail('');
        setFacultyCount(8);
        setStatus('ACTIVE');
      }
    }
  }, [isOpen, editDepartment]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !hodName.trim() || !hodEmail.trim()) {
      showError('Please fill in all mandatory department fields.');
      return;
    }

    if (isEditMode && editDepartment) {
      const updatedDept: Department = {
        ...editDepartment,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        hodName: hodName.trim(),
        hodEmail: hodEmail.trim().toLowerCase(),
        facultyCount: Number(facultyCount) || 0,
        status,
      };
      if (onDepartmentUpdated) {
        onDepartmentUpdated(updatedDept);
      }
      showSuccess(`Department "${updatedDept.name}" (${updatedDept.code}) updated successfully.`);
      onClose();
      return;
    }

    const newDept: Department = {
      id: `dept-${Date.now().toString().slice(-4)}`,
      institutionId: 'inst-01',
      name: name.trim(),
      code: code.trim().toUpperCase(),
      hodName: hodName.trim(),
      hodEmail: hodEmail.trim().toLowerCase(),
      programsCount: 0,
      facultyCount: Number(facultyCount) || 0,
      studentsCount: 0,
      status,
      createdAt: new Date().toISOString(),
    };

    onDepartmentCreated(newDept);
    showSuccess(`Department "${newDept.name}" (${newDept.code}) created successfully.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform ease-out duration-300 border-l border-slate-200">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Academic Department' : 'Create Academic Department'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isEditMode ? 'Modify departmental unit details & HOD assignment' : 'Establish departmental unit & assign Head of Department'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Department of Artificial Intelligence & Data Science"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department Code *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. AIDS"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Initial Faculty Count
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={facultyCount}
                    onChange={(e) => setFacultyCount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-[#0B2447] flex items-center gap-1.5 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-[#0052CC]" />
                Head of Department (HOD) Assignment
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  HOD Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Soundararajan, Ph.D."
                  value={hodName}
                  onChange={(e) => setHodName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  HOD Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. hod.aids@loyolacollege.edu"
                    value={hodEmail}
                    onChange={(e) => setHodEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department Operational Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                <option value="ACTIVE">ACTIVE (Accepting Program Allocations)</option>
                <option value="INACTIVE">INACTIVE (Setup in Progress)</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-800 leading-relaxed">
              Once created, programs and degree courses can be immediately linked to this department under the Academic Programs module.
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 sm:px-5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isEditMode ? 'Update Department' : 'Save Department'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
