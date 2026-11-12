// ============================================================================
// ISML ENTERPRISE NOTIFICATIONS HUB VIEW (REUSABLE ACROSS ALL 10 PORTALS)
// Clean, dynamic, responsive notification center tailored per portal
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Filter,
  Trash2,
  ExternalLink,
  Search,
  Check,
  ShieldAlert,
  Sparkles,
  Info,
  Layers,
  GraduationCap,
  School,
  Building2,
  Calendar,
} from 'lucide-react';
import { notificationStore, LiveNotification } from '@/services/notificationStore';
import { soundNotification } from '@/lib/soundNotification';
import { useToast } from '@/context/ToastContext';

export interface NotificationsHubViewProps {
  portalName: string;
  portalRole: string;
  portalKey: string;
  primaryColor?: string;
  accentBg?: string;
}

export default function NotificationsHubView({
  portalName,
  portalRole,
  portalKey,
  primaryColor = '#0052CC',
  accentBg = 'bg-blue-50',
}: NotificationsHubViewProps) {
  const { showSuccess } = useToast();
  const [items, setItems] = useState<LiveNotification[]>(() => notificationStore.getNotificationsForPortal(portalKey));
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'URGENT' | 'SYSTEM'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Subscribe to live notifications from notificationStore
  useEffect(() => {
    const unsub = notificationStore.subscribe(() => {
      setItems(notificationStore.getNotificationsForPortal(portalKey));
    });
    return () => unsub();
  }, [portalKey]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'UNREAD' && item.isRead) return false;
      if (activeTab === 'URGENT' && item.category !== 'URGENT') return false;
      if (activeTab === 'SYSTEM' && item.type !== 'SYSTEM' && item.category !== 'INFO') return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q) ||
          (item.sourcePortal && item.sourcePortal.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, activeTab, searchTerm]);

  const unreadCount = items.filter((i) => !i.isRead).length;

  const markAllRead = () => {
    notificationStore.markAllAsRead(portalKey);
    showSuccess('All notifications marked as read.');
  };

  const clearItem = (id: string) => {
    notificationStore.clearNotification(id);
    showSuccess('Notification removed.');
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0052CC] shrink-0 shadow-2xs">
            <Bell className="w-6 h-6 animate-swing" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {portalName} Notifications & Alerts
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white shadow-2xs animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Role: <strong className="text-slate-800">{portalRole}</strong> • Real-time event notifications, academic alerts & announcements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Filter Tabs & Search Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Alerts ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('UNREAD')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'UNREAD'
                ? 'bg-white text-blue-700 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab('URGENT')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'URGENT'
                ? 'bg-white text-rose-700 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Urgent Action
          </button>
          <button
            onClick={() => setActiveTab('SYSTEM')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'SYSTEM'
                ? 'bg-white text-purple-700 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System & Info
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by title or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* ─── Notification Feed ─── */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6 stroke-1" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No notifications found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are all caught up! When academic events, approvals, or batch updates occur, they will appear here.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isUrgent = item.category === 'URGENT';
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !item.isRead
                    ? 'bg-white border-blue-200 shadow-xs ring-1 ring-blue-500/10'
                    : 'bg-white/70 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isUrgent
                        ? 'bg-rose-50 border border-rose-200 text-rose-600'
                        : 'bg-blue-50 border border-blue-200 text-[#0052CC]'
                    }`}
                  >
                    {isUrgent ? <AlertCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {item.title}
                      </span>
                      {isUrgent && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 uppercase">
                          Action Required
                        </span>
                      )}
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      {item.institutionName && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">🏛️ {item.institutionName}</span>
                        </>
                      )}
                      {item.sourcePortal && (
                        <>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                            {item.sourcePortal}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {item.actionUrl && (
                    <Link
                      href={item.actionUrl}
                      onClick={() => notificationStore.markAsRead(item.id)}
                      className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Open Action</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button
                    onClick={() => clearItem(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

