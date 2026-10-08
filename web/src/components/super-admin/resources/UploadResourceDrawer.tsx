// ============================================================================
// ISML COLLEGE LMS — UPLOAD RESOURCE SLIDE-OVER DRAWER
// Digital Content Ingestion: Handouts, Videos, Audio Tracks & Textbooks
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import {
  Upload,
  X,
  FileText,
  Video,
  Headphones,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  BookOpen,
} from 'lucide-react';
import { ResourceItem } from '@/types/rbac';
import { mockSubjects } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface UploadResourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onResourceUploaded: (newResource: ResourceItem) => void;
  editResource?: ResourceItem | null;
  onResourceUpdated?: (resource: ResourceItem) => void;
}

export default function UploadResourceDrawer({
  isOpen,
  onClose,
  onResourceUploaded,
  editResource,
  onResourceUpdated,
}: UploadResourceDrawerProps) {
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(editResource);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'DOCUMENT' | 'VIDEO' | 'PRESENTATION' | 'WORKSHEET' | 'AUDIO'>('DOCUMENT');
  const [subjectName, setSubjectName] = useState(mockSubjects[0]?.name || 'Foreign Language: French A1');
  const [moduleName, setModuleName] = useState('Module 1: Foundations & Core Concepts');
  const [topicName, setTopicName] = useState('Unit 1 Overview & Practice Exercises');
  const [authorName, setAuthorName] = useState('Dr. P. Srinivasan');
  const [fileSize, setFileSize] = useState('8.4 MB PDF');
  const [status, setStatus] = useState<'APPROVED' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');

  useEffect(() => {
    if (isOpen) {
      if (editResource) {
        setTitle(editResource.title);
        setType(editResource.type);
        setSubjectName(editResource.subjectName);
        setModuleName(editResource.moduleName);
        setTopicName(editResource.topicName);
        setAuthorName(editResource.authorName);
        setFileSize(editResource.fileSize);
        setStatus(editResource.status);
      } else {
        setTitle('');
        setType('DOCUMENT');
        setModuleName('Module 1: Foundations & Core Concepts');
        setTopicName('Unit 1 Overview & Practice Exercises');
        setFileSize('8.4 MB PDF');
        setStatus('PUBLISHED');
      }
    }
  }, [isOpen, editResource]);

  // Handle ESC
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
      showError('Please enter resource title.');
      return;
    }

    if (isEditMode && editResource) {
      const updatedResource: ResourceItem = {
        ...editResource,
        title,
        type,
        subjectName,
        moduleName,
        topicName,
        authorName,
        fileSize,
        status,
      };
      if (onResourceUpdated) {
        onResourceUpdated(updatedResource);
      }
      showSuccess(`Resource "${title}" updated.`);
      onClose();
      return;
    }

    const newResource: ResourceItem = {
      id: `res-${Date.now().toString().slice(-4)}`,
      title,
      type,
      subjectName,
      moduleName,
      topicName,
      authorName,
      fileSize,
      status,
      createdAt: new Date().toISOString(),
    };

    onResourceUploaded(newResource);
    showSuccess(`Resource "${title}" uploaded and added to library.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {isEditMode ? 'Edit Digital Resource' : 'Upload Digital Resource'}
              </h2>
              <p className="text-[11px] sm:text-xs text-blue-200 mt-0.5">
                {isEditMode ? 'Modify metadata and repository permissions' : 'Publish learning materials, audio tracks & lecture notes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resource Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete French Phonetics & Audio Pronunciation Guide"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Format Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="DOCUMENT">Document (PDF/DOCX)</option>
                  <option value="VIDEO">Video Lecture (MP4)</option>
                  <option value="AUDIO">Audio Track (MP3)</option>
                  <option value="PRESENTATION">Presentation (PPTX)</option>
                  <option value="WORKSHEET">Interactive Worksheet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  File Size / Format
                </label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="e.g. 14.2 MB PDF"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Linked Curriculum Subject
              </label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                {mockSubjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Module Unit
                </label>
                <input
                  type="text"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g. Module 1: Salutations"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topic / Subunit
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g. Vowel Accents (Aigu / Grave)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Author / Faculty
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Dr. P. Srinivasan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catalog Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="PUBLISHED">Published (Immediately Available)</option>
                  <option value="APPROVED">Approved (Staged)</option>
                  <option value="PENDING_REVIEW">Pending Academic Review</option>
                </select>
              </div>
            </div>

            {/* Mock Drag & Drop Box */}
            <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-700">Attach Media File or Cloud Asset</p>
              <p className="text-[10px] text-slate-400">PDF, MP4, MP3, PPTX up to 500MB</p>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-300 text-slate-700 hover:bg-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isEditMode ? 'Update Resource' : 'Upload to Repository'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
