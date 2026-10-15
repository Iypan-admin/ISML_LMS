// ============================================================================
// ISML COLLEGE LMS — CREATE / EDIT ACADEMIC YEAR DRAWER
// Multi-Year Cycle Definition, Commencement/Conclusion Windows & Status
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, X, Plus, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export interface AcademicYearItem {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
}

interface CreateAcademicYearDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onYearCreated: (newYear: AcademicYearItem) => void;
  editYear?: AcademicYearItem | null;
  onYearUpdated?: (year: AcademicYearItem) => void;
}

export default function CreateAcademicYearDrawer({
  isOpen,
  onClose,
  onYearCreated,
  editYear,
  onYearUpdated,
}: CreateAcademicYearDrawerProps) {
  const { showSuccess, showError } = useToast();
  const isEditMode = Boolean(editYear);

  const [startYear, setStartYear] = useState<number>(2026);
  const [endYear, setEndYear] = useState<number>(2027);
  const [name, setName] = useState('Academic Year 2026–2027');
  const [code, setCode] = useState('AY-2026-2027');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2027-06-30');
  const [isCurrent, setIsCurrent] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'UPCOMING' | 'COMPLETED'>('ACTIVE');

  // Sync title and code whenever startYear changes in create mode
  const handleStartYearChange = (year: number) => {
    setStartYear(year);
    const nextYear = year + 1;
    setEndYear(nextYear);
    setName(`Academic Year ${year}–${nextYear}`);
    setCode(`AY-${year}-${nextYear}`);
    setStartDate(`${year}-07-01`);
    setEndDate(`${nextYear}-06-30`);
  };

  useEffect(() => {
    if (isOpen) {
      if (editYear) {
        setName(editYear.name);
        setCode(editYear.code);
        setStartDate(editYear.startDate);
        setEndDate(editYear.endDate);
        setIsCurrent(editYear.isCurrent);
        setStatus(editYear.status);
        const match = editYear.code.match(/\d{4}/g);
        if (match && match.length >= 2) {
          setStartYear(Number(match[0]));
          setEndYear(Number(match[1]));
        }
      } else {
        setStartYear(2028);
        setEndYear(2029);
        setName('Academic Year 2028–2029');
        setCode('AY-2028-2029');
        setStartDate('2028-07-01');
        setEndDate('2029-06-30');
        setIsCurrent(false);
        setStatus('UPCOMING');
      }
    }
  }, [isOpen, editYear]);

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
    if (!name.trim()) {
      showError('Please provide academic year title.');
      return;
    }
    if (!code.trim()) {
      showError('Please provide academic cycle code.');
      return;
    }
    if (startDate >= endDate) {
      showError('Conclusion date must be after commencement date.');
      return;
    }

    if (isEditMode && editYear) {
      const updatedYear: AcademicYearItem = {
        ...editYear,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        startDate,
        endDate,
        isCurrent,
        status,
      };
      if (onYearUpdated) {
        onYearUpdated(updatedYear);
      }
      showSuccess(`Academic Year "${updatedYear.name}" updated successfully.`);
      onClose();
      return;
    }

    const newYear: AcademicYearItem = {
      id: `ay-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      startDate,
      endDate,
      isCurrent,
      status,
    };

    onYearCreated(newYear);
    showSuccess(`Academic Year "${newYear.name}" configured successfully.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform ease-out duration-300 border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Academic Year Cycle' : 'New Academic Year Cycle'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Institutional calendar window, commencement & admissions term
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Quick Year Range Selector */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0052CC] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Calendar Year Span</span>
                </label>
                <span className="text-[11px] font-bold text-blue-900">
                  {startYear} – {endYear}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Start Year
                  </label>
                  <select
                    value={startYear}
                    onChange={(e) => handleStartYearChange(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#0052CC]"
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    End Year
                  </label>
                  <input
                    type="number"
                    value={endYear}
                    readOnly
                    className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Academic Year Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Academic Year Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Academic Year 2026–2027"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            {/* Academic Cycle Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cycle Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. AY-2026-2027"
                className="w-full px-3 py-2 font-mono uppercase font-bold bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            {/* Commencement & Conclusion Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Commencement Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Conclusion Date *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>
            </div>

            {/* Cycle Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cycle Operational Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'UPCOMING' | 'COMPLETED')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                <option value="ACTIVE">🟢 Active (Current In-Session Cycle)</option>
                <option value="UPCOMING">🔵 Upcoming (Admissions Open Cycle)</option>
                <option value="COMPLETED">⚪ Completed (Past Historic Cycle)</option>
              </select>
            </div>

            {/* Is Current Active Toggle */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Set as Primary Active Year</p>
                <p className="text-[11px] text-slate-500">Default cycle for current admissions & fees</p>
              </div>
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => {
                  setIsCurrent(e.target.checked);
                  if (e.target.checked) setStatus('ACTIVE');
                }}
                className="w-4 h-4 rounded text-[#0052CC] focus:ring-[#0052CC] cursor-pointer"
              />
            </div>

            {/* Buttons */}
            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Update Academic Year' : 'Create Academic Year'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
