// ============================================================================
// ISML COLLEGE LMS — LIVE CLASSROOM INSPECTION MODAL (GOOGLE MEET STYLE)
// Mobile-Friendly, Full Surveillance, Real-time Attendance Marking & QA
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Users,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  Check,
  UserCheck,
  UserX,
  Send,
  AlertCircle,
  Volume2,
  VolumeX,
  FileSpreadsheet,
  Download,
  Settings,
  MoreVertical,
  Maximize2,
  Minimize2,
  Hand,
  Smile,
  BarChart3,
  Radio,
  ChevronDown,
  Info
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export interface ClassSessionData {
  id: string;
  topic: string;
  batchName: string;
  batchCode?: string;
  subjectName?: string;
  facultyName: string;
  facultyAvatar?: string;
  facultyTitle?: string;
  date: string;
  timeSlot: string;
  durationMins?: number;
  status: 'LIVE_NOW' | 'TODAY' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  roomOrLink?: string;
  attendeesCount?: number;
}

export interface StudentAttendee {
  id: string;
  name: string;
  rollNo: string;
  college: string;
  avatar: string;
  joinedAt: string;
  durationMins: number;
  attendanceStatus: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  micOn: boolean;
  videoOn: boolean;
  handRaised: boolean;
  connectionQuality: 'EXCELLENT' | 'GOOD' | 'POOR';
}

interface LiveMeetingInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ClassSessionData;
}

const INITIAL_STUDENTS: StudentAttendee[] = [
  {
    id: 'att-1',
    name: 'Bharathi M',
    rollNo: '2026-FR-8942',
    college: 'Anna University, Chennai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedAt: '10:30 AM',
    durationMins: 42,
    attendanceStatus: 'PRESENT',
    micOn: false,
    videoOn: true,
    handRaised: true,
    connectionQuality: 'EXCELLENT',
  },
  {
    id: 'att-2',
    name: 'Priya Sharma',
    rollNo: '2026-FR-8910',
    college: 'IIT Madras',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    joinedAt: '10:31 AM',
    durationMins: 41,
    attendanceStatus: 'PRESENT',
    micOn: false,
    videoOn: true,
    handRaised: false,
    connectionQuality: 'EXCELLENT',
  },
  {
    id: 'att-3',
    name: 'Rahul Verma',
    rollNo: '2026-FR-8915',
    college: 'Loyola College, Chennai',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    joinedAt: '10:38 AM',
    durationMins: 34,
    attendanceStatus: 'LATE',
    micOn: false,
    videoOn: false,
    handRaised: false,
    connectionQuality: 'GOOD',
  },
  {
    id: 'att-4',
    name: 'Sneha Patel',
    rollNo: '2026-FR-8922',
    college: 'Stella Maris College',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joinedAt: '10:30 AM',
    durationMins: 42,
    attendanceStatus: 'PRESENT',
    micOn: true,
    videoOn: true,
    handRaised: false,
    connectionQuality: 'EXCELLENT',
  },
  {
    id: 'att-5',
    name: 'Karthik Raja',
    rollNo: '2026-FR-8930',
    college: 'PSG Tech, Coimbatore',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedAt: '10:32 AM',
    durationMins: 40,
    attendanceStatus: 'PRESENT',
    micOn: false,
    videoOn: true,
    handRaised: false,
    connectionQuality: 'GOOD',
  },
  {
    id: 'att-6',
    name: 'Ananya Deshmukh',
    rollNo: '2026-FR-8938',
    college: 'Madras Christian College (MCC)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    joinedAt: '10:30 AM',
    durationMins: 42,
    attendanceStatus: 'PRESENT',
    micOn: false,
    videoOn: false,
    handRaised: false,
    connectionQuality: 'EXCELLENT',
  },
  {
    id: 'att-7',
    name: 'Siddharth Menon',
    rollNo: '2026-FR-8951',
    college: 'Anna University, Chennai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joinedAt: '--',
    durationMins: 0,
    attendanceStatus: 'ABSENT',
    micOn: false,
    videoOn: false,
    handRaised: false,
    connectionQuality: 'POOR',
  },
  {
    id: 'att-8',
    name: 'Divya Krishnan',
    rollNo: '2026-FR-8964',
    college: 'Women\'s Christian College (WCC)',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    joinedAt: '--',
    durationMins: 0,
    attendanceStatus: 'EXCUSED',
    micOn: false,
    videoOn: false,
    handRaised: false,
    connectionQuality: 'POOR',
  },
];

export default function LiveMeetingInspectionModal({
  isOpen,
  onClose,
  session,
}: LiveMeetingInspectionModalProps) {
  const { showSuccess } = useToast();

  // Navigation tabs in side sheet
  const [activeSideTab, setActiveSideTab] = useState<'ATTENDANCE' | 'PEOPLE' | 'CHAT' | 'INSPECT'>('ATTENDANCE');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Attendance management state
  const [attendees, setAttendees] = useState<StudentAttendee[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ABSENT'>('ALL');

  // Academic Manager Studio Controls (Manager Override Controls)
  const [managerMutedAll, setManagerMutedAll] = useState(false);
  const [managerCamMuted, setManagerCamMuted] = useState(true);
  const [managerMicMuted, setManagerMicMuted] = useState(true);
  const [screenShareMode, setScreenShareMode] = useState<'PRESENTATION' | 'GRID' | 'SPOTLIGHT'>('PRESENTATION');
  const [elapsedSeconds, setElapsedSeconds] = useState(2540); // ~42 mins
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  // Chat messages
  const [messages, setMessages] = useState([
    { sender: session.facultyName, role: 'Instructor', text: 'Bonjour à tous! Please turn to slide 14 on Café conversation phrases.', time: '10:30 AM' },
    { sender: 'Academic Manager (You)', role: 'Supervisor', text: 'Class inspection ongoing. Audio transmission clarity: 100%. Attendance auto-tracking enabled.', time: '10:32 AM' },
    { sender: 'Bharathi M', role: 'Student', text: 'Bonjour professeur! Audio is very clear.', time: '10:33 AM' },
    { sender: 'Priya Sharma', role: 'Student', text: 'Should we conjugate regular -er verbs as well?', time: '10:36 AM' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Live timer effect
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleUpdateStatus = (studentId: string, newStatus: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED') => {
    setAttendees((prev) =>
      prev.map((att) => (att.id === studentId ? { ...att, attendanceStatus: newStatus } : att))
    );
    showSuccess(`Attendance updated to ${newStatus}.`);
  };

  const handleMarkAllPresent = () => {
    setAttendees((prev) =>
      prev.map((att) => ({ ...att, attendanceStatus: 'PRESENT' }))
    );
    showSuccess('Marked all active attendees as PRESENT.');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: 'Academic Manager (Observer)',
        role: 'Supervisor',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  const handleMuteAllStudents = () => {
    setManagerMutedAll(!managerMutedAll);
    setAttendees((prev) => prev.map((s) => ({ ...s, micOn: false })));
    showSuccess(managerMutedAll ? 'Unmuted class audio control.' : 'All students muted by Academic Manager.');
  };

  const filteredAttendees = attendees.filter((att) => {
    const matchesSearch =
      att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.college.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (attendanceFilter === 'ALL') return true;
    return att.attendanceStatus === attendanceFilter;
  });

  const presentCount = attendees.filter((a) => a.attendanceStatus === 'PRESENT').length;
  const lateCount = attendees.filter((a) => a.attendanceStatus === 'LATE').length;
  const absentCount = attendees.filter((a) => a.attendanceStatus === 'ABSENT').length;

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col font-sans text-white overflow-hidden select-none">
      {/* 🟢 TOP BAR (Google Meet Style with Session Info & Manager Inspector Badge) */}
      <div className="h-14 sm:h-16 bg-[#1E1E1E] border-b border-white/10 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          {/* Recording & Live Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/30 text-rose-400 border border-rose-500/40 text-[10px] sm:text-xs font-black tracking-wide shrink-0 animate-pulse">
            <Radio className="w-3 h-3 text-rose-500" />
            <span>LIVE MONITOR</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md lg:max-w-xl">
                {session.subjectName || session.topic}
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-cyan-300 border border-cyan-500/30">
                {session.batchName}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate hidden xs:block">
              Lead Faculty: <strong className="text-slate-200">{session.facultyName}</strong> • {session.timeSlot}
            </p>
          </div>
        </div>

        {/* Right Header Status: Live Time & Inspector Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supervisor Mode: Non-Intrusive</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Leave Inspection Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 🟢 MAIN BODY: VIDEO STAGE (Left) + INSPECTOR DRAWER (Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIDEO ROOM VIEWPORT (100% on Mobile, Adaptive Grid on Desktop) */}
        <div className="flex-1 bg-[#121212] p-2 sm:p-4 flex flex-col justify-between overflow-hidden relative">
          {/* Main Stage Grid Container */}
          <div className="flex-1 rounded-2xl overflow-hidden bg-[#1E1E1E] border border-white/10 p-2 sm:p-3 relative flex flex-col gap-2">
            {screenShareMode === 'PRESENTATION' && (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-3 min-h-0">
                {/* 1. Large Presentation Screen */}
                <div className="lg:col-span-3 bg-slate-900 rounded-xl relative overflow-hidden flex flex-col justify-between border border-slate-800 shadow-xl">
                  {/* Presentation Header */}
                  <div className="p-2 sm:p-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10 text-xs">
                    <span className="font-bold text-cyan-400 flex items-center gap-2 truncate">
                      <Monitor className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate">{session.facultyName} (Screen Presentation: LiveKit 1080p)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 shrink-0">
                      60 FPS HD
                    </span>
                  </div>

                  {/* Simulated High-Res Slide Presentation Canvas */}
                  <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 text-center space-y-4 bg-gradient-to-b from-slate-900 via-[#0B2447] to-slate-950 overflow-y-auto">
                    <div className="p-5 sm:p-7 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md w-full max-w-xl space-y-3 shadow-2xl">
                      <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
                        <span>ISML INTERACTIVE WEBINAR</span>
                        <span>MODULE 3 • SLIDE 18</span>
                      </div>
                      <h3 className="text-lg sm:text-2xl font-bold text-white font-serif tracking-tight leading-snug">
                        Pratique Orale: Les Dialogues au Café Parisien
                      </h3>
                      <div className="p-3.5 bg-slate-950/80 rounded-xl text-left space-y-2 text-xs sm:text-sm text-slate-200 font-mono border border-slate-800">
                        <p>
                          <span className="text-cyan-400 font-bold">Serveur:</span> &ldquo;Bonjour Madame, que désirez-vous prendre aujourd&apos;hui?&rdquo;
                        </p>
                        <p>
                          <span className="text-emerald-400 font-bold">Étudiant:</span> &ldquo;Bonjour! Je voudrais un croissant chaud et un grand café crème.&rdquo;
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">
                        Speaking task: Students practice roleplay in pairs. Live transcription active.
                      </p>
                    </div>
                  </div>

                  {/* Live Reaction Overlay */}
                  {selectedEmoji && (
                    <div className="absolute bottom-12 right-6 p-3 bg-slate-900/90 text-3xl rounded-full border border-cyan-400/50 shadow-2xl animate-bounce z-20">
                      {selectedEmoji}
                    </div>
                  )}
                </div>

                {/* 2. Side Spotlight Column: Faculty Cam + Student Thumbnails */}
                <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto lg:overflow-y-auto max-h-full">
                  {/* Faculty Camera Tile */}
                  <div className="relative aspect-video lg:aspect-auto lg:h-44 w-40 lg:w-full rounded-xl overflow-hidden bg-slate-950 border-2 border-cyan-500/80 shadow-lg shrink-0">
                    <Image
                      src={session.facultyAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'}
                      alt={session.facultyName}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white truncate max-w-[100px]">{session.facultyName}</span>
                      <span className="p-1 rounded-full bg-cyan-500/20 text-cyan-400">
                        <Mic className="w-3 h-3 text-cyan-400" />
                      </span>
                    </div>
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-[#0052CC] text-white">
                      TRAINER
                    </span>
                  </div>

                  {/* Top Enrolled Student Tiles */}
                  {attendees.slice(0, 3).map((stu) => (
                    <div
                      key={stu.id}
                      className="relative aspect-video lg:aspect-auto lg:h-32 w-36 lg:w-full rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0"
                    >
                      <Image src={stu.avatar} alt={stu.name} fill className="object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-200 truncate max-w-[90px]">{stu.name}</span>
                        {stu.micOn ? (
                          <Mic className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <MicOff className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                      {stu.handRaised && (
                        <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-amber-500/90 text-white animate-bounce shadow">
                          <Hand className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screenShareMode === 'GRID' && (
              /* Gallery Grid View */
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 overflow-y-auto">
                {/* Faculty Card */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border-2 border-cyan-500 shadow-lg">
                  <Image
                    src={session.facultyAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'}
                    alt={session.facultyName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{session.facultyName} (Instructor)</span>
                    <Mic className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                </div>

                {/* All Attendees in Grid */}
                {attendees.map((stu) => (
                  <div
                    key={stu.id}
                    className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/10"
                  >
                    <Image src={stu.avatar} alt={stu.name} fill className="object-cover" />
                    <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-2 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-200 truncate">{stu.name}</span>
                      {stu.micOn ? (
                        <Mic className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <MicOff className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                    {stu.handRaised && (
                      <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-amber-500 text-white animate-bounce">
                        <Hand className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🟢 BOTTOM CONTROLS BAR (Google Meet Signature Toolbar) */}
          <div className="h-16 bg-[#1E1E1E] border border-white/10 rounded-2xl mt-2 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-2xl">
            {/* Left: Meeting Info / Code */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">meet.isml.edu/{session.batchCode || 'fr-a1-live'}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText?.(`https://meet.isml.edu/${session.batchCode || 'fr-a1-live'}`);
                  showSuccess('Live room link copied!');
                }}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Copy Link"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Center: Essential Controls (Mic, Video, Grid Toggle, Manager Mute All, Reactions) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Observer Mic */}
              <button
                onClick={() => setManagerMicMuted(!managerMicMuted)}
                className={`p-2.5 sm:p-3 rounded-full transition-all cursor-pointer ${
                  managerMicMuted ? 'bg-rose-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
                title={managerMicMuted ? 'Unmute Observer Mic' : 'Mute Observer Mic'}
              >
                {managerMicMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Observer Video */}
              <button
                onClick={() => setManagerCamMuted(!managerCamMuted)}
                className={`p-2.5 sm:p-3 rounded-full transition-all cursor-pointer ${
                  managerCamMuted ? 'bg-rose-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
                title={managerCamMuted ? 'Start Camera' : 'Stop Camera'}
              >
                {managerCamMuted ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* View Layout Toggle */}
              <button
                onClick={() =>
                  setScreenShareMode(screenShareMode === 'PRESENTATION' ? 'GRID' : 'PRESENTATION')
                }
                className={`p-2.5 sm:p-3 rounded-full transition-all cursor-pointer ${
                  screenShareMode === 'GRID' ? 'bg-[#0052CC] text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
                title="Switch Grid / Presentation Layout"
              >
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Quick Reactions */}
              <div className="hidden xs:flex items-center gap-1 bg-slate-800/80 px-2 py-1.5 rounded-full border border-white/10">
                {['👏', '👍', '❤️', '💡'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setSelectedEmoji(emoji);
                      setTimeout(() => setSelectedEmoji(null), 2500);
                    }}
                    className="p-1 hover:bg-white/10 rounded-full text-sm cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Mute All Attendees Button (Admin Feature) */}
              <button
                onClick={handleMuteAllStudents}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold transition cursor-pointer"
                title="Mute All Students"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Mute All</span>
              </button>

              {/* Red Leave Room Button */}
              <button
                onClick={onClose}
                className="px-4 sm:px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-900/50 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>

            {/* Right: Drawer Triggers (Attendance, People, Chat) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  setActiveSideTab('ATTENDANCE');
                  setMobileDrawerOpen(true);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                  activeSideTab === 'ATTENDANCE'
                    ? 'bg-[#0052CC] border-cyan-400 text-white'
                    : 'bg-slate-800 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Attendance</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {presentCount}/{attendees.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveSideTab('CHAT');
                  setMobileDrawerOpen(true);
                }}
                className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                  activeSideTab === 'CHAT'
                    ? 'bg-[#0052CC] border-cyan-400 text-white'
                    : 'bg-slate-800 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Open Chat"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🟢 DESKTOP SIDE INSPECTION & ATTENDANCE PANEL (Visible on lg:flex) */}
        <div className="hidden lg:flex w-96 bg-[#1E1E1E] border-l border-white/10 flex-col h-full shrink-0">
          {/* Side Tabs Bar */}
          <div className="p-2 bg-[#181818] border-b border-white/10 grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveSideTab('ATTENDANCE')}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSideTab === 'ATTENDANCE'
                  ? 'bg-[#0052CC] text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Attendance</span>
            </button>
            <button
              onClick={() => setActiveSideTab('PEOPLE')}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSideTab === 'PEOPLE'
                  ? 'bg-[#0052CC] text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>People ({attendees.length})</span>
            </button>
            <button
              onClick={() => setActiveSideTab('CHAT')}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSideTab === 'CHAT'
                  ? 'bg-[#0052CC] text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>In-Call Chat</span>
            </button>
          </div>

          {/* TAB 1: ATTENDANCE MANAGER (Main Request Feature) */}
          {activeSideTab === 'ATTENDANCE' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Attendance Quick Metrics */}
              <div className="p-3 bg-slate-900/60 border-b border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">Class Roll Call</span>
                  <button
                    onClick={handleMarkAllPresent}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark All Present</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg">
                    <p className="text-base font-extrabold text-emerald-400">{presentCount}</p>
                    <p className="text-[10px] text-emerald-300 uppercase font-bold">Present</p>
                  </div>
                  <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg">
                    <p className="text-base font-extrabold text-amber-400">{lateCount}</p>
                    <p className="text-[10px] text-amber-300 uppercase font-bold">Late Entry</p>
                  </div>
                  <div className="p-2 bg-rose-950/40 border border-rose-500/30 rounded-lg">
                    <p className="text-base font-extrabold text-rose-400">{absentCount}</p>
                    <p className="text-[10px] text-rose-300 uppercase font-bold">Absent</p>
                  </div>
                </div>

                {/* Filter & Search */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search student or roll no..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-[#252525] border border-white/10 rounded-lg text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <select
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value as any)}
                    className="bg-[#252525] border border-white/10 rounded-lg text-xs px-2 py-1.5 text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="ALL">All ({attendees.length})</option>
                    <option value="PRESENT">Present</option>
                    <option value="LATE">Late</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>
              </div>

              {/* Attendee Roll Call List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                {filteredAttendees.map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-slate-600 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-700">
                          <Image src={att.avatar} alt={att.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate text-xs">{att.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{att.rollNo}</p>
                        </div>
                      </div>

                      {/* Connection pill */}
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          att.connectionQuality === 'EXCELLENT'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : att.connectionQuality === 'GOOD'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {att.connectionQuality}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                      <span className="text-slate-400">
                        Joined: <strong className="text-slate-300">{att.joinedAt}</strong> ({att.durationMins}m)
                      </span>

                      {/* Status Toggle Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateStatus(att.id, 'PRESENT')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            att.attendanceStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          P
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(att.id, 'LATE')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            att.attendanceStatus === 'LATE'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          L
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(att.id, 'ABSENT')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            att.attendanceStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          A
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Attendance Export Action */}
              <div className="p-3 bg-[#181818] border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Total Enrolled: {attendees.length} Students
                </span>
                <button
                  onClick={() => showSuccess('Attendance ledger exported to Excel/CSV successfully.')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONNECTED PEOPLE */}
          {activeSideTab === 'PEOPLE' && (
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {/* Host Faculty */}
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400">
                      <Image
                        src={session.facultyAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                        alt={session.facultyName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-white">{session.facultyName}</p>
                      <p className="text-[10px] text-cyan-300">Host • Main Instructor</p>
                    </div>
                  </div>
                  <Mic className="w-4 h-4 text-cyan-400" />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                  Students in Stream ({attendees.length})
                </p>
                {attendees.map((stu) => (
                  <div
                    key={stu.id}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between mb-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative w-7 h-7 rounded-full overflow-hidden">
                        <Image src={stu.avatar} alt={stu.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200 text-xs">{stu.name}</p>
                        <p className="text-[10px] text-slate-400">{stu.college}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {stu.micOn ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-500" />}
                      {stu.videoOn ? <Video className="w-3.5 h-3.5 text-cyan-400" /> : <VideoOff className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: IN-CALL CHAT */}
          {activeSideTab === 'CHAT' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                {messages.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-cyan-300">{m.sender}</span>
                      <span className="text-slate-400 font-mono">{m.time}</span>
                    </div>
                    <p className="text-slate-200">{m.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#181818]">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Supervisor broadcast message..."
                  className="flex-1 bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
                <button type="submit" className="p-2 bg-[#0052CC] hover:bg-blue-600 text-white rounded-xl cursor-pointer">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 🟢 MOBILE SLIDE-UP BOTTOM SHEET (100% Mobile Friendly for Attendance & Chat) */}
        {mobileDrawerOpen && (
          <div className="lg:hidden absolute inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex flex-col justify-end animate-in fade-in duration-200">
            <div className="bg-[#1E1E1E] border-t border-white/20 rounded-t-3xl max-h-[85vh] h-[80vh] flex flex-col overflow-hidden text-white shadow-2xl">
              {/* Sheet Header */}
              <div className="p-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
                {/* Mobile Tab Switcher */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveSideTab('ATTENDANCE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      activeSideTab === 'ATTENDANCE'
                        ? 'bg-[#0052CC] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Attendance</span>
                  </button>
                  <button
                    onClick={() => setActiveSideTab('PEOPLE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeSideTab === 'PEOPLE'
                        ? 'bg-[#0052CC] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>People ({attendees.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveSideTab('CHAT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeSideTab === 'CHAT'
                        ? 'bg-[#0052CC] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Chat</span>
                  </button>
                </div>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 bg-white/10 rounded-full text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Tab Content */}
              {activeSideTab === 'ATTENDANCE' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-3 bg-slate-900 border-b border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">Real-time Attendance Roll Call</span>
                      <button
                        onClick={handleMarkAllPresent}
                        className="text-[11px] text-cyan-400 font-bold"
                      >
                        Mark All P
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-1.5 bg-emerald-950/60 rounded border border-emerald-500/30">
                        <strong className="text-emerald-400 text-sm">{presentCount}</strong> P
                      </div>
                      <div className="p-1.5 bg-amber-950/60 rounded border border-amber-500/30">
                        <strong className="text-amber-400 text-sm">{lateCount}</strong> L
                      </div>
                      <div className="p-1.5 bg-rose-950/60 rounded border border-rose-500/30">
                        <strong className="text-rose-400 text-sm">{absentCount}</strong> A
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                    {attendees.map((att) => (
                      <div
                        key={att.id}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-white truncate text-xs">{att.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{att.rollNo}</p>
                        </div>

                        {/* Status buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleUpdateStatus(att.id, 'PRESENT')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                              att.attendanceStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            P
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(att.id, 'LATE')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                              att.attendanceStatus === 'LATE'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            L
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(att.id, 'ABSENT')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                              att.attendanceStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            A
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[#181818] border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => showSuccess('Attendance ledger exported to Excel/CSV successfully.')}
                      className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Mobile Attendance Report</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSideTab === 'CHAT' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                    {messages.map((m, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-cyan-300">{m.sender}</span>
                          <span className="text-slate-400">{m.time}</span>
                        </div>
                        <p className="text-slate-200">{m.text}</p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#181818]">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type message to class..."
                      className="flex-1 bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                    <button type="submit" className="p-2 bg-[#0052CC] text-white rounded-xl">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {activeSideTab === 'PEOPLE' && (
                <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                  {attendees.map((stu) => (
                    <div key={stu.id} className="p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden">
                          <Image src={stu.avatar} alt={stu.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{stu.name}</p>
                          <p className="text-[10px] text-slate-400">{stu.college}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">{stu.joinedAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
