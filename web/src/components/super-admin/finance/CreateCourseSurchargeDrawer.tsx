// ============================================================================
// ISML COLLEGE LMS — CREATE COURSE SURCHARGE DRAWER
// Specialized Course Lab Surcharges & Certification Exam Pricing
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, X, Plus, Sparkles, ShieldCheck, IndianRupee } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export interface CourseFeeEntry {
  courseId: string;
  courseCode: string;
  courseName: string;
  department: string;
  certificationFee: number;
  labLicensingFee: number;
  totalCourseSurcharge: number;
  enrolledStudents: number;
  status: string;
}

interface CreateCourseSurchargeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSurchargeCreated: (newEntry: CourseFeeEntry) => void;
  editSurcharge?: CourseFeeEntry | null;
  onSurchargeUpdated?: (updated: CourseFeeEntry) => void;
}

export default function CreateCourseSurchargeDrawer({
  isOpen,
  onClose,
  onSurchargeCreated,
  editSurcharge,
  onSurchargeUpdated,
}: CreateCourseSurchargeDrawerProps) {
  const { showSuccess, showError } = useToast();
  const isEditMode = Boolean(editSurcharge);

  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [department, setDepartment] = useState('Department of Computer Science & IT');
  const [certificationFee, setCertificationFee] = useState(5000);
  const [labLicensingFee, setLabLicensingFee] = useState(2500);

  useEffect(() => {
    if (isOpen) {
      if (editSurcharge) {
        setCourseCode(editSurcharge.courseCode);
        setCourseName(editSurcharge.courseName);
        setDepartment(editSurcharge.department);
        setCertificationFee(editSurcharge.certificationFee);
        setLabLicensingFee(editSurcharge.labLicensingFee);
      } else {
        setCourseCode('');
        setCourseName('');
        setDepartment('Department of Computer Science & IT');
        setCertificationFee(5000);
        setLabLicensingFee(2500);
      }
    }
  }, [isOpen, editSurcharge]);

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
    if (!courseCode.trim() || !courseName.trim()) {
      showError('Please provide course code and course title.');
      return;
    }

    const total = Number(certificationFee) + Number(labLicensingFee);

    if (isEditMode && editSurcharge) {
      const updated: CourseFeeEntry = {
        ...editSurcharge,
        courseCode: courseCode.trim().toUpperCase(),
        courseName: courseName.trim(),
        department,
        certificationFee: Number(certificationFee),
        labLicensingFee: Number(labLicensingFee),
        totalCourseSurcharge: total,
      };
      onSurchargeUpdated?.(updated);
      showSuccess(`Course surcharge updated for ${updated.courseCode}.`);
      onClose();
      return;
    }

    const newEntry: CourseFeeEntry = {
      courseId: `crs-${Date.now().toString().slice(-4)}`,
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      department,
      certificationFee: Number(certificationFee),
      labLicensingFee: Number(labLicensingFee),
      totalCourseSurcharge: total,
      enrolledStudents: 0,
      status: 'APPROVED',
    };

    onSurchargeCreated(newEntry);
    showSuccess(`Course surcharge of ₹${total.toLocaleString('en-IN')} added for ${newEntry.courseCode}.`);
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
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform ease-out duration-300 border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Course Surcharge' : 'Add Course Surcharge'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {isEditMode
                    ? 'Update lab licensing & certification exam pricing'
                    : 'Lab licensing & international exam fees'}
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
                Course Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS-CLOUD-302"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Course Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud DevOps Engineering & Kubernetes"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                <option value="Department of Computer Science & IT">Department of Computer Science & IT</option>
                <option value="Department of Foreign Languages (ISML)">Department of Foreign Languages (ISML)</option>
                <option value="Department of Commerce & Management">Department of Commerce & Management</option>
                <option value="Department of Data Science & AI">Department of Data Science & AI</option>
                <option value="Department of Physics & Electronics">Department of Physics & Electronics</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Certification Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={certificationFee}
                    onChange={(e) => setCertificationFee(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lab Licensing Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={labLicensingFee}
                    onChange={(e) => setLabLicensingFee(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Total Calculation Card */}
            <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Certification Examination:</span>
                <span className="font-bold text-slate-800">₹{certificationFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Lab & Cloud Sandbox Licensing:</span>
                <span className="font-bold text-slate-800">₹{labLicensingFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-blue-200 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0052CC]">Total Surcharge per Enrollee:</span>
                <span className="text-sm font-black text-blue-900">
                  ₹{(Number(certificationFee) + Number(labLicensingFee)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Course surcharges will be automatically appended to the student invoice upon enrollment in this specialized course module.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isEditMode ? 'Update Surcharge' : 'Save Course Surcharge'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
