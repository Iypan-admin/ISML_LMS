'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  ShieldCheck,
  GraduationCap,
  RefreshCw,
  Sparkles,
  Layers
} from 'lucide-react';
import { fastFetch } from '@/lib/fastCache';

interface ParentLinkage {
  id: string;
  relationship: string;
  isPrimaryContact: boolean;
  emergencyContactNum: string;
  parent: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    userType: string;
  };
  student: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    rollNo: string;
  };
  linkedAt: string;
}

interface GroupedParent {
  parentId: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  relationship: string;
  isPrimaryContact: boolean;
  emergencyContactNum: string;
  children: {
    linkId: string;
    studentId: string;
    fullName: string;
    email: string;
    phone: string;
    rollNo: string;
    relationship: string;
  }[];
}

export default function CollegeAdminParentsPage() {
  const [links, setLinks] = useState<ParentLinkage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRel, setSelectedRel] = useState('ALL');
  const [collegeId, setCollegeId] = useState<string>('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('isml_admin_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.tenantId || u.institutionCode) {
          setCollegeId(u.tenantId || u.institutionCode);
        }
      }
    } catch { }
  }, []);

  const fetchParents = async () => {
    setLoading(true);
    try {
      const queryParam = collegeId ? `?collegeId=${encodeURIComponent(collegeId)}` : '';
      const res = await fetch(`/api/portals/parents${queryParam}`);
      if (res.ok) {
        const json = await res.json();
        setLinks(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching parent linkages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, [collegeId]);

  // Group by Parent so 8 parents appear cleanly with multi-children badges
  const groupedParents = useMemo(() => {
    const map = new Map<string, GroupedParent>();
    links.forEach((l) => {
      const pId = l.parent.id;
      if (!map.has(pId)) {
        map.set(pId, {
          parentId: pId,
          fullName: l.parent.fullName,
          email: l.parent.email,
          phone: l.parent.phone,
          status: l.parent.status,
          relationship: l.relationship,
          isPrimaryContact: l.isPrimaryContact,
          emergencyContactNum: l.emergencyContactNum || l.parent.phone,
          children: [],
        });
      }
      map.get(pId)!.children.push({
        linkId: l.id,
        studentId: l.student.id,
        fullName: l.student.fullName,
        email: l.student.email,
        phone: l.student.phone,
        rollNo: l.student.rollNo,
        relationship: l.relationship,
      });
    });
    return Array.from(map.values());
  }, [links]);

  const filteredParents = useMemo(() => {
    return groupedParents.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.children.some(
          (c) =>
            c.fullName.toLowerCase().includes(q) ||
            c.rollNo.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)
        );

      const matchRel = selectedRel === 'ALL' || item.relationship === selectedRel;
      return matchSearch && matchRel;
    });
  }, [groupedParents, searchQuery, selectedRel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <Users className="w-4 h-4" />
            <span>Campus Community & Family Linkage</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Parent & Guardian Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verified parents and legal guardians linked directly to registered students (supporting single and multiple child enrollments).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchParents}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Parents</p>
            <p className="text-2xl font-bold text-slate-900">{groupedParents.length}</p>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">8 Registered Parents</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Multi-Child Parents</p>
            <p className="text-2xl font-bold text-purple-700">
              {groupedParents.filter((p) => p.children.length > 1).length}
            </p>
            <p className="text-xs text-purple-600 font-medium mt-0.5">Linked to 2 Students</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Primary Contacts</p>
            <p className="text-2xl font-bold text-slate-900">
              {groupedParents.filter((l) => l.isPrimaryContact).length}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">Emergency SMS Enabled</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Students Linked</p>
            <p className="text-2xl font-bold text-slate-900">
              {groupedParents.reduce((acc, p) => acc + p.children.length, 0)}
            </p>
            <p className="text-xs text-blue-600 font-medium mt-0.5">Active Learners</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parent, student, email or roll no..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedRel}
            onChange={(e) => setSelectedRel(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="ALL">All Relationships</option>
            <option value="FATHER">Father</option>
            <option value="MOTHER">Mother</option>
            <option value="LEGAL_GUARDIAN">Legal Guardian</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Parent / Guardian</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Relationship</th>
                <th className="py-3 px-4">Linked Student(s)</th>
                <th className="py-3 px-4">Student ID / Roll</th>
                <th className="py-3 px-4 text-right">Portal Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading parent linkages...
                  </td>
                </tr>
              ) : filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No parent linkages found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredParents.map((item) => (
                  <tr key={item.parentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${item.children.length > 1
                            ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-400/30'
                            : 'bg-indigo-100 text-indigo-700'
                          }`}>
                          {item.fullName.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-slate-900">{item.fullName}</p>
                            {item.children.length > 1 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                <Sparkles className="w-2.5 h-2.5" /> 2 Children
                              </span>
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                            Parent ID: {item.parentId.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-[11px]">{item.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.emergencyContactNum || item.phone || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.relationship.replace('_', ' ')}
                      </span>
                      {item.isPrimaryContact && (
                        <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Primary Contact</span>
                        </div>
                      )}
                    </td>

                    {/* Linked Student(s) */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-2">
                        {item.children.map((child, idx) => (
                          <div key={child.linkId} className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div>
                              <div className="flex items-center gap-1">
                                <p className="font-medium text-slate-900">{child.fullName}</p>
                                {item.children.length > 1 && (
                                  <span className="text-[9px] text-purple-600 font-bold bg-purple-50 px-1 rounded">
                                    Child #{idx + 1}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono">{child.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Student ID / Roll */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-2">
                        {item.children.map((child) => (
                          <div key={child.linkId}>
                            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200 font-medium">
                              {child.rollNo}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${item.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
