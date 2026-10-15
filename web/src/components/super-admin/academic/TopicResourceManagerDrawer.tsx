// ============================================================================
// ISML COLLEGE LMS — TOPIC RESOURCE MANAGER DRAWER
// Multi-Format Content Upload & Link Attachment (PDFs, Docs, Web Links, Video)
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  X,
  Plus,
  FileText,
  Link as LinkIcon,
  Video,
  FileCode,
  Trash2,
  ExternalLink,
  Download,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Eye,
  File,
} from 'lucide-react';
import { AcademicTopic, TopicResource } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';

interface TopicResourceManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topic: AcademicTopic | null;
  onUpdateTopicResources: (updatedTopic: AcademicTopic) => void;
}

export default function TopicResourceManagerDrawer({
  isOpen,
  onClose,
  topic,
  onUpdateTopicResources,
}: TopicResourceManagerDrawerProps) {
  const { showSuccess, showError } = useToast();

  const [activeFormType, setActiveFormType] = useState<'FILE' | 'LINK'>('FILE');

  // New Resource Form States
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceType, setResourceType] = useState<'PDF' | 'DOC' | 'VIDEO' | 'LINK'>('PDF');
  const [resourceLinkUrl, setResourceLinkUrl] = useState('');
  const [description, setDescription] = useState('');
  const [simulatedFileName, setSimulatedFileName] = useState('');
  const [simulatedFileSize, setSimulatedFileSize] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !topic) return null;

  const currentResources = topic.resources || [];

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSimulatedFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setSimulatedFileSize(`${sizeMB} MB`);
      if (!resourceTitle) {
        setResourceTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      if (file.name.endsWith('.pdf')) {
        setResourceType('PDF');
      } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        setResourceType('DOC');
      } else if (file.name.endsWith('.mp4') || file.name.endsWith('.mov')) {
        setResourceType('VIDEO');
      }
    }
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resourceTitle.trim()) {
      showError('Please enter a resource title.');
      return;
    }

    if (activeFormType === 'LINK' && !resourceLinkUrl.trim()) {
      showError('Please enter a valid web link URL.');
      return;
    }

    if (activeFormType === 'FILE' && !simulatedFileName && !resourceLinkUrl) {
      showError('Please select a file or provide a document download link.');
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      const newRes: TopicResource = {
        id: `res-${Date.now().toString().slice(-4)}`,
        topicId: topic.id,
        title: resourceTitle.trim(),
        type: activeFormType === 'LINK' ? 'LINK' : resourceType,
        url:
          activeFormType === 'LINK'
            ? resourceLinkUrl.trim()
            : resourceLinkUrl.trim() || `https://isml.edu/uploads/${encodeURIComponent(simulatedFileName || 'document.pdf')}`,
        fileSize: activeFormType === 'FILE' ? simulatedFileSize || '1.8 MB' : undefined,
        description: description.trim() || undefined,
        uploadedAt: new Date().toISOString().split('T')[0],
        isExternalLink: activeFormType === 'LINK',
      };

      const updatedResources = [newRes, ...currentResources];
      const updatedTopic: AcademicTopic = {
        ...topic,
        resources: updatedResources,
        resourcesCount: updatedResources.length,
      };

      onUpdateTopicResources(updatedTopic);
      showSuccess(`Added resource "${newRes.title}" to topic.`);

      // Reset Form
      setResourceTitle('');
      setResourceLinkUrl('');
      setDescription('');
      setSimulatedFileName('');
      setSimulatedFileSize('');
      setIsUploading(false);
    }, 350);
  };

  const handleDeleteResource = (resourceId: string) => {
    const target = currentResources.find((r) => r.id === resourceId);
    const updatedResources = currentResources.filter((r) => r.id !== resourceId);
    const updatedTopic: AcademicTopic = {
      ...topic,
      resources: updatedResources,
      resourcesCount: updatedResources.length,
    };

    onUpdateTopicResources(updatedTopic);
    showSuccess(`Removed "${target?.title || 'Resource'}".`);
  };

  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'PDF':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          icon: <FileText className="w-3.5 h-3.5 text-rose-600" />,
          label: 'PDF Document',
        };
      case 'DOC':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
          icon: <File className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Word Doc',
        };
      case 'LINK':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          icon: <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Web Resource',
        };
      case 'VIDEO':
        return {
          bg: 'bg-purple-50 border-purple-200 text-purple-700',
          icon: <Video className="w-3.5 h-3.5 text-purple-600" />,
          label: 'Video Lecture',
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          icon: <FileCode className="w-3.5 h-3.5 text-slate-600" />,
          label: 'Material',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col transform transition-transform ease-out duration-300 border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#061A36] text-white flex items-center justify-between border-b border-[#153460]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-400/30">
                  Topic #{topic.topicNumber}
                </span>
                <span className="text-[10px] text-slate-300 font-semibold truncate max-w-[200px]">
                  {topic.moduleTitle}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight mt-1 line-clamp-1">
                {topic.title}
              </h2>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Attach lesson slides, PDF references, reading docs & external web resources
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Upload / Link Form Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                <h3 className="text-xs font-bold text-[#0B2447] flex items-center gap-1.5 uppercase tracking-wider">
                  <UploadCloud className="w-4 h-4 text-[#0052CC]" />
                  <span>Upload Resource or Attach Link</span>
                </h3>

                {/* Form Mode Toggle */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveFormType('FILE')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      activeFormType === 'FILE'
                        ? 'bg-[#0052CC] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormType('LINK')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      activeFormType === 'LINK'
                        ? 'bg-[#0052CC] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>External Link</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddResource} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. French Pronunciation Master Guide, Chapter 1 Exercises"
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>

                {activeFormType === 'FILE' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Choose File (PDF, DOCX, Video, PPT) *
                    </label>
                    <div className="border-2 border-dashed border-slate-200 bg-white rounded-lg p-3 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="topic-file-input"
                        className="hidden"
                        onChange={handleSimulatedFileUpload}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.zip"
                      />
                      <label
                        htmlFor="topic-file-input"
                        className="cursor-pointer flex flex-col items-center justify-center gap-1"
                      >
                        <UploadCloud className="w-6 h-6 text-slate-400" />
                        <span className="text-xs font-semibold text-[#0052CC] hover:underline">
                          Browse local file
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {simulatedFileName
                            ? `${simulatedFileName} (${simulatedFileSize})`
                            : 'Supports PDF, Word DOC, Video up to 50MB'}
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          File Type
                        </label>
                        <select
                          value={resourceType}
                          onChange={(e) => setResourceType(e.target.value as any)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                        >
                          <option value="PDF">PDF Document</option>
                          <option value="DOC">Word Document (.docx)</option>
                          <option value="VIDEO">Video Lecture (.mp4)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Direct File URL (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="https://isml.edu/uploads/..."
                          value={resourceLinkUrl}
                          onChange={(e) => setResourceLinkUrl(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Resource Web URL / Video Link *
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        required
                        placeholder="https://apprendre.tv5monde.com/... or https://youtube.com/..."
                        value={resourceLinkUrl}
                        onChange={(e) => setResourceLinkUrl(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0052CC] outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description & Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide notes or instructions for students/faculty regarding this material..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0052CC] outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Attach Resource'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Resources List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#0B2447] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Attached Materials & Links</span>
                  <span className="bg-blue-100 text-[#0052CC] px-2 py-0.2 rounded-full text-[10px] font-bold">
                    {currentResources.length}
                  </span>
                </h3>
              </div>

              {currentResources.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-xl">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-600">No resources attached yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload PDFs, Word docs, practice worksheets, or web links using the form above.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {currentResources.map((res) => {
                    const badge = getBadgeForType(res.type);
                    return (
                      <div
                        key={res.id}
                        className="bg-white border border-slate-200 rounded-xl p-3 hover:border-slate-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${badge.bg}`}
                          >
                            {badge.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-[#0B2447]">{res.title}</h4>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                              {res.fileSize && (
                                <span className="text-[10px] font-mono text-slate-500">
                                  {res.fileSize}
                                </span>
                              )}
                            </div>

                            {res.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                {res.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span>Added {res.uploadedAt}</span>
                              <span>•</span>
                              <span className="font-mono truncate max-w-[220px] text-blue-600">
                                {res.url}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Open Link / View Resource"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteResource(res.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {currentResources.length} content resource{currentResources.length === 1 ? '' : 's'} linked
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#0B2447] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
