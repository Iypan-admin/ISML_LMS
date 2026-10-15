// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: DIGITAL CERTIFICATES MASTER
// (/academic-manager/certificates)
// Batch-wise & Student-wise CEFR Language Certificates, Issuance & Verification
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Award,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Users,
  QrCode,
  FileCheck2,
  Printer,
  Sparkles,
  RefreshCw,
  Building2,
  X,
  FileSpreadsheet
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';
import { mockCertificates, DigitalCertificate } from '@/mock/certificates';

export default function AcademicManagerCertificatesPage() {
  const { showSuccess } = useToast();
  const [certificates, setCertificates] = useState<DigitalCertificate[]>(mockCertificates);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('ALL');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewCert, setPreviewCert] = useState<DigitalCertificate | null>(null);

  // Extract distinct batches
  const batchOptions = useMemo(() => {
    const map = new Map<string, string>();
    certificates.forEach((c) => {
      map.set(c.batchId, c.batchName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [certificates]);

  // Filtered certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter((c) => {
      if (selectedBatchFilter !== 'ALL' && c.batchId !== selectedBatchFilter) {
        return false;
      }
      if (selectedLanguageFilter !== 'ALL' && c.languageFamily !== selectedLanguageFilter) {
        return false;
      }
      if (selectedStatusFilter !== 'ALL' && c.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          c.studentName.toLowerCase().includes(q) ||
          c.studentId.toLowerCase().includes(q) ||
          c.certificateNumber.toLowerCase().includes(q) ||
          c.courseName.toLowerCase().includes(q) ||
          c.batchName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [certificates, selectedBatchFilter, selectedLanguageFilter, selectedStatusFilter, searchQuery]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const total = certificates.length;
    const issued = certificates.filter((c) => c.status === 'ISSUED').length;
    const pending = certificates.filter((c) => c.status === 'PENDING').length;
    const avgScore = Math.round(
      certificates.reduce((acc, curr) => acc + curr.scorePercentage, 0) / total
    );
    return { total, issued, pending, avgScore };
  }, [certificates]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Digital Certificates Registry' }]} />

      <CollegeFilterBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>Digital Certificates & CEFR Credentials</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit, verify, and issue verifiable QR-coded language diplomas across all batches and students.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => showSuccess('Certificate list CSV/Excel downloaded successfully!')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Registry (Excel)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Certificates Issued</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{stats.issued}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Cryptographically signed</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Average CEFR Mastery</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{stats.avgScore}%</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Across all 5 languages</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Enrolled Batches</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{batchOptions.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Active certificate tracks</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Pending Validation</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{stats.pending}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Awaiting exam sign-off</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll ID, certificate serial number, or batch..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          {/* Batch Filter Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 shrink-0">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Batch:</span>
            <select
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-indigo-950 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Batches ({certificates.length})</option>
              {batchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shrink-0">
            <span>Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ISSUED">Issued & Certified</option>
              <option value="PENDING">Pending Review</option>
            </select>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 mr-1 shrink-0">Language:</span>
          {['ALL', 'FRENCH', 'JAPANESE', 'KOREAN', 'SPANISH', 'GERMAN'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguageFilter(lang)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedLanguageFilter === lang
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang === 'ALL' ? 'All Languages' : lang}
            </button>
          ))}

          <span className="ml-auto text-xs font-bold text-slate-500 shrink-0">
            Showing <strong className="text-slate-800">{filteredCertificates.length}</strong> certificates
          </span>
        </div>
      </div>

      {/* Certificates Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Student & Certificate Serial</th>
                <th className="py-3 px-4">Student Batch</th>
                <th className="py-3 px-4">Foreign Language Track</th>
                <th className="py-3 px-4">CEFR Level</th>
                <th className="py-3 px-4 text-center">Final Score</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Verification & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCertificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-blue-50/40 transition-colors">
                  {/* Student & Serial */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {cert.studentName.slice(0, 1)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{cert.studentName}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-normal">
                            ({cert.studentId})
                          </span>
                        </p>
                        <p className="text-[10px] font-mono text-blue-700 font-bold mt-0.5">
                          {cert.certificateNumber}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Batch */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {cert.batchName}
                    </span>
                  </td>

                  {/* Course & Language */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-bold text-slate-900 leading-snug">{cert.courseName}</p>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                      {cert.languageFamily}
                    </span>
                  </td>

                  {/* CEFR Level */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-800">{cert.cefrLevel}</span>
                  </td>

                  {/* Score */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300">
                      {cert.scorePercentage}%
                    </span>
                  </td>

                  {/* Issue Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                    {cert.issueDate}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{cert.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Preview Diploma</span>
                      </button>

                      <Link
                        href={`/academic-manager/results/${cert.studentId}`}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="View Full Academic Transcript"
                      >
                        <span>Transcript</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIPLOMA PREVIEW MODAL */}
      {previewCert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border-4 border-amber-600/30 flex flex-col font-serif">
            {/* Modal Top Bar */}
            <div className="p-4 bg-slate-900 text-white font-sans flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold font-mono">
                  VERIFIED CREDENTIAL: {previewCert.certificateNumber}
                </span>
              </div>
              <button
                onClick={() => setPreviewCert(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diploma Body */}
            <div className="p-8 sm:p-12 text-center space-y-6 relative">
              <div className="space-y-1">
                <p className="text-xs font-sans tracking-widest text-amber-800 uppercase font-bold">
                  INDIAN SCHOOL FOR MODERN LANGUAGES (ISML)
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447] tracking-tight">
                  Certificate of Language Competence
                </h2>
                <p className="text-xs text-slate-500 font-sans italic">
                  Accredited in alignment with the Common European Framework of Reference for Languages (CEFR)
                </p>
              </div>

              <div className="py-2">
                <p className="text-xs text-slate-600 font-sans">This is officially certified and awarded to</p>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0B2447] my-2 text-indigo-950 underline decoration-amber-400 decoration-2 underline-offset-8">
                  {previewCert.studentName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-2">
                  Student ID: {previewCert.studentId} • Batch: {previewCert.batchName}
                </p>
              </div>

              <div className="max-w-xl mx-auto space-y-2 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <p>
                  Having successfully satisfied all curriculum modular examinations, continuous oral & written assessments with an overall distinction score of <strong>{previewCert.scorePercentage}%</strong>, is conferred the qualification:
                </p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 inline-block font-sans font-bold text-[#0B2447]">
                  {previewCert.courseName} — {previewCert.cefrLevel}
                </div>
              </div>

              {/* Signatures & QR Code */}
              <div className="pt-6 border-t border-amber-200/60 flex items-center justify-between font-sans text-left text-xs">
                <div>
                  <p className="font-bold text-slate-800">Academic Directorate</p>
                  <p className="text-[10px] text-slate-500">{previewCert.issuedBy}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">Date: {previewCert.issueDate}</p>
                </div>

                <div className="text-center p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <QrCode className="w-12 h-12 text-slate-900 mx-auto" />
                  <span className="text-[9px] font-mono text-slate-400 block mt-0.5">SCAN TO VERIFY</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-100 font-sans border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">
                Blockchain-backed hash verification ID: {previewCert.qrVerificationCode}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => {
                    showSuccess('Certificate downloaded as High-Res PDF.');
                    setPreviewCert(null);
                  }}
                  className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
