// ============================================================================
// ISML COLLEGE LMS — NOTIFICATIONS & CAMPUS BROADCASTS
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Bell, Send, Plus, Users, ShieldAlert, Sparkles } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import { Can } from '@/context/AuthRbacContext';
import { NotificationItem } from '@/types/rbac';
import { mockNotifications } from '@/mock/superAdminData';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [showCompose, setShowCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<NotificationItem['audience']>('ALL_STUDENTS');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type: 'ANNOUNCEMENT',
      audience,
      sentBy: 'Super Administrator',
      sentAt: new Date().toISOString(),
      status: 'SENT',
    };

    setNotifications([newNotif, ...notifications]);
    setShowCompose(false);
    setTitle('');
    setMessage('');
  };

  const columns: Column<NotificationItem>[] = [
    {
      key: 'title',
      header: 'Announcement & Message',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs">{row.title}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1">{row.message}</p>
        </div>
      ),
    },
    {
      key: 'audience',
      header: 'Target Audience',
      render: (row) => (
        <span className="font-semibold text-xs text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          {row.audience.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'sentBy',
      header: 'Dispatched By',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-700 text-xs">{row.sentBy}</span>,
    },
    {
      key: 'sentAt',
      header: 'Date & Time',
      render: (row) => (
        <span className="text-slate-500 text-[11px]">
          {new Date(row.sentAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Communication' }, { label: 'Notifications' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Campus Broadcasts & Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliver campus-wide announcements, exam schedules, and emergency notices.
          </p>
        </div>

        <Can permission="NOTIFICATION_CREATE">
          <button
            onClick={() => setShowCompose(true)}
            className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Compose Broadcast</span>
          </button>
        </Can>
      </div>

      <DataTable
        data={notifications}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search announcement, audience..."
        searchKey={(row) => `${row.title} ${row.message} ${row.audience}`}
      />

      {/* Compose Notification Modal */}
      {showCompose && (
        <Modal
          isOpen={showCompose}
          onClose={() => setShowCompose(false)}
          title="Compose Campus Broadcast"
          description="Send push alerts and notification feed announcements"
          maxWidth="md"
        >
          <form onSubmit={handleSend} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Target Audience:</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as NotificationItem['audience'])}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                <option value="ALL_STUDENTS">All College Students</option>
                <option value="ALL_FACULTY">All Teaching Faculty</option>
                <option value="ALL_DEPARTMENTS">All College Staff & Students</option>
                <option value="SUPER_ADMINS">Administrative Staff Only</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Announcement Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. End Semester Exam Registration Deadline"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Detailed Message:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write message content..."
                rows={4}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Broadcast</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
