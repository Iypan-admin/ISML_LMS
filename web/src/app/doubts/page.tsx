"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { MessageSquare, Send, Bot, User, CheckCircle2, Plus, X, Sparkles, Clock } from 'lucide-react';
import { mockDoubtThreads, DoubtThread } from '@/mock/doubts';
import { currentStudent } from '@/mock/students';

export default function DoubtsPage() {
  const [threads, setThreads] = useState<DoubtThread[]>(mockDoubtThreads);
  const [activeThread, setActiveThread] = useState<DoubtThread>(mockDoubtThreads[0]);
  const [newMsg, setNewMsg] = useState('');
  
  // Ask New Doubt Modal State
  const [showNewDoubtModal, setShowNewDoubtModal] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newCategory, setNewCategory] = useState<'Grammar' | 'Pronunciation' | 'Homework' | 'Exam Doubt'>('Grammar');
  const [newQuestionText, setNewQuestionText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const updatedMessages = [
      ...activeThread.messages,
      {
        id: `msg-${Date.now()}`,
        sender: 'STUDENT' as const,
        senderName: currentStudent.name,
        text: newMsg,
        timestamp: 'Just now'
      }
    ];
    const updatedThread = { ...activeThread, messages: updatedMessages };
    setActiveThread(updatedThread);
    setThreads(prev => prev.map(t => t.id === updatedThread.id ? updatedThread : t));
    setNewMsg('');
  };

  const handleCreateDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newQuestionText.trim()) return;
    const createdThread: DoubtThread = {
      id: `dt-${Date.now()}`,
      topicTitle: newTopic,
      category: newCategory,
      assignedTutorName: "Prof. Hélène Dubois",
      assignedTutorRole: "Main Tutor",
      status: "OPEN",
      createdAt: "Just now",
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "STUDENT",
          senderName: currentStudent.name,
          text: newQuestionText,
          timestamp: "Just now"
        },
        {
          id: `msg-ai-${Date.now()}`,
          sender: "AI_ASSISTANT",
          senderName: "ISML AI Tutor Assistant",
          text: `Bonjour ${currentStudent.name}! I have notified Prof. Hélène Dubois. In the meantime, regarding "${newTopic}": Always remember to check grammatical agreement for French nouns and adjectives!`,
          timestamp: "Just now"
        }
      ]
    };
    setThreads(prev => [createdThread, ...prev]);
    setActiveThread(createdThread);
    setShowNewDoubtModal(false);
    setNewTopic('');
    setNewQuestionText('');
  };

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
          Ask doubt questions anytime. Tutors & AI response system active.
        </p>
      </div>

      {/* 🚀 QUICK THREAD SELECTOR PILL BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 font-mono">
          Topics:
        </span>
        {threads.map((thread) => {
          const isSelected = activeThread.id === thread.id;
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

      {/* 💬 BRIGHT LIGHT CHAT CONVERSATION BOX & STICKY SEND FORM */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col h-[520px] sm:h-[580px]">
        {/* Active Thread Light Header */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="truncate">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#0052CC]">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0052CC] font-bold">{activeThread.category}</span>
              <span>• Ticket: {activeThread.id}</span>
            </div>
            <h2 className="text-xs sm:text-base font-extrabold text-[#0B2447] truncate max-w-md sm:max-w-xl">
              {activeThread.topicTitle}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">
              Assigned Tutor: <span className="text-[#0052CC] font-bold">{activeThread.assignedTutorName}</span> ({activeThread.assignedTutorRole})
            </p>
          </div>

          <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full text-[10px] sm:text-xs font-extrabold shrink-0">
            {activeThread.status}
          </span>
        </div>

        {/* Conversation Feed */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 font-sans">
          {activeThread.messages.map((m) => {
            const isStudent = m.sender === 'STUDENT';
            const isAI = m.sender === 'AI_ASSISTANT';
            const isTutor = m.sender === 'TUTOR';

            return (
              <div key={m.id} className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] sm:max-w-md p-3 sm:p-4 rounded-2xl space-y-1.5 text-xs shadow-2xs ${
                  isStudent 
                    ? 'bg-[#0052CC] text-white rounded-br-none' 
                    : isAI 
                      ? 'bg-purple-50 text-purple-950 rounded-bl-none border border-purple-200'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                }`}>
                  {/* Sender Header */}
                  <div className="flex items-center justify-between text-[10px] opacity-90 gap-2 pb-1 border-b border-slate-200/40">
                    <span className="font-bold flex items-center gap-1.5 truncate">
                      {isAI && <Bot className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                      {isTutor && <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      <span>{m.senderName}</span>
                    </span>
                    <span className="text-[9px] opacity-75 shrink-0">{m.timestamp}</span>
                  </div>

                  {/* Message Body */}
                  <p className="leading-relaxed text-xs sm:text-sm whitespace-pre-line">{m.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ALWAYS VISIBLE LIGHT STICKY SEND INPUT FORM */}
        <form 
          onSubmit={handleSend} 
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 shadow-lg"
        >
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your doubt question or follow-up reply here..."
            className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-500 outline-none focus:border-[#0052CC] focus:bg-white transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>

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
                  rows={3}
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
