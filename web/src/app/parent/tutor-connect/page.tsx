// ============================================================================
// ISML COLLEGE LMS — PARENT: TUTOR DIRECT CONNECT (/parent/tutor-connect)
// Direct messaging desk with Lead Tutors, parent queries, notes & call schedule
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare,
  PhoneCall,
  Mail,
  User,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useParent } from '@/context/ParentContext';
import { useToast } from '@/context/ToastContext';

export default function ParentTutorConnectPage() {
  const { selectedChild, selectChild, allChildren, parent } = useParent();
  const { showSuccess } = useToast();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg-01',
      sender: 'Lead Tutor: Jay (fac-jay)',
      isParent: false,
      timestamp: 'Yesterday, 06:15 PM',
      text: `Hello Dr. Meenakshi. Bharathi performed exceptionally well in yesterday's oral dialogue assessment on Passé Composé. She scored 22.5/25. Please encourage her to maintain this momentum!`,
    },
    {
      id: 'msg-02',
      sender: parent.name,
      isParent: true,
      timestamp: 'Yesterday, 07:30 PM',
      text: `Thank you so much Prof. Jay. We are very proud of her progress in French! Will there be any mock listening drills scheduled this Sunday?`,
    },
    {
      id: 'msg-03',
      sender: 'Lead Tutor: Jay (fac-jay)',
      isParent: false,
      timestamp: 'Today, 08:45 AM',
      text: `Yes, we have a DELF A1 audio clinic this Friday from 05:30 PM to 06:30 PM on LiveKit Studio. Bharathi has already been enrolled.`,
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: parent.name,
      isParent: true,
      timestamp: 'Just now',
      text: message.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
    showSuccess('Message sent directly to Lead Tutor Jay.');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: 'Parent Portal', href: '/parent/dashboard' },
            { label: 'Tutor Direct Connect' },
          ]}
        />
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {allChildren.map((c) => (
            <button
              key={c.id}
              onClick={() => selectChild(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                c.id === selectedChild.id
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200 text-xs font-bold mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Parent-Faculty Direct Line</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight">
            Consultation Desk: {selectedChild.primaryCourse.leadTutorName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ward: <strong>{selectedChild.name}</strong> • {selectedChild.primaryCourse.courseCode} ({selectedChild.primaryCourse.batchName})
          </p>
        </div>

        {/* Quick Contact Chips */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${selectedChild.primaryCourse.leadTutorPhone}`}
            className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call Faculty</span>
          </a>
          <a
            href={`mailto:${selectedChild.primaryCourse.leadTutorEmail}`}
            className="px-3 py-2 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>Email</span>
          </a>
        </div>
      </div>

      {/* INTERACTIVE MESSAGING CONSOLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0052CC] text-white font-black text-xs flex items-center justify-center">
              JT
            </div>
            <div>
              <h4 className="text-xs font-black text-[#0B2447]">{selectedChild.primaryCourse.leadTutorName}</h4>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Active on College LMS Desk</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">
            All messages are archived for NAAC academic governance
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isParent ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                <span className="font-bold text-slate-600">{m.sender}</span>
                <span>• {m.timestamp}</span>
              </div>
              <div
                className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed ${
                  m.isParent
                    ? 'bg-[#0052CC] text-white rounded-tr-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Type query or request to tutor regarding ${selectedChild.name}...`}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0052CC] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
