"use client";

import React, { useState } from 'react';
import {
  X,
  Send,
  BookOpen,
  Layers,
  FileCheck2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Building2,
  School,
  GraduationCap
} from 'lucide-react';
import { useCollege } from '@/context/CollegeContext';

interface SubmitAcademicRequestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courses: { id: string; code: string; name: string }[];
  batches: { id: string; name: string; courseId?: string }[];
  onSubmitted: () => void;
}

export default function SubmitAcademicRequestDrawer({
  isOpen,
  onClose,
  courses,
  batches,
  onSubmitted,
}: SubmitAcademicRequestDrawerProps) {
  const { institutions, isSchoolMode, selectedCollegeId } = useCollege();

  const [requestType, setRequestType] = useState('COURSE_CREATION');
  const [category, setCategory] = useState<'TUTOR_REQUEST' | 'EXAM_ASSESSMENT' | 'EVALUATION_RESULT' | 'ATTENDANCE_LOCK' | 'SUBSTITUTE_SWAP'>('EXAM_ASSESSMENT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');
  const [proposedDetails, setProposedDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institutionId, setInstitutionId] = useState(selectedCollegeId || 'inst-01');

  if (!isOpen) return null;

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a proposal/request title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        requestType,
        title: title.trim(),
        description: description.trim(),
        entityType: requestType === 'COURSE_CREATION' ? 'COURSE' : requestType === 'BATCH_ALLOCATION' ? 'BATCH' : 'ASSESSMENT',
        courseId: currentCourse?.id,
        courseCode: currentCourse?.code || 'GEN-101',
        courseName: currentCourse?.name || 'General Course',
        batchId: currentBatch?.id,
        batchName: currentBatch?.name || 'All Cohorts',
        category,
        urgency: priority,
        priority,
        institutionId: institutionId || 'inst-01',
        requestedByUserId: 'Academic Manager',
        submittedBy: {
          name: 'Academic Coordinator',
          role: 'Academic Manager',
          email: 'academics@isml.edu',
        },
        details: {
          evidenceOrRemarks: proposedDetails,
          scoreSummary: proposedDetails,
          duration: 'Current Academic Term',
        },
      };

      const res = await fetch('https://ismllms-production.up.railway.app/api/portals/approvals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to submit approval request');

      onSubmitted();
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setProposedDetails('');
    } catch (err: any) {
      alert(err.message || 'Error submitting proposal to Super Admin Desk');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0052CC]">
                Academic Executive Desk
              </span>
            </div>
            <h2 className="text-base font-black text-[#0B2447] mt-0.5">
              Submit Proposal for Super Admin Sign-Off
            </h2>
            <p className="text-xs text-slate-500">
              This request will immediately register on the Super Admin Dashboard and Approval Desk.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Request Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Approval Request Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'COURSE_CREATION', label: 'Course & Syllabus Sign-Off', cat: 'EXAM_ASSESSMENT' },
                { id: 'TUTOR_ASSIGNMENT', label: 'Tutor / Faculty Allocation', cat: 'TUTOR_REQUEST' },
                { id: 'EXAM_BLUEPRINT', label: 'Exam Blueprint & Grading', cat: 'EXAM_ASSESSMENT' },
                { id: 'ATTENDANCE_LOCK', label: 'Attendance Lock & Sign-Off', cat: 'ATTENDANCE_LOCK' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setRequestType(opt.id);
                    setCategory(opt.cat as any);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    requestType === opt.id
                      ? 'bg-blue-50/80 border-[#0052CC] text-[#0052CC] ring-1 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Affiliated Institution Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Campus / Institution *
            </label>
            <select
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            >
              {institutions && institutions.length > 0 ? (
                institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.type === 'SCHOOL' ? '🏫 ' : '🎓 '} {inst.name} ({inst.code})
                  </option>
                ))
              ) : (
                <option value="inst-01">Main Campus — Delhi Public School Coimbatore</option>
              )}
            </select>
          </div>

          {/* Course Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Foreign Language Track *
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Batch / Cohort *
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                <option value="">All Batches Combined</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Proposal Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Proposal / Request Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., German B1 Curriculum & Assessment Schedule Authorization"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Urgency / Executive Priority *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'NORMAL', label: 'Normal Priority', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
                { id: 'HIGH', label: 'High Priority', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
                { id: 'CRITICAL', label: 'Critical / Urgent', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id as any)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                    priority === p.id
                      ? `${p.bg} ring-2 ring-[#0052CC]/30 font-black`
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Justification / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Scope & Academic Justification *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, trainer availability, syllabus objectives, and rationale for executive authorization..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          {/* Operational Details / Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Technical Specifications / Evidence Summary (Optional)
            </label>
            <textarea
              rows={2}
              value={proposedDetails}
              onChange={(e) => setProposedDetails(e.target.value)}
              placeholder="e.g., Evaluation scheme: 40% Continuous Viva, 60% Final Proctored Exam. Tutor: Jay (Lead Trainer)."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Transmitting Proposal...' : 'Submit to Super Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
