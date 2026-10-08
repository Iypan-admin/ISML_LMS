// ============================================================================
// ISML COLLEGE LMS — SYSTEM TELEMETRY & MONITORING
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Activity, Server, Database, HardDrive, Video, Sparkles, CheckCircle2 } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import StatusBadge from '@/components/common/StatusBadge';
import StatCard from '@/components/common/StatCard';
import { SystemServiceHealth } from '@/types/rbac';
import { mockSystemHealth } from '@/mock/superAdminData';

export default function SystemMonitoringPage() {
  const [health] = useState<SystemServiceHealth[]>(mockSystemHealth);

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'System' }, { label: 'System Monitoring' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            System Telemetry & Health
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud infrastructure uptime, database latency, and media streaming nodes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Overall Platform Status"
          value="100% OPERATIONAL"
          icon={CheckCircle2}
          subtext="All 5 core clusters active"
          trend={{ value: 'Normal', isPositive: true }}
          iconColor="text-emerald-600"
        />
        <StatCard
          title="API Response Time"
          value="38 ms"
          icon={Activity}
          subtext="Avg edge latency"
          trend={{ value: 'P99: 84ms', isPositive: true }}
          iconColor="text-[#0052CC]"
        />
        <StatCard
          title="Cluster Uptime"
          value="99.98%"
          icon={Server}
          subtext="Last 30 rolling days"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Storage Consumption"
          value="14.2 TB"
          icon={HardDrive}
          subtext="Videos & PDF handouts"
          iconColor="text-cyan-600"
        />
      </div>

      {/* Services Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {health.map((srv, idx) => (
          <div
            key={idx}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {srv.category}
                </span>
                <StatusBadge status={srv.status} />
              </div>

              <h3 className="text-sm font-bold text-[#0B2447]">{srv.serviceName}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{srv.details}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Latency: <strong className="text-slate-800">{srv.latencyMs}ms</strong>
              </span>
              <span className="text-slate-500">
                Uptime: <strong className="text-emerald-600">{srv.uptimePercentage}%</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
