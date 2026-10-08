// ============================================================================
// ISML COLLEGE LMS — CREATE ACADEMIC TOPIC DRAWER
// Micro-Learning Lessons, LSRW Skill Alignment & Pedagogical Objectives
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { ListTree, X, Plus, Sparkles, BookOpen, Target, Award } from 'lucide-react';
import { AcademicTopic } from '@/types/rbac';
import { mockModules } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateTopicDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicCreated: (newTopic: AcademicTopic) => void;
  editTopic?: AcademicTopic | null;
  onTopicUpdated?: (topic: AcademicTopic) => void;
}

export default function CreateTopicDrawer({
  isOpen,
  onClose,
  onTopicCreated,
  editTopic,
  onTopicUpdated,
}: CreateTopicDrawerProps) {
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(editTopic);

  const [selectedModuleId, setSelectedModuleId] = useState(mockModules[0]?.id || 'mod-01');
  const [topicNumber, setTopicNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [skillMapped, setSkillMapped] = useState('Writing & Code Analysis');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT'>('ACTIVE');

  useEffect(() => {
    if (isOpen) {
      if (editTopic) {
        setSelectedModuleId(editTopic.moduleId);
        setTopicNumber(editTopic.topicNumber);
        setTitle(editTopic.title);
        setLearningObjective(editTopic.learningObjective);
        setSkillMapped(editTopic.skillMapped);
        setStatus(editTopic.status);
      } else {
        setSelectedModuleId(mockModules[0]?.id || 'mod-01');
        setTopicNumber(1);
        setTitle('');
        setLearningObjective('');
        setSkillMapped('Writing & Code Analysis');
        setStatus('ACTIVE');
      }
    }
  }, [isOpen, editTopic]);

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
    if (!title.trim() || !learningObjective.trim()) {
      showError('Please provide topic title and learning objective.');
      return;
    }

    const mod = mockModules.find((m) => m.id === selectedModuleId);
    const modTitle = mod ? mod.title : 'Curriculum Module';
    const subName = mod ? mod.subjectName : 'Subject';

    if (isEditMode && editTopic) {
      const updatedTopic: AcademicTopic = {
        ...editTopic,
        moduleId: selectedModuleId,
        moduleTitle: modTitle,
        subjectName: subName,
        topicNumber: Number(topicNumber),
        title: title.trim(),
        learningObjective: learningObjective.trim(),
        skillMapped,
        status,
      };
      if (onTopicUpdated) {
        onTopicUpdated(updatedTopic);
      }
      showSuccess(`Topic "${updatedTopic.title}" updated successfully.`);
      onClose();
      return;
    }

    const newTopic: AcademicTopic = {
      id: `top-${Date.now().toString().slice(-4)}`,
      moduleId: selectedModuleId,
      moduleTitle: modTitle,
      subjectName: subName,
      topicNumber: Number(topicNumber),
      title: title.trim(),
      learningObjective: learningObjective.trim(),
      skillMapped,
      resourcesCount: 0,
      status,
    };

    onTopicCreated(newTopic);
    showSuccess(`Topic "${newTopic.title}" created successfully.`);
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
                <ListTree className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Lesson Topic' : 'Create Lesson Topic'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {isEditMode ? 'Modify learning objective and skill mapping' : 'Granular learning objective and skill competency'}
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
                Target Curriculum Module *
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                {mockModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.subjectName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Topic Number *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={topicNumber}
                  onChange={(e) => setTopicNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Skill Competency Mapping
                </label>
                <select
                  value={skillMapped}
                  onChange={(e) => setSkillMapped(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                >
                  <option value="Writing & Code Analysis">Writing & Code Analysis</option>
                  <option value="Speaking & Presentation">Speaking & Presentation</option>
                  <option value="Listening & Comprehension">Listening & Comprehension</option>
                  <option value="Reading & Literature Review">Reading & Literature Review</option>
                  <option value="Practical Lab Problem-Solving">Practical Lab Problem-Solving</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Topic Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Asymptotic Notation: Big-O, Omega and Theta analysis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pedagogical Learning Objective *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Students will be able to analyze time and memory complexity of recursive algorithms..."
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Topic Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                <option value="ACTIVE">ACTIVE (Published in Course Plan)</option>
                <option value="DRAFT">DRAFT</option>
              </select>
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
                <span>{isEditMode ? 'Update Topic' : 'Save Topic'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
