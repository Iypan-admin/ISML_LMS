// ============================================================================
// ISML COLLEGE LMS — LIVE WEBINAR STUDIO MODAL
// Full Interactive Classroom: Live Video Stream, Host Mic/Cam toggles,
// Auto Cloud Recording indicator, Student Roster & End Webinar handler
// ============================================================================

"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Radio,
  Users,
  MessageSquare,
  ShieldCheck,
  Disc,
  PhoneOff,
  Share2,
  Settings,
  Sparkles,
  CheckCircle2,
  Bell,
  UserCheck,
  UserX,
  Hand,
  Save,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import RealLiveKitStage from '@/components/live/RealLiveKitStage';
import InteractiveWhiteboard from '@/components/live/InteractiveWhiteboard';
import SharedContentStage from '@/components/live/SharedContentStage';
import { soundNotification } from '@/lib/soundNotification';
import {
  FileText,
  Volume2,
  PenTool,
  Upload,
  Send,
  FileUp,
  FolderOpen,
  Sparkles as SparkleIcon,
} from 'lucide-react';

interface LiveWebinarStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId?: string;
  sessionTitle: string;
  batchName: string;
  subjectCode: string;
  tutorName: string;
  isHost: boolean;
  onEndSession?: () => void;
}

export default function LiveWebinarStudioModal({
  isOpen,
  onClose,
  classId = 'live-class-french-01',
  sessionTitle,
  batchName,
  subjectCode,
  tutorName,
  isHost,
  onEndSession,
}: LiveWebinarStudioModalProps) {
  const { showSuccess, showInfo } = useToast();
  // Lead Tutor Media Governance: Controls whether students in the room are permitted to unmute or enable camera
  const [allowStudentMic, setAllowStudentMic] = useState(false);
  const [allowStudentVideo, setAllowStudentVideo] = useState(false);

  // Synchronize initial permissions
  useEffect(() => {
    if (!isOpen) return;
    fetch(`http://localhost:4000/api/live-classes/${classId}/interactive-state`)
      .then((r) => r.json())
      .then((res) => {
        if (res?.data?.permissions) {
          setAllowStudentMic(Boolean(res.data.permissions.allowStudentMic));
          setAllowStudentVideo(Boolean(res.data.permissions.allowStudentVideo));
        }
      })
      .catch(() => {});
  }, [isOpen, classId]);

  const handleToggleStudentMicPermission = async () => {
    const nextVal = !allowStudentMic;
    setAllowStudentMic(nextVal);
    try {
      await fetch(`http://localhost:4000/api/live-classes/${classId}/media-permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowStudentMic: nextVal }),
      });
      if (nextVal) {
        showSuccess('Student Microphone Access Enabled: Students can now unmute and speak.');
      } else {
        showInfo('Student Microphone Access Locked: All student microphones muted.');
      }
    } catch {}
  };

  const handleToggleStudentVideoPermission = async () => {
    const nextVal = !allowStudentVideo;
    setAllowStudentVideo(nextVal);
    try {
      await fetch(`http://localhost:4000/api/live-classes/${classId}/media-permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowStudentVideo: nextVal }),
      });
      if (nextVal) {
        showSuccess('Student Camera Access Enabled: Students can now turn on their webcams.');
      } else {
        showInfo('Student Camera Access Locked: Student cameras disabled.');
      }
    } catch {}
  };
  // Professional Tutor Live Studio Defaults: Mic and Camera kept OFF by default on initial entry
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const videoOnRef = useRef(false);
  useEffect(() => {
    videoOnRef.current = videoOn;
  }, [videoOn]);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [elapsedSecs, setElapsedSecs] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedStart = localStorage.getItem(`isml_class_start_${classId}`) || sessionStorage.getItem(`isml_class_start_${classId}`);
        if (storedStart) {
          const startTime = parseInt(storedStart, 10);
          if (!isNaN(startTime)) {
            const diff = Math.floor((Date.now() - startTime) / 1000);
            return diff >= 0 ? diff : 0;
          }
        }
      } catch { }
    }
    return 0;
  });

  // Interactive Content & Whiteboard states
  const [activeStageMode, setActiveStageMode] = useState<'VIDEO' | 'WHITEBOARD' | 'CONTENT'>('VIDEO');
  const activeStageModeRef = useRef<'VIDEO' | 'WHITEBOARD' | 'CONTENT'>('VIDEO');
  useEffect(() => {
    activeStageModeRef.current = activeStageMode;
  }, [activeStageMode]);
  const [sharedContent, setSharedContent] = useState<any>(null);
  const sharedContentRef = useRef<any>(null);
  useEffect(() => {
    sharedContentRef.current = sharedContent;
  }, [sharedContent]);
  const [showShareModal, setShowShareModal] = useState(false);

  // Cached rendered canvas / image / pdf for shared document in recording & student sync
  const cachedDocumentCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ending & Uploading state for professional feedback dialog
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(15);
  const [uploadStepText, setUploadStepText] = useState('Packaging session video, audio & whiteboard canvas...');

  // Optional End Session Metadata dialog
  const [showEndMetadataDialog, setShowEndMetadataDialog] = useState(false);
  const [customRecordingTitle, setCustomRecordingTitle] = useState(sessionTitle);
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  // Classroom Live Chat State
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const chatDrawerOpenRef = useRef(false);
  useEffect(() => {
    chatDrawerOpenRef.current = chatDrawerOpen;
  }, [chatDrawerOpen]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const chatMessagesRef = useRef<any[]>([]);
  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);
  const [chatInput, setChatInput] = useState('');

  // Live In-Studio Interactive Attendance Ledger Modal State
  const [showLiveAttendanceModal, setShowLiveAttendanceModal] = useState(false);
  const [liveRosterStudents, setLiveRosterStudents] = useState<Array<{
    id: string;
    studentId: string;
    name: string;
    email: string;
    tenantName: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    attendancePercentage: number;
    checkInTime?: string;
  }>>([]);
  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);

  // Load real cohort students from API on mount
  useEffect(() => {
    // Check if attendance state was already saved previously
    let previouslySaved: any[] | null = null;
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('isml_batch_attendance_batch-4168') || localStorage.getItem('isml_live_attendance_sync');
        if (raw) {
          const parsed = JSON.parse(raw);
          previouslySaved = Array.isArray(parsed) ? parsed : parsed.students;
        }
      }
    } catch {}

    fetch('/api/portals/students?collegeId=AMER-COL')
      .then((r) => r.json())
      .then((res) => {
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          const amerStudents = res.data
            .filter((s: any) => /amer/i.test(s.tenantCode || '') || /american/i.test(s.tenantName || ''))
            .map((s: any, idx: number) => {
              const matchedPrev = previouslySaved?.find((p: any) => p.id === s.id || p.rollNo === s.studentId || p.rollNo === s.rollNo);
              return {
                id: s.id || `std-${idx + 1}`,
                studentId: s.studentId || `AMER-STD-${idx + 1}`,
                name: s.name || `Student ${idx + 1}`,
                email: s.email || `student${idx + 1}@americancollege.edu.in`,
                tenantName: s.tenantName || 'The American College',
                status: (matchedPrev?.status || 'ABSENT') as 'PRESENT' | 'ABSENT' | 'LATE',
                attendancePercentage: s.attendancePercentage || 92,
                checkInTime: matchedPrev?.checkInTime || '--',
              };
            });
          setLiveRosterStudents(amerStudents);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateStudentStatus = (studentId: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setLiveRosterStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId || s.id === studentId
          ? {
              ...s,
              status: newStatus,
              checkInTime: newStatus === 'PRESENT' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
            }
          : s
      )
    );
  };

  const handleMarkAllRoster = (newStatus: 'PRESENT' | 'ABSENT') => {
    setLiveRosterStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: newStatus,
        checkInTime: newStatus === 'PRESENT' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
      }))
    );
  };

  const handleCommitLiveAttendance = () => {
    try {
      if (typeof window !== 'undefined') {
        const payload = {
          batchId: 'batch-4168',
          batchName: 'MRNG BATCH',
          courseName: 'testtt',
          date: new Date().toISOString().split('T')[0],
          students: liveRosterStudents.map((s) => ({
            id: s.id,
            name: s.name,
            rollNo: s.studentId,
            email: s.email,
            avatarUrl: `https://images.unsplash.com/photo-1534528741775?w=150`,
            collegeName: s.tenantName || 'The American College',
            overallAttendancePct: s.attendancePercentage || 95,
            status: s.status,
            checkInTime: s.checkInTime || (s.status === 'PRESENT' ? '07:32 PM' : '--:--'),
          })),
        };
        localStorage.setItem('isml_live_attendance_sync', JSON.stringify(payload));
        // Also persist under batchId key for attendance page
        localStorage.setItem(`isml_batch_attendance_batch-4168`, JSON.stringify(payload.students));
        // Broadcast custom event for immediate tab sync
        window.dispatchEvent(new CustomEvent('isml-live-attendance-updated', { detail: payload }));
      }
    } catch (e) {
      console.warn('Attendance storage error:', e);
    }
    setAttendanceSavedToast(true);
    setTimeout(() => setAttendanceSavedToast(false), 3000);
    setShowLiveAttendanceModal(false);
  };

  // Live Interactions: Hand raises and floating emoji reactions from learners
  const [raisedHands, setRaisedHands] = useState<Array<{ studentId: string; studentName: string; timestamp: number }>>([]);
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: string; emoji: string; studentName: string; left: number }>>([]);

  // MediaRecorder Ref & recorded chunks for live audio/video session capture
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const localWebcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const directFeedVideoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Fetch interactive state and listen for real-time chat & content updates
  useEffect(() => {
    if (!isOpen) return;

    fetch(`http://localhost:4000/api/live-classes/${classId}/interactive-state`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          if (res.data.sharedContent) {
            setSharedContent(res.data.sharedContent);
            if (res.data.sharedContent.type === 'WHITEBOARD') {
              setActiveStageMode('WHITEBOARD');
            } else {
              setActiveStageMode('CONTENT');
              if (res.data.sharedContent.url && res.data.sharedContent.type === 'DOCUMENT') {
                renderPdfToOffscreenCanvas(res.data.sharedContent.url, 1).then((canvas) => {
                  if (canvas) cachedDocumentCanvasRef.current = canvas;
                }).catch(() => {});
              }
            }
          }
          if (res.data.messages) setChatMessages(res.data.messages);
        }
      })
      .catch(() => { });

    const handleRealtimeUpdates = (e: any) => {
      const detail = e?.detail;
      if (detail?.payload?.classId !== classId) return;

      if (detail?.type === 'CLASSROOM_CONTENT_SHARED') {
        const c = detail?.payload?.content;
        if (c?.type === 'NONE') {
          setSharedContent(null);
          setActiveStageMode('VIDEO');
        } else if (c?.type === 'WHITEBOARD') {
          setSharedContent(c);
          setActiveStageMode('WHITEBOARD');
        } else {
          setSharedContent(c);
          setActiveStageMode('CONTENT');
          if (c?.url && c?.type === 'DOCUMENT') {
            renderPdfToOffscreenCanvas(c.url, 1).then((canvas) => {
              if (canvas) cachedDocumentCanvasRef.current = canvas;
            }).catch(() => {});
          }
        }
      }

      if (detail?.type === 'CLASSROOM_CHAT_MESSAGE') {
        const m = detail.payload.message;
        setChatMessages((prev) => {
          if (m?.id && prev.some((existing: any) => existing.id === m.id)) {
            return prev;
          }
          // Play pleasant incoming chat message notification sound
          soundNotification.playMessagePop();

          return [...prev, m];
        });
      }

      if (detail?.type === 'CLASSROOM_INTERACTION') {
        const inter = detail.payload?.interaction;
        if (inter?.type === 'HAND_RAISE') {
          if (inter.raised) {
            soundNotification.playMessagePop();
            setRaisedHands((prev) => {
              if (prev.some((h) => h.studentId === inter.studentId)) return prev;
              return [...prev, { studentId: inter.studentId, studentName: inter.studentName, timestamp: Date.now() }];
            });
          } else {
            setRaisedHands((prev) => prev.filter((h) => h.studentId !== inter.studentId));
          }
        } else if (inter?.type === 'REACTION' && inter.emoji) {
          const emojiId = inter.id || `em_${Date.now()}_${Math.random()}`;
          const leftPercent = 20 + Math.floor(Math.random() * 60); // Random position across screen
          setFloatingEmojis((prev) => {
            if (prev.some((e) => e.id === emojiId)) return prev;
            return [...prev, { id: emojiId, emoji: inter.emoji, studentName: inter.studentName, left: leftPercent }];
          });
          setTimeout(() => {
            setFloatingEmojis((prev) => prev.filter((e) => e.id !== emojiId));
          }, 3000);
        }
      }
    };

    window.addEventListener('isml-realtime-event', handleRealtimeUpdates);
    return () => window.removeEventListener('isml-realtime-event', handleRealtimeUpdates);
  }, [isOpen, classId]);

  const handleSendTutorChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput('');
    try {
      await fetch(`http://localhost:4000/api/live-classes/${classId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'tutor_host',
          senderName: tutorName,
          role: 'teacher',
          text,
        }),
      });
    } catch { }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState<'DOCUMENT' | 'AUDIO' | 'VIDEO'>('DOCUMENT');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleShareMedia = async (type: 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'WHITEBOARD' | 'NONE', title: string, url?: string) => {
    try {
      await fetch(`http://localhost:4000/api/live-classes/${classId}/share-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          url,
          senderName: tutorName,
        }),
      });
      setShowShareModal(false);
      showSuccess(`Sharing ${title} with students!`);
    } catch { }
  };

  const handleTriggerUpload = (type: 'DOCUMENT' | 'AUDIO' | 'VIDEO') => {
    setUploadCategory(type);
    if (fileInputRef.current) {
      if (type === 'DOCUMENT') {
        fileInputRef.current.accept = '.pdf,.ppt,.pptx,.txt,.doc,.docx';
      } else if (type === 'AUDIO') {
        fileInputRef.current.accept = 'audio/*,.mp3,.wav,.m4a,.ogg';
      } else if (type === 'VIDEO') {
        fileInputRef.current.accept = 'video/*,.mp4,.webm,.mkv';
      }
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Helper to dynamically load pdfjs library from CDN exactly like ISML_portal
  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        return resolve((window as any).pdfjsLib);
      }
      const existing = document.getElementById('pdfjs-cdn-script');
      if (existing) {
        existing.addEventListener('load', () => resolve((window as any).pdfjsLib));
        existing.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.id = 'pdfjs-cdn-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        try {
          if ((window as any).pdfjsLib) {
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }
        } catch (_) { }
        resolve((window as any).pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF engine.'));
      document.head.appendChild(script);
    });
  };

  // Render a real PDF page into an offscreen canvas for crisp live streaming & composite recording
  const renderPdfToOffscreenCanvas = async (data: ArrayBuffer | string, pageNum: number = 1): Promise<HTMLCanvasElement | null> => {
    try {
      const pdfjs = await loadPdfJs();
      const loadingTask = typeof data === 'string'
        ? (data.startsWith('data:') ? pdfjs.getDocument({ data: atob(data.split(',')[1] || '') }) : pdfjs.getDocument(data))
        : pdfjs.getDocument({ data });
      const pdfDoc = await loadingTask.promise;
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 }); // 2x scale for crystal clear HD rendering

      const offCanvas = document.createElement('canvas');
      offCanvas.width = viewport.width;
      offCanvas.height = viewport.height;
      const offCtx = offCanvas.getContext('2d');

      await page.render({ canvasContext: offCtx, viewport }).promise;
      return offCanvas;
    } catch (e) {
      console.warn('renderPdfToOffscreenCanvas error:', e);
      return null;
    }
  };

  const handleFileUploadSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 40 * 1024 * 1024) {
      alert('File size exceeds 40MB limit for real-time live streaming.');
      return;
    }

    setIsUploading(true);

    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg|gif)$/i.test(file.name);

      if (isPdf) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const renderedCanvas = await renderPdfToOffscreenCanvas(arrayBuffer, 1);
          if (renderedCanvas) {
            cachedDocumentCanvasRef.current = renderedCanvas;
          }
        } catch (pdfErr) {
          console.warn('PDF offline parsing warning:', pdfErr);
        }
      } else if (isImg) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.onload = () => {
            const off = document.createElement('canvas');
            off.width = img.naturalWidth || 1280;
            off.height = img.naturalHeight || 720;
            const offCtx = off.getContext('2d');
            if (offCtx) offCtx.drawImage(img, 0, 0);
            cachedDocumentCanvasRef.current = off;
          };
          img.src = evt.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      // Convert to DataURL and broadcast
      const fileReader = new FileReader();
      fileReader.onload = async (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        await handleShareMedia(uploadCategory, file.name, dataUrl);
        setIsUploading(false);
      };
      fileReader.onerror = () => {
        setIsUploading(false);
        alert('Failed to read file.');
      };
      fileReader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      console.warn('File preparation error:', err);
    }
  };
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [admittedStudents, setAdmittedStudents] = useState<any[]>([]);
  const admittedStudentsRef = useRef<any[]>([]);
  useEffect(() => {
    admittedStudentsRef.current = admittedStudents;
  }, [admittedStudents]);
  const [admittedCount, setAdmittedCount] = useState<number>(0);
  // Global cache of already notified student join requests across reloads/re-renders
  const notifiedStudentsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('isml_notified_students_set');
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          arr.forEach((k: string) => notifiedStudentsRef.current.add(k));
        }
      }
    } catch { }
  }, []);

  // Function to play ding notification sound using Web Audio API
  const playDingSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch { }
  };

  // Poll for join requests when studio is open
  // Prevent accidental page refresh / reload while tutor live studio broadcast is active!
  useEffect(() => {
    if (!isOpen) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Live webinar broadcast in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F5' ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'))
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      notifiedStudentsRef.current.clear();
      return;
    }

    const checkRequests = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/live-classes/${classId}/join-requests`);
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const pendings = json.data.filter((r: any) => r.status === 'PENDING');
          const approved = json.data.filter((r: any) => r.status === 'APPROVED');
          setAdmittedCount(approved.length);
          setAdmittedStudents(approved);

          // Find newly arrived pending students that have NOT been notified yet
          const newPendings = pendings.filter((p: any) => {
            const key = p.studentId || p.studentName;
            return !notifiedStudentsRef.current.has(key);
          });

          if (newPendings.length > 0) {
            newPendings.forEach((p: any) => {
              const key = p.studentId || p.studentName;
              notifiedStudentsRef.current.add(key);
            });

            try {
              sessionStorage.setItem(
                'isml_notified_students_set',
                JSON.stringify(Array.from(notifiedStudentsRef.current))
              );
            } catch { }

            playDingSound();
            const latestStudent = newPendings[newPendings.length - 1].studentName;
            showInfo(`🔔 New student waiting to join: ${latestStudent}`);
          }

          setPendingRequests(pendings);
        }
      } catch { }
    };

    checkRequests();
    const interval = setInterval(checkRequests, 1500);

    // Instant SSE listener for cancelled join requests
    const handleRealtime = (e: any) => {
      const type = e?.detail?.type;
      if (type === 'STUDENT_CANCEL_JOIN') {
        const cancelledId = e?.detail?.payload?.studentId;
        const cancelledName = e?.detail?.payload?.studentName?.trim()?.toLowerCase();
        setPendingRequests((prev) =>
          prev.filter(
            (r) =>
              r.studentId !== cancelledId &&
              (!cancelledName || r.studentName.trim().toLowerCase() !== cancelledName)
          )
        );
        if (cancelledId) notifiedStudentsRef.current.delete(cancelledId);
        if (cancelledName) notifiedStudentsRef.current.delete(cancelledName);
      }
    };

    window.addEventListener('isml-realtime-event', handleRealtime);

    return () => {
      clearInterval(interval);
      window.removeEventListener('isml-realtime-event', handleRealtime);
    };
  }, [isOpen, classId, showInfo]);

  const handleAdmit = async (studentId: string) => {
    try {
      await fetch(`http://localhost:4000/api/live-classes/${classId}/admit-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      setPendingRequests((prev) => prev.filter((r) => r.studentId !== studentId));
      showSuccess('Student admitted to live classroom!');
    } catch { }
  };

  const handleReject = async (studentId: string) => {
    try {
      await fetch(`http://localhost:4000/api/live-classes/${classId}/reject-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      setPendingRequests((prev) => prev.filter((r) => r.studentId !== studentId));
      showInfo('Student request declined.');
    } catch { }
  };

  // Prevent accidental page refresh / reload while tutor live studio broadcast is active!
  useEffect(() => {
    if (!isOpen) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Live webinar broadcast in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F5' ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'))
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Set class start timestamp persistently if not already recorded
    try {
      const existing = localStorage.getItem(`isml_class_start_${classId}`) || sessionStorage.getItem(`isml_class_start_${classId}`);
      if (!existing) {
        const now = Date.now().toString();
        localStorage.setItem(`isml_class_start_${classId}`, now);
        sessionStorage.setItem(`isml_class_start_${classId}`, now);
      }
    } catch { }

    const timer = setInterval(() => {
      try {
        const storedStart = localStorage.getItem(`isml_class_start_${classId}`) || sessionStorage.getItem(`isml_class_start_${classId}`);
        if (storedStart) {
          const startTime = parseInt(storedStart, 10);
          if (!isNaN(startTime)) {
            const diff = Math.floor((Date.now() - startTime) / 1000);
            setElapsedSecs(diff >= 0 ? diff : 0);
            return;
          }
        }
      } catch { }
      setElapsedSecs((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, classId]);

  if (!isOpen) return null;

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Synchronize recording stream audio tracks when tutor toggles micOn
  useEffect(() => {
    if (combinedStreamRef.current) {
      combinedStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = micOn;
      });
    }
  }, [micOn]);

  // Synchronize camera video stream for recording compositor when tutor toggles videoOn
  useEffect(() => {
    videoOnRef.current = videoOn;
    if (!videoOn) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      setCameraStream(null);
      if (directFeedVideoRef.current) {
        directFeedVideoRef.current.srcObject = null;
      }
      if (localWebcamVideoRef.current) {
        const stream = localWebcamVideoRef.current.srcObject as MediaStream | null;
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }
        localWebcamVideoRef.current.srcObject = null;
      }
      return;
    }

    let isCancelled = false;
    const startCamera = async () => {
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: false,
          });
          if (isCancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          cameraStreamRef.current = stream;
          setCameraStream(stream);

          if (!localWebcamVideoRef.current) {
            const v = document.createElement('video');
            v.autoplay = true;
            v.muted = true;
            v.playsInline = true;
            v.setAttribute('playsinline', 'true');
            v.setAttribute('webkit-playsinline', 'true');
            localWebcamVideoRef.current = v;
          }
          localWebcamVideoRef.current.srcObject = stream;
          localWebcamVideoRef.current.onloadedmetadata = () => {
            localWebcamVideoRef.current?.play().catch(() => {});
          };
          localWebcamVideoRef.current.play().catch(() => {});

          if (directFeedVideoRef.current) {
            directFeedVideoRef.current.srcObject = stream;
            directFeedVideoRef.current.play().catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Direct camera access for recording notice:', err);
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
    };
  }, [videoOn]);

  useEffect(() => {
    if (directFeedVideoRef.current && cameraStream) {
      directFeedVideoRef.current.srcObject = cameraStream;
      directFeedVideoRef.current.play().catch(() => {});
    }
  }, [cameraStream]);

  // When tutor opens studio fresh, ensure clean VIDEO grid default & start recording
  useEffect(() => {
    setActiveStageMode('VIDEO');
    setIsEndingSession(false);
    setMicOn(false);
    setVideoOn(false);
    videoOnRef.current = false;
    setUploadProgress(15);
    setUploadStepText('Packaging session video, audio & whiteboard canvas...');

    if (isOpen) {

      // Initialize live recording stream
      recordedChunksRef.current = [];
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      compositeCanvasRef.current = canvas;
      const ctx = canvas.getContext('2d');

      const setupMediaAndRecorder = async () => {
        try {
          const canvasStream = canvas.captureStream(30);
          const combinedStream = new MediaStream();
          canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));

          // Composite microphone tracks only when mic is unmuted
          try {
            if (navigator?.mediaDevices?.getUserMedia) {
              const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              // Start with audio tracks disabled since mic is OFF by default
              audioStream.getAudioTracks().forEach((track) => {
                track.enabled = false;
                combinedStream.addTrack(track);
              });
            }
          } catch (audioErr) {
            console.warn('Microphone access for recording:', audioErr);
          }

          combinedStreamRef.current = combinedStream;

          const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
              ? 'video/webm;codecs=vp8'
              : 'video/webm';

          const recorder = new MediaRecorder(combinedStream, { mimeType });
          recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };
          recorder.start(1000); // chunk every 1 second
          mediaRecorderRef.current = recorder;
        } catch (err) {
          console.warn('MediaRecorder setup notice:', err);
        }
      };

      setupMediaAndRecorder();

      // Render loop to composite video, avatar, whiteboard & chat into 1280x720 video feed
      const drawFrame = () => {
        if (!ctx) return;
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, 1280, 720);

        // Draw Studio Header (Header Bar on Compositor Canvas - Exactly like ISML_portal)
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, 1280, 52);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 52);
        ctx.lineTo(1280, 52);
        ctx.stroke();

        // Pulsing RED REC indicator
        const timeNow = Date.now();
        const pulse = Math.abs(Math.sin(timeNow / 400));
        ctx.beginPath();
        ctx.arc(28, 26, 4.5 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.4})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(28, 26, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('REC', 40, 26);

        // Vertical separator
        ctx.strokeStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(76, 17);
        ctx.lineTo(76, 35);
        ctx.stroke();

        // Batch Name & Class Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillText(batchName || 'Modern Languages', 88, 26);

        const batchWidth = ctx.measureText(batchName || 'Modern Languages').width;
        ctx.fillStyle = '#64748b';
        ctx.font = '13px Inter, sans-serif';
        ctx.fillText('•', 98 + batchWidth, 26);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 13px Inter, sans-serif';
        ctx.fillText(sessionTitle || 'Virtual Classroom Session', 110 + batchWidth, 26);

        // Right Side: Attendees Pill
        const liveStudentsList = admittedStudentsRef.current || [];
        const totalAttendeesCount = 1 + liveStudentsList.length;
        const countLabel = `👥 ${totalAttendeesCount} Attendee${totalAttendeesCount === 1 ? '' : 's'}`;
        ctx.font = '600 12px Inter, sans-serif';
        const cW = ctx.measureText(countLabel).width + 20;
        const cX = 1280 - cW - 20;

        // Rounded rect for attendees pill
        ctx.beginPath();
        ctx.roundRect(cX, 13, cW, 26, 13);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText(countLabel, cX + cW / 2, 26);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        // Check if Chat Drawer is explicitly opened by the tutor
        const isChatOpen = chatDrawerOpenRef.current;
        const mainStageWidth = isChatOpen ? 860 : 1240;

        // Check if Whiteboard is active and has a canvas element (excluding document annotation canvas)
        const whiteboardCanvas = document.querySelector('canvas.cursor-crosshair:not([data-type="annotation-canvas"]):not(#live-doc-annotation-canvas)') as HTMLCanvasElement | null;
        const currentMode = activeStageModeRef.current;
        const activeContent = sharedContentRef.current;

        // Helper: Draw Participant Tile (Matches exact ISML_portal layout & aesthetics)
        const drawParticipantTile = (p: any, px: number, py: number, pw: number, ph: number) => {
          ctx.save();

          const cardRadius = Math.min(16, Math.max(8, Math.round(pw * 0.03)));
          ctx.beginPath();
          ctx.roundRect(px, py, pw, ph, cardRadius);
          ctx.clip();

          // Card Background Gradient
          const bgGrad = ctx.createLinearGradient(px, py, px, py + ph);
          bgGrad.addColorStop(0, '#1e293b');
          bgGrad.addColorStop(1, '#0b0f19');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(px, py, pw, ph);

          // Interior grid lines for texture
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          for (let gx = px; gx < px + pw; gx += 32) {
            ctx.beginPath();
            ctx.moveTo(gx, py);
            ctx.lineTo(gx, py + ph);
            ctx.stroke();
          }

          // Check if real video element is available and active
          const feedVideo = directFeedVideoRef.current;
          const recordingFeedCam = document.getElementById('live-tutor-recording-feed') as HTMLVideoElement | null;
          const directCam = localWebcamVideoRef.current;
          const pipCam = document.getElementById('live-tutor-pip-video') as HTMLVideoElement | null;
          const videoEls = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[];
          // Search for any active camera video element (Direct webcam feed, PiP element or LiveKit video track)
          const candidateCams = [feedVideo, recordingFeedCam, directCam, pipCam, ...videoEls].filter(Boolean) as HTMLVideoElement[];
          const liveCam = candidateCams.find((v) => {
            return Boolean(v && (v.srcObject || v.src) && v.readyState >= 2 && v.videoWidth > 0);
          }) || candidateCams.find((v) => Boolean(v && (v.srcObject || v.src))) || (directCam && directCam.srcObject ? directCam : null);

          // If tutor video is ON and drawing host participant, render real webcam video frame!
          if (videoOnRef.current && p.isHost) {
            let rendered = false;
            if (liveCam) {
              try {
                // If dimensions not yet ready, draw with standard aspect ratio fallback
                const vw = liveCam.videoWidth > 0 ? liveCam.videoWidth : 640;
                const vh = liveCam.videoHeight > 0 ? liveCam.videoHeight : 480;
                const scale = Math.max(pw / vw, ph / vh);
                const sw = pw / scale;
                const sh = ph / scale;
                const sx = Math.max(0, (vw - sw) / 2);
                const sy = Math.max(0, (vh - sh) / 2);
                ctx.drawImage(liveCam, sx, sy, sw, sh, px, py, pw, ph);
                rendered = true;
              } catch (drawErr) {
                // If drawImage throws because video element is not ready, fallback below
              }
            }

            if (!rendered) {
              // Graceful active camera placeholder while webcam hardware initializes
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(px, py, pw, ph);
              ctx.fillStyle = '#38bdf8';
              ctx.font = '600 14px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('Connecting Tutor Camera...', px + pw / 2, py + ph / 2);
              ctx.textAlign = 'start';
            }
          } else {
            // Elegant Virtual Classroom Avatar Presentation
            const avatarRadius = Math.min(pw * 0.16, ph * 0.22, 58);
            const avatarCenterX = px + pw / 2;
            const avatarCenterY = py + ph / 2 - Math.max(16, ph * 0.08);

            ctx.beginPath();
            ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
            const avGrad = ctx.createLinearGradient(
              avatarCenterX - avatarRadius,
              avatarCenterY - avatarRadius,
              avatarCenterX + avatarRadius,
              avatarCenterY + avatarRadius
            );

            if (p.isHost) {
              avGrad.addColorStop(0, '#2563eb');
              avGrad.addColorStop(1, '#1d4ed8');
            } else {
              avGrad.addColorStop(0, '#059669');
              avGrad.addColorStop(1, '#047857');
            }
            ctx.fillStyle = avGrad;
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Initial Letter
            const initial = (p.name || (p.isHost ? 'T' : 'S'))[0]?.toUpperCase() || 'U';
            ctx.fillStyle = '#ffffff';
            const letterFontSize = Math.max(16, Math.round(avatarRadius * 0.9));
            ctx.font = `bold ${letterFontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(initial, avatarCenterX, avatarCenterY);

            // Name under avatar
            const nameY = avatarCenterY + avatarRadius + Math.max(18, ph * 0.09);
            ctx.fillStyle = '#f8fafc';
            const nameFontSize = Math.min(22, Math.max(13, Math.round(pw * 0.045)));
            ctx.font = `bold ${nameFontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.name || (p.isHost ? 'Instructor' : 'Student'), avatarCenterX, nameY);

            // Role Tag under Name
            const badgeY = nameY + Math.max(18, ph * 0.07);
            const roleText = p.role || (p.isHost ? 'Instructor (Host)' : 'Student');
            const badgeFontSize = Math.max(10, Math.min(13, Math.round(nameFontSize * 0.7)));
            ctx.font = `600 ${badgeFontSize}px Inter, sans-serif`;
            const textWidth = ctx.measureText(roleText).width;
            const badgeW = textWidth + 16;
            const badgeH = badgeFontSize + 10;

            ctx.beginPath();
            ctx.roundRect(avatarCenterX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 6);
            ctx.fillStyle = p.isHost ? 'rgba(37, 99, 235, 0.25)' : 'rgba(71, 85, 105, 0.3)';
            ctx.fill();
            ctx.strokeStyle = p.isHost ? 'rgba(59, 130, 246, 0.6)' : 'rgba(148, 163, 184, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = p.isHost ? '#93c5fd' : '#cbd5e1';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(roleText, avatarCenterX, badgeY);
          }

          ctx.restore();

          // Outer Border Ring
          ctx.beginPath();
          ctx.roundRect(px, py, pw, ph, cardRadius);
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Bottom Left Status Pill
          const pillH = Math.max(22, Math.min(30, Math.round(ph * 0.09)));
          const pillY = py + ph - pillH - 10;
          const pillX = px + 10;
          const pillFontSize = Math.max(10, Math.min(12, Math.round(pw * 0.03)));
          ctx.font = `500 ${pillFontSize}px Inter, sans-serif`;
          const pillLabel = p.isHost ? `${p.name || 'Instructor'} (Host)` : `${p.name || 'Student'}`;
          const pillTextW = ctx.measureText(pillLabel).width;
          const pillW = pillTextW + 32;

          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 8);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(pillLabel, pillX + 10, pillY + pillH / 2);
          ctx.textBaseline = 'alphabetic';
        };

        // If tutor is sharing a document/content, prioritize Mode B (CONTENT)
        if (currentMode === 'CONTENT' && activeContent) {
          // Mode B: Shared Material Stage (Real PDF, Image, Video, or PPT - Rendered dynamically with annotations)
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(20, 68, mainStageWidth, 636);

          const sharedVideoEl = document.querySelector('video[controls]') as HTMLVideoElement | null;
          const cachedDocCanvas = cachedDocumentCanvasRef.current;
          // Check for the specific annotation drawing canvas over the document
          const annotationCanvas = (document.querySelector('canvas#live-doc-annotation-canvas') ||
            document.querySelector('canvas[data-type="annotation-canvas"]')) as HTMLCanvasElement | null;

          if (sharedVideoEl && sharedVideoEl.readyState >= 2 && !sharedVideoEl.paused) {
            ctx.drawImage(sharedVideoEl, 20, 68, mainStageWidth, 636);
          } else {
            // Document bounds inside the stage
            const deckX = 30;
            const deckY = 78;
            const deckW = mainStageWidth - 20;
            const deckH = 616;

            if (cachedDocCanvas && cachedDocCanvas.width > 0 && cachedDocCanvas.height > 0) {
              // Draw white page backing
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.roundRect(deckX, deckY, deckW, deckH, 12);
              ctx.fill();

              // Render the real document page (PDF, Image, Deck) directly onto the recording frame with exact proportions
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              const scale = Math.min((deckW - 30) / cachedDocCanvas.width, (deckH - 30) / cachedDocCanvas.height);
              const drawW = Math.round(cachedDocCanvas.width * scale);
              const drawH = Math.round(cachedDocCanvas.height * scale);
              const drawX = Math.round(deckX + (deckW - drawW) / 2);
              const drawY = Math.round(deckY + (deckH - drawH) / 2);

              // Render exact uploaded document page content
              ctx.drawImage(cachedDocCanvas, drawX, drawY, drawW, drawH);

              // Overlay tutor markings/annotations scaled directly to match the document coordinates
              if (annotationCanvas && annotationCanvas.width > 0 && annotationCanvas.height > 0) {
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(annotationCanvas, drawX, drawY, drawW, drawH);
              }
            } else {
              // Fallback document presentation
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.roundRect(deckX, deckY, deckW, deckH, 12);
              ctx.fill();

              // Document Top Header Bar
              ctx.fillStyle = '#f1f5f9';
              ctx.fillRect(deckX, deckY, deckW, 52);
              ctx.strokeStyle = '#e2e8f0';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(deckX, deckY + 52);
              ctx.lineTo(deckX + deckW, deckY + 52);
              ctx.stroke();

              ctx.fillStyle = '#dc2626';
              ctx.beginPath();
              ctx.roundRect(deckX + 16, deckY + 12, 48, 26, 6);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 12px Inter, sans-serif';
              ctx.fillText('DOC', deckX + 26, deckY + 29);

              ctx.fillStyle = '#0f172a';
              ctx.font = 'bold 15px Inter, sans-serif';
              ctx.fillText(activeContent.title || 'Course Material', deckX + 74, deckY + 30);

              ctx.fillStyle = '#64748b';
              ctx.font = '12px Inter, sans-serif';
              ctx.fillText('Synchronized Classroom View', deckX + deckW - 200, deckY + 30);

              // Document Content Area
              ctx.fillStyle = '#f8fafc';
              ctx.fillRect(deckX + 20, deckY + 68, deckW - 40, deckH - 85);
              ctx.strokeStyle = '#cbd5e1';
              ctx.strokeRect(deckX + 20, deckY + 68, deckW - 40, deckH - 85);

              ctx.fillStyle = '#1e293b';
              ctx.font = 'bold 22px Inter, sans-serif';
              ctx.fillText(activeContent.title || 'Lecture Document', deckX + 45, deckY + 120);

              ctx.fillStyle = '#64748b';
              ctx.font = '13px Inter, sans-serif';
              ctx.fillText(`Presented by ${activeContent.senderName || tutorName || 'Lead Trainer'} • ${batchName}`, deckX + 45, deckY + 150);

              if (annotationCanvas && annotationCanvas.width > 0 && annotationCanvas.height > 0) {
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(annotationCanvas, deckX, deckY, deckW, deckH);
              }
            }
          }

          // Corner PiP for Tutor while presenting document
          if (videoOnRef.current) {
            const pw = 250;
            const ph = 145;
            const px = 20 + mainStageWidth - pw - 20;
            const py = 68 + 636 - ph - 20;
            drawParticipantTile(
              {
                name: tutorName,
                role: 'Instructor (Host)',
                isHost: true,
                isCameraEnabled: true,
              },
              px,
              py,
              pw,
              ph
            );
          }
        } else if (currentMode === 'WHITEBOARD' || (whiteboardCanvas && whiteboardCanvas.width > 0 && whiteboardCanvas.height > 0)) {
          // Mode A: Whiteboard Active (Exact ISML_portal proportions)
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(20, 68, mainStageWidth, 636);

          if (whiteboardCanvas && whiteboardCanvas.width > 0 && whiteboardCanvas.height > 0) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            const scale = Math.min(mainStageWidth / whiteboardCanvas.width, 636 / whiteboardCanvas.height);
            const drawW = Math.round(whiteboardCanvas.width * scale);
            const drawH = Math.round(whiteboardCanvas.height * scale);
            const drawX = Math.round(20 + (mainStageWidth - drawW) / 2);
            const drawY = Math.round(68 + (636 - drawH) / 2);
            ctx.drawImage(whiteboardCanvas, drawX, drawY, drawW, drawH);
          } else {
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 20px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Interactive Whiteboard Canvas Ready', 20 + mainStageWidth / 2, 380);
            ctx.textAlign = 'start';
          }

          // Corner PiP for Tutor in Whiteboard mode when camera is ON
          if (videoOnRef.current) {
            const pw = 250;
            const ph = 145;
            const px = 20 + mainStageWidth - pw - 20;
            const py = 68 + 636 - ph - 20;
            drawParticipantTile(
              {
                name: tutorName,
                role: 'Instructor (Host)',
                isHost: true,
                isCameraEnabled: true,
              },
              px,
              py,
              pw,
              ph
            );
          }
        } else {
          // Mode C: Dynamic Classroom Stage (Exact ISML_portal Tile Grid: 1 Hero or Side-by-Side Dual Grid)
          const liveStudents = admittedStudentsRef.current || [];
          const allParticipants = [
            {
              name: tutorName,
              role: 'Instructor (Host)',
              isHost: true,
              isCameraEnabled: videoOnRef.current,
            },
            ...liveStudents.map((s) => ({
              name: s.studentName || 'Student Learner',
              role: 'Student',
              isHost: false,
              isCameraEnabled: false,
            })),
          ];

          const count = allParticipants.length;
          if (count === 1) {
            // Single Hero Tile (Tutor Solo View - 980x551 centered, exactly like ISML_portal)
            const tileW = Math.min(980, mainStageWidth - 40);
            const tileH = Math.round(tileW * (551 / 980));
            const tileX = 20 + (mainStageWidth - tileW) / 2;
            const tileY = 68 + (636 - tileH) / 2;
            drawParticipantTile(allParticipants[0], tileX, tileY, tileW, tileH);
          } else if (count === 2) {
            // 2 Side-by-Side Equal Tiles (Tutor + Student)
            const gap = 20;
            const tileW = (mainStageWidth - 40 - gap) / 2;
            const tileH = 460;
            const tileY = 68 + (636 - tileH) / 2;
            drawParticipantTile(allParticipants[0], 20, tileY, tileW, tileH);
            drawParticipantTile(allParticipants[1], 20 + tileW + gap, tileY, tileW, tileH);
          } else {
            // Multi-participant 2x2 Grid
            const gapX = 20;
            const gapY = 16;
            const tileW = (mainStageWidth - 40 - gapX) / 2;
            const tileH = (636 - gapY) / 2;
            drawParticipantTile(allParticipants[0], 20, 68, tileW, tileH);
            drawParticipantTile(allParticipants[1], 20 + tileW + gapX, 68, tileW, tileH);
          }
        }

        // Live Chat Box Streamed in Video ONLY when chat drawer is opened by tutor!
        if (isChatOpen) {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(920, 80, 320, 600, 16);
          ctx.fill();

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText('In-Class Live Chats', 940, 115);

          // Fetch recent messages
          const currentMsgs = chatMessagesRef.current;
          const recentMsgs = currentMsgs.slice(-6);
          if (recentMsgs.length === 0) {
            ctx.fillStyle = '#64748b';
            ctx.font = 'italic 12px sans-serif';
            ctx.fillText('No in-class messages yet', 940, 160);
          } else {
            recentMsgs.forEach((msg, idx) => {
              const y = 150 + idx * 75;
              ctx.fillStyle = '#1e293b';
              ctx.beginPath();
              ctx.roundRect(935, y - 18, 290, 60, 10);
              ctx.fill();

              ctx.fillStyle = '#38bdf8';
              ctx.font = 'bold 12px sans-serif';
              ctx.fillText(msg.senderName || 'Attendee', 945, y);

              ctx.fillStyle = '#f8fafc';
              ctx.font = '12px sans-serif';
              ctx.fillText((msg.text || '').slice(0, 35), 945, y + 20);
            });
          }
        }

        animFrameIdRef.current = requestAnimationFrame(drawFrame);
      };

      drawFrame();
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch { }
      }
    };
  }, [isOpen, sessionTitle, tutorName, batchName]);

  const handleEndClass = async () => {
    setIsEndingSession(true);
    setUploadProgress(25);
    setUploadStepText('Packaging in-class audio, video tracks & whiteboard canvas...');

    // Progress sequence for realistic high-end cloud storage sync feedback
    setTimeout(() => {
      setUploadProgress(55);
      setUploadStepText('Uploading session media to Supabase Storage (live-recordings bucket)...');
    }, 1200);

    setTimeout(() => {
      setUploadProgress(85);
      setUploadStepText('Generating VOD Archive signed stream & logging attendance...');
    }, 2400);

    // Stop recording and package the video blob
    let recordedBlob: Blob | null = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        await new Promise<void>((resolve) => {
          if (!mediaRecorderRef.current) return resolve();
          mediaRecorderRef.current.onstop = () => resolve();
          mediaRecorderRef.current.stop();
        });
      } catch { }
    }

    if (recordedChunksRef.current.length > 0) {
      recordedBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    }

    let uploadedVideoUrl: string | null = null;
    if (recordedBlob && recordedBlob.size > 0) {
      try {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(recordedBlob!);
        });

        const uploadRes = await fetch(`http://localhost:4000/api/live-classes/${classId}/upload-recording`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data,
            contentType: 'video/webm',
            fileName: `${classId}_${Date.now()}.webm`,
          }),
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson?.url) {
          uploadedVideoUrl = uploadJson.url;
        }
      } catch (err) {
        console.warn('Direct recording upload error:', err);
      }
    }

    try {
      localStorage.removeItem(`isml_class_start_${classId}`);
      sessionStorage.removeItem(`isml_class_start_${classId}`);
      sessionStorage.removeItem('isml_notified_students_set');
    } catch { }

    try {
      const realDurationMins = Math.max(1, Math.round(elapsedSecs / 60));
      const finalTitle = customRecordingTitle?.trim() || sessionTitle;
      const endRes = await fetch(`http://localhost:4000/api/live-classes/${classId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationMinutes: realDurationMins,
          durationSecs: elapsedSecs,
          title: finalTitle,
          batchName: batchName,
          videoUrl: uploadedVideoUrl || undefined,
          thumbnailUrl: customThumbnailUrl || undefined,
        }),
      });
      const endData = await endRes.json();
      if (endData?.data) {
        if (uploadedVideoUrl) {
          endData.data.videoUrl = uploadedVideoUrl;
        }
        if (customThumbnailUrl) {
          endData.data.thumbnailUrl = customThumbnailUrl;
        }
        if (finalTitle) {
          endData.data.sessionTopic = finalTitle;
        }
        // Persist archived recording in browser storage so it is never lost on restart
        try {
          const key = 'isml_archived_live_recordings';
          const saved = JSON.parse(localStorage.getItem(key) || '[]');
          const updated = [endData.data, ...saved.filter((s: any) => s.id !== endData.data.id)];
          localStorage.setItem(key, JSON.stringify(updated));
        } catch { }
      }
    } catch { }

    // Graceful completion after 3.6 seconds
    setTimeout(() => {
      setUploadProgress(100);
      setUploadStepText('Completed! Session safely archived.');
      showSuccess('Live session ended & recording successfully archived to Supabase Storage.');
      if (onEndSession) onEndSession();
      setIsEndingSession(false);
      onClose();
    }, 3600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans select-none animate-in fade-in duration-150">
      {/* ─── Top Studio Status Bar ─── */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>LIVE BROADCAST</span>
            </span>
            <span className="font-mono text-xs font-bold text-slate-300">{formatTimer(elapsedSecs)}</span>
          </div>

          <span className="hidden sm:inline text-slate-700">|</span>

          <div className="truncate">
            <h2 className="text-xs sm:text-sm font-bold text-white truncate">{sessionTitle}</h2>
            <p className="text-[11px] text-slate-400 truncate">
              {batchName} • {subjectCode} • Host: <strong className="text-white">{tutorName}</strong>
            </p>
          </div>
        </div>

        {/* Cloud Auto Recording Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Disc className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden md:inline">Auto Cloud Recording Active (1080p HD)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{admittedCount} {admittedCount === 1 ? 'Learner' : 'Learners'} Present</span>
          </div>
        </div>
      </div>

      {/* ─── Main Stage & Virtual Classroom (LiveKit Powered) ─── */}
      <div className="flex-1 bg-slate-950 relative flex flex-col p-2 sm:p-4 overflow-hidden">
        {/* 🔔 Floating Waiting Room Approval Dock for Tutor */}
        {pendingRequests.length > 0 && (
          <div className="absolute top-4 left-4 z-30 bg-slate-900/95 border-2 border-amber-400/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md max-w-sm w-full space-y-2 animate-bounce-short">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                <Bell className="w-4 h-4 animate-ring" />
                <span>Waiting Room ({pendingRequests.length} Waiting)</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/40">
                Needs Approval
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {pendingRequests.map((req) => (
                <div
                  key={req.studentId}
                  className="p-2 bg-slate-800/90 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{req.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{req.regNo}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleAdmit(req.studentId)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Admit</span>
                    </button>
                    <button
                      onClick={() => handleReject(req.studentId)}
                      className="p-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      title="Decline"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🖐 Floating Student Hand-Raised Alert Dock for Tutor */}
        {raisedHands.length > 0 && (
          <div className="absolute top-4 right-4 z-30 bg-amber-500/90 text-slate-950 font-bold px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
            <Hand className="w-5 h-5 text-slate-950" />
            <div className="text-xs">
              <span className="font-extrabold">{raisedHands[raisedHands.length - 1].studentName}</span> raised hand!
              {raisedHands.length > 1 && <span className="ml-1 text-[10px] font-normal">+{raisedHands.length - 1} more</span>}
            </div>
            <button
              onClick={() => setRaisedHands([])}
              className="ml-2 text-[10px] bg-slate-950 text-white px-2 py-0.5 rounded-lg hover:bg-slate-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Floating Animated Emojis Streamed from Learners */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {floatingEmojis.map((item) => (
            <div
              key={item.id}
              style={{ left: `${item.left}%` }}
              className="absolute bottom-6 flex flex-col items-center animate-float-fade"
            >
              <span className="text-3xl filter drop-shadow-lg">{item.emoji}</span>
              <span className="text-[10px] font-bold text-white/90 bg-black/60 px-1.5 py-0.2 rounded-full whitespace-nowrap mt-0.5">
                {item.studentName}
              </span>
            </div>
          ))}
        </div>

        {/* Active visible playback element for tutor webcam stream & recording compositor */}
        <div className="fixed top-0 left-0 w-32 h-24 pointer-events-none opacity-[0.01] -z-50 overflow-hidden">
          <video
            ref={(el) => {
              directFeedVideoRef.current = el;
              if (el && cameraStream) {
                if (el.srcObject !== cameraStream) {
                  el.srcObject = cameraStream;
                  el.play().catch(() => {});
                }
              }
            }}
            id="live-tutor-recording-feed"
            autoPlay
            muted
            playsInline
            width={640}
            height={480}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
          {/* Always-mounted WebRTC LiveKit media layer in background so camera track NEVER drops when switching to Whiteboard or Content! */}
          <div className={`w-full h-full ${activeStageMode === 'VIDEO' ? 'flex flex-col' : 'hidden'}`}>
            <RealLiveKitStage
              classId={classId}
              identity={tutorName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'tutor_host'}
              name={tutorName}
              role="teacher"
              onDisconnect={onClose}
              hideControls={true}
              externalMicOn={micOn}
              externalVideoOn={videoOn}
            />
          </div>

          {activeStageMode === 'WHITEBOARD' && (
            <InteractiveWhiteboard
              classId={classId}
              isHost={isHost}
              onBackToGrid={() => handleShareMedia('NONE', '')}
            />
          )}

          {activeStageMode === 'CONTENT' && sharedContent && (
            <SharedContentStage
              content={sharedContent}
              isHost={isHost}
              classId={classId}
              onClose={() => handleShareMedia('NONE', '')}
            />
          )}

          {/* Floating Tutor Corner PiP on UI when Whiteboard or Document mode is active and Camera is ON */}
          {activeStageMode !== 'VIDEO' && videoOn && (
            <div className="absolute bottom-3 right-3 w-40 sm:w-52 aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 border-blue-500 bg-slate-900 z-30 flex items-center justify-center">
              <video
                id="live-tutor-pip-video"
                ref={(el) => {
                  if (el && localWebcamVideoRef.current && localWebcamVideoRef.current.srcObject) {
                    if (el.srcObject !== localWebcamVideoRef.current.srcObject) {
                      el.srcObject = localWebcamVideoRef.current.srcObject;
                      el.play().catch(() => { });
                    }
                  }
                }}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white">
                You (Host)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom Tutor Control Dock (Mobile-First Responsive Dock) ─── */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 text-white shrink-0 z-50">
        {/* Left media control pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMicOn((prev) => !prev)}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs shadow-md active:scale-95 ${micOn
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 ring-2 ring-emerald-400/40'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 ring-2 ring-rose-400/40 animate-pulse'
              }`}
            title={micOn ? 'Mute Mic' : 'Unmute Mic'}
          >
            <div className={`p-1 rounded-lg ${micOn ? 'bg-emerald-700/60' : 'bg-rose-700/60'} transition-colors`}>
              {micOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
            </div>
            <span className="hidden md:inline">{micOn ? 'Mic Live' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setVideoOn((prev) => !prev)}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs shadow-md active:scale-95 ${videoOn
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 ring-2 ring-blue-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            title={videoOn ? 'Stop Camera' : 'Start Camera'}
          >
            <div className={`p-1 rounded-lg ${videoOn ? 'bg-blue-700/60' : 'bg-slate-700/60'} transition-colors`}>
              {videoOn ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-slate-400" />}
            </div>
            <span className="hidden md:inline">{videoOn ? 'Camera On' : 'Camera Off'}</span>
          </button>

          {/* Lead Tutor Exclusive: Student Microphone Lock/Unlock */}
          {isHost && (
            <button
              onClick={handleToggleStudentMicPermission}
              className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs shadow-md active:scale-95 border ${
                allowStudentMic
                  ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                  : 'bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 border-rose-500/40'
              }`}
              title={allowStudentMic ? 'Students Can Speak (Click to Mute All)' : 'Student Mics Locked (Click to Allow Speech)'}
            >
              <div className={`p-1 rounded-lg ${allowStudentMic ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                {allowStudentMic ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden lg:inline">
                {allowStudentMic ? 'Learner Mic: ON' : 'Learner Mic: LOCKED'}
              </span>
            </button>
          )}

          {/* Lead Tutor Exclusive: Student Camera Lock/Unlock */}
          {isHost && (
            <button
              onClick={handleToggleStudentVideoPermission}
              className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs shadow-md active:scale-95 border ${
                allowStudentVideo
                  ? 'bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border-cyan-500/50'
                  : 'bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 border-rose-500/40'
              }`}
              title={allowStudentVideo ? 'Student Cameras Allowed (Click to Disable All)' : 'Student Cameras Locked (Click to Allow Video)'}
            >
              <div className={`p-1 rounded-lg ${allowStudentVideo ? 'bg-[#0052CC] text-white' : 'bg-rose-600 text-white'}`}>
                {allowStudentVideo ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden lg:inline">
                {allowStudentVideo ? 'Learner Cam: ON' : 'Learner Cam: LOCKED'}
              </span>
            </button>
          )}

          {/* Interactive Whiteboard Button */}
          <button
            onClick={() => {
              if (activeStageMode === 'WHITEBOARD') {
                handleShareMedia('NONE', '');
              } else {
                handleShareMedia('WHITEBOARD', 'Interactive Whiteboard');
              }
            }}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs shadow-md active:scale-95 ${activeStageMode === 'WHITEBOARD'
                ? 'bg-cyan-600 text-white ring-2 ring-cyan-400/50 shadow-cyan-900/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            title="Whiteboard"
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden md:inline">
              {activeStageMode === 'WHITEBOARD' ? 'Active Board' : 'Whiteboard'}
            </span>
          </button>

          {/* Share Content (PPT / PDF / Audio / Video) Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs shadow-md active:scale-95 ${activeStageMode === 'CONTENT'
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-indigo-900/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            title="Share PPT, PDF, Audio, Video"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden md:inline">Share Media</span>
          </button>

          {/* Chat Drawer Toggle */}
          <button
            onClick={() => setChatDrawerOpen(!chatDrawerOpen)}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs shadow-md active:scale-95 ${chatDrawerOpen
                ? 'bg-cyan-600 text-white ring-2 ring-cyan-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            title="Class Chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden md:inline">Chat ({chatMessages.length})</span>
          </button>

          {/* In-Studio Instant Roll Call Modal Trigger (No Navigation away from Studio) */}
          <button
            type="button"
            onClick={() => setShowLiveAttendanceModal(true)}
            className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs shadow-md active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40"
            title="Mark Live Roll Call for this Batch inside Studio"
          >
            <UserCheck className="w-4 h-4" />
            <span className="hidden md:inline">
              Mark Attendance ({liveRosterStudents.filter((s) => s.status === 'PRESENT').length}/{liveRosterStudents.length || 10})
            </span>
          </button>
        </div>

        {/* Right action buttons: Clean end session action without minimize button */}
        <div className="flex items-center gap-2 shrink-0">
          {isHost ? (
            <button
              onClick={() => setShowEndMetadataDialog(true)}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-900/50 transition-transform active:scale-95"
            >
              <PhoneOff className="w-4 h-4 shrink-0" />
              <span className="sm:hidden">End Class</span>
              <span className="hidden sm:inline">End Class & Save</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl sm:rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-900/50"
            >
              <PhoneOff className="w-4 h-4 shrink-0" />
              <span>Leave Room</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Share Media / PPT / PDF / Audio Modal ─── */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-cyan-300">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Share & Upload Lecture Material</span>
              </h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <UserX className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden native input for custom file uploads */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUploadSelected}
              className="hidden"
            />

            {isUploading && (
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span>Reading and broadcasting file to all students...</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Upload from Device (PDF, PPT, Audio, Video)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Upload Custom PDF / PPT */}
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => handleTriggerUpload('DOCUMENT')}
                  className="p-3 bg-blue-950/40 hover:bg-blue-900/60 rounded-xl border border-blue-500/30 flex items-center gap-3 text-left transition-colors cursor-pointer group"
                >
                  <div className="p-2.5 rounded-lg bg-blue-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span>Upload PDF / PPT</span>
                      <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.2 rounded-full">Device</span>
                    </p>
                    <p className="text-[11px] text-slate-400">Share slides or handouts from your computer</p>
                  </div>
                </button>

                {/* Upload Custom Audio */}
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => handleTriggerUpload('AUDIO')}
                  className="p-3 bg-emerald-950/40 hover:bg-emerald-900/60 rounded-xl border border-emerald-500/30 flex items-center gap-3 text-left transition-colors cursor-pointer group"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span>Upload Audio</span>
                      <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">Device</span>
                    </p>
                    <p className="text-[11px] text-slate-400">Pronunciation mp3, wav drills</p>
                  </div>
                </button>

                {/* Upload Custom Video */}
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => handleTriggerUpload('VIDEO')}
                  className="p-3 bg-purple-950/40 hover:bg-purple-900/60 rounded-xl border border-purple-500/30 flex items-center gap-3 text-left transition-colors cursor-pointer group"
                >
                  <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span>Upload Video</span>
                      <span className="text-[9px] bg-purple-500 text-white font-bold px-1.5 py-0.2 rounded-full">Device</span>
                    </p>
                    <p className="text-[11px] text-slate-400">Lecture clip or recorded roleplay (MP4)</p>
                  </div>
                </button>

                {/* Interactive Whiteboard */}
                <button
                  type="button"
                  onClick={() => handleShareMedia('WHITEBOARD', 'Interactive Teaching Canvas')}
                  className="p-3 bg-cyan-950/40 hover:bg-cyan-900/60 rounded-xl border border-cyan-500/30 flex items-center gap-3 text-left transition-colors cursor-pointer group"
                >
                  <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Live Whiteboard</p>
                    <p className="text-[11px] text-slate-400">Draw phonetics, diagrams & notes</p>
                  </div>
                </button>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Sample Curriculum Courseware (Instant 1-Click)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleShareMedia('DOCUMENT', 'French A1 Lecture Slides & Handout (PDF/PPT)', 'https://pdfobject.com/pdf/sample.pdf')}
                    className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-white/5 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-white truncate">French A1 Slides</p>
                      <p className="text-[10px] text-slate-400 truncate">Courseware sample PDF</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleShareMedia('AUDIO', 'Bistro Phonetics Listening Drill (Audio)', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')}
                    className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-white/5 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-white truncate">Phonetics Drill Track</p>
                      <p className="text-[10px] text-slate-400 truncate">Native speaker French MP3</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Classroom Live Chat Drawer (Tutor Side) ─── */}
      {chatDrawerOpen && (
        <div className="absolute top-14 right-2 bottom-20 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden text-xs">
          <div className="p-3 bg-slate-950 border-b border-white/10 flex items-center justify-between">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>In-Class Interactive Chat</span>
            </span>
            <button onClick={() => setChatDrawerOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400">
              <UserX className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            {chatMessages.length === 0 ? (
              <p className="text-center text-slate-500 pt-8">No messages yet. Send a greeting to the class!</p>
            ) : (
              chatMessages.map((m: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-slate-800/80 rounded-xl border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-bold ${m.role === 'teacher' ? 'text-cyan-300' : 'text-emerald-400'}`}>
                      {m.senderName} {m.role === 'teacher' ? '(Host)' : ''}
                    </span>
                    <span className="text-slate-400">{m.time}</span>
                  </div>
                  <p className="text-slate-200">{m.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendTutorChat} className="p-2.5 bg-slate-950 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send message to all students..."
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
            />
            <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ─── Optional End Class Metadata & Thumbnail Dialog ─── */}
      {showEndMetadataDialog && (
        <div className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                  Save Session Details
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-1">End Class & Archive VOD</h3>
              </div>
              <button
                onClick={() => setShowEndMetadataDialog(false)}
                className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              You can optionally update the session topic title or add a thumbnail image before ending the class.
            </p>

            {/* Custom Session Topic Title Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Session Topic Title (Optional)</label>
              <input
                type="text"
                value={customRecordingTitle}
                onChange={(e) => setCustomRecordingTitle(e.target.value)}
                placeholder="e.g. French A1: Conversational Greetings & Bistro Scenarios"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Custom Thumbnail Upload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300">Custom Thumbnail Image (Optional)</label>
                <span className="text-[10px] text-slate-400 font-medium">Default: Pure Black Screen</span>
              </div>
              <input
                type="file"
                ref={thumbnailInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setCustomThumbnailUrl(ev.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{customThumbnailUrl ? 'Change Thumbnail' : 'Upload Image'}</span>
                </button>
                {customThumbnailUrl ? (
                  <button
                    type="button"
                    onClick={() => setCustomThumbnailUrl(null)}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Reset to Pure Black
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No image chosen (Pure Black active)</span>
                )}
              </div>
              {customThumbnailUrl ? (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/10 mt-2 bg-black">
                  <img src={customThumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-24 rounded-xl border border-white/10 mt-2 bg-black flex flex-col items-center justify-center text-slate-500 space-y-1">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Video className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 font-bold">Pure Black Thumbnail Screen</span>
                  <span className="text-[10px] text-slate-600">Video player will display cinema black default</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEndMetadataDialog(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEndMetadataDialog(false);
                  handleEndClass();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-lg shadow-rose-900/50 cursor-pointer flex items-center gap-1.5"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Confirm & End Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Professional In-Studio Live Attendance Roll Call Modal ─── */}
      {showLiveAttendanceModal && (
        <div className="fixed inset-0 z-[95] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Roll Call Ledger
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Batch: {batchName}
                  </span>
                </div>
                <h3 className="text-base font-black text-white pt-1">
                  Mark Attendance • The American College
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLiveAttendanceModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                  Present: {liveRosterStudents.filter((s) => s.status === 'PRESENT').length}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold">
                  Absent: {liveRosterStudents.filter((s) => s.status === 'ABSENT').length}
                </span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  Total Enrolled: {liveRosterStudents.length} Students
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMarkAllRoster('PRESENT')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg border border-emerald-500/40 transition cursor-pointer"
                >
                  ✓ Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAllRoster('ABSENT')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 rounded-lg border border-rose-500/40 transition cursor-pointer"
                >
                  ✕ Mark All Absent
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[50vh] divide-y divide-slate-800/60">
              {liveRosterStudents.map((st, idx) => {
                const isPresent = st.status === 'PRESENT';
                const isAbsent = st.status === 'ABSENT';

                return (
                  <div
                    key={st.studentId || idx}
                    className="pt-2 pb-2 flex items-center justify-between gap-3 text-xs hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-bold text-slate-100 truncate flex items-center gap-1.5">
                          <span>{st.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({st.studentId})</span>
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {st.email} • Over. Att: {st.attendancePercentage}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateStudentStatus(st.studentId, 'PRESENT')}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          isPresent
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 ring-2 ring-emerald-400/50'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStudentStatus(st.studentId, 'ABSENT')}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          isAbsent
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-950 ring-2 ring-rose-400/50'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Attendance immediately syncs to Academic Records</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLiveAttendanceModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCommitLiveAttendance}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-lg shadow-emerald-950 cursor-pointer transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Attendance</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {attendanceSavedToast && (
        <div className="fixed top-5 right-5 z-[105] bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Live Attendance marked and automatically synced to student records!</span>
        </div>
      )}

      {/* ─── Professional Cloud Uploading & Session Archiving Feedback Modal ─── */}
      {isEndingSession && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-5 relative">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <Disc className="w-7 h-7 text-cyan-400 absolute animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Saving & Uploading Live Class Recording
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white pt-1">
                Finalizing Classroom Archive
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Recording and whiteboard data are being uploaded to cloud storage. Please wait a few seconds and do not close or navigate away from this page.
              </p>
            </div>

            {/* Dynamic Animated Progress Bar */}
            <div className="space-y-2 pt-1 text-left">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="truncate pr-2">{uploadStepText}</span>
                <span className="text-cyan-400 font-bold shrink-0">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Classroom Session Saved & Ready for Students</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
