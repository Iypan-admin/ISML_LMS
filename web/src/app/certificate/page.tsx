"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Award, Download, QrCode, ShieldCheck, CheckCircle2, X, Star, Check } from 'lucide-react';
import { mockCertificates } from '@/mock/certificates';
import { currentStudent } from '@/mock/students';

export default function CertificatePage() {
  const [showQrModal, setShowQrModal] = useState(false);
  const cert = mockCertificates[0];

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <Award className="w-4 h-4 text-[#0052CC]" />
          <span>Official Language Certificate</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B2447]">Digital Certificate & Verification</h1>
        <p className="text-xs text-slate-600">
          Official French A1 Language Certificate issued under joint authority of ISML & Anna University.
        </p>
      </div>

      {/* 🖼 LIGHT-COLORED WARM IVORY DIPLOMA CERTIFICATE TEMPLATE */}
      <div className="w-full bg-gradient-to-b from-[#FFFDF9] via-white to-[#FFFDF9] rounded-2xl border-4 sm:border-8 border-[#0B2447] p-4 sm:p-8 md:p-10 relative shadow-xl space-y-6 select-none overflow-hidden border-[#0B2447]">
        {/* Inner Gold Foil Corner Accents */}
        <div className="absolute inset-2 sm:inset-3 border-2 border-amber-400/70 rounded-xl pointer-events-none" />

        {/* 🏛️ Faded Background Watermark Layer (Logo + Clear "INDIAN SCHOOL FOR MODERN LANGUAGES" Text) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden z-0">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 opacity-[0.07] shrink-0">
            <Image src="/logo.png" alt="ISML Crest Watermark" fill className="object-contain" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl sm:text-4xl md:text-5xl font-serif font-black tracking-[0.25em] text-[#0B2447]/[0.06] uppercase text-center rotate-[-15deg] leading-relaxed whitespace-nowrap">
              INDIAN SCHOOL FOR MODERN LANGUAGES
            </span>
          </div>
        </div>

        {/* 1. Header: Crest & University Title */}
        <div className="relative z-10 text-center space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <Image src="/logo.png" alt="ISML Crest" fill className="object-contain" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-base sm:text-xl font-serif font-extrabold text-[#0B2447] tracking-tight">
                INDIAN SCHOOL FOR MODERN LANGUAGES
              </h2>
              <p className="text-[10px] sm:text-xs text-[#0052CC] font-mono font-bold uppercase tracking-wider">
                Office of Academic Affairs & CEFR Language Certification Board
              </p>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent h-0.5 my-2" />

          {/* Distinction Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full font-bold text-xs shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Passed with Distinction (Mention Très Bien - 86.4%)</span>
          </div>
        </div>

        {/* 2. Certificate Body Content */}
        <div className="relative z-10 text-center space-y-3 py-2 max-w-2xl mx-auto">
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            This Official Certificate is Awarded to
          </p>

          <h3 className="text-2xl sm:text-4xl font-serif font-extrabold text-[#0B2447] tracking-wide underline decoration-amber-500 decoration-2">
            {currentStudent.name}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            for successfully completing all coursework, 87.5% attendance requirements, and passing examinations for
          </p>

          <div className="inline-block px-4 py-2 bg-blue-50/80 border-2 border-[#0052CC] rounded-2xl shadow-2xs">
            <p className="text-sm sm:text-lg font-extrabold text-[#0052CC]">
              {cert.courseName} — CEFR {cert.cefrLevel}
            </p>
          </div>

          <p className="text-xs text-slate-500 font-mono pt-1">
            Roll No: <span className="font-bold text-slate-800">{currentStudent.rollNo}</span> • Partner Campus: <span className="font-bold text-[#0B2447]">{cert.institutionName}</span>
          </p>
        </div>

        {/* 3. Signatures & QR Code Audit Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 items-end gap-4 text-center">
          {/* Left Signature: Pradeep Kumar M for ISML */}
          <div className="space-y-1">
            <p className="font-serif italic text-lg font-bold text-[#0B2447] tracking-wide">Pradeep Kumar M</p>
            <div className="w-36 h-0.5 bg-slate-400 mx-auto my-1" />
            <p className="text-xs font-extrabold text-slate-900">Pradeep Kumar M</p>
            <p className="text-[10px] font-semibold text-slate-600">Academic Director & Founder, ISML</p>
          </div>

          {/* Center QR Verification Code */}
          <div className="space-y-1 my-2 sm:my-0">
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl inline-block cursor-pointer shadow-2xs transition-transform active:scale-95"
              title="Click to Verify QR Code"
            >
              <QrCode className="w-8 h-8 text-[#0B2447]" />
            </button>
            <p className="text-[10px] font-mono text-[#0052CC] font-bold">
              Code: {cert.qrVerificationCode}
            </p>
          </div>

          {/* Right Signature */}
          <div className="space-y-1">
            <p className="font-serif italic text-base text-[#0B2447]">Dr. K. Ramanathan</p>
            <div className="w-36 h-0.5 bg-slate-400 mx-auto my-1" />
            <p className="text-xs font-bold text-slate-800">Dr. K. Ramanathan</p>
            <p className="text-[10px] text-slate-500">Controller of Exams, Anna Univ</p>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => setShowQrModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-[#0B2447] hover:bg-[#071730] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <QrCode className="w-4 h-4 text-cyan-400" />
          <span>Verify Certificate QR Code</span>
        </button>

        <button className="w-full sm:w-auto px-6 py-3 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95">
          <Download className="w-4 h-4" />
          <span>Download High-Res PDF Certificate</span>
        </button>
      </div>

      {/* QR Code Verification Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center space-y-4 shadow-2xl border border-slate-200 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-[#0B2447] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official Academic QR Verification
              </span>
              <button onClick={() => setShowQrModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-100 rounded-xl inline-block border border-slate-200">
              <div className="w-40 h-40 bg-slate-900 text-white flex flex-col items-center justify-center rounded-lg font-mono text-xs font-bold border-2 border-[#0052CC] p-2 space-y-1">
                <QrCode className="w-16 h-16 text-cyan-400" />
                <span className="text-[10px] text-cyan-300">ISML VERIFIED SEAL</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1 text-left">
              <p className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Valid Academic Certificate Issued
              </p>
              <p className="font-mono text-[11px]">Issued To: <span className="font-bold">Bharathi M</span> ({currentStudent.rollNo})</p>
              <p className="font-mono text-[11px]">Verification Code: {cert.qrVerificationCode}</p>
              <p className="text-[11px] text-slate-600 truncate font-mono">Verify Link: {cert.verificationUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
