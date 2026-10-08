// ============================================================================
// ISML COLLEGE LMS — SCHEDULE SESSION / TIMETABLE PERIOD DRAWER
// Add Timetable Lecture Periods, Live Broadcast Sessions & Lab Studios
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  X,
  Plus,
  Sparkles,
  Users,
  Video,
  BookOpen,
  Wifi,
  Building,
  Link as LinkIcon,
} from 'lucide-react';
import { ClassSessionItem, TimetableSlot } from '@/types/rbac';
import { mockSubjects, mockBatches, mockPrograms } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface ScheduleSessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionScheduled: (newSession: ClassSessionItem) => void;
  editSession?: ClassSessionItem | null;
  onSessionUpdated?: (session: ClassSessionItem) => void;
}

export default function ScheduleSessionDrawer({
  isOpen,
  onClose,
  onSessionScheduled,
  editSession,
  onSessionUpdated,
}: ScheduleSessionDrawerProps) {
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(editSession);

  const [subjectName, setSubjectName] = useState(mockSubjects[0]?.name || 'Problem Solving & Python');
  const [facultyName, setFacultyName] = useState('Dr. Anandhakumar V.');
  const [programName, setProgramName] = useState(mockPrograms[0]?.name || 'B.Sc Computer Science');
  const [batchName, setBatchName] = useState(mockBatches[0]?.name || 'Cohort 2026–2029 (Section A)');
  const [date, setDate] = useState('2026-10-12');
  const [timeSlot, setTimeSlot] = useState('08:30 AM – 09:30 AM');
  const [deliveryMode, setDeliveryMode] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/ism-live');
  const [venueRoom, setVenueRoom] = useState('Computing Lab Hall 204');
  const [roomOrLink, setRoomOrLink] = useState('Virtual Studio A');
  const [attendeesCount, setAttendeesCount] = useState(60);
  const [status, setStatus] = useState<'UPCOMING' | 'LIVE_NOW' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');

  useEffect(() => {
    if (isOpen) {
      if (editSession) {
        setSubjectName(editSession.subjectName);
        setFacultyName(editSession.facultyName);
        setProgramName(editSession.programName);
        setBatchName(editSession.batchName);
        setDate(editSession.date);
        setTimeSlot(editSession.timeSlot);
        setDeliveryMode(editSession.deliveryMode || (editSession.roomOrLink?.toLowerCase().includes('http') || editSession.roomOrLink?.toLowerCase().includes('studio') || editSession.roomOrLink?.toLowerCase().includes('zoom') ? 'ONLINE' : 'OFFLINE'));
        setMeetingUrl(editSession.meetingUrl || (editSession.roomOrLink?.startsWith('http') ? editSession.roomOrLink : 'https://meet.google.com/ism-live'));
        setVenueRoom(editSession.venueRoom || editSession.roomOrLink || 'Lecture Hall 101');
        setRoomOrLink(editSession.roomOrLink);
        setAttendeesCount(editSession.attendeesCount);
        setStatus(editSession.status);
      } else {
        setSubjectName(mockSubjects[0]?.name || 'Problem Solving & Python');
        setFacultyName('Dr. Anandhakumar V.');
        setProgramName(mockPrograms[0]?.name || 'B.Sc Computer Science');
        setBatchName(mockBatches[0]?.name || 'Cohort 2026–2029 (Section A)');
        setDate('2026-10-12');
        setTimeSlot('08:30 AM – 09:30 AM');
        setDeliveryMode('ONLINE');
        setMeetingUrl('https://meet.google.com/ism-live');
        setVenueRoom('Computing Lab Hall 204');
        setRoomOrLink('Live Virtual Studio');
        setAttendeesCount(60);
        setStatus('UPCOMING');
      }
    }
  }, [isOpen, editSession]);

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
    if (!subjectName.trim()) {
      showError('Please choose or enter a subject name.');
      return;
    }

    const calculatedLocation = deliveryMode === 'ONLINE'
      ? (meetingUrl || 'Virtual Live Studio')
      : (venueRoom || 'Campus Lecture Hall');

    if (isEditMode && editSession) {
      const updatedSession: ClassSessionItem = {
        ...editSession,
        subjectName,
        facultyName,
        programName,
        batchName,
        deliveryMode,
        meetingUrl: deliveryMode === 'ONLINE' ? meetingUrl : undefined,
        venueRoom: deliveryMode === 'OFFLINE' ? venueRoom : undefined,
        roomOrLink: calculatedLocation,
        date,
        timeSlot,
        attendeesCount,
        status,
      };
      if (onSessionUpdated) {
        onSessionUpdated(updatedSession);
      }
      showSuccess(`Class slot for ${subjectName} (${deliveryMode}) updated.`);
      onClose();
      return;
    }

    const newSession: ClassSessionItem = {
      id: `session-${Date.now().toString().slice(-4)}`,
      subjectName,
      facultyName,
      programName,
      batchName,
      deliveryMode,
      meetingUrl: deliveryMode === 'ONLINE' ? meetingUrl : undefined,
      venueRoom: deliveryMode === 'OFFLINE' ? venueRoom : undefined,
      roomOrLink: calculatedLocation,
      date,
      timeSlot,
      attendeesCount,
      status,
    };

    onSessionScheduled(newSession);
    showSuccess(`Class slot scheduled for ${subjectName} (${deliveryMode}) on ${timeSlot}.`);
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
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {isEditMode ? 'Edit Lecture / Period Slot' : 'Schedule Lecture / Period'}
              </h2>
              <p className="text-[11px] sm:text-xs text-blue-200 mt-0.5">
                {isEditMode ? 'Update timetable slot and hall allocation' : 'Allocate timetable slot, physical hall or live studio'}
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
                Curriculum Subject <span className="text-rose-500">*</span>
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
                  Faculty Incharge
                </label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="e.g. Dr. Anandhakumar V."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Cohort Batch
                </label>
                <select
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  {mockBatches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Session Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time Slot Period
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="08:30 AM – 09:30 AM">Period 1 (08:30 AM – 09:30 AM)</option>
                  <option value="09:30 AM – 10:30 AM">Period 2 (09:30 AM – 10:30 AM)</option>
                  <option value="10:45 AM – 11:45 AM">Period 3 (10:45 AM – 11:45 AM)</option>
                  <option value="11:45 AM – 12:45 PM">Period 4 (11:45 AM – 12:45 PM)</option>
                  <option value="01:45 PM – 02:45 PM">Period 5 (01:45 PM – 02:45 PM)</option>
                  <option value="02:45 PM – 03:45 PM">Period 6 (02:45 PM – 03:45 PM)</option>
                </select>
              </div>
            </div>

            {/* ─── Delivery Mode Selection (ONLINE / OFFLINE) ─── */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Lecture Delivery Mode <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMode('ONLINE')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    deliveryMode === 'ONLINE'
                      ? 'border-[#0052CC] bg-blue-50/70 text-[#0052CC] ring-2 ring-blue-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${deliveryMode === 'ONLINE' ? 'bg-[#0052CC] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold">Online Live Class</span>
                    <span className="block text-[10px] text-slate-500">Virtual studio / Webinar</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMode('OFFLINE')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    deliveryMode === 'OFFLINE'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${deliveryMode === 'OFFLINE' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold">Offline Classroom</span>
                    <span className="block text-[10px] text-slate-500">Physical hall / Campus lab</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {deliveryMode === 'ONLINE' ? 'Live Stream / Meeting Link' : 'Campus Hall / Room No.'}
                </label>
                {deliveryMode === 'ONLINE' ? (
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      placeholder="https://meet.google.com/xyz or Zoom Link"
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      required
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={venueRoom}
                      onChange={(e) => setVenueRoom(e.target.value)}
                      placeholder="e.g. Computing Lab 2 or Hall 204"
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max Student Attendees
                </label>
                <input
                  type="number"
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(Number(e.target.value))}
                  min={1}
                  max={250}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Session Readiness Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                <option value="UPCOMING">Upcoming (Scheduled in Academic Calendar)</option>
                <option value="LIVE_NOW">Live Now (Active Broadcast / Ongoing Period)</option>
              </select>
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
              <span>{isEditMode ? 'Update Period Slot' : 'Save & Publish Slot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
