// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN TIMETABLE HUB & SCHEDULER MATRIX
// Full Administrative Authority: Real DB timetable sync, Add, Edit & DELETE
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Plus,
  Wifi,
  CalendarRange,
  Video,
  Filter,
  Search,
  Repeat,
  Zap,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  X,
  UserCheck,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useToast } from '@/context/ToastContext';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
type DayType = (typeof DAYS)[number];

const TIME_INTERVALS = [
  '08:30 AM - 10:00 AM',
  '09:00 AM - 10:30 AM',
  '10:00 AM - 11:30 AM',
  '11:00 AM - 12:30 PM',
  '11:45 AM - 01:15 PM',
  '02:00 PM - 03:30 PM',
  '04:00 PM - 05:30 PM',
  '06:00 PM - 07:30 PM',
  '07:30 PM - 09:00 PM',
];

export interface SuperAdminTimetableSlot {
  id: string;
  day: DayType;
  timeSlot: string;
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  batchName: string;
  room?: string;
  deliveryMode: 'ONLINE' | 'OFFLINE';
  meetingUrl?: string;
  department?: string;
  program?: string;
  semester?: number;
  recurrenceType?: 'ONE_DAY' | 'WEEKLY' | 'CYCLIC_ROTATION';
  sessionFormat?: 'GROUP_WEBINAR' | 'ONE_ON_ONE_HUMAN_TUTOR';
  targetStudentName?: string;
  targetCollege?: string;
  maxAttendees?: number;
  specificDate?: string;
}

export default function SuperAdminTimetablePage() {
  const { showSuccess, showError } = useToast();

  const [timetable, setTimetable] = useState<SuperAdminTimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal / Drawer state for Super Admin (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // Form states
  const [formSubjectName, setFormSubjectName] = useState('French A1: Spoken & Phonetics');
  const [formFacultyName, setFormFacultyName] = useState('Joy JK');
  const [formBatchName, setFormBatchName] = useState('The American College French A1 Executive Cohort');
  const [formDay, setFormDay] = useState<DayType>('MONDAY');
  const [formTimeSlot, setFormTimeSlot] = useState(TIME_INTERVALS[2]);
  const [formRecurrence, setFormRecurrence] = useState<'ONE_DAY' | 'WEEKLY' | 'CYCLIC_ROTATION'>('WEEKLY');
  const [formMaxAttendees, setFormMaxAttendees] = useState(50);
  const [formTargetCollege, setFormTargetCollege] = useState('The American College');

  // Fetch real timetable from backend API
  const fetchTimetable = () => {
    setLoading(true);
    fetch('/api/portals/timetable')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) {
          setTimetable(json.data);
        }
      })
      .catch((err) => console.error('Failed to fetch timetable:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  // Filtered timetable
  const filteredTimetable = useMemo(() => {
    return timetable.filter((slot) => {
      if (selectedDay !== 'ALL' && slot.day !== selectedDay) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          slot.subjectName.toLowerCase().includes(q) ||
          slot.facultyName.toLowerCase().includes(q) ||
          slot.batchName.toLowerCase().includes(q) ||
          slot.timeSlot.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [timetable, selectedDay, searchQuery]);

  // Open Edit Mode
  const handleOpenEdit = (slot: SuperAdminTimetableSlot) => {
    setEditingSlotId(slot.id);
    setFormSubjectName(slot.subjectName);
    setFormFacultyName(slot.facultyName);
    setFormBatchName(slot.batchName);
    setFormDay(slot.day);
    setFormTimeSlot(slot.timeSlot);
    setFormRecurrence(slot.recurrenceType || 'WEEKLY');
    setFormMaxAttendees(slot.maxAttendees || 50);
    setFormTargetCollege(slot.targetCollege || 'Partner College Campus');
    setIsModalOpen(true);
  };

  // Open Create Mode
  const handleOpenCreate = () => {
    setEditingSlotId(null);
    setFormSubjectName('German A1 Intensive Masterclass');
    setFormFacultyName('Prof. Antoine Martin');
    setFormBatchName('CIT Coimbatore German A1 Fast-Track Track');
    setFormDay('MONDAY');
    setFormTimeSlot(TIME_INTERVALS[1]);
    setFormRecurrence('WEEKLY');
    setFormMaxAttendees(50);
    setFormTargetCollege('Coimbatore Institute of Technology (CIT)');
    setIsModalOpen(true);
  };

  // 🗑️ SUPER ADMIN EXCLUSIVE: DELETE TIMETABLE SLOT HANDLER
  const handleDeleteSlot = async (slotId: string, subjectName: string) => {
    if (!window.confirm(`[Super Admin Authority] Are you sure you want to permanently delete the schedule for "${subjectName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/portals/timetable?id=${slotId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTimetable((prev) => prev.filter((s) => s.id !== slotId));
        showSuccess(`Schedule slot for "${subjectName}" permanently deleted from database.`);
      } else {
        showError('Failed to delete timetable slot from database.');
      }
    } catch (e: any) {
      showError(e?.message || 'Error deleting timetable slot');
    }
  };

  // Save changes / Create slot
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEdit = Boolean(editingSlotId);
    const newId = editingSlotId || `tt-real-${Date.now()}`;
    const slotPayload: SuperAdminTimetableSlot = {
      id: newId,
      day: formDay,
      timeSlot: formTimeSlot,
      subjectName: formSubjectName,
      subjectCode: formSubjectName.substring(0, 3).toUpperCase(),
      facultyName: formFacultyName,
      batchName: formBatchName,
      room: 'Live Online Studio',
      deliveryMode: 'ONLINE',
      meetingUrl: `https://live.isml.edu/livekit-room/isml-${newId}`,
      department: 'Foreign Languages & Linguistics',
      program: 'Language Certification Program',
      semester: 1,
      recurrenceType: formRecurrence,
      targetCollege: formTargetCollege,
      maxAttendees: formMaxAttendees,
    };

    try {
      const res = await fetch('/api/portals/timetable', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotPayload),
      });

      if (res.ok) {
        if (isEdit) {
          setTimetable((prev) => prev.map((s) => (s.id === newId ? slotPayload : s)));
          showSuccess(`Timetable slot for "${formSubjectName}" updated successfully.`);
        } else {
          setTimetable((prev) => [slotPayload, ...prev]);
          showSuccess(`New timetable slot scheduled for "${formSubjectName}".`);
        }
        setIsModalOpen(false);
      } else {
        showError('Failed to save timetable slot to database.');
      }
    } catch (err: any) {
      showError(err?.message || 'Save error');
    }
  };

  return (
    <div className="space-y-5 pb-10 font-sans">
      <Breadcrumbs items={[{ label: 'Scheduling & Matrix' }, { label: 'College Timetable' }]} />

      {/* Main Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-[#0052CC] border border-blue-200 uppercase tracking-wider">
              Super Admin Authority
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Full CRUD: Add, Edit & Permanent Delete
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-[#0052CC]" />
            <span>Master Timetable Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Centralized timetable controls across all affiliated colleges and campuses. Only Super Administrators possess authorization to permanently delete scheduled slots.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Timetable Slot</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Day Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDay('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              selectedDay === 'ALL' ? 'bg-[#0052CC] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Days ({timetable.length})
          </button>
          {DAYS.map((day) => {
            const count = timetable.filter((s) => s.day === day).length;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedDay === day ? 'bg-[#0052CC] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {day} ({count})
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subject, faculty, campus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Timetable Slots Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Active Schedules Matrix ({filteredTimetable.length} items)</span>
          <span className="text-slate-400 font-normal text-[11px]">Synced with PostgreSQL database</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading schedules from database...</div>
        ) : filteredTimetable.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No timetable slots found for the selected criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {DAYS.map((day) => {
              const daySlots = filteredTimetable.filter((s) => s.day === day);
              if (selectedDay !== 'ALL' && selectedDay !== day) return null;
              if (daySlots.length === 0) return null;

              return (
                <div key={day} className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start hover:bg-slate-50/40 transition">
                  <div className="w-36 shrink-0 space-y-1">
                    <span className="font-extrabold text-xs uppercase tracking-wider text-[#0052CC] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block">
                      {day}
                    </span>
                    <p className="text-[11px] text-slate-400 font-semibold pl-0.5">
                      {daySlots.length} Scheduled Slot{daySlots.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-slate-600 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {slot.timeSlot}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-[#0052CC] border border-blue-200">
                              {slot.recurrenceType || 'Weekly'}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-[#0B2447] line-clamp-1">{slot.subjectName}</h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            Cohort: <strong className="text-slate-700">{slot.batchName}</strong>
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            Campus: <strong className="text-slate-700">{slot.targetCollege || 'Partner Campus'}</strong>
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            Trainer: <strong className="text-slate-800">{slot.facultyName}</strong>
                          </p>
                        </div>

                        {/* Super Admin Action Bar: Edit & DELETE */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                            {slot.id}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEdit(slot)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-slate-200"
                              title="Edit Timetable Slot"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* 🚨 Super Admin Exclusive DELETE Button */}
                            <button
                              onClick={() => handleDeleteSlot(slot.id, slot.subjectName)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-rose-200 hover:border-rose-300"
                              title="Super Admin Authority: Permanently Delete Slot"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Super Admin Schedule / Edit Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                  <CalendarRange className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {editingSlotId ? 'Edit Timetable Schedule' : 'Create Timetable Schedule'}
                  </h3>
                  <p className="text-[11px] text-blue-200 mt-0.5">Super Admin Management Authority</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveSlot} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject / Course Track *</label>
                  <input
                    type="text"
                    required
                    value={formSubjectName}
                    onChange={(e) => setFormSubjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Campus / College *</label>
                  <input
                    type="text"
                    required
                    value={formTargetCollege}
                    onChange={(e) => setFormTargetCollege(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Trainer Faculty *</label>
                  <input
                    type="text"
                    required
                    value={formFacultyName}
                    onChange={(e) => setFormFacultyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Cohort / Batch Name *</label>
                  <input
                    type="text"
                    required
                    value={formBatchName}
                    onChange={(e) => setFormBatchName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Day of Week *</label>
                    <select
                      value={formDay}
                      onChange={(e) => setFormDay(e.target.value as DayType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Time Slot *</label>
                    <select
                      value={formTimeSlot}
                      onChange={(e) => setFormTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      {TIME_INTERVALS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Recurrence *</label>
                    <select
                      value={formRecurrence}
                      onChange={(e) => setFormRecurrence(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="WEEKLY">Weekly Repeating</option>
                      <option value="ONE_DAY">One-Day Session</option>
                      <option value="CYCLIC_ROTATION">Cyclic Rotation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Max Attendees *</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={formMaxAttendees}
                      onChange={(e) => setFormMaxAttendees(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-cyan-300" />
                  <span>{editingSlotId ? 'Save Changes' : 'Confirm Slot'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
