// ============================================================================
// ISML COLLEGE LMS — CREATE PROFICIENCY LEVEL DRAWER
// Subject Language Levels (e.g., A1, A2, B1, B2, JLPT N5-N1, TOPIK 1-6)
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { Award, X, Sparkles, BookOpen, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { AcademicLevel, Subject } from '@/types/rbac';
import { mockSubjects } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateLevelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLevelCreated: (newLevel: AcademicLevel) => void;
  editLevel?: AcademicLevel | null;
  onLevelUpdated?: (level: AcademicLevel) => void;
  defaultSubjectId?: string;
  subjectsList?: Subject[];
}

export default function CreateLevelDrawer({
  isOpen,
  onClose,
  onLevelCreated,
  editLevel,
  onLevelUpdated,
  defaultSubjectId,
  subjectsList = mockSubjects,
}: CreateLevelDrawerProps) {
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(editLevel);

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectsList[0]?.id || 'subj-fr101');
  const [levelCode, setLevelCode] = useState('A1');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetCefrOrJlpt, setTargetCefrOrJlpt] = useState('CEFR A1');
  const [estimatedHours, setEstimatedHours] = useState(40);
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT'>('ACTIVE');

  // Quick preset badges for foreign language frameworks
  const PRESET_LEVELS = [
    { code: 'A1', name: 'A1 Beginner Foundation', standard: 'CEFR A1', hours: 40 },
    { code: 'A2', name: 'A2 Elementary Communication', standard: 'CEFR A2', hours: 60 },
    { code: 'B1', name: 'B1 Intermediate Fluency', standard: 'CEFR B1', hours: 80 },
    { code: 'B2', name: 'B2 Vantage / Professional', standard: 'CEFR B2', hours: 100 },
    { code: 'N5', name: 'JLPT N5 Introductory', standard: 'JLPT N5', hours: 50 },
    { code: 'N4', name: 'JLPT N4 Basic Conversational', standard: 'JLPT N4', hours: 70 },
    { code: 'N3', name: 'JLPT N3 Intermediate', standard: 'JLPT N3', hours: 90 },
    { code: 'TOPIK 1', name: 'TOPIK I Level 1 (Hangul Beginner)', standard: 'TOPIK Level 1', hours: 40 },
    { code: 'TOPIK 2', name: 'TOPIK I Level 2 (Elementary)', standard: 'TOPIK Level 2', hours: 60 },
  ];

  useEffect(() => {
    if (isOpen) {
      if (editLevel) {
        setSelectedSubjectId(editLevel.subjectId);
        setLevelCode(editLevel.levelCode);
        setName(editLevel.name);
        setDescription(editLevel.description || '');
        setTargetCefrOrJlpt(editLevel.targetCefrOrJlpt || 'CEFR A1');
        setEstimatedHours(editLevel.estimatedHours || 40);
        setStatus(editLevel.status || 'ACTIVE');
      } else {
        const initialSub = defaultSubjectId || subjectsList[0]?.id || 'subj-fr101';
        setSelectedSubjectId(initialSub);
        setLevelCode('A1');
        setName('A1 Beginner Foundation');
        setDescription('Basic survival vocabulary, everyday greetings, grammar patterns & listening comprehension.');
        setTargetCefrOrJlpt('CEFR A1');
        setEstimatedHours(40);
        setStatus('ACTIVE');
      }
    }
  }, [isOpen, editLevel, defaultSubjectId, subjectsList]);

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

  const handleApplyPreset = (preset: typeof PRESET_LEVELS[0]) => {
    setLevelCode(preset.code);
    setName(preset.name);
    setTargetCefrOrJlpt(preset.standard);
    setEstimatedHours(preset.hours);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !levelCode.trim()) {
      showError('Please provide Level Code and Title.');
      return;
    }

    const sub = subjectsList.find((s) => s.id === selectedSubjectId) || mockSubjects[0];
    const subName = sub ? sub.name : 'Curriculum Subject';

    if (isEditMode && editLevel) {
      const updatedLevel: AcademicLevel = {
        ...editLevel,
        subjectId: selectedSubjectId,
        subjectName: subName,
        levelCode: levelCode.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim(),
        targetCefrOrJlpt: targetCefrOrJlpt.trim(),
        estimatedHours: Number(estimatedHours),
        status,
      };
      if (onLevelUpdated) {
        onLevelUpdated(updatedLevel);
      }
      showSuccess(`Level "${updatedLevel.name}" (${updatedLevel.levelCode}) updated.`);
      onClose();
      return;
    }

    const newLevel: AcademicLevel = {
      id: `lvl-${Date.now().toString().slice(-4)}`,
      subjectId: selectedSubjectId,
      subjectName: subName,
      levelCode: levelCode.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      targetCefrOrJlpt: targetCefrOrJlpt.trim(),
      estimatedHours: Number(estimatedHours),
      modulesCount: 0,
      status,
    };

    onLevelCreated(newLevel);
    showSuccess(`Proficiency Level "${newLevel.name}" (${newLevel.levelCode}) added to ${subName}.`);
    onClose();
  };

  if (!isOpen) return null;

  const currentSubject = subjectsList.find((s) => s.id === selectedSubjectId);

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
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  {isEditMode ? 'Edit Proficiency Level' : 'Add Proficiency Level'}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Configure language level tracks (e.g. A1, A2, B1 or JLPT N5, N4)
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
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Parent Subject Mapping */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Parent Subject *</span>
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none cursor-pointer"
              >
                {subjectsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              {currentSubject && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Levels and subsequent chapters/topics will be organized directly under <strong>{currentSubject.name}</strong>.
                </p>
              )}
            </div>

            {/* Quick Framework Level Presets */}
            <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Quick Preset Templates (Click to fill):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_LEVELS.map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      levelCode === preset.code
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    {preset.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Code & Framework Standard */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Level Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A1, A2, N5, N4"
                  value={levelCode}
                  onChange={(e) => setLevelCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Framework Benchmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. CEFR A1, JLPT N5, TOPIK 1"
                  value={targetCefrOrJlpt}
                  onChange={(e) => setTargetCefrOrJlpt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>
            </div>

            {/* Level Display Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Level Title / Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. A1 Beginner Foundation / JLPT N5 Introductory"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            {/* Estimated Duration Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Estimated Classroom & Practice Hours</span>
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            {/* Description / Learning Scope */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description & Target Competency
              </label>
              <textarea
                rows={3}
                placeholder="Key language goals, vocabulary targets, and syllabus scope for this level..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE (Available for Chapters & Course Building)</option>
                <option value="DRAFT">DRAFT (Under Preparation)</option>
              </select>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {isEditMode ? 'Update Level' : 'Save Level'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
