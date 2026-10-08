// ============================================================================
// ISML COLLEGE LMS — CREATE ACADEMIC MODULE DRAWER
// Curriculum Units, Estimated Hours & Coursework Planning
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { Layers, X, Plus, Sparkles, BookOpen, Clock, FileText } from 'lucide-react';
import { AcademicModule } from '@/types/rbac';
import { mockSubjects } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateModuleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onModuleCreated: (newModule: AcademicModule) => void;
  editModule?: AcademicModule | null;
  onModuleUpdated?: (module: AcademicModule) => void;
}

export default function CreateModuleDrawer({
  isOpen,
  onClose,
  onModuleCreated,
  editModule,
  onModuleUpdated,
}: CreateModuleDrawerProps) {
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(editModule);

  const [selectedSubjectId, setSelectedSubjectId] = useState(mockSubjects[0]?.id || 'sub-01');
  const [moduleNumber, setModuleNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(12);

  useEffect(() => {
    if (isOpen) {
      if (editModule) {
        setSelectedSubjectId(editModule.subjectId);
        setModuleNumber(editModule.moduleNumber);
        setTitle(editModule.title);
        setDescription(editModule.description);
        setEstimatedHours(editModule.estimatedHours);
      } else {
        setSelectedSubjectId(mockSubjects[0]?.id || 'sub-01');
        setModuleNumber(1);
        setTitle('');
        setDescription('');
        setEstimatedHours(12);
      }
    }
  }, [isOpen, editModule]);

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
    if (!title.trim()) {
      showError('Please provide module title.');
      return;
    }

    const sub = mockSubjects.find((s) => s.id === selectedSubjectId);
    const subName = sub ? sub.name : 'Data Structures and Algorithms in C++';

    if (isEditMode && editModule) {
      const updatedModule: AcademicModule = {
        ...editModule,
        subjectId: selectedSubjectId,
        subjectName: subName,
        moduleNumber: Number(moduleNumber),
        title: title.trim(),
        description: description.trim() || 'Unit syllabus coverage & lecture outlines.',
        estimatedHours: Number(estimatedHours),
      };
      if (onModuleUpdated) {
        onModuleUpdated(updatedModule);
      }
      showSuccess(`Module ${updatedModule.moduleNumber}: "${updatedModule.title}" updated.`);
      onClose();
      return;
    }

    const newModule: AcademicModule = {
      id: `mod-${Date.now().toString().slice(-4)}`,
      subjectId: selectedSubjectId,
      subjectName: subName,
      moduleNumber: Number(moduleNumber),
      title: title.trim(),
      description: description.trim() || 'Unit syllabus coverage & lecture outlines.',
      topicsCount: 0,
      estimatedHours: Number(estimatedHours),
      status: 'ACTIVE',
    };

    onModuleCreated(newModule);
    showSuccess(`Module ${newModule.moduleNumber}: "${newModule.title}" created successfully.`);
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
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Curriculum Module' : 'Create Curriculum Module'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {isEditMode ? 'Modify unit outline and lecture duration' : 'Unit breakdown, lecture duration & topic container'}
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
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Curriculum Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                {mockSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Unit / Module Number *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={moduleNumber}
                  onChange={(e) => setModuleNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Lecture Hours *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Module Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Unit 3: Graph Traversal, BFS, DFS & Shortest Path Algorithms"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Syllabus Outline & Key Concepts
              </label>
              <textarea
                rows={3}
                placeholder="Brief summary of theories, lab practicals and topics covered under this unit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none resize-none"
              />
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
                <span>{isEditMode ? 'Update Module' : 'Save Module'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
