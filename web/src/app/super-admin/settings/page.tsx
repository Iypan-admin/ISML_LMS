// ============================================================================
// ISML COLLEGE LMS — SYSTEM SETTINGS
// Modular Settings with Permission-Controlled Updates
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Building2, Bell, Lock } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Can } from '@/context/AuthRbacContext';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'ACADEMIC' | 'SECURITY' | 'NOTIFICATIONS'>('GENERAL');
  const [collegeName, setCollegeName] = useState('Loyola College of Arts & Science (Autonomous)');
  const [contactEmail, setContactEmail] = useState('admin@loyolacollege.edu');
  const [academicYear, setAcademicYear] = useState('2026–2027');
  const [passThreshold, setPassThreshold] = useState('40');
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState('60');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess('Settings configuration saved successfully.');
  };

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'System' }, { label: 'Settings' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Institutional System Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure campus branding, default grading parameters, and security policies.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            activeTab === 'GENERAL'
              ? 'bg-[#0052CC] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          General Branding
        </button>
        <button
          onClick={() => setActiveTab('ACADEMIC')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            activeTab === 'ACADEMIC'
              ? 'bg-[#0052CC] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Academic Rules
        </button>
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            activeTab === 'SECURITY'
              ? 'bg-[#0052CC] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Session & Security
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-6 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          {activeTab === 'GENERAL' && (
            <>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Institution Display Name:</label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Super Admin Official Email:</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
            </>
          )}

          {activeTab === 'ACADEMIC' && (
            <>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Active Academic Term:</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Minimum Pass Mark Threshold (%):</label>
                <input
                  type="number"
                  value={passThreshold}
                  onChange={(e) => setPassThreshold(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
            </>
          )}

          {activeTab === 'SECURITY' && (
            <>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Idle Session Auto-Logout (Minutes):</label>
                <input
                  type="number"
                  value={sessionTimeoutMins}
                  onChange={(e) => setSessionTimeoutMins(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Can
              permission="SYSTEM_SETTINGS_UPDATE"
              fallback={
                <span className="text-slate-400 italic text-[11px]">
                  Setting modifications require SYSTEM_SETTINGS_UPDATE authorization.
                </span>
              }
            >
              <button
                type="submit"
                className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </Can>
          </div>
        </form>
      </div>
    </div>
  );
}
