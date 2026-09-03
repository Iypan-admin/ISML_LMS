"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, User, Mail, Phone, GraduationCap, BookOpen, Lock, 
  CheckCircle2, ArrowRight, ArrowLeft, Upload, Edit2, AlertCircle, 
  Sparkles, Check, Clock, Eye, EyeOff, Copy, Printer, Globe, FileText 
} from 'lucide-react';

// ─── Cascading Dropdown Master Data ───
const collegeOptions = [
  "Anna University Partner College — Chennai Main Campus",
  "ISML Partner Institution — Coimbatore Campus",
  "PSG College of Technology",
  "Loyola College — Chennai",
  "St. Xavier's College — Palayamkottai",
  "Madras Christian College",
  "Government College of Technology — Coimbatore"
];

const academicData: Record<string, string[]> = {
  "Computer Science & Engineering": [
    "B.E Computer Science & Engineering",
    "B.Tech Information Technology",
    "B.Sc Computer Science",
    "M.Sc Computer Science",
    "BCA — Bachelor of Computer Applications"
  ],
  "Commerce & Management": [
    "B.Com General",
    "B.Com Corporate Secretaryship",
    "B.Com Accounting & Finance",
    "BBA — Bachelor of Business Administration",
    "MBA — Master of Business Administration"
  ],
  "English & Foreign Languages": [
    "B.A English Literature",
    "M.A English Literature",
    "M.A Linguistics & Translation"
  ],
  "Mathematics & Science": [
    "B.Sc Mathematics",
    "B.Sc Physics",
    "B.Sc Chemistry",
    "M.Sc Data Analytics"
  ]
};

const courseData: Record<string, Record<string, Record<string, string[]>>> = {
  "French": {
    "French Language Program": {
      "A1 (Beginner)": ["Batch F01 — Mon/Wed/Fri — 6:00 PM IST", "Batch F02 — Tue/Thu/Sat — 10:00 AM IST"],
      "A2 (Elementary)": ["Batch F03 — Sat/Sun Weekend — 2:00 PM IST"]
    },
    "French Foundation & DELF Prep": {
      "A1.1 (Foundation)": ["Batch F04 — Mon/Wed — 7:30 PM IST"],
      "A1.2 (Intensive)": ["Batch F05 — Tue/Thu — 6:00 PM IST"]
    }
  },
  "German": {
    "German Language Program": {
      "A1 (Beginner)": ["Batch G01 — Mon/Wed/Fri — 7:00 PM IST"],
      "B1 (Intermediate)": ["Batch G02 — Tue/Thu/Sat — 9:00 AM IST"]
    },
    "German Goethe-Zertifikat Prep": {
      "B2 (Vantage)": ["Batch G03 — Sat/Sun — 4:00 PM IST"]
    }
  },
  "Japanese": {
    "Japanese JLPT Course": {
      "N5 (Beginner)": ["Batch J01 — Sat/Sun — 10:00 AM IST", "Batch J02 — Mon/Wed — 6:30 PM IST"],
      "N4 (Elementary)": ["Batch J03 — Tue/Thu — 7:00 PM IST"]
    }
  },
  "Spanish": {
    "Spanish DELE Diploma Program": {
      "A1 (Beginner)": ["Batch S01 — Mon/Wed/Fri — 5:00 PM IST"],
      "A2 (Elementary)": ["Batch S02 — Sat/Sun — 11:00 AM IST"]
    }
  }
};

const countryCodes = [
  { code: '+91', flag: '🇮🇳', label: 'India (+91)' },
  { code: '+1', flag: '🇺🇸', label: 'USA (+1)' },
  { code: '+44', flag: '🇬🇧', label: 'UK (+44)' },
  { code: '+971', flag: '🇦🇪', label: 'UAE (+971)' },
  { code: '+65', flag: '🇸🇬', label: 'Singapore (+65)' },
];

export default function StudentRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [refId, setRefId] = useState('');
  const [copied, setCopied] = useState(false);

  // ─── Step 1: Personal Details ───
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // ─── Step 2: Contact Details ───
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobile, setMobile] = useState('');

  // ─── Step 3: Academic Details ───
  const [college, setCollege] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [programme, setProgramme] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('1st Year');
  const [academicYear, setAcademicYear] = useState('2026–2027');
  const [rollNo, setRollNo] = useState('');

  // ─── Step 4: Enrollment ───
  const [language, setLanguage] = useState('');
  const [course, setCourse] = useState('');
  const [level, setLevel] = useState('');
  const [batch, setBatch] = useState('');

  // ─── Step 5: Account Setup ───
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // ─── Validation Errors ───
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: 'File size must be under 2MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setErrors((prev) => ({ ...prev, photo: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Password Strength Meter ───
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const pwdStrength = getPasswordStrength(password);

  // ─── Step Validation ───
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!firstName.trim() || !/^[A-Za-z\s]{2,50}$/.test(firstName)) {
        newErrors.firstName = 'Please enter a valid first name (2-50 letters only)';
      }
      if (!lastName.trim() || !/^[A-Za-z\s]{1,50}$/.test(lastName)) {
        newErrors.lastName = 'Please enter a valid last name';
      }
      if (!dob) {
        newErrors.dob = 'Date of Birth is required';
      }
      if (!gender) {
        newErrors.gender = 'Please select your gender';
      }
    }

    if (currentStep === 2) {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      } else if (email.toLowerCase() === 'student@gmail.com') {
        newErrors.email = 'An account with this email address already exists';
      }
      if (!mobile.trim() || !/^[0-9]{10}$/.test(mobile)) {
        newErrors.mobile = 'Please enter a valid 10-digit mobile number';
      }
    }

    if (currentStep === 3) {
      if (!college) {
        newErrors.college = 'Please select your college/institution';
      }
      if (!department) {
        newErrors.department = 'Please select your department';
      }
      if (!programme) {
        newErrors.programme = 'Please select your programme/degree';
      }
      if (!rollNo.trim()) {
        newErrors.rollNo = 'Please enter your student roll number';
      }
    }

    if (currentStep === 4) {
      if (!language) newErrors.language = 'Please select a language';
      if (!course) newErrors.course = 'Please select a course';
      if (!level) newErrors.level = 'Please select a course level';
      if (!batch) newErrors.batch = 'Please select an available batch';
    }

    if (currentStep === 5) {
      if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  // ─── Final Submit Handler ───
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setErrors((prev) => ({ ...prev, terms: 'Please accept the Terms & Conditions and Privacy Policy to continue.' }));
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setRefId(`ISML-REG-2026-${Math.floor(10000 + Math.random() * 90000)}`);
      setIsSuccess(true);
    }, 1200);
  };

  const handleCopyRefId = () => {
    navigator.clipboard.writeText(refId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Step Names Array
  const stepsList = [
    { num: 1, label: 'Personal' },
    { num: 2, label: 'Contact' },
    { num: 3, label: 'Academic' },
    { num: 4, label: 'Enrollment' },
    { num: 5, label: 'Account' },
    { num: 6, label: 'Review' },
  ];

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40 text-slate-900 flex flex-col justify-center items-center px-3 sm:px-6 py-4 sm:py-8 relative font-sans select-none"
      style={{ fontFamily: "'Inter', 'Outfit', system-ui, -apple-system, sans-serif" }}
    >
      {/* Soft Ambient Light Blur Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-blue-200/40 blur-3xl opacity-70" />
        <div className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full bg-indigo-200/30 blur-3xl opacity-60" />
      </div>

      {/* 💳 Enterprise Registration Form Card */}
      <main className="relative z-10 w-full max-w-4xl sm:max-w-5xl my-auto py-1 shrink-0">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl space-y-6 w-full">
          
          {/* 🌟 ULTRA-RICH SUCCESS SCREEN 🌟 */}
          {isSuccess ? (
            <div className="space-y-6 py-2 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Dual Glowing Celebration Avatar */}
              <div className="text-center space-y-3">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-100/80 animate-ping absolute opacity-40" />
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 relative z-10">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447] tracking-tight">
                    Registration Request Submitted!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto">
                    Your student enrollment application has been logged and forwarded to the ISML Admin team for verification.
                  </p>
                </div>
              </div>

              {/* 🎟️ Clean Light Glass Registration Pass Ticket Card */}
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white rounded-2xl p-5 text-slate-900 shadow-xl space-y-4 border border-blue-200/90">
                <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-7 h-7 shrink-0">
                      <Image src="/logo.png" alt="ISML LMS Logo" fill className="object-contain" priority />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold text-[#0052CC] uppercase tracking-widest block leading-none">ISML LMS ENROLLMENT TICKET</span>
                      <span className="text-[9px] text-slate-500 font-medium">Indian School for Modern Languages</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 border border-amber-300/80 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                    <Clock className="w-3 h-3" /> PENDING APPROVAL
                  </span>
                </div>

                {/* Reference ID Banner */}
                <div className="bg-white border border-blue-200/90 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">APPLICATION REFERENCE ID</span>
                    <span className="font-mono font-extrabold text-lg text-[#0052CC] tracking-wider">{refId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyRefId}
                    className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy ID'}</span>
                  </button>
                </div>

                {/* Ticket Details Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-blue-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Student Name:</span>
                    <span className="font-bold text-[#0B2447] truncate block">{firstName} {lastName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Email Address:</span>
                    <span className="font-bold text-[#0052CC] truncate block">{email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Language Course:</span>
                    <span className="font-bold text-emerald-700 truncate block">{language} ({level})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Batch Schedule:</span>
                    <span className="font-bold text-slate-700 truncate block">{batch ? batch.split('—')[0] : 'Assigned'}</span>
                  </div>
                </div>
              </div>

              {/* ⏱️ Interactive 3-Step Approval Timeline Stepper */}
              <div className="max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-extrabold text-[#0B2447] uppercase tracking-wider">Next Steps & Approval Timeline</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>1. Request Received</span>
                    </div>
                    <p className="text-[11px] text-slate-600">Application submitted successfully at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                      <Clock className="w-4 h-4 shrink-0 animate-spin" />
                      <span>2. Admin Verification</span>
                    </div>
                    <p className="text-[11px] text-slate-600">Admin team reviews college & course details within <strong className="text-slate-900">24 hours</strong>.</p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1 opacity-70">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span>3. Portal Login Access</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Official Login ID & Password will be emailed to <span className="font-semibold">{email}</span>.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="w-full sm:w-auto py-3.5 px-8 bg-[#0052CC] hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Back to Login Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl border border-slate-300 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print Application Ticket</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Card Header & 6-Step Wizard Indicator */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink-0 drop-shadow-xs">
                      <Image src="/logo.png" alt="ISML LMS Logo" fill className="object-contain" priority />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B2447] tracking-tight">Create Your Student Account</h2>
                      <p className="text-xs text-slate-500 font-medium">Register for your ISML LMS learning program.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0052CC] bg-blue-50 px-3 py-1 rounded-lg border border-blue-200/80 shadow-2xs self-start sm:self-center">
                    Est. 2–3 mins
                  </span>
                </div>

                {/* Step Progress Pills Bar */}
                <div className="grid grid-cols-6 gap-1 pt-1">
                  {stepsList.map((s) => {
                    const isPassed = step > s.num;
                    const isCurrent = step === s.num;
                    return (
                      <div key={s.num} className="space-y-1">
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${
                          isPassed ? 'bg-[#0052CC]' : isCurrent ? 'bg-blue-500 ring-2 ring-blue-200' : 'bg-slate-200'
                        }`} />
                        <p className={`text-[9px] text-center truncate font-semibold ${
                          isCurrent ? 'text-[#0052CC]' : isPassed ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                          {s.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                  <span className="font-medium text-[#0052CC]">Note: Most details can be selected from the available dropdown options.</span>
                  <span className="text-slate-400 font-medium">Fields with * are required</span>
                </div>
              </div>

              {/* ─── STEP 1: Personal Details ─── */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-150">
                  <h3 className="text-xs font-extrabold text-[#0B2447] uppercase tracking-wider border-b border-slate-100 pb-1.5">
                    Step 1 – Personal Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                    {/* First Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">First Name*</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                          errors.firstName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                        }`}
                      />
                      {errors.firstName && <p className="text-[10px] text-rose-600 font-medium">{errors.firstName}</p>}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Last Name*</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                          errors.lastName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                        }`}
                      />
                      {errors.lastName && <p className="text-[10px] text-rose-600 font-medium">{errors.lastName}</p>}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Date of Birth*</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                          errors.dob ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                        }`}
                      />
                      {errors.dob && <p className="text-[10px] text-rose-600 font-medium">{errors.dob}</p>}
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Gender*</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                          errors.gender ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                      {errors.gender && <p className="text-[10px] text-rose-600 font-medium">{errors.gender}</p>}
                    </div>
                  </div>

                  {/* Profile Photo Upload */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-slate-700">Profile Photo (Optional)</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <label className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0052CC] text-xs font-bold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo (JPG/PNG max 2MB)</span>
                        <input type="file" accept="image/png, image/jpeg" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                    {errors.photo && <p className="text-[10px] text-rose-600 font-medium">{errors.photo}</p>}
                  </div>
                </div>
              )}

              {/* ─── STEP 2: Contact Details ─── */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-150">
                  <h3 className="text-xs font-extrabold text-[#0B2447] uppercase tracking-wider border-b border-slate-100 pb-1.5">
                    Step 2 – Contact Details
                  </h3>

                  <div className="space-y-3.5">
                    {/* Email Address */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Email Address*</label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. bharathi.m@gmail.com"
                          className={`w-full bg-slate-50 border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                            errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                          }`}
                        />
                      </div>
                      {errors.email && <p className="text-[10px] text-rose-600 font-medium">{errors.email}</p>}
                    </div>

                    {/* India Mobile Number with Fixed 🇮🇳 Flag */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Mobile Number*</label>
                      <div className="flex gap-2">
                        <div className="bg-slate-100/90 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#0B2447] flex items-center gap-2 shrink-0 shadow-2xs">
                          {/* High-Resolution Universal SVG Indian Flag */}
                          <svg className="w-5 h-3.5 rounded-[2px] shadow-2xs shrink-0 overflow-hidden border border-slate-200/60" viewBox="0 0 640 480">
                            <path fill="#FF9933" d="M0 0h640v160H0z"/>
                            <path fill="#FFFFFF" d="M0 160h640v160H0z"/>
                            <path fill="#128807" d="M0 320h640v160H0z"/>
                            <g transform="translate(320 240)">
                              <circle r="60" fill="none" stroke="#000080" strokeWidth="14"/>
                              <circle r="12" fill="#000080"/>
                              <path stroke="#000080" strokeWidth="6" d="M0-60V60M-60 0h120M-42-42l84 84M-42 42l84-84M-23-55l46 110M-55-23l110 46M-55 23l110-46M-23 55l46-110"/>
                            </g>
                          </svg>
                          <span>+91</span>
                        </div>
                        <div className="relative flex-1 flex items-center">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                          <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength={10}
                            placeholder="e.g. 9876543210"
                            className={`w-full bg-slate-50 border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                              errors.mobile ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                            }`}
                          />
                        </div>
                      </div>
                      {errors.mobile && <p className="text-[10px] text-rose-600 font-medium">{errors.mobile}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 3: College & Academic Details ─── */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-150">
                  <h3 className="text-xs font-extrabold text-[#0B2447] uppercase tracking-wider border-b border-slate-100 pb-1.5">
                    Step 3 – College & Academic Details
                  </h3>

                  <div className="space-y-3.5">
                    {/* College Selection */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">College / Institution*</label>
                      <select
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                          errors.college ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                        }`}
                      >
                        <option value="">Select College / Institution</option>
                        {collegeOptions.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.college && <p className="text-[10px] text-rose-600 font-medium">{errors.college}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Department (Cascading) */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Department*</label>
                        <select
                          value={department}
                          onChange={(e) => {
                            setDepartment(e.target.value);
                            setProgramme(''); // reset dependent programme
                          }}
                          className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                            errors.department ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                          }`}
                        >
                          <option value="">Select Department</option>
                          {Object.keys(academicData).map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        {errors.department && <p className="text-[10px] text-rose-600 font-medium">{errors.department}</p>}
                      </div>

                      {/* Programme / Degree (Dependent on Department) */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Programme / Degree*</label>
                        <select
                          value={programme}
                          disabled={!department}
                          onChange={(e) => setProgramme(e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                            errors.programme ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                          } disabled:opacity-50`}
                        >
                          <option value="">{department ? 'Select Programme' : 'Select Department First'}</option>
                          {department && academicData[department]?.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                        {errors.programme && <p className="text-[10px] text-rose-600 font-medium">{errors.programme}</p>}
                      </div>

                      {/* Year of Study */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Year of Study*</label>
                        <select
                          value={yearOfStudy}
                          onChange={(e) => setYearOfStudy(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Passed Out">Passed Out</option>
                        </select>
                      </div>

                      {/* Academic Year */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Academic Year*</label>
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none"
                        >
                          <option value="2026–2027">2026–2027</option>
                          <option value="2027–2028">2027–2028</option>
                        </select>
                      </div>
                    </div>

                    {/* Student Roll Number */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Student / Roll Number*</label>
                      <input
                        type="text"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                        placeholder="e.g. 2026-CS-8942"
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                          errors.rollNo ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                        }`}
                      />
                      {errors.rollNo && <p className="text-[10px] text-rose-600 font-medium">{errors.rollNo}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 4: Course Enrollment (Cascading) ─── */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-150">
                  <h3 className="text-xs font-extrabold text-[#0B2447] uppercase tracking-wider border-b border-slate-100 pb-1.5">
                    Step 4 – Course Enrollment (Cascading Options)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                    {/* Language */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Language*</label>
                      <select
                        value={language}
                        onChange={(e) => {
                          setLanguage(e.target.value);
                          setCourse('');
                          setLevel('');
                          setBatch('');
                        }}
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                          errors.language ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                        }`}
                      >
                        <option value="">Select Foreign Language</option>
                        {Object.keys(courseData).map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      {errors.language && <p className="text-[10px] text-rose-600 font-medium">{errors.language}</p>}
                    </div>

                    {/* Course */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Course*</label>
                      <select
                        value={course}
                        disabled={!language}
                        onChange={(e) => {
                          setCourse(e.target.value);
                          setLevel('');
                          setBatch('');
                        }}
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                          errors.course ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                        } disabled:opacity-50`}
                      >
                        <option value="">{language ? 'Select Course' : 'Select Language First'}</option>
                        {language && Object.keys(courseData[language] || {}).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.course && <p className="text-[10px] text-rose-600 font-medium">{errors.course}</p>}
                    </div>

                    {/* Level */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Course Level*</label>
                      <select
                        value={level}
                        disabled={!course}
                        onChange={(e) => {
                          setLevel(e.target.value);
                          setBatch('');
                        }}
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                          errors.level ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                        } disabled:opacity-50`}
                      >
                        <option value="">{course ? 'Select Level' : 'Select Course First'}</option>
                        {language && course && Object.keys(courseData[language]?.[course] || {}).map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                      {errors.level && <p className="text-[10px] text-rose-600 font-medium">{errors.level}</p>}
                    </div>

                    {/* Available Batch */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Available Batch / Schedule*</label>
                      <select
                        value={batch}
                        disabled={!level}
                        onChange={(e) => setBatch(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                          errors.batch ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                        } disabled:opacity-50`}
                      >
                        <option value="">{level ? 'Select Batch Schedule' : 'Select Level First'}</option>
                        {language && course && level && courseData[language]?.[course]?.[level]?.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      {errors.batch && <p className="text-[10px] text-rose-600 font-medium">{errors.batch}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 5: Account Setup ─── */}
              {step === 5 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-150">
                  <h3 className="text-xs font-extrabold text-[#0B2447] uppercase tracking-wider border-b border-slate-100 pb-1.5">
                    Step 5 – Account Setup
                  </h3>

                  {/* Auto-Generated Login ID Notice */}
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#0B2447] block">Auto-Generated System Login ID:</span>
                      <span className="text-[11px] text-slate-600">Your official Login ID will be issued by ISML upon admin approval.</span>
                    </div>
                    <span className="font-mono font-bold text-[#0052CC] bg-white px-2.5 py-1 rounded-md border border-blue-200 shrink-0">
                      ISML2026-PENDING
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Create Password*</label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 8 chars (A-z, 0-9, #)"
                          className={`w-full bg-slate-50 border rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                            errors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-slate-400 hover:text-[#0052CC] cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      {password && (
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium">Strength:</span>
                            <span className="font-bold text-slate-700">{pwdStrength.label}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                            <div className={`h-full flex-1 transition-all ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-200'}`} />
                            <div className={`h-full flex-1 transition-all ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-200'}`} />
                            <div className={`h-full flex-1 transition-all ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-200'}`} />
                          </div>
                        </div>
                      )}
                      {errors.password && <p className="text-[10px] text-rose-600 font-medium">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Confirm Password*</label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className={`w-full bg-slate-50 border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                            errors.confirmPassword ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#0052CC] focus:bg-white'
                          }`}
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-[10px] text-rose-600 font-medium">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 6: Review Summary & Submit ─── */}
              {step === 6 && (
                <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-xs font-extrabold text-[#0B2447] uppercase tracking-wider">
                        Step 6 – Application Review & Final Verification
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">Please review all information before submitting your registration.</p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                      5 Sections Ready
                    </span>
                  </div>

                  {/* 2x2 Grid of Rich Glassmorphic Review Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* 1. Personal Details Card */}
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/90 hover:border-blue-300 rounded-2xl space-y-2.5 transition-all shadow-xs group">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#0052CC] flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-xs text-[#0B2447]">1. Personal Details</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#0052CC] bg-white hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Full Name:</span>
                          <span className="font-bold text-slate-800">{firstName} {lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Date of Birth:</span>
                          <span className="font-semibold text-slate-700">{dob}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Gender:</span>
                          <span className="font-semibold text-slate-700">{gender}</span>
                        </div>
                        {photoPreview && (
                          <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                            <span className="text-slate-500 font-medium">Profile Photo:</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Attached</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. Contact Information Card */}
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/90 hover:border-blue-300 rounded-2xl space-y-2.5 transition-all shadow-xs group">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Mail className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-xs text-[#0B2447]">2. Contact Details</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#0052CC] bg-white hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Email:</span>
                          <span className="font-bold text-blue-700 truncate max-w-[180px]">{email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Mobile:</span>
                          <span className="font-semibold text-slate-800">{countryCode} {mobile}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                          <span className="text-slate-500 font-medium">Status:</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Verified Unique</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Academic Details Card */}
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/90 hover:border-blue-300 rounded-2xl space-y-2.5 transition-all shadow-xs group">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-xs text-[#0B2447]">3. Academic Institution</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#0052CC] bg-white hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-slate-500 font-medium block text-[10px]">Institution:</span>
                          <span className="font-bold text-slate-800 line-clamp-1">{college}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Programme:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[170px]">{programme}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Year / Roll:</span>
                          <span className="font-mono font-bold text-slate-700">{yearOfStudy} • {rollNo}</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Course Enrollment Card */}
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/90 hover:border-blue-300 rounded-2xl space-y-2.5 transition-all shadow-xs group">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-xs text-[#0B2447]">4. Course Enrollment</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(4)}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#0052CC] bg-white hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Language & Level:</span>
                          <span className="font-extrabold text-emerald-700">{language} ({level})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Course Title:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[170px]">{course}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block text-[10px]">Batch Schedule:</span>
                          <span className="font-mono font-semibold text-slate-700 text-[11px] truncate block">{batch}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Account Security Credentials Banner */}
                  <div className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/90 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white text-[#0052CC] border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <ShieldCheck className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-[#0B2447] block">5. Account Credentials & Security</span>
                        <span className="text-[11px] text-slate-600">Login ID: <strong className="font-mono text-[#0052CC]">ISML2026-PENDING</strong> (Issued upon approval) • Password: <strong className="font-mono">••••••••</strong></span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#0052CC] bg-white hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Styled Terms Checkbox Card */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => {
                          setAgreedTerms(e.target.checked);
                          if (e.target.checked) setErrors((prev) => ({ ...prev, terms: '' }));
                        }}
                        className="w-4.5 h-4.5 rounded border-slate-300 text-[#0052CC] focus:ring-blue-200 cursor-pointer accent-[#0052CC] mt-0.5"
                      />
                      <span className="leading-snug">
                        I hereby confirm that all provided personal, academic, and enrollment information is true and accurate. I agree to abide by the <strong className="text-slate-900">ISML Terms of Service</strong> and <strong className="text-slate-900">Privacy Policy</strong>.
                      </span>
                    </label>
                    {errors.terms && <p className="text-[10px] text-rose-600 font-medium pl-7">{errors.terms}</p>}
                  </div>

                  {/* Glowing Final Submit CTA Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !agreedTerms}
                    className="w-full py-4 px-6 bg-gradient-to-r from-[#0052CC] to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm font-extrabold rounded-xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Submitting Student Registration Request...</span>
                      </div>
                    ) : (
                      <>
                        <span>Submit Registration Request</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Wizard Navigation Buttons (Steps 1–5) */}
              {!isSuccess && step < 6 && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 1}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl disabled:opacity-40 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Bottom Back to Login Link */}
          {!isSuccess && (
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-xs text-slate-500 hover:text-[#0052CC] font-semibold transition-colors cursor-pointer"
              >
                Already have an account? <span className="text-[#0052CC] font-bold underline">Sign In</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-1 text-center text-[10px] text-slate-400 font-medium shrink-0">
        © 2026 ISML LMS (IYPAN Educational Centre Pvt. Ltd.) • Student Onboarding Portal
      </footer>
    </div>
  );
}
