"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2, UserPlus, ChevronDown, ChevronUp, Construction, X, Sparkles } from 'lucide-react';
import { currentStudent } from '@/mock/students';

const platformRoles = [
  { id: 'STUDENT', name: 'Student', desc: 'Bharathi M (Learning Portal)', isAvailable: true, credentials: { id: currentStudent.rollNo, pwd: 'student2026pass' } },
  { id: 'SUPER_ADMIN', name: 'Super Admin', desc: 'Full System & Delete Access', isAvailable: false },
  { id: 'MANAGER', name: 'Manager', desc: 'Internal Team & User Mgmt', isAvailable: false },
  { id: 'FINANCE_MANAGER', name: 'Finance Manager', desc: 'College Fees & Accounts', isAvailable: false },
  { id: 'ACADEMIC_COORD', name: 'Academic Coord', desc: 'Course & Resource Monitoring', isAvailable: false },
  { id: 'TEACHER', name: 'Main Teacher', desc: 'Classes, Exams & Marks', isAvailable: false },
  { id: 'SUB_TEACHER', name: 'Substitute Teacher', desc: 'Backup Class Mgmt', isAvailable: false },
  { id: 'DOUBT_TEACHER', name: 'Doubt Teacher', desc: 'Student Doubt Resolution', isAvailable: false },
  { id: 'ASST_DOUBT', name: 'Asst Doubt Teacher', desc: 'Doubt Support Staff', isAvailable: false },
  { id: 'COLLEGE_ADMIN', name: 'College Admin', desc: 'College Student Reg', isAvailable: false },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState<string | null>(null);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleRoleSelect = (role: typeof platformRoles[0]) => {
    if (role.isAvailable && role.credentials) {
      setSelectedRole(role.id);
      setStudentId(role.credentials.id);
      setPassword(role.credentials.pwd);
      setActiveNotice(null);
    } else {
      setActiveNotice(`${role.name} portal is currently under active development. Current access is enabled for Student role.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push('/dashboard'), 750);
  };

  return (
    <div 
      className="h-screen max-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40 text-slate-900 flex flex-col justify-start sm:justify-between items-center px-0 sm:px-4 py-0 sm:py-3 relative overflow-hidden select-none"
      style={{ fontFamily: "'Inter', 'Outfit', system-ui, -apple-system, sans-serif" }}
    >
      
      {/* ─── Soft Ambient Light Blur Orbs (Full Screen Coverage) ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-blue-200/40 blur-3xl opacity-70" />
        <div className="absolute -top-20 right-10 w-[500px] h-[500px] rounded-full bg-indigo-200/35 blur-3xl opacity-60" />
        <div className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full bg-indigo-200/30 blur-3xl opacity-60" />
      </div>

      {/* ⚡ 1. Top Minimal SaaS Glass Badge (Desktop Only) */}
      <header className="hidden sm:flex relative z-10 pt-3 pb-1 justify-center shrink-0">
        <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-xl border border-blue-200/90 text-[11px] font-bold text-[#0052CC] shadow-2xs hover:border-[#0052CC] transition-all">
          <span>Enterprise Foreign Language SaaS System</span>
        </div>
      </header>

      {/* 💳 2. Center Glassmorphic Premium Login Card */}
      <main className="relative z-10 w-full sm:max-w-[440px] my-0 sm:my-auto py-0 sm:py-1 shrink-0 px-0">
        <div className="bg-white/95 backdrop-blur-xl border-b sm:border border-slate-200/90 rounded-none sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-none sm:shadow-2xl space-y-4 sm:space-y-4 lg:space-y-5 w-full">
          
          {/* Card Title & Greeting */}
          <div className="text-center space-y-1">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto drop-shadow-xs mb-1">
              <Image src="/logo.png" alt="ISML LMS Logo" fill className="object-contain" priority />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B2447] tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-normal">
              Sign in to access your live webinar classes & learning modules.
            </p>
          </div>

          {/* 🚧 Inline Work Undergoing Notification Banner */}
          {activeNotice && (
            <div className="p-2.5 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 shadow-2xs">
              <Construction className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-amber-900 text-xs leading-none">Work Undergoing</p>
                <p className="text-[11px] text-amber-800 font-medium leading-tight mt-1">{activeNotice}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveNotice(null)}
                className="text-amber-500 hover:text-amber-800 text-xs font-bold shrink-0 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 🔽 Ultra-Sleek Role Dropdown Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-2.5 sm:p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-[#0052CC] transition-all cursor-pointer text-left"
            >
              {selectedRole === 'STUDENT' ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    {currentStudent.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-[#0B2447] truncate">{currentStudent.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{currentStudent.rollNo} • {currentStudent.collegeName}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100/80 text-[#0052CC] border border-blue-200 flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                    <User className="w-4.5 h-4.5 text-[#0052CC]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-[#0B2447] truncate">Choose Demo Credentials</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Select role to auto-fill login details</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 shrink-0">
                {selectedRole === 'STUDENT' && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-blue-100 shadow-2xs">
                    Student
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Floating Popdown Menu Grid */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2.5 bg-white/98 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-2xl z-50 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-1 flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Choose Demo Role & Credentials</span>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-0.5">
                  {platformRoles.map((role) => {
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          handleRoleSelect(role);
                          if (role.isAvailable) setIsDropdownOpen(false);
                        }}
                        className={`p-2 rounded-xl text-left text-xs transition-all flex flex-col justify-between border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 text-[#0052CC] border-blue-300 font-bold ring-1 ring-blue-200'
                            : role.isAvailable
                            ? 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            : 'bg-slate-50/60 text-slate-600 border-slate-100 hover:bg-amber-50/40 hover:border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <p className={`truncate text-[11px] font-bold leading-tight ${isSelected ? 'text-[#0052CC]' : 'text-slate-800'}`}>
                            {role.name}
                          </p>
                          {isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                          ) : role.isAvailable ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200/80 px-1 rounded shrink-0">
                              Ongoing
                            </span>
                          )}
                        </div>
                        <p className={`text-[9px] truncate mt-0.5 ${isSelected ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}>
                          {role.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            
            {/* Login ID Input */}
            <div className="space-y-1">
              <label htmlFor="student-id-input" className="block text-xs font-semibold text-slate-700">
                Login ID / User Code
              </label>
              <div 
                className={`relative flex items-center rounded-xl border transition-all ${
                  focused === 'id' 
                    ? 'bg-white border-[#0052CC] ring-2 ring-blue-100 shadow-xs' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-50/80'
                }`}
              >
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="student-id-input"
                  name="studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onFocus={() => setFocused('id')}
                  onBlur={() => setFocused(null)}
                  required
                  placeholder="e.g. 2026-FR-8942"
                  className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium placeholder-slate-400 outline-none"
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label htmlFor="password-input" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div 
                className={`relative flex items-center rounded-xl border transition-all ${
                  focused === 'pwd' 
                    ? 'bg-white border-[#0052CC] ring-2 ring-blue-100 shadow-xs' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-50/80'
                }`}
              >
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="password-input"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('pwd')}
                  onBlur={() => setFocused(null)}
                  required
                  placeholder="Enter password"
                  className="w-full bg-transparent pl-10 pr-10 py-2.5 text-sm text-slate-900 font-medium outline-none"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 text-slate-400 hover:text-[#0052CC] transition-colors cursor-pointer p-0.5"
                  title={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0052CC] focus:ring-blue-200 cursor-pointer accent-[#0052CC]"
                />
                <span>Remember me</span>
              </label>

              <a href="#" className="text-xs text-[#0052CC] font-semibold hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* CTA Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 px-6 bg-[#0052CC] hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-70 mt-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Authenticating Session...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Don't have an account? Register link */}
          <div className="pt-2 sm:pt-2.5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600 font-medium">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-[#0052CC] font-bold hover:underline inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Register / Enroll Now</span>
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* 🔻 3. Footer Bar */}
      <footer className="relative z-10 py-1 text-center text-[10px] text-slate-400 font-medium">
        © 2026 ISML LMS (IYPAN Educational Centre Pvt. Ltd.) • Standardized Foreign Language Instruction Platform
      </footer>
    </div>
  );
}
