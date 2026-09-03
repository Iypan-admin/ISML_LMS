"use client";

import React from 'react';
import Image from 'next/image';
import { Briefcase, Building2, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { mockJobPostings } from '@/mock/career';

export default function CareerPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <Briefcase className="w-4 h-4 text-[#0052CC]" />
          <span>Multinational Corporate Placement Partner Network</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Career & Placement Assistance</h1>
        <p className="text-xs text-slate-600">
          Connect your certified foreign language skills with top corporate hiring partners seeking bilingual professionals.
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#0B2447]">Latest Bilingual Job Openings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockJobPostings.map((job) => (
            <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image src={job.companyLogo} alt={job.companyName} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0B2447] leading-snug">{job.jobTitle}</h3>
                    <p className="text-xs font-semibold text-slate-600">{job.companyName}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#0052CC]" /> {job.location}</p>
                  <p className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {job.salaryRange}</p>
                  <p><span className="font-bold text-slate-800">Required:</span> {job.requiredLanguage} ({job.requiredCefrLevel})</p>
                </div>
              </div>

              <button className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                <span>Apply with ISML Certificate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
