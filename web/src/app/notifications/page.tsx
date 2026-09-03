"use client";

import React from 'react';
import Link from 'next/link';
import { Bell, Video, Film, FileCheck2, MessageSquare, Award, ArrowRight } from 'lucide-react';
import { mockNotifications } from '@/mock/notifications';

export default function NotificationsPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <Bell className="w-4 h-4 text-[#0052CC]" />
          <span>Multi-Channel Platform Alerts</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Notifications Center</h1>
        <p className="text-xs text-slate-600">
          Real-time alerts for live webinar classes, new recordings, homework deadlines, and doubt responses.
        </p>
      </div>

      {/* Feed */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {mockNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
              notif.isRead ? 'bg-slate-50/60 border-slate-200' : 'bg-blue-50/70 border-blue-200'
            }`}
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[#0052CC]" />}
                <h3 className="text-sm font-bold text-[#0B2447]">{notif.title}</h3>
                <span className="text-[10px] font-mono text-slate-400">{notif.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
            </div>

            {notif.actionUrl && (
              <Link
                href={notif.actionUrl}
                className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg self-start sm:self-auto flex items-center gap-1 shrink-0"
              >
                <span>View Alert</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
