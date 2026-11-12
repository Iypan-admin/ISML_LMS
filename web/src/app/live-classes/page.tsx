"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Video,
  Clock,
  User,
  Users,
  MessageSquare,
  Hand,
  Mic,
  MicOff,
  VideoOff,
  ShieldCheck,
  X,
  Send,
  CheckCircle2,
  Film,
  PhoneOff,
  Smile,
  Monitor,
  BarChart2,
  Lock,
  Volume2
} from 'lucide-react';
import { LiveClass } from '@/mock/liveClasses';
import { currentStudent } from '@/mock/students';
import RealLiveKitStage from '@/components/live/RealLiveKitStage';
import InteractiveWhiteboard from '@/components/live/InteractiveWhiteboard';
import SharedContentStage from '@/components/live/SharedContentStage';
import { soundNotification } from '@/lib/soundNotification';

const mockParticipants: any[] = [];

export default function LiveClassesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'LIVE_NOW' | 'TODAY' | 'UPCOMING' | 'COMPLETED'>('LIVE_NOW');
  const [activeRoom, setActiveRoom] = useState<LiveClass | null>(null);

  // Studio Drawer State
  const [rightDrawerTab, setRightDrawerTab] = useState<'CHAT' | 'PEOPLE' | 'POLLS'>('CHAT');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ id?: string; sender: string; role: string; text: string; time: string }>>([]);
  const [micOn, setMicOn] = useState<boolean>(false);
  const [videoOn, setVideoOn] = useState<boolean>(false);
  const [handRaised, setHandRaised] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [pollVoted, setPollVoted] = useState<number | null>(null);

  // Synchronized Interactive Content & Whiteboard from Tutor
  const [studentContent, setStudentContent] = useState<any>(null);
  const [participantsList, setParticipantsList] = useState<Array<{ id: string; name: string; role: string; regNo?: string; isHost?: boolean }>>([]);

  const [stayTimeSecs, setStayTimeSecs] = useState<number>(0);

  // Active verified Student Profile state (Always ensures real student identity, never Finance Manager / Staff)
  const [activeStudent, setActiveStudent] = useState({
    id: 'AMER-COL-STD-23',
    name: 'Muthu Pandian',
    rollNo: 'AMER-COL-STD-23',
    collegeName: 'The American College',
    batchName: 'Morning Batch (BAT-SAMPLE-MRNG)',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('isml_user');
      if (stored) {
        const u = JSON.parse(stored);
        // Only adopt if it is actually a Student user, otherwise retain verified American College Student
        if (u.role === 'STUDENT' || (u.rollNo && !u.role?.includes('MANAGER') && !u.role?.includes('ADMIN') && !u.role?.includes('TUTOR'))) {
          setActiveStudent({
            id: u.studentId || u.rollNo || u.id || 'AMER-COL-STD-23',
            name: u.name || 'Muthu Pandian',
            rollNo: u.rollNo || u.studentId || 'AMER-COL-STD-23',
            collegeName: u.campusName || u.tenantName || 'The American College',
            batchName: u.batchName || 'Morning Batch (BAT-SAMPLE-MRNG)',
          });
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    setMounted(true);
    // Note: Do NOT auto-restore old stale active room from localStorage if tutor ended or isn't in room!
    // Clean stale sessions on mount so student always knocks or waits for tutor approval
    try {
      localStorage.removeItem('isml_student_active_room');
      sessionStorage.removeItem('isml_student_active_room');
      localStorage.removeItem('isml_student_waiting_status');
      sessionStorage.removeItem('isml_student_waiting_status');
      localStorage.removeItem('isml_student_requesting_class');
      sessionStorage.removeItem('isml_student_requesting_class');

      const storedTime = localStorage.getItem('isml_student_stay_time_start') || sessionStorage.getItem('isml_student_stay_time_start');
      if (storedTime) {
        const t = parseInt(storedTime, 10);
        if (!isNaN(t)) {
          const diff = Math.floor((Date.now() - t) / 1000);
          setStayTimeSecs(diff >= 0 ? diff : 0);
        }
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (!activeRoom) return;

    try {
      const stored = localStorage.getItem('isml_student_stay_time_start') || sessionStorage.getItem('isml_student_stay_time_start');
      if (!stored) {
        const now = Date.now().toString();
        localStorage.setItem('isml_student_stay_time_start', now);
        sessionStorage.setItem('isml_student_stay_time_start', now);
      }
    } catch { }

    const timer = setInterval(() => {
      try {
        const stored = localStorage.getItem('isml_student_stay_time_start') || sessionStorage.getItem('isml_student_stay_time_start');
        if (stored) {
          const t = parseInt(stored, 10);
          if (!isNaN(t)) {
            const diff = Math.floor((Date.now() - t) / 1000);
            setStayTimeSecs(diff >= 0 ? diff : 0);
            return;
          }
        }
      } catch { }
      setStayTimeSecs((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRoom]);

  const formatStayTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} Mins`;
  };

  // Prevent accidental page reload (F5 / Ctrl+R / browser reload) while in live class
  useEffect(() => {
    if (!activeRoom) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Live class session in progress. Please use the Leave button to exit.';
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
  }, [activeRoom]);

  const [classesList, setClassesList] = useState<LiveClass[]>([]);
  // Waiting Room state for Student
  const [waitingRoomStatus, setWaitingRoomStatus] = useState<'IDLE' | 'WAITING' | 'ADMITTED' | 'DECLINED'>('IDLE');
  const [requestingClass, setRequestingClass] = useState<LiveClass | null>(null);

  // Tutor permission state for student media capabilities
  const [canStudentUnmute, setCanStudentUnmute] = useState(false);
  const [canStudentShareVideo, setCanStudentShareVideo] = useState(false);

  const handleExitRoom = useCallback(() => {
    setActiveRoom(null);
    setWaitingRoomStatus('IDLE');
    setRequestingClass(null);
    setStayTimeSecs(0);
    try {
      localStorage.removeItem('isml_student_active_room');
      localStorage.removeItem('isml_student_waiting_status');
      localStorage.removeItem('isml_student_requesting_class');
      localStorage.removeItem('isml_student_stay_time_start');
      sessionStorage.removeItem('isml_student_active_room');
      sessionStorage.removeItem('isml_student_waiting_status');
      sessionStorage.removeItem('isml_student_requesting_class');
      sessionStorage.removeItem('isml_student_stay_time_start');
    } catch { }
  }, []);

  const handleEnterRoom = useCallback((cls: LiveClass) => {
    setActiveRoom(cls);
    setWaitingRoomStatus('ADMITTED');
    setRequestingClass(cls);
    try {
      const jsonStr = JSON.stringify(cls);
      localStorage.setItem('isml_student_active_room', jsonStr);
      localStorage.setItem('isml_student_waiting_status', 'ADMITTED');
      localStorage.setItem('isml_student_requesting_class', jsonStr);
      sessionStorage.setItem('isml_student_active_room', jsonStr);
      sessionStorage.setItem('isml_student_waiting_status', 'ADMITTED');
      sessionStorage.setItem('isml_student_requesting_class', jsonStr);
    } catch { }
  }, []);

  const handleSetWaiting = useCallback((cls: LiveClass) => {
    setRequestingClass(cls);
    setWaitingRoomStatus('WAITING');
    try {
      const jsonStr = JSON.stringify(cls);
      localStorage.setItem('isml_student_waiting_status', 'WAITING');
      localStorage.setItem('isml_student_requesting_class', jsonStr);
      sessionStorage.setItem('isml_student_waiting_status', 'WAITING');
      sessionStorage.setItem('isml_student_requesting_class', jsonStr);
    } catch { }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput('');

    // Broadcast through backend interactive chat API so tutor and other students see it instantly
    if (activeRoom) {
      try {
        await fetch(`https://ismllms-production.up.railway.app/api/live-classes/${activeRoom.id}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: activeStudent.id,
            senderName: activeStudent.name,
            role: 'student',
            text,
          }),
        });
      } catch { }
    } else {
      setMessages(prev => [...prev, { sender: activeStudent.name, role: 'Student', text, time: '10:44 AM' }]);
    }
  };

  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: string; emoji: string; studentName: string; left: number }>>([]);

  const handleToggleHandRaise = async () => {
    const nextState = !handRaised;
    setHandRaised(nextState);
    if (activeRoom) {
      try {
        await fetch(`https://ismllms-production.up.railway.app/api/live-classes/${activeRoom.id}/interaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'HAND_RAISE',
            studentId: activeStudent.id,
            studentName: activeStudent.name,
            raised: nextState,
          }),
        });
      } catch { }
    }
  };

  const handleSendReaction = async (emoji: string) => {
    setSelectedEmoji(emoji);
    setTimeout(() => setSelectedEmoji(null), 2000);

    if (activeRoom) {
      try {
        await fetch(`https://ismllms-production.up.railway.app/api/live-classes/${activeRoom.id}/interaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'REACTION',
            studentId: activeStudent.id,
            studentName: activeStudent.name,
            emoji,
          }),
        });
      } catch { }
    }
  };

  const openMobileDrawer = (tab: 'CHAT' | 'PEOPLE' | 'POLLS') => {
    setRightDrawerTab(tab);
    setMobileDrawerOpen(true);
  };

  useEffect(() => {
    fetch('/api/live-classes')
      .then((r) => r.json())
      .then((json) => {
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: LiveClass[] = json.data.map((item: any) => {
            const startDate = item.scheduledStartTime ? new Date(item.scheduledStartTime) : new Date();
            const endDate = item.scheduledEndTime ? new Date(item.scheduledEndTime) : new Date(startDate.getTime() + (item.durationMinutes || 60) * 60000);

            const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formatDate = (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

            const formattedTimeSlot = `${formatTime(startDate)} – ${formatTime(endDate)}`;
            const formattedDate = formatDate(startDate);

            const isEnded = item.status === 'ENDED' || item.status === 'COMPLETED' || endDate.getTime() < Date.now();
            const isLive = !isEnded && (item.status === 'LIVE' || item.isBroadcastingNow === true);
            const isToday = startDate.toDateString() === new Date().toDateString();

            let computedStatus = 'UPCOMING';
            if (isLive) computedStatus = 'LIVE_NOW';
            else if (isEnded) computedStatus = 'COMPLETED';
            else if (isToday) computedStatus = 'TODAY';
            else computedStatus = 'UPCOMING';

            return {
              id: item.id,
              topic: item.title || 'Live Interactive Class',
              tutorName: item.tutorName || 'Joy JK',
              tutorAvatar: '',
              tutorTitle: 'Lead Certified Faculty',
              status: computedStatus,
              date: formattedDate,
              timeSlot: item.timeSlot || formattedTimeSlot,
              durationMins: item.durationMinutes || 90,
              batchCode: item.batchCode || 'BAT-01',
              batchName: item.batchName || 'Evening Batch',
              moduleName: item.courseName || 'Sample Course',
              roomToken: item.roomName || item.id,
              attendeesCount: item.enrolledStudentsCount || 10,
              recordingAvailable: isEnded,
            };
          });
          setClassesList(mapped);
        }
      })
      .catch(() => { });
  }, []);

  // Poll waiting room status if student is in WAITING state
  useEffect(() => {
    if (waitingRoomStatus !== 'WAITING' || !requestingClass) return;

    const studentId = activeStudent.rollNo || activeStudent.id || 'AMER-COL-STD-23';

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/live-classes/${requestingClass.id}/join-status?studentId=${encodeURIComponent(studentId)}`);
        const json = await res.json();
        if (json.data?.status === 'APPROVED') {
          handleEnterRoom(requestingClass);
          clearInterval(interval);
        } else if (json.data?.status === 'REJECTED') {
          handleExitRoom();
          setWaitingRoomStatus('DECLINED');
          clearInterval(interval);
        }
      } catch { }
    }, 1500);

    return () => clearInterval(interval);
  }, [waitingRoomStatus, requestingClass, activeStudent, handleEnterRoom, handleExitRoom]);

  // Real-time Interactive Sync: Content, Whiteboard, Chat & Attendance Ping
  useEffect(() => {
    if (!activeRoom) return;
    const classId = activeRoom.id;

    // 1. Initial fetch of interactive state from backend
    fetch(`https://ismllms-production.up.railway.app/api/live-classes/${classId}/interactive-state`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          if (res.data.sharedContent && res.data.sharedContent.type !== 'NONE') {
            setStudentContent(res.data.sharedContent);
          }
          if (res.data.permissions) {
            setCanStudentUnmute(Boolean(res.data.permissions.allowStudentMic));
            setCanStudentShareVideo(Boolean(res.data.permissions.allowStudentVideo));
            if (!res.data.permissions.allowStudentMic) setMicOn(false);
            if (!res.data.permissions.allowStudentVideo) setVideoOn(false);
          }
          if (res.data.messages && Array.isArray(res.data.messages)) {
            setMessages(
              res.data.messages.map((m: any) => ({
                id: m.id,
                sender: m.senderName || m.sender,
                role: m.role === 'teacher' ? 'Faculty Instructor' : 'Student',
                text: m.text,
                time: m.time,
              }))
            );
          }
          if (res.data.attendance && Array.isArray(res.data.attendance)) {
            const tutorEntry = {
              id: 'tutor_host',
              name: activeRoom.tutorName || 'Course Instructor',
              role: 'Host Instructor',
              regNo: 'FACULTY-LEAD',
              isHost: true,
            };
            const studentEntries = res.data.attendance.map((s: any) => {
              // Sanitize any stale staff/finance names to active student name
              const isStaffName = /finance|admin|manager|staff/i.test(s.studentName || '') || /finance|admin/i.test(s.studentId || '');
              return {
                id: isStaffName ? activeStudent.id : s.studentId,
                name: isStaffName ? activeStudent.name : s.studentName,
                role: 'Enrolled Learner',
                regNo: isStaffName ? activeStudent.rollNo : (s.regNo || activeStudent.rollNo),
                isHost: false,
              };
            });
            setParticipantsList([tutorEntry, ...studentEntries]);
          } else {
            setParticipantsList([
              {
                id: 'tutor_host',
                name: activeRoom.tutorName || 'Course Instructor',
                role: 'Host Instructor',
                regNo: 'FACULTY-LEAD',
                isHost: true,
              },
              {
                id: activeStudent.id,
                name: activeStudent.name,
                role: 'Enrolled Learner',
                regNo: activeStudent.rollNo,
                isHost: false,
              },
            ]);
          }
        }
      })
      .catch(() => { });

    // 2. Attendance Ping: Auto records verified student attendance in DB every 30 seconds
    const studentId = activeStudent.id;
    const studentName = activeStudent.name;
    const regNo = activeStudent.rollNo;

    const attendanceTimer = setInterval(() => {
      fetch(`https://ismllms-production.up.railway.app/api/live-classes/${classId}/attendance-ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentName,
          regNo,
        }),
      }).catch(() => { });
    }, 30000);

    // Initial ping on entry
    fetch(`https://ismllms-production.up.railway.app/api/live-classes/${classId}/attendance-ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        studentName,
        regNo,
      }),
    }).catch(() => { });

    // 3. Listen for Realtime Tutor Broadcasts: Shared Content & Chat Messages
    const handleRealtime = (e: any) => {
      const detail = e?.detail;
      if (detail?.payload?.classId !== classId) return;

      if (detail?.type === 'CLASSROOM_CONTENT_SHARED') {
        const c = detail?.payload?.content;
        if (c?.type === 'NONE') {
          setStudentContent(null);
        } else {
          setStudentContent(c);
        }
      }

      if (detail?.type === 'CLASSROOM_PERMISSIONS_UPDATED') {
        const perms = detail?.payload?.permissions;
        if (perms) {
          setCanStudentUnmute(Boolean(perms.allowStudentMic));
          setCanStudentShareVideo(Boolean(perms.allowStudentVideo));
          if (!perms.allowStudentMic) {
            setMicOn(false);
            soundNotification.playNoticeTone();
          }
          if (!perms.allowStudentVideo) {
            setVideoOn(false);
          }
        }
      }

      if (detail?.type === 'CLASSROOM_CHAT_MESSAGE') {
        const m = detail.payload.message;
        setMessages((prev) => {
          if (m?.id && prev.some((existing) => existing.id === m.id)) {
            return prev;
          }
          // Play pleasant incoming chat message notification sound
          soundNotification.playMessagePop();

          return [
            ...prev,
            {
              id: m.id,
              sender: m.senderName,
              role: m.role === 'teacher' ? 'Faculty Instructor' : 'Student',
              text: m.text,
              time: m.time,
            },
          ];
        });
      }

      if (detail?.type === 'CLASSROOM_INTERACTION') {
        const inter = detail.payload?.interaction;
        if (inter?.type === 'REACTION' && inter.emoji) {
          const emojiId = inter.id || `em_${Date.now()}_${Math.random()}`;
          const leftPercent = 25 + Math.floor(Math.random() * 50);
          setFloatingEmojis((prev) => {
            if (prev.some((e) => e.id === emojiId)) return prev;
            return [...prev, { id: emojiId, emoji: inter.emoji, studentName: inter.studentName, left: leftPercent }];
          });
          setTimeout(() => {
            setFloatingEmojis((prev) => prev.filter((e) => e.id !== emojiId));
          }, 2500);
        }
      }

      if (detail?.type === 'CLASSROOM_ATTENDANCE_UPDATE') {
        const attList = detail.payload?.attendance;
        if (Array.isArray(attList)) {
          const tutorEntry = {
            id: 'tutor_host',
            name: activeRoom.tutorName || 'Course Instructor',
            role: 'Host Instructor',
            regNo: 'FACULTY-LEAD',
            isHost: true,
          };
          const studentEntries = attList.map((s: any) => {
            const isStaffName = /finance|admin|manager|staff/i.test(s.studentName || '') || /finance|admin/i.test(s.studentId || '');
            return {
              id: isStaffName ? activeStudent.id : s.studentId,
              name: isStaffName ? activeStudent.name : s.studentName,
              role: 'Enrolled Learner',
              regNo: isStaffName ? activeStudent.rollNo : (s.regNo || activeStudent.rollNo),
              isHost: false,
            };
          });
          setParticipantsList([tutorEntry, ...studentEntries]);
        }
      }
    };

    window.addEventListener('isml-realtime-event', handleRealtime);

    return () => {
      clearInterval(attendanceTimer);
      window.removeEventListener('isml-realtime-event', handleRealtime);
    };
  }, [activeRoom]);

  // Real-time Event Listener & Polling: If tutor ends session, automatically kick out student!
  useEffect(() => {
    if (!activeRoom) return;
    const currentActiveRoomId = (activeRoom as any).id;
    if (!currentActiveRoomId) return;

    // SSE Realtime Event Listener (Instant Webhook/SSE - Zero need to poll or reload)
    const handleClassEnded = (e: any) => {
      if (e?.detail?.type === 'LIVE_CLASS_ENDED') {
        const endedId = e?.detail?.payload?.classId;
        if (!endedId || endedId === currentActiveRoomId) {
          handleExitRoom();
        }
      }
    };

    // Auto-Kick & End Class Timer: When scheduledEndTime passes, automatically end session!
    const endMs = (activeRoom as any).scheduledEndTime
      ? new Date((activeRoom as any).scheduledEndTime).getTime()
      : (activeRoom as any).timeSlot
        ? 0
        : 0;

    let autoEndTimer: NodeJS.Timeout | null = null;
    if (endMs && endMs > Date.now()) {
      autoEndTimer = setTimeout(() => {
        handleExitRoom();
        alert('This scheduled live class session has reached its end time (10:04 AM) and is now closed.');
      }, endMs - Date.now());
    } else if (endMs && endMs <= Date.now()) {
      handleExitRoom();
    }

    window.addEventListener('isml-realtime-event', handleClassEnded);

    return () => {
      if (autoEndTimer) clearTimeout(autoEndTimer);
      window.removeEventListener('isml-realtime-event', handleClassEnded);
    };
  }, [activeRoom, handleExitRoom]);

  const handleStudentJoinClick = async (item: LiveClass) => {
    // If class is already ENDED / COMPLETED, block join directly!
    if (item.status === 'COMPLETED') {
      alert('This live class session has already ended. Please view the recording in the VOD library.');
      return;
    }

    handleSetWaiting(item);

    const studentId = activeStudent.rollNo || activeStudent.id || 'AMER-COL-STD-23';
    const studentName = activeStudent.name || 'Muthu Pandian';
    const regNo = activeStudent.rollNo || 'AMER-COL-STD-23';

    try {
      const res = await fetch(`/api/live-classes/${item.id}/request-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentName,
          regNo,
        }),
      });
      const data = await res.json();
      if (data.status === 'ended' || data.error === 'ENDED') {
        handleExitRoom();
        alert('This session has already ended by the host tutor.');
      }
    } catch { }
  };
  const handleCancelJoinRequest = async () => {
    if (!requestingClass) {
      setWaitingRoomStatus('IDLE');
      return;
    }

    const studentId = activeStudent.rollNo || activeStudent.id || 'AMER-COL-STD-23';
    const studentName = activeStudent.name || 'Muthu Pandian';

    const classId = requestingClass.id;
    setWaitingRoomStatus('IDLE');
    setRequestingClass(null);

    try {
      await fetch(`/api/live-classes/${classId}/cancel-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, studentName }),
      });
    } catch { }
  };

  const filteredClasses = classesList.filter((c: any) => c.status === activeTab || (activeTab === "TODAY" && c.status === "SCHEDULED"));

  // Prevent SSR hydration mismatch before browser mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If student is inside active live class room, render ONLY the full-screen classroom view!
  // This eliminates any underlying dashboard flash during reload.
  if (activeRoom) {
    return (
      <div className="fixed inset-0 bg-[#121212] z-50 flex flex-col font-sans text-white overflow-hidden">
        {/* Top Header Bar */}
        <div className="h-14 bg-[#1E1E1E] border-b border-white/10 px-3 sm:px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 truncate">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-400 border border-rose-500/40 text-[10px] sm:text-xs font-extrabold animate-pulse shrink-0">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>REC</span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xl">
              {activeRoom.topic}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Stay Time: {formatStayTime(stayTimeSecs)} (Attendance Tracked)</span>
            </span>

            <button
              onClick={handleExitRoom}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
              title="Exit Class"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area (LiveKit WebRTC Classroom + Synchronized Content/Whiteboard) */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Studio Stage View with Real LiveKit Media Feeds or Synchronized Whiteboard/Content */}
          <div className="flex-1 bg-[#121212] p-2 sm:p-4 flex flex-col justify-between relative overflow-hidden w-full">
            {/* Floating Animated Emojis Streamed from Classmates */}
            <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
              {floatingEmojis.map((item) => (
                <div
                  key={item.id}
                  style={{ left: `${item.left}%` }}
                  className="absolute bottom-16 flex flex-col items-center animate-float-fade"
                >
                  <span className="text-3xl filter drop-shadow-lg">{item.emoji}</span>
                  <span className="text-[10px] font-bold text-white/90 bg-black/60 px-1.5 py-0.2 rounded-full whitespace-nowrap mt-0.5">
                    {item.studentName}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#1E1E1E] border border-white/10 flex flex-col">
              {studentContent && studentContent.type === 'WHITEBOARD' ? (
                <InteractiveWhiteboard
                  classId={activeRoom.id}
                  isHost={false}
                />
              ) : studentContent && studentContent.type !== 'NONE' ? (
                <SharedContentStage
                  content={studentContent}
                  isHost={false}
                  classId={activeRoom.id}
                />
              ) : (
                <RealLiveKitStage
                  classId={activeRoom.id}
                  identity={activeStudent.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'student_learner'}
                  name={activeStudent.name}
                  role="student"
                  onDisconnect={handleExitRoom}
                  hideControls={true}
                  externalMicOn={micOn}
                  externalVideoOn={videoOn}
                  canUnmute={canStudentUnmute}
                  canShareVideo={canStudentShareVideo}
                />
              )}
            </div>

            {/* 🎛 FLOATING GOOGLE MEET CONTROL DOCK BAR */}
            <div className="mt-2 p-2 bg-[#1E1E1E] rounded-2xl border border-white/10 flex items-center justify-between max-w-3xl mx-auto w-full shadow-2xl z-20">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (!canStudentUnmute && !micOn) {
                      soundNotification.playNoticeTone();
                      alert('🔒 Microphone is locked by the Lead Tutor. Please raise your hand if you want to speak.');
                      return;
                    }
                    setMicOn(!micOn);
                  }}
                  className={`p-2.5 sm:p-3 rounded-full border transition-all cursor-pointer relative ${micOn
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/30'
                      : !canStudentUnmute
                        ? 'bg-slate-800/80 border-slate-700/60 text-slate-500 hover:text-slate-400'
                        : 'bg-rose-600/20 border-rose-500/40 text-rose-400 hover:bg-rose-600/30'
                    }`}
                  title={
                    !canStudentUnmute
                      ? 'Microphone locked by Lead Tutor (Click to request)'
                      : micOn
                        ? 'Mute Microphone'
                        : 'Unmute Microphone'
                  }
                >
                  {micOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {!canStudentUnmute && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full ring-2 ring-[#1E1E1E]">
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (!canStudentShareVideo && !videoOn) {
                      soundNotification.playNoticeTone();
                      alert('🔒 Camera access is locked by the Lead Tutor.');
                      return;
                    }
                    setVideoOn(!videoOn);
                  }}
                  className={`p-2.5 sm:p-3 rounded-full border transition-all cursor-pointer relative ${videoOn
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/30'
                      : !canStudentShareVideo
                        ? 'bg-slate-800/80 border-slate-700/60 text-slate-500 hover:text-slate-400'
                        : 'bg-slate-800 border-white/10 text-slate-400 hover:text-slate-300'
                    }`}
                  title={
                    !canStudentShareVideo
                      ? 'Camera locked by Lead Tutor'
                      : videoOn
                        ? 'Turn Off Camera'
                        : 'Turn On Camera'
                  }
                >
                  {videoOn ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {!canStudentShareVideo && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full ring-2 ring-[#1E1E1E]">
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>

                {/* Hand Raise */}
                <button
                  onClick={handleToggleHandRaise}
                  className={`p-2.5 sm:p-3 rounded-full border transition-all cursor-pointer ${handRaised ? 'bg-amber-500 border-amber-400 text-slate-950 animate-bounce' : 'bg-slate-800 border-white/10 text-white'
                    }`}
                  title={handRaised ? 'Lower Hand' : 'Raise Hand to Tutor'}
                >
                  <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Emoji Quick Reactions */}
                <div className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-full border border-white/10">
                  {['👏', '👍', '❤️', '❓'].map((emoji) => (
                    <button key={emoji} onClick={() => handleSendReaction(emoji)} className="p-1 hover:bg-white/10 rounded-full text-sm">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Drawer Controls */}
                <button
                  onClick={() => { setRightDrawerTab('CHAT'); setMobileDrawerOpen(true); }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${rightDrawerTab === 'CHAT' ? 'bg-[#0052CC] border-cyan-400 text-white' : 'bg-slate-800 border-white/10 text-slate-300'
                    }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </button>

                <button
                  onClick={() => { setRightDrawerTab('PEOPLE'); setMobileDrawerOpen(true); }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${rightDrawerTab === 'PEOPLE' ? 'bg-[#0052CC] border-cyan-400 text-white' : 'bg-slate-800 border-white/10 text-slate-300'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">People</span>
                </button>

                {/* Red Leave Class Button */}
                <button
                  onClick={handleExitRoom}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-full flex items-center gap-1 shadow-lg shadow-rose-900/50 cursor-pointer shrink-0"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Leave</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Side Drawer Panel (hidden on mobile, visible lg:flex) */}
          <div className="hidden lg:flex w-96 bg-[#1E1E1E] border-l border-white/10 flex-col h-full shrink-0">
            <div className="p-3 bg-[#181818] border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                {rightDrawerTab === 'CHAT' && <><MessageSquare className="w-4 h-4" /> In-Class Live Chat</>}
                {rightDrawerTab === 'PEOPLE' && <><Users className="w-4 h-4" /> Connected Learners ({participantsList.length})</>}
                {rightDrawerTab === 'POLLS' && <><BarChart2 className="w-4 h-4" /> Live In-Class Polls</>}
              </span>
              <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-lg">
                <button
                  onClick={() => setRightDrawerTab('CHAT')}
                  className={`p-1.5 rounded-md text-xs font-bold ${rightDrawerTab === 'CHAT' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setRightDrawerTab('PEOPLE')}
                  className={`p-1.5 rounded-md text-xs font-bold ${rightDrawerTab === 'PEOPLE' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                >
                  People
                </button>
              </div>
            </div>

            {rightDrawerTab === 'CHAT' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="px-3 py-1.5 bg-blue-950/40 border-b border-blue-500/20 text-[10px] text-cyan-300 flex items-center justify-between">
                  <span>Doubt Solver Moderation Desk Active</span>
                  <span className="text-emerald-400 font-bold">Live Q&A Desk</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-slate-400 text-xs">No chat messages yet</p>
                      <p className="text-[11px] text-slate-500">
                        Ask any question! Your doubts are answered by the assigned Doubt Solver Tutor or escalated to the Lead Trainer.
                      </p>
                    </div>
                  ) : (
                    messages.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-cyan-300">{m.sender}</span>
                          <span className="text-slate-400">{m.time}</span>
                        </div>
                        <p className="text-slate-200">{m.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex flex-col gap-1.5 bg-[#181818]">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a doubt or send a message..."
                      className="flex-1 bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                    />
                    <button type="submit" className="p-2 bg-[#0052CC] hover:bg-blue-600 text-white rounded-xl">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[9.5px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    <span>Student questions are received by the dedicated Doubt Solving Tutor.</span>
                  </span>
                </form>
              </div>
            )}

            {rightDrawerTab === 'PEOPLE' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs">
                {participantsList.length === 0 ? (
                  <div className="text-center p-6 text-slate-500">
                    <p className="text-xs">No learners connected yet.</p>
                  </div>
                ) : (
                  participantsList.map((p) => (
                    <div key={p.id} className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${p.isHost ? 'bg-cyan-600 text-white' : 'bg-blue-600/30 text-blue-300'}`}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {p.isHost && (
                              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.2 rounded-full font-bold">
                                Host
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {p.role} {p.regNo ? `• ${p.regNo}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500" title="Connected & Active" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Mobile Bottom Sheet Drawer */}
          {mobileDrawerOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 lg:hidden flex flex-col justify-end">
              <div className="bg-[#1E1E1E] rounded-t-3xl h-[70vh] flex flex-col border-t border-white/10">
                <div className="p-3 bg-[#181818] border-b border-white/10 flex items-center justify-between rounded-t-3xl">
                  <span className="text-xs font-bold text-cyan-300">{rightDrawerTab}</span>
                  <button onClick={() => setMobileDrawerOpen(false)} className="p-1.5 bg-white/10 rounded-lg text-slate-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {rightDrawerTab === 'CHAT' && (
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 space-y-2">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <p className="font-semibold text-slate-400 text-xs">No chat messages yet</p>
                          <p className="text-[11px] text-slate-500">Live conversation between tutor & classmates will appear here.</p>
                        </div>
                      ) : (
                        messages.map((m, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-cyan-300">{m.sender}</span>
                              <span className="text-slate-400">{m.time}</span>
                            </div>
                            <p className="text-slate-200">{m.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#181818]">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Send a message to everyone..."
                        className="flex-1 bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                      />
                      <button type="submit" className="p-2 bg-[#0052CC] text-white rounded-xl">
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}

                {rightDrawerTab === 'PEOPLE' && (
                  <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                    {participantsList.length === 0 ? (
                      <div className="text-center p-6 text-slate-500">
                        <p className="text-xs">No learners connected yet.</p>
                      </div>
                    ) : (
                      participantsList.map((p) => (
                        <div key={p.id} className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${p.isHost ? 'bg-cyan-600 text-white' : 'bg-blue-600/30 text-blue-300'}`}>
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-100 flex items-center gap-1.5">
                                <span>{p.name}</span>
                                {p.isHost && (
                                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.2 rounded-full font-bold">
                                    Host
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {p.role} {p.regNo ? `• ${p.regNo}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500" title="Connected & Active" />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
          <span>Enrolled Batch Schedule • {activeStudent.batchName}</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Live Webinar Classes</h1>
        <p className="text-xs text-slate-600">
          Join interactive live webinar classes with expert native instructors.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { key: 'LIVE_NOW', label: '🔴 Live Now', count: classesList.filter(c => c.status === 'LIVE_NOW').length },
          { key: 'TODAY', label: "Today's Schedule", count: classesList.filter(c => c.status === 'TODAY').length },
          { key: 'UPCOMING', label: 'Upcoming Classes', count: classesList.filter(c => c.status === 'UPCOMING').length },
          { key: 'COMPLETED', label: 'Completed Classes', count: classesList.filter(c => c.status === 'COMPLETED').length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${activeTab === tab.key
              ? 'bg-[#0052CC] text-white border-b-2 border-cyan-400 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <p className="text-sm font-bold text-slate-700">No scheduled classes found under this tab.</p>
            <p className="text-xs text-slate-500">Check back later for upcoming timetable updates.</p>
          </div>
        ) : (
          filteredClasses.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all">
              <div className="p-5 space-y-4">
                {/* Header Badge Strip: Status + Course Tag */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 ${
                      item.status === 'LIVE_NOW'
                        ? 'bg-rose-600 text-white animate-live-pulse'
                        : item.status === 'COMPLETED'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-blue-50 text-[#0052CC] border border-blue-200'
                    }`}
                  >
                    {item.status === 'LIVE_NOW' && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                    {item.status === 'LIVE_NOW'
                      ? '🔴 LIVE WEBINAR NOW'
                      : item.status === 'COMPLETED'
                      ? 'COMPLETED / ENDED'
                      : `SCHEDULED: ${item.timeSlot}`}
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    {item.moduleName}
                  </span>
                </div>

                {/* Topic / Title */}
                <div>
                  <h3 className="text-base font-extrabold text-[#0B2447] leading-snug line-clamp-2">
                    {item.topic}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-semibold">
                    <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Batch: {item.batchName}
                    </span>
                    <span>•</span>
                    <span>{item.attendeesCount} Enrolled Students</span>
                  </div>
                </div>

                {/* Trainer Profile Block (Modern Initials Badge - No Fake Static Stock Photos) */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs border border-blue-400/40">
                    {item.tutorName ? item.tutorName.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{item.tutorName}</p>
                    <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.tutorTitle}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Schedule Strip: Date, Time & Join Trigger */}
              <div className="p-4 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 text-xs">
                  <div className="text-slate-800 font-extrabold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                    <span>{item.timeSlot}</span>
                    <span className="text-slate-500 font-semibold">({item.durationMins} Mins)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium pl-5">
                    Date: <strong className="text-slate-800 font-bold">{item.date}</strong>
                  </div>
                </div>

                {/* Action button - only enabled when LIVE, never after completed */}
                {item.status === 'LIVE_NOW' && (
                  <button
                    onClick={() => handleStudentJoinClick(item)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer ring-2 ring-rose-400/40"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Live Class</span>
                  </button>
                )}

                {item.status === 'COMPLETED' && (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl border border-slate-300">
                      Session Concluded
                    </span>
                    <a
                      href="/recordings"
                      className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Watch Replay</span>
                    </a>
                  </div>
                )}

                {item.status === 'TODAY' && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Starts {item.timeSlot}</span>
                  </span>
                )}

                {item.status === 'UPCOMING' && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Scheduled Upcoming</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ⏳ WAITING FOR TUTOR APPROVAL MODAL */}
      {waitingRoomStatus === 'WAITING' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0052CC] mx-auto flex items-center justify-center border-4 border-blue-100 shadow-inner">
              <Clock className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Waiting Room
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">Waiting for Tutor Approval...</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your entry request has been sent to <strong>{requestingClass?.tutorName || 'the Faculty Tutor'}</strong>. You will be admitted into the classroom immediately upon tutor authorization.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Identity Verified: {activeStudent.name} ({activeStudent.rollNo})</span>
            </div>

            <button
              onClick={handleCancelJoinRequest}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer underline pt-2"
            >
              Cancel Request & Go Back
            </button>
          </div>
        </div>
      )}

      {/* ❌ DECLINED MODAL */}
      {waitingRoomStatus === 'DECLINED' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-rose-100">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border-4 border-rose-100">
              <X className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Admission Request Declined</h3>
            <p className="text-xs text-slate-500">
              The tutor was unable to admit you to this session right now. Please reach out via Doubt Support or try again later.
            </p>
            <button
              onClick={() => { setWaitingRoomStatus('IDLE'); setRequestingClass(null); }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
