"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCheck2, 
  Clock, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  MessageSquare,
  Headphones,
  Mic,
  PenTool,
  BookOpen,
  Users,
  Sparkles,
  X,
  FileAudio,
  File,
  Eye,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { assignmentStore, SharedAssignment, AssignmentLsrwSkill } from '@/services/assignmentStore';

export default function StudentAssignmentsPage() {
  const { showSuccess, showError } = useToast();
  const [assignments, setAssignments] = useState<SharedAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'SUBMITTED' | 'COMPLETED'>('PENDING');
  const [selectedLsrwFilter, setSelectedLsrwFilter] = useState<'ALL' | AssignmentLsrwSkill>('ALL');

  // Submit Modal State
  const [submittingAssignment, setSubmittingAssignment] = useState<SharedAssignment | null>(null);
  const [viewingAssignmentPrompt, setViewingAssignmentPrompt] = useState<SharedAssignment | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [studentNotes, setStudentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load student info from session/storage if available
  const [studentInfo, setStudentInfo] = useState({
    id: 'AMER-COL-STD-23',
    name: 'Muthu Pandian',
    rollNo: 'AMER-COL-STD-23',
    college: 'The American College',
    courseName: 'testtt',
    batchName: 'MRNG BATCH',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('isml_user') || localStorage.getItem('isml_student_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setStudentInfo({
          id: parsed.id || parsed.studentId || 'AMER-COL-STD-23',
          name: parsed.name || 'Muthu Pandian',
          rollNo: parsed.rollNo || parsed.studentId || 'AMER-COL-STD-23',
          college: parsed.collegeName || parsed.campusName || parsed.institutionName || 'The American College',
          courseName: parsed.courseName || parsed.enrolledCourse || 'testtt',
          batchName: parsed.batchName || 'MRNG BATCH',
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Load store assignments & real DB assignments
    const loadAll = () => {
      const storeItems = assignmentStore.getAll();
      fetch('/api/portals/assignments')
        .then(r => r.json())
        .then(res => {
          if (res?.data && Array.isArray(res.data)) {
            const combined = [...storeItems];
            res.data.forEach((dbItem: any) => {
              if (!combined.some(c => c.id === dbItem.id)) {
                combined.unshift(dbItem);
              }
            });
            setAssignments(combined);
          } else {
            setAssignments(storeItems);
          }
        })
        .catch(() => setAssignments(storeItems));
    };

    loadAll();
    const unsubscribe = assignmentStore.subscribe(loadAll);
    const handleSync = () => loadAll();
    window.addEventListener('isml-realtime-event', handleSync);
    return () => {
      unsubscribe();
      window.removeEventListener('isml-realtime-event', handleSync);
    };
  }, []);

  // Filter based on tab and LSRW skill
  const currentStudentId = studentInfo.id;
  const filteredAssignments = assignments
    .filter((a) => {
      const mySub = a.submissions?.find((s) => s.studentId === currentStudentId || s.studentRollNo === studentInfo.rollNo);
      if (activeTab === 'PENDING') return !mySub;
      if (activeTab === 'SUBMITTED') return mySub && mySub.status === 'PENDING_REVIEW';
      if (activeTab === 'COMPLETED') return mySub && mySub.status === 'EVALUATED';
      return true;
    })
    .filter((a) => selectedLsrwFilter === 'ALL' || a.lsrwSkill === selectedLsrwFilter);

  // File type accept restriction based on LSRW Skill
  const getAcceptedFileTypes = (skill: AssignmentLsrwSkill) => {
    switch (skill) {
      case 'SPEAKING':
        return '.mp3,.wav,.m4a,.webm,.mp4';
      case 'LISTENING':
        return '.pdf,.docx,.doc,.txt';
      case 'READING':
        return '.pdf,.docx,.doc,.txt';
      case 'WRITING':
        return '.pdf,.docx,.doc,.txt,.jpg,.jpeg,.png';
      default:
        return '.pdf,.docx,.mp3,.wav,.txt';
    }
  };

  const getFormatLabel = (skill: AssignmentLsrwSkill) => {
    switch (skill) {
      case 'SPEAKING':
        return 'Audio/Video Viva File (.mp3, .wav, .m4a, .webm)';
      case 'LISTENING':
        return 'Comprehension Worksheet (.pdf, .docx, .txt)';
      case 'READING':
        return 'Reading Analysis Document (.pdf, .docx)';
      case 'WRITING':
        return 'Essays / Handwritten Scan / PDF (.pdf, .docx, .png, .jpg)';
      default:
        return 'PDF, Document or Audio File';
    }
  };

  const handleOpenSubmitModal = (assignment: SharedAssignment) => {
    setSubmittingAssignment(assignment);
    setUploadFile(null);
    setStudentNotes('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;
    if (!uploadFile) {
      showError('Please upload your LSRW deliverable file before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert file to Base64 or local preview URL for persistence
      const fileDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(uploadFile);
      });

      const submissionPayload = {
        studentId: currentStudentId,
        studentName: studentInfo.name,
        studentRollNo: studentInfo.rollNo,
        status: 'PENDING_REVIEW' as const,
        submissionType: (submittingAssignment.lsrwSkill === 'SPEAKING' ? 'AUDIO' : 'PDF') as any,
        fileName: uploadFile.name,
        fileSize: `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB`,
        fileUrl: fileDataUrl,
        fileDataUrl: fileDataUrl,
        maxScore: submittingAssignment.maxScore,
        studentNotes: studentNotes || `Delivered ${submittingAssignment.lsrwSkill} task.`,
      };

      // 1. Save in assignmentStore
      assignmentStore.submitAssignment(submittingAssignment.id, submissionPayload);

      // 2. Persist in real DB via /api/portals/assignments
      await fetch('/api/portals/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUBMIT',
          assignmentId: submittingAssignment.id,
          submission: submissionPayload,
        }),
      });

      // 3. Dispatch realtime event for Tutor and UI tabs
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('isml-realtime-event', {
            detail: {
              type: 'ASSIGNMENT_SUBMITTED',
              assignmentId: submittingAssignment.id,
              studentId: currentStudentId,
            },
          })
        );
      }

      showSuccess(`"${submittingAssignment.title}" uploaded & submitted to Tutor for grading!`);
      setSubmittingAssignment(null);
      setUploadFile(null);
      setStudentNotes('');
    } catch (err: any) {
      showError('Failed to upload file. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <FileCheck2 className="w-4 h-4 text-[#0052CC]" />
          <span>Academic Homework & LSRW Practical Portfolio</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Assignments & Homework</h1>
        <p className="text-xs text-slate-600">
          Targeted LSRW practical assignments mapped to your enrolled foreign language course and student batch cohort.
        </p>
      </div>

      {/* Tabs & LSRW Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          {(['PENDING', 'SUBMITTED', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-[#0052CC] text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab} Assignments
            </button>
          ))}
        </div>

        {/* LSRW Skill Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'LISTENING', 'SPEAKING', 'READING', 'WRITING'] as const).map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedLsrwFilter(skill)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedLsrwFilter === skill
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {skill === 'ALL' ? 'All Skills' : skill}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No {activeTab.toLowerCase()} assignments</h3>
          <p className="text-xs text-slate-400 mt-1">
            When your Academic Manager or Tutor assigns new homework, it will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const mySub = assignment.submissions?.find((s) => s.studentId === currentStudentId);

            return (
              <div
                key={assignment.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        assignment.lsrwSkill === 'LISTENING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        assignment.lsrwSkill === 'SPEAKING' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        assignment.lsrwSkill === 'READING' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {assignment.lsrwSkill === 'LISTENING' && <Headphones className="w-3 h-3" />}
                        {assignment.lsrwSkill === 'SPEAKING' && <Mic className="w-3 h-3" />}
                        {assignment.lsrwSkill === 'READING' && <FileText className="w-3 h-3" />}
                        {assignment.lsrwSkill === 'WRITING' && <PenTool className="w-3 h-3" />}
                        <span>{assignment.lsrwSkill} TASK</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {assignment.subjectCode}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        {assignment.courseName}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0B2447]">{assignment.title}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Users className="w-3 h-3 text-indigo-500" />
                      <span>Cohort: <strong>{assignment.batchName}</strong></span>
                      <span>• Tutor: <strong>{assignment.assignedTutorName || 'Assigned Faculty'}</strong></span>
                    </p>
                  </div>
                  <div className="text-right self-start sm:self-auto shrink-0">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                      Due: {assignment.dueDate}
                    </span>
                    <p className="text-[11px] font-bold text-slate-500 mt-1">Max {assignment.maxScore} Marks</p>
                  </div>
                </div>

                {/* Questions & Instructions Box with dedicated View Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#0052CC]" />
                      <span>Assignment Questions & Worksheet Rubric</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewingAssignmentPrompt(assignment)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0052CC] border border-blue-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Questions & Rubric</span>
                    </button>
                  </div>

                  <div className="text-xs text-slate-800 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 whitespace-pre-line font-medium max-h-36 overflow-y-auto">
                    {assignment.instructions}
                  </div>
                </div>

                {assignment.attachedFile && (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <FileText className="w-4 h-4 text-[#0052CC]" />
                      <span>{assignment.attachedFile.name} ({assignment.attachedFile.size})</span>
                    </div>
                    <button
                      onClick={() => showSuccess(`Downloading ${assignment.attachedFile?.name}...`)}
                      className="text-xs text-[#0052CC] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Materials
                    </button>
                  </div>
                )}

                {/* Submission Actions */}
                {!mySub && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Pending your submission</span>
                    <button
                      onClick={() => handleOpenSubmitModal(assignment)}
                      className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Submit Deliverable</span>
                    </button>
                  </div>
                )}

                {mySub && mySub.status === 'PENDING_REVIEW' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Submitted on {new Date(mySub.submittedAt).toLocaleDateString()} — Awaiting Tutor Review
                      </span>
                      <span className="font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded text-[11px]">Under Evaluation</span>
                    </div>
                    {mySub.fileName && (
                      <div className="flex items-center justify-between pt-1 border-t border-amber-200/50 text-[11px]">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 truncate max-w-[280px]">
                          {mySub.submissionType === 'AUDIO' ? <FileAudio className="w-3.5 h-3.5 text-rose-500" /> : <File className="w-3.5 h-3.5 text-blue-500" />}
                          {mySub.fileName} ({mySub.fileSize || 'Attached'})
                        </span>
                        {mySub.fileUrl && (
                          <a
                            href={mySub.fileUrl}
                            download={mySub.fileName}
                            className="text-[#0052CC] font-bold hover:underline flex items-center gap-0.5"
                          >
                            <Download className="w-3 h-3" /> Download
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {mySub && mySub.status === 'EVALUATED' && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-950">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Evaluated by Tutor
                      </span>
                      <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs">
                        {mySub.scoreAwarded} / {mySub.maxScore} Marks
                      </span>
                    </div>
                    {mySub.fileName && (
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <span className="text-slate-400">Delivered:</span>
                        <span className="font-semibold">{mySub.fileName}</span>
                      </div>
                    )}
                    {mySub.tutorFeedback && (
                      <p className="text-emerald-800 text-[11px] mt-1 pl-5">
                        <strong>Feedback:</strong> {mySub.tutorFeedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── REAL LSRW FILE UPLOAD MODAL ─── */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  submittingAssignment.lsrwSkill === 'SPEAKING' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  submittingAssignment.lsrwSkill === 'LISTENING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  submittingAssignment.lsrwSkill === 'READING' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {submittingAssignment.lsrwSkill} TASK SUBMISSION
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{submittingAssignment.title}</h3>
                <p className="text-xs text-slate-500">
                  Student: <strong>{studentInfo.name}</strong> ({studentInfo.rollNo})
                </p>
              </div>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDeliverable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Upload Deliverable File <span className="text-rose-500">*</span>
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors ${
                    uploadFile 
                      ? 'border-emerald-400 bg-emerald-50/40 text-emerald-900' 
                      : 'border-slate-300 hover:border-[#0052CC] bg-slate-50 hover:bg-blue-50/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept={getAcceptedFileTypes(submittingAssignment.lsrwSkill)}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadFile ? (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-xs mx-auto">
                        {uploadFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit
                      </p>
                      <span className="text-[10px] text-[#0052CC] font-bold hover:underline inline-block pt-1">
                        Click to change file
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center mx-auto">
                        {submittingAssignment.lsrwSkill === 'SPEAKING' ? <Mic className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to browse or drop your {submittingAssignment.lsrwSkill.toLowerCase()} deliverable
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Allowed: {getFormatLabel(submittingAssignment.lsrwSkill)} (Max 25MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Learner Notes or Clarifications (Optional)
                </label>
                <textarea
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="e.g. Completed Part 2 speaking dialogue with focus on nasal vowels and accent."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadFile}
                  className="px-5 py-2.5 bg-[#0052CC] hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Confirm Submission'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Dedicated Questions & Worksheet Detail Modal ─── */}
      {viewingAssignmentPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${
                    viewingAssignmentPrompt.lsrwSkill === 'SPEAKING' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    viewingAssignmentPrompt.lsrwSkill === 'LISTENING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    viewingAssignmentPrompt.lsrwSkill === 'READING' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {viewingAssignmentPrompt.lsrwSkill} TASK
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Max: <strong>{viewingAssignmentPrompt.maxScore} Marks</strong>
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">{viewingAssignmentPrompt.title}</h3>
                <p className="text-xs text-slate-500">
                  {viewingAssignmentPrompt.courseName} • Due: {viewingAssignmentPrompt.dueDate}
                </p>
              </div>
              <button
                onClick={() => setViewingAssignmentPrompt(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Question Brief & Instructions */}
              <div>
                <h4 className="text-xs font-black text-[#0052CC] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#0052CC]" />
                  <span>Worksheet Prompt & Question Instructions</span>
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {viewingAssignmentPrompt.instructions || 'No specific prompt recorded for this worksheet.'}
                </div>
              </div>

              {/* Tutor Materials / Audio / Files */}
              {viewingAssignmentPrompt.attachments && viewingAssignmentPrompt.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Faculty Reference Materials ({viewingAssignmentPrompt.attachments.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {viewingAssignmentPrompt.attachments.map((att, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs">
                        <div className="flex items-center gap-2 truncate">
                          {att.fileType.includes('audio') ? (
                            <FileAudio className="w-4 h-4 text-[#0052CC] shrink-0" />
                          ) : (
                            <File className="w-4 h-4 text-[#0052CC] shrink-0" />
                          )}
                          <span className="font-bold text-slate-800 truncate">{att.fileName}</span>
                          <span className="text-[10px] text-slate-400">({(att.fileSize / 1024).toFixed(0)} KB)</span>
                        </div>
                        <a
                          href={att.fileUrl}
                          download={att.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-white hover:bg-blue-50 text-[#0052CC] border border-blue-200 rounded text-[11px] font-bold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Format required: <strong>{getFormatLabel(viewingAssignmentPrompt.lsrwSkill)}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingAssignmentPrompt(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingAssignmentPrompt;
                    setViewingAssignmentPrompt(null);
                    setSubmittingAssignment(target);
                  }}
                  className="px-5 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
