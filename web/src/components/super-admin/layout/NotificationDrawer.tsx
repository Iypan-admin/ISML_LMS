// ============================================================================
// ISML COLLEGE LMS — NOTIFICATION SLIDE-OVER DRAWER
// Responsive Right-Side Slide-Over Drawer for Super Admin Alerts & Broadcasts
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  GraduationCap,
  Building,
  Clock,
  AlertCircle,
  BookOpen,
  Users,
  Video,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { notificationStore, LiveNotification } from '@/services/notificationStore';

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const pathname = usePathname();

  // Detect current portal key from pathname
  const currentPortalKey = React.useMemo(() => {
    if (pathname?.startsWith('/academic-manager')) return 'ACADEMIC';
    if (pathname?.startsWith('/college-admin')) return 'COLLEGE_ADMIN';
    if (pathname?.startsWith('/school-admin')) return 'SCHOOL_ADMIN';
    if (pathname?.startsWith('/tutor')) return 'TUTOR';
    if (pathname?.startsWith('/finance-manager')) return 'FINANCE';
    if (pathname?.startsWith('/sales-manager')) return 'SALES';
    if (pathname?.startsWith('/parent')) return 'PARENT';
    if (pathname?.startsWith('/super-admin')) return 'SUPER_ADMIN';
    return 'STUDENT';
  }, [pathname]);

  const [items, setItems] = useState<LiveNotification[]>(() => notificationStore.getNotificationsForPortal(currentPortalKey));
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'APPROVALS' | 'SYSTEM'>('ALL');

  useEffect(() => {
    setItems(notificationStore.getNotificationsForPortal(currentPortalKey));
    const unsub = notificationStore.subscribe(() => {
      setItems(notificationStore.getNotificationsForPortal(currentPortalKey));
    });
    return () => unsub();
  }, [currentPortalKey]);

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

  // Dynamically resolve target full notifications page based on active portal route
  const fullNotificationsUrl = React.useMemo(() => {
    if (pathname?.startsWith('/academic-manager')) return '/academic-manager/notifications';
    if (pathname?.startsWith('/college-admin')) return '/college-admin/notifications';
    if (pathname?.startsWith('/school-admin')) return '/school-admin/notifications';
    if (pathname?.startsWith('/tutor')) return '/tutor/notifications';
    if (pathname?.startsWith('/finance-manager')) return '/finance-manager/notifications';
    if (pathname?.startsWith('/sales-manager')) return '/sales-manager/notifications';
    if (pathname?.startsWith('/parent')) return '/parent/notifications';
    if (pathname?.startsWith('/super-admin')) return '/super-admin/notifications';
    return '/notifications'; // Student & General
  }, [pathname]);

  if (!isOpen) return null;

  const unreadCount = items.filter((i) => !i.isRead).length;

  const markAllAsRead = () => {
    notificationStore.markAllAsRead(currentPortalKey);
  };

  const toggleReadStatus = (id: string, isRead: boolean) => {
    if (!isRead) {
      notificationStore.markAsRead(id);
    }
  };

  const clearNotification = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'UNREAD') return !item.isRead;
    if (filter === 'APPROVALS') return item.type === 'APPROVAL_REQUEST' || item.type === 'APPROVAL_REVIEWED';
    if (filter === 'SYSTEM') return item.type === 'SYSTEM' || item.type === 'ANNOUNCEMENT';
    return true;
  });

  const getTargetBadge = (targetModule?: string) => {
    switch (targetModule) {
      case 'COURSE':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-200">
            <BookOpen className="w-2.5 h-2.5" />
            <span>Course</span>
          </span>
        );
      case 'BATCH':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200">
            <Users className="w-2.5 h-2.5" />
            <span>Batch / Cohort</span>
          </span>
        );
      case 'LIVE_CLASS':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Video className="w-2.5 h-2.5" />
            <span>Live Class</span>
          </span>
        );
      case 'FEES':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200">
            <CreditCard className="w-2.5 h-2.5" />
            <span>Finance / Fee</span>
          </span>
        );
      case 'ADMISSION':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-50 text-cyan-700 border border-cyan-200">
            <GraduationCap className="w-2.5 h-2.5" />
            <span>Admission</span>
          </span>
        );
      case 'INSTITUTION':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Building className="w-2.5 h-2.5" />
            <span>Institution MoU</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string, targetModule?: string) => {
    switch (type) {
      case 'APPROVAL_REQUEST':
        return (
          <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-2xs" title="Pending Approval">
            <Clock className="w-3.5 h-3.5" />
          </span>
        );
      case 'APPROVAL_REVIEWED':
        return (
          <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 border border-emerald-400/50 flex items-center justify-center shrink-0 shadow-2xs" title="Authorized">
            <CheckCheck className="w-3.5 h-3.5" />
          </span>
        );
      case 'SYSTEM':
        return (
          <span className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-700 border border-rose-400/50 flex items-center justify-center shrink-0 shadow-2xs" title="System Alert">
            <AlertCircle className="w-3.5 h-3.5" />
          </span>
        );
      default:
        return (
          <span className="w-6 h-6 rounded-lg bg-blue-500/15 text-[#0052CC] border border-blue-400/50 flex items-center justify-center shrink-0 shadow-2xs" title="Broadcast">
            <Bell className="w-3.5 h-3.5" />
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
                onClick={() => setFilter('APPROVALS')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'APPROVALS'
                    ? 'bg-[#0052CC] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Approvals & Requests
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
                System Alerts
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
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2">
            {filteredItems.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-2">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">No notifications</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {filter === 'UNREAD' ? "No unread notifications." : "No alerts in this category."}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border transition-all relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group ${
                    !item.isRead
                      ? 'bg-blue-50/40 border-blue-200 shadow-2xs hover:bg-blue-50/70'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {/* Left Section: Icon + Rich Categorized Content */}
                  <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                    {getTypeBadge(item.type, item.targetModule)}

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Top Meta Line: Target Category Tag + Admin Name Tag + Campus */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Target Module Badge (Course / Batch / Live Class / Fees) */}
                        {getTargetBadge(item.targetModule)}

                        {/* Submitter Admin Pill */}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                          <UserCheck className="w-2.5 h-2.5 text-slate-500" />
                          <span className="truncate max-w-[120px]">{item.submittedBy?.name || 'Academic Manager'}</span>
                        </span>

                        {/* Origin Campus / Source Portal */}
                        <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[140px]">
                          {item.institutionName ? item.institutionName : item.sourcePortal}
                        </span>

                        {!item.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] shrink-0" />
                        )}
                      </div>

                      {/* Main Title & Message in Compact Single Line */}
                      <div className="flex items-center gap-2 text-xs truncate">
                        <h4 className="font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <p className="text-[11px] text-slate-600 truncate hidden sm:inline">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Time + Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.actionUrl && (
                        <Link
                          href={item.actionUrl}
                          onClick={() => {
                            toggleReadStatus(item.id, false);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-[10px] font-extrabold transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleReadStatus(item.id, item.isRead)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0052CC] hover:bg-slate-100 transition-colors cursor-pointer"
                        title={item.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        <CheckCheck className={`w-3.5 h-3.5 ${item.isRead ? 'text-slate-300' : 'text-slate-600'}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => clearNotification(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Dismiss"
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
              href={fullNotificationsUrl}
              onClick={onClose}
              className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1.5"
            >
              <span>View Full Notifications Center</span>
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
