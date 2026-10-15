// ============================================================================
// ISML COLLEGE LMS — VIEW RESOURCE DETAIL DRAWER
// Full Control & Comprehensive Details for Digital Learning Assets
// Features: Full-Screen Toggle, Media Preview, Curriculum Path,
// Full Control Actions (Approve, Publish, Archive, Edit, Delete, Download)
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  FileText,
  Video,
  Headphones,
  Download,
  CheckCircle2,
  Globe,
  Archive,
  Edit2,
  Trash2,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  FileCheck2,
  Clock,
  Play,
  Volume2,
  ExternalLink,
  ShieldCheck,
  Eye,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { ResourceItem } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { useToast } from '@/context/ToastContext';

interface ViewResourceDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceItem | null;
  onApprove: (id: string) => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onEdit: (resource: ResourceItem) => void;
  onDelete: (resource: ResourceItem) => void;
}

export default function ViewResourceDetailDrawer({
  isOpen,
  onClose,
  resource,
  onApprove,
  onPublish,
  onArchive,
  onEdit,
  onDelete,
}: ViewResourceDetailDrawerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PREVIEW' | 'AUDIT'>('OVERVIEW');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const { showSuccess, showInfo } = useToast();

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

  if (!isOpen || !resource) return null;

  const handleDownload = () => {
    showSuccess(`Downloading "${resource.title}" (${resource.fileSize})...`);
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(window.location.origin + `/resources/${resource.id}`);
      showInfo('Resource URL copied to clipboard.');
    }
  };

  const renderTypeIcon = () => {
    switch (resource.type) {
      case 'VIDEO':
        return <Video className="w-6 h-6 text-indigo-400" />;
      case 'AUDIO':
        return <Headphones className="w-6 h-6 text-emerald-400" />;
      case 'PRESENTATION':
        return <Layers className="w-6 h-6 text-amber-400" />;
      default:
        return <FileText className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`relative bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 transition-all ${
          isFullscreen ? 'w-full max-w-full' : 'w-full max-w-2xl lg:max-w-3xl'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E3A8A] bg-[#0B2447] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
              {renderTypeIcon()}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  {resource.type}
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-300 font-mono">{resource.fileSize}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate mt-0.5" title={resource.title}>
                {resource.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              title={isFullscreen ? 'Exit Full Screen' : 'View Full Screen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'OVERVIEW'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Asset Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'PREVIEW'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Interactive Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'AUDIT'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Governance & Audit</span>
            </button>
          </div>

          <div className="py-1">
            <StatusBadge status={resource.status} />
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/30">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format</p>
                  <p className="text-xs sm:text-sm font-bold text-[#0B2447] mt-1">{resource.type}</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Size</p>
                  <p className="text-xs sm:text-sm font-bold text-[#0052CC] mt-1">{resource.fileSize}</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created Date</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                    {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Scope</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-1">Enrolled Learners</p>
                </div>
              </div>

              {/* Curriculum Hierarchy Block */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0052CC]" />
                  Curriculum Hierarchy & Alignment
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-500">Subject / Course:</span>
                    <span className="font-bold text-[#0B2447] text-right">{resource.subjectName}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-500">Module / Unit:</span>
                    <span className="font-bold text-slate-800 text-right">{resource.moduleName}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-500">Topic / Lesson:</span>
                    <span className="font-bold text-indigo-700 text-right">{resource.topicName}</span>
                  </div>
                </div>
              </div>

              {/* Author & Contribution Metadata */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Author & Custodianship
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Uploaded By / Faculty Incharge</p>
                    <p className="font-bold text-[#0B2447] mt-1 text-sm">{resource.authorName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Academic Lead & Content Contributor</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Repository Asset ID</p>
                    <p className="font-mono font-bold text-slate-700 mt-1 text-sm">{resource.id}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Secure CDN SHA-256 Verified</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PREVIEW' && (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#0052CC]" />
                    Live Content Preview
                  </h3>
                  <button
                    onClick={handleDownload}
                    className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                </div>

                {resource.type === 'AUDIO' ? (
                  <div className="p-6 bg-slate-900 rounded-xl text-white flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 animate-pulse">
                      <Headphones className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{resource.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">High Fidelity Listening Comprehension Track</p>
                    </div>

                    {/* Mock Audio Player Bar */}
                    <div className="w-full max-w-md bg-slate-800 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>01:14</span>
                        <span>03:45</span>
                      </div>
                      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-1/3 rounded-full" />
                      </div>
                      <div className="flex items-center justify-center gap-4 pt-1">
                        <button
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-full text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          {isPlayingAudio ? (
                            <>
                              <Volume2 className="w-3.5 h-3.5" /> Pause Audio
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" /> Play Track
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : resource.type === 'VIDEO' ? (
                  <div className="aspect-video bg-slate-900 rounded-xl relative flex flex-col items-center justify-center text-white overflow-hidden shadow-inner group">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:scale-110 transition-transform cursor-pointer">
                      <Play className="w-8 h-8 ml-1" />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{resource.title}</p>
                        <p className="text-slate-300 text-[11px]">{resource.topicName}</p>
                      </div>
                      <span className="bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono">1080p HD • 14:20</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
                    <div className="p-4 rounded-2xl bg-cyan-100 text-[#0052CC]">
                      <FileText className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0B2447]">{resource.title}</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Curated study guide and lecture notes document ready for student view & PDF print.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleDownload}
                        className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Open & Download PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Approval & Lifecycle Audit Trail
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0B2447]">
                        Status: <span className="text-emerald-700">{resource.status}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Current lifecycle state of this asset in the global institutional repository.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="p-1.5 bg-blue-100 text-[#0052CC] rounded-lg mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0B2447]">Ingestion Timestamp</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {resource.createdAt ? new Date(resource.createdAt).toLocaleString() : 'Recent Session'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg mt-0.5">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0B2447]">Role-Based Access Scope</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Accessible by Super Admins, Department HODs, Course Faculty, and Enrolled Learners.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Full Control Action Bar */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Can permission="RESOURCE_APPROVE">
              {resource.status === 'PENDING_REVIEW' && (
                <button
                  onClick={() => onApprove(resource.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Resource</span>
                </button>
              )}
            </Can>

            <Can permission="RESOURCE_PUBLISH">
              {resource.status === 'APPROVED' && (
                <button
                  onClick={() => onPublish(resource.id)}
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Publish to Students</span>
                </button>
              )}
            </Can>

            <Can permission="RESOURCE_UPDATE">
              {resource.status === 'PUBLISHED' && (
                <button
                  onClick={() => onArchive(resource.id)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              )}
            </Can>

            <button
              onClick={() => {
                onClose();
                onEdit(resource);
              }}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052CC] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(resource);
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
