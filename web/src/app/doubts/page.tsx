"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MessageSquare, Send, Bot, User, CheckCircle2, Plus, X, Sparkles, Clock, Check, CheckCheck, HelpCircle } from 'lucide-react';
import { playMessageSound } from '@/lib/soundEffects';

export default function DoubtsPage() {
  const [studentInfo, setStudentInfo] = useState({
    name: 'Student',
    rollNo: '',
    id: '',
    college: 'The American College',
    batch: 'Morning Batch',
    course: 'French Language Track',
    tutor: 'Joy JK'
  });

  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Ask New Doubt Modal State
  const [showNewDoubtModal, setShowNewDoubtModal] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newCategory, setNewCategory] = useState<'Grammar' | 'Pronunciation' | 'Homework' | 'Exam Doubt'>('Grammar');
  const [newQuestionText, setNewQuestionText] = useState('');

  // 1. Identify current logged-in student
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('isml_user') || localStorage.getItem('isml_student_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          setStudentInfo({
            name: parsed.name || 'Student',
            rollNo: parsed.rollNo || parsed.registrationNumber || parsed.studentId || '',
            id: parsed.id || parsed.studentId || '',
            college: parsed.collegeName || parsed.tenantName || 'The American College',
            batch: parsed.batchName || 'Morning Batch',
            course: parsed.enrolledCourseName || parsed.courseName || 'French Language Track',
            tutor: parsed.tutorName || 'Joy JK'
          });
        }
      }
    } catch {}
  }, []);

  // 2. Fetch from DB (/api/portals/doubts) filtered strictly for this student
  const loadDoubts = () => {
    let currentRoll = '';
    let currentId = '';
    let currentName = '';

    try {
      const stored = localStorage.getItem('isml_user') || localStorage.getItem('isml_student_profile');
      if (stored) {
        const u = JSON.parse(stored);
        currentRoll = u.rollNo || u.studentId || '';
        currentId = u.id || u.studentId || '';
        currentName = u.name || '';
      }
    } catch {}

    fetch('/api/portals/doubts')
      .then((res) => res.json())
      .then((json) => {
        setIsLoading(false);
        if (json?.data && Array.isArray(json.data)) {
          // Strict student isolation: show only doubts belonging to this student!
          const myDoubts = json.data.filter((t: any) => {
            if (!currentRoll && !currentName && !currentId) return false;
            const matchRoll = currentRoll && t.studentRollNo?.toLowerCase() === currentRoll.toLowerCase();
            const matchId = currentId && t.studentId?.toLowerCase() === currentId.toLowerCase();
            const matchName = currentName && t.studentName?.toLowerCase().trim() === currentName.toLowerCase().trim();
            return matchRoll || matchId || matchName;
          });

          setThreads(myDoubts);
          setActiveThread((prev: any) => {
            if (!prev) return myDoubts[0] || null;
            return myDoubts.find((t: any) => t.id === prev.id) || myDoubts[0] || null;
          });
        } else {
          setThreads([]);
          setActiveThread(null);
        }
      })
      .catch(() => {
        setIsLoading(false);
        setThreads([]);
        setActiveThread(null);
      });
  };

  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Broadcast typing status
  const broadcastTyping = () => {
    if (!activeThread?.id) return;
    try {
      const bc = new BroadcastChannel('isml_doubts_webhook');
      bc.postMessage({ type: 'TYPING', sender: 'STUDENT', threadId: activeThread.id });
      bc.close();
    } catch {}
  };

  useEffect(() => {
    loadDoubts();

    // 1. Cross-tab BroadcastChannel webhook
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('isml_doubts_webhook');
      channel.onmessage = (event) => {
        if (event?.data?.type === 'DOUBTS_UPDATED') {
          setIsOtherTyping(false);
          loadDoubts();
        } else if (event?.data?.type === 'TYPING' && event?.data?.sender === 'TUTOR' && event?.data?.threadId === activeThread?.id) {
          setIsOtherTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 2500);
        }
      };
    } catch {}

    // 2. Window event listener
    const handleSync = () => loadDoubts();
    window.addEventListener('isml-realtime-event', handleSync);
    window.addEventListener('isml-doubt-thread-updated', handleSync);

    // 3. Ultra-fast 2s background polling webhook sync
    const interval = setInterval(loadDoubts, 2000);

    return () => {
      channel?.close();
      window.removeEventListener('isml-realtime-event', handleSync);
      window.removeEventListener('isml-doubt-thread-updated', handleSync);
      clearInterval(interval);
    };
  }, [studentInfo.rollNo, studentInfo.name, activeThread?.id]);

  const currentActiveThread = activeThread;
  const previousCountRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto scroll & receive chime on new incoming message or typing indicator
  useEffect(() => {
    const currentCount = currentActiveThread?.messages?.length || 0;
    if (previousCountRef.current > 0 && currentCount > previousCountRef.current) {
      const lastMsg = currentActiveThread.messages[currentCount - 1];
      if (lastMsg && lastMsg.sender !== 'STUDENT') {
        playMessageSound('RECEIVED');
      }
    }
    previousCountRef.current = currentCount;
    scrollToBottom();
  }, [currentActiveThread?.messages, isOtherTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !currentActiveThread) return;

    const newMsgObj = {
      id: `msg-${Date.now()}`,
      sender: 'STUDENT' as const,
      senderName: studentInfo.name,
      text: newMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
    };

    const updatedMessages = [...(currentActiveThread.messages || []), newMsgObj];
    const updatedThread = { ...currentActiveThread, messages: updatedMessages };

    setActiveThread(updatedThread);
    setThreads(prev => prev.map(t => t.id === updatedThread.id ? updatedThread : t));
    setNewMsg('');
    playMessageSound('SENT');

    // Persist to DB API
    try {
      await fetch('/api/portals/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REPLY',
          threadId: currentActiveThread.id,
          message: newMsgObj
        })
      });
      window.dispatchEvent(new CustomEvent('isml-doubt-thread-updated', { detail: threads }));
      window.dispatchEvent(new CustomEvent('isml-realtime-event', { detail: { type: 'DOUBTS_UPDATED' } }));
      try {
        const bc = new BroadcastChannel('isml_doubts_webhook');
        bc.postMessage({ type: 'DOUBTS_UPDATED' });
        bc.close();
      } catch {}
    } catch {}
  };

  const handleCreateDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newQuestionText.trim()) return;

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    const createdThread: any = {
      id: `dt-${Date.now()}`,
      ticketNo: `TKT-${Date.now().toString().slice(-4)}`,
      topicTitle: newTopic,
      category: newCategory,
      batchId: 'batch-all',
      batchName: studentInfo.batch,
      courseName: studentInfo.course,
      studentId: studentInfo.id || studentInfo.rollNo || 'std-current',
      studentName: studentInfo.name,
      studentRollNo: studentInfo.rollNo,
      collegeName: studentInfo.college,
      assignedTutorName: studentInfo.tutor,
      assignedTutorRole: "Main Tutor",
      status: "OPEN",
      createdAt: formattedTime,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "STUDENT",
          senderName: studentInfo.name,
          text: newQuestionText,
          timestamp: formattedTime
        },
        {
          id: `msg-ai-${Date.now()}`,
          sender: "AI_ASSISTANT",
          senderName: "ISML AI Academic Assistant",
          text: `Hello ${studentInfo.name}! Your doubt ticket has been routed to assigned faculty ${studentInfo.tutor}. They will evaluate and reply with guidance directly here.`,
          timestamp: formattedTime
        }
      ]
    };

    const newThreads = [createdThread, ...threads];
    setThreads(newThreads);
    setActiveThread(createdThread);
    setShowNewDoubtModal(false);
    setNewTopic('');
    setNewQuestionText('');

    // Persist to real backend DB
    try {
      await fetch('/api/portals/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdThread)
      });
      window.dispatchEvent(new CustomEvent('isml-doubt-thread-updated', { detail: newThreads }));
      window.dispatchEvent(new CustomEvent('isml-realtime-event', { detail: { type: 'DOUBTS_UPDATED', thread: createdThread } }));
      try {
        const bc = new BroadcastChannel('isml_doubts_webhook');
        bc.postMessage({ type: 'DOUBTS_UPDATED', thread: createdThread });
        bc.close();
      } catch {}
    } catch {}
  };

  const studentInitial = (studentInfo.name || 'S').trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-4 pb-20 md:pb-8 font-sans">
      {/* ☀️ BRIGHT LIGHT BLUE PAGE HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
            <MessageSquare className="w-4 h-4 text-[#0052CC]" />
            <span>Assistant Tutor Doubt Resolution</span>
          </div>
          <button
            onClick={() => setShowNewDoubtModal(true)}
            className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm cursor-pointer transition-transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ask Doubt</span>
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B2447]">Academic Doubt Support & Chat</h1>
        <p className="text-xs text-slate-600">
          Ask questions directly to your certified faculty ({studentInfo.tutor}). Your doubt threads remain 100% private to your account.
        </p>
      </div>

      {/* 🚀 QUICK THREAD SELECTOR PILL BAR */}
      {threads.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 font-mono">
            My Topics:
          </span>
          {threads.map((thread) => {
            const isSelected = activeThread?.id === thread.id;
            return (
              <button
                key={thread.id}
                onClick={() => setActiveThread(thread)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#0052CC] text-white border-cyan-400 shadow-xs scale-102'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-300' : 'bg-slate-400'}`} />
                <span className="truncate max-w-[180px] sm:max-w-xs">{thread.topicTitle}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 💬 CHAT BOX OR EMPTY STATE */}
      {threads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto text-[#0052CC]">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">No Doubt Inquiries Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Have a question regarding pronunciation, grammar, or homework? Click below to ask your faculty {studentInfo.tutor}.
            </p>
          </div>
          <button
            onClick={() => setShowNewDoubtModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ask Your First Doubt</span>
          </button>
        </div>
      ) : currentActiveThread ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col h-[520px] sm:h-[580px]">
          {/* Active Thread Light Header */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="truncate">
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#0052CC]">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0052CC] font-bold">{currentActiveThread.category}</span>
                <span>• Ticket: {currentActiveThread.id}</span>
              </div>
              <h2 className="text-xs sm:text-base font-extrabold text-[#0B2447] truncate max-w-md sm:max-w-xl">
                {currentActiveThread.topicTitle}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                Assigned Tutor: <span className="text-[#0052CC] font-bold">{currentActiveThread.assignedTutorName}</span> ({currentActiveThread.assignedTutorRole})
              </p>
            </div>

            <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full text-[10px] sm:text-xs font-extrabold shrink-0">
              {currentActiveThread.status}
            </span>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 bg-slate-100/70 font-sans">
            {(currentActiveThread.messages || []).map((m: any, mIdx: number) => {
              const isStudent = m.sender === 'STUDENT';
              const isAI = m.sender === 'AI_ASSISTANT';
              const isTutor = m.sender === 'TUTOR';

              return (
                <div 
                  key={m.id || mIdx} 
                  className={`flex items-end gap-2 ${isStudent ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                >
                  {!isStudent && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                      isAI 
                        ? 'bg-purple-600 text-white ring-2 ring-purple-200' 
                        : 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                    }`}>
                      {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                  )}

                  <div className={`group relative max-w-[85%] sm:max-w-md p-3.5 sm:p-4 rounded-2xl space-y-1.5 text-xs sm:text-[13px] shadow-sm transition-all ${
                    isStudent 
                      ? 'bg-gradient-to-br from-[#0052CC] to-[#1E3A8A] text-white rounded-br-xs shadow-blue-500/10' 
                      : isAI 
                        ? 'bg-white text-slate-800 rounded-bl-xs border border-purple-200/80 shadow-purple-500/5'
                        : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-slate-200/50'
                  }`}>
                    {/* Sender Header */}
                    <div className={`flex items-center justify-between text-[11px] gap-2 pb-1 border-b ${
                      isStudent ? 'border-white/15 text-blue-100 font-semibold' : 'border-slate-100 text-slate-500 font-bold'
                    }`}>
                      <span className="flex items-center gap-1.5 truncate">
                        {isAI ? 'AI Assistant' : isTutor ? currentActiveThread.assignedTutorName : 'You (Student)'}
                      </span>
                      <span className="text-[10px] font-mono opacity-80 shrink-0">{m.timestamp}</span>
                    </div>

                    {/* Message Body */}
                    <p className="leading-relaxed whitespace-pre-line font-normal tracking-wide">
                      {m.text}
                    </p>

                    {/* Delivery Tick */}
                    {isStudent && (
                      <div className="flex justify-end pt-0.5">
                        <CheckCheck className="w-3.5 h-3.5 text-cyan-300 opacity-90" />
                      </div>
                    )}
                  </div>

                  {isStudent && (
                    <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black shrink-0 ring-2 ring-blue-300 shadow-2xs">
                      {studentInitial}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 💬 Messenger Typing Indicator Dot Animation */}
            {isOtherTyping && (
              <div className="flex items-end gap-2 justify-start animate-in fade-in slide-in-from-bottom-1 duration-150">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-emerald-200 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-xs shadow-sm flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">{currentActiveThread.assignedTutorName} is typing</span>
                  <span className="w-2 h-2 rounded-full bg-[#0052CC] animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#0052CC] animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#0052CC] animate-bounce"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ALWAYS VISIBLE LIGHT STICKY SEND INPUT FORM */}
          <form 
            onSubmit={handleSend} 
            className="p-3 sm:p-3.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 shadow-lg"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => {
                  setNewMsg(e.target.value);
                  broadcastTyping();
                }}
                placeholder="Type your doubt message here... (Press Enter to Send)"
                className="w-full bg-slate-100/90 hover:bg-slate-100 border border-slate-200 rounded-2xl pl-4 pr-10 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0052CC] focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={!newMsg.trim()}
              className="px-5 py-3 bg-[#0052CC] hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-[#0052CC] text-white rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      ) : null}

      {/* ➕ ASK NEW DOUBT MODAL */}
      {showNewDoubtModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs sm:text-sm font-bold text-[#0B2447] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0052CC]" /> Submit New Academic Doubt
              </span>
              <button onClick={() => setShowNewDoubtModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoubt} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doubt Topic Title</label>
                <input
                  type="text"
                  required
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Difference between 'un café' and 'du café'?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0052CC]"
                >
                  <option value="Grammar">Grammar & Conjugation</option>
                  <option value="Pronunciation">Pronunciation & Accent</option>
                  <option value="Homework">Homework & Assignments</option>
                  <option value="Exam Doubt">Exam Doubt</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Question</label>
                <textarea
                  required
                  rows={4}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Describe what you find confusing..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0052CC]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewDoubtModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
