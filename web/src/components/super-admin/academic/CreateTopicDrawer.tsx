// ============================================================================
// ISML COLLEGE LMS — CREATE ACADEMIC TOPIC DRAWER
// Micro-Learning Lessons, LSRW Skill Alignment & Pedagogical Objectives
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { ListTree, X, Plus, Sparkles, BookOpen, Target, Award, UploadCloud, Link as LinkIcon, FileText, Trash2 } from 'lucide-react';
import { AcademicTopic, TopicResource } from '@/types/rbac';
import { mockModules, mockCourses, mockSubjects } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateTopicDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicCreated: (newTopic: AcademicTopic) => void;
  editTopic?: AcademicTopic | null;
  onTopicUpdated?: (topic: AcademicTopic) => void;
  defaultCourseId?: string;
  defaultModuleId?: string;
}

export default function CreateTopicDrawer({
  isOpen,
  onClose,
  onTopicCreated,
  editTopic,
  onTopicUpdated,
  defaultCourseId,
  defaultModuleId,
}: CreateTopicDrawerProps) {
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(editTopic);

  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0]?.id || 'crs-01');
  const [selectedModuleId, setSelectedModuleId] = useState(mockModules[0]?.id || 'mod-fr-01');
  const [topicNumber, setTopicNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [skillMapped, setSkillMapped] = useState('Writing & Code Analysis');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT'>('ACTIVE');

  // Resource attachment states
  const [attachedResources, setAttachedResources] = useState<TopicResource[]>([]);
  const [resFormType, setResFormType] = useState<'FILE' | 'LINK'>('FILE');
  const [newResTitle, setNewResTitle] = useState('');
  const [newResType, setNewResType] = useState<'PDF' | 'DOC' | 'VIDEO' | 'LINK'>('PDF');
  const [newResUrl, setNewResUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editTopic) {
        setSelectedCourseId(editTopic.courseId || mockCourses[0]?.id || 'crs-01');
        setSelectedModuleId(editTopic.moduleId);
        setTopicNumber(editTopic.topicNumber);
        setTitle(editTopic.title);
        setLearningObjective(editTopic.learningObjective);
        setSkillMapped(editTopic.skillMapped);
        setStatus(editTopic.status);
        setAttachedResources(editTopic.resources || []);
      } else {
        const initialCourse = defaultCourseId || (defaultModuleId ? (mockModules.find(m => m.id === defaultModuleId)?.courseId || mockSubjects.find(s => s.id === mockModules.find(m => m.id === defaultModuleId)?.subjectId)?.courseId) : undefined) || mockCourses[0]?.id || 'crs-01';
        const initialModule = defaultModuleId || mockModules[0]?.id || 'mod-fr-01';
        setSelectedCourseId(initialCourse);
        setSelectedModuleId(initialModule);
        setTopicNumber(1);
        setTitle('');
        setLearningObjective('');
        setSkillMapped('Writing & Code Analysis');
        setStatus('ACTIVE');
        setAttachedResources([]);
      }
      setNewResTitle('');
      setNewResUrl('');
      setUploadedFileName('');
      setUploadedFileSize('');
    }
  }, [isOpen, editTopic, defaultCourseId, defaultModuleId]);

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

  const handleAddLocalResource = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) {
      showError('Please enter a title for the resource.');
      return;
    }
    if (resFormType === 'LINK' && !newResUrl.trim()) {
      showError('Please provide the external link URL.');
      return;
    }

    const createdRes: TopicResource = {
      id: `res-${Date.now().toString().slice(-4)}`,
      topicId: editTopic?.id || 'temp',
      title: newResTitle.trim(),
      type: resFormType === 'LINK' ? 'LINK' : newResType,
      url: resFormType === 'LINK' ? newResUrl.trim() : newResUrl.trim() || `https://isml.edu/uploads/${encodeURIComponent(uploadedFileName || 'document.pdf')}`,
      fileSize: resFormType === 'FILE' ? uploadedFileSize || '2.0 MB' : undefined,
      uploadedAt: new Date().toISOString().split('T')[0],
      isExternalLink: resFormType === 'LINK',
    };

    setAttachedResources((prev) => [createdRes, ...prev]);
    setNewResTitle('');
    setNewResUrl('');
    setUploadedFileName('');
    setUploadedFileSize('');
    showSuccess(`Added "${createdRes.title}" to topic.`);
  };

  const handleRemoveLocalResource = (id: string) => {
    setAttachedResources((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !learningObjective.trim()) {
      showError('Please provide topic title and learning objective.');
      return;
    }

    const matchedCourse = mockCourses.find((c) => c.id === selectedCourseId);
    const crsName = matchedCourse ? matchedCourse.name : 'Certification Course';
    const mod = mockModules.find((m) => m.id === selectedModuleId);
    const modTitle = mod ? mod.title : 'Curriculum Module';
    const subName = mod ? mod.subjectName : 'Subject';

    if (isEditMode && editTopic) {
      const updatedTopic: AcademicTopic = {
        ...editTopic,
        courseId: selectedCourseId,
        courseName: crsName,
        moduleId: selectedModuleId,
        moduleTitle: modTitle,
        subjectName: subName,
        topicNumber: Number(topicNumber),
        title: title.trim(),
        learningObjective: learningObjective.trim(),
        skillMapped,
        resourcesCount: attachedResources.length,
        resources: attachedResources,
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
      courseId: selectedCourseId,
      courseName: crsName,
      moduleId: selectedModuleId,
      moduleTitle: modTitle,
      subjectName: subName,
      topicNumber: Number(topicNumber),
      title: title.trim(),
      learningObjective: learningObjective.trim(),
      skillMapped,
      resourcesCount: attachedResources.length,
      resources: attachedResources,
      status,
    };

    onTopicCreated(newTopic);
    showSuccess(`Topic "${newTopic.title}" mapped to ${crsName}.`);
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
                  {isEditMode ? 'Edit Course Lesson Topic' : 'Create Course Lesson Topic'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {isEditMode ? 'Modify learning objective and course mapping' : 'Course mapping, granular learning objective & skill'}
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
            {/* Integrated Course Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0052CC]" />
                <span>Associated Course *</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                {mockCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    📘 {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Curriculum Module / Chapter *
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

            {/* Resource Upload Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B2447] flex items-center gap-1.5 uppercase tracking-wider">
                  <UploadCloud className="w-3.5 h-3.5 text-[#0052CC]" />
                  <span>Attach PDF / Docs / Web Links</span>
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                  {attachedResources.length} files
                </span>
              </div>

              {/* Mode Selector */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 w-fit">
                <button
                  type="button"
                  onClick={() => setResFormType('FILE')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    resFormType === 'FILE'
                      ? 'bg-[#0052CC] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResFormType('LINK')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    resFormType === 'LINK'
                      ? 'bg-[#0052CC] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>External URL</span>
                </button>
              </div>

              {/* Inputs */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Resource Title (e.g. Grammar Summary Notes.pdf)"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />

                {resFormType === 'FILE' ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={newResType}
                      onChange={(e) => setNewResType(e.target.value as any)}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold shrink-0"
                    >
                      <option value="PDF">PDF</option>
                      <option value="DOC">DOCX</option>
                      <option value="VIDEO">Video</option>
                    </select>

                    <label className="flex-1 px-3 py-1.5 bg-white border border-dashed border-blue-300 rounded-lg text-xs text-blue-700 hover:bg-blue-50/50 cursor-pointer text-center font-medium truncate">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFileName(file.name);
                            setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                            if (!newResTitle) setNewResTitle(file.name.replace(/\.[^/.]+$/, ''));
                            if (file.name.endsWith('.pdf')) setNewResType('PDF');
                            else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) setNewResType('DOC');
                            else if (file.name.endsWith('.mp4')) setNewResType('VIDEO');
                          }
                        }}
                      />
                      {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Choose Local File (PDF/DOC)'}
                    </label>
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder="https://... (Web reference, video link)"
                    value={newResUrl}
                    onChange={(e) => setNewResUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddLocalResource}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Attach Material</span>
                  </button>
                </div>
              </div>

              {/* Render Attached Resources List */}
              {attachedResources.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Attached to this topic:
                  </span>
                  {attachedResources.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {res.type}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{res.title}</span>
                        {res.fileSize && (
                          <span className="text-[10px] text-slate-400 font-mono">({res.fileSize})</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocalResource(res.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
