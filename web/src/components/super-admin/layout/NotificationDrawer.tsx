// ============================================================================
// ISML COLLEGE LMS — NOTIFICATION SLIDE-OVER DRAWER
// Responsive Right-Side Slide-Over Drawer for Super Admin Alerts & Broadcasts
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  FileCheck,
  Sparkles,
  ExternalLink,
  Trash2,
  Filter,
} from 'lucide-react';
import { NotificationItem } from '@/types/rbac';
import { mockNotifications } from '@/mock/superAdminData';

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExtendedNotification extends NotificationItem {
  isRead?: boolean;
}

const INITIAL_NOTIFICATIONS: ExtendedNotification[] = [
  ...mockNotifications.map((n, idx) => ({ ...n, isRead: idx > 0 })),
  {
    id: 'notif-03',
    title: 'New Fee Structure Approval Pending',
    message: 'Finance Manager at Loyola College submitted AY 2026-27 Semester 1 schedule for authorization.',
    type: 'SYSTEM',
    audience: 'SUPER_ADMINS',
    sentBy: 'Finance System',
    sentAt: '2026-10-08T09:15:00Z',
    status: 'SENT',
    isRead: false,
  },
  {
    id: 'notif-04',
    title: 'Faculty Session Rescheduled',
    message: 'Prof. Ramesh shifted Data Structures Lab from Offline Lab 3 to Hybrid Online Studio.',
    type: 'ACADEMIC',
    audience: 'ALL_FACULTY',
    sentBy: 'Academic Coordinator',
    sentAt: '2026-10-08T07:45:00Z',
    status: 'SENT',
    isRead: true,
  },
  {
    id: 'notif-05',
    title: 'Zero-Plaintext Secret Rotated',
    message: 'Institutional tenant API tokens were securely rotated with SHA-256 HMAC digest validation.',
    type: 'SYSTEM',
    audience: 'SUPER_ADMINS',
    sentBy: 'Security Bot',
    sentAt: '2026-10-07T18:20:00Z',
    status: 'SENT',
    isRead: true,
  },
];

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [items, setItems] = useState<ExtendedNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'SYSTEM' | 'ACADEMIC'>('ALL');

  // Handle escape key
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

  if (!isOpen) return null;

  const unreadCount = items.filter((i) => !i.isRead).length;

  const markAllAsRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const toggleReadStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: !item.isRead } : item
      )
    );
  };

  const clearNotification = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'UNREAD') return !item.isRead;
    if (filter === 'SYSTEM') return item.type === 'SYSTEM';
    if (filter === 'ACADEMIC') return item.type === 'ACADEMIC';
    return true;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SYSTEM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
            System Alert
          </span>
        );
      case 'ACADEMIC':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-[#0052CC] border border-blue-200 uppercase tracking-wider">
            Academic
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
            Announcement
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Dimmed Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform ease-out duration-300 animate-in slide-in-from-right">
          {/* ─── Drawer Header ─── */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B2447] via-[#0D3166] to-[#0052CC] text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 shrink-0 relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#0B2447] animate-pulse" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Notifications & Alerts
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-blue-200">
                  Real-time updates, approvals & system broadcasts
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ─── Controls & Tabs ─── */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'ALL'
                    ? 'bg-[#0052CC] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                All ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('UNREAD')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'UNREAD'
                    ? 'bg-[#0052CC] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('SYSTEM')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'SYSTEM'
                    ? 'bg-[#0052CC] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                System
              </button>
              <button
                type="button"
                onClick={() => setFilter('ACADEMIC')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'ACADEMIC'
                    ? 'bg-[#0052CC] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Academic
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-bold text-[#0052CC] hover:text-blue-700 hover:underline flex items-center gap-1 shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* ─── Notification List ─── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {filter === 'UNREAD'
                    ? "You are all caught up! No unread notifications at this time."
                    : "No alerts match the selected filter category."}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all relative group ${
                    !item.isRead
                      ? 'bg-blue-50/50 border-blue-200 shadow-2xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {/* Status Indicator Dot */}
                  {!item.isRead && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#0052CC]" />
                  )}

                  <div className="flex items-start justify-between gap-2 mb-1.5 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(item.type)}
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(item.sentAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">
                      By <strong className="text-slate-700">{item.sentBy}</strong>
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleReadStatus(item.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-[#0052CC] transition-colors"
                        title={item.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        {item.isRead ? 'Mark unread' : 'Mark read'}
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => clearNotification(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                        title="Dismiss alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ─── Drawer Bottom Bar ─── */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <Link
              href="/super-admin/notifications"
              onClick={onClose}
              className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1.5"
            >
              <span>View Full Broadcast Center</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
