"use client";

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  ShieldCheck, 
  CheckSquare, 
  ArrowRight,
  X,
  Building2,
  MapPin,
  Download,
  Mic,
  Video,
  Users
} from 'lucide-react';
import { mockExams, ExamModel } from '@/mock/exams';

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'UPCOMING' | 'COMPLETED'>('AVAILABLE');
  const [activeExam, setActiveExam] = useState<ExamModel | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);

  const filteredExams = mockExams.filter(e => e.status === activeTab);

  const sampleQuestions = [
    { text: "Choose the correct French translation for 'Good Morning':", options: ["Bonsoir", "Bonjour", "Au revoir", "Bonne nuit"], correct: 1 },
    { text: "Which subject pronoun represents 'We' in French?", options: ["Je", "Tu", "Nous", "Vous"], correct: 2 },
    { text: "Identify the silent consonant in the word 'Paris':", options: ["P", "a", "r", "s"], correct: 3 }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <GraduationCap className="w-4 h-4 text-[#0052CC]" />
          <span>Language Assessments & Exams</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Examinations & Assessments</h1>
        <p className="text-xs text-slate-600">
          Take scheduled language quizzes, mid-terms, and final CEFR certification exams.
        </p>
      </div>

      {/* Offline Center Announcement Directive Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-2xs">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <span className="font-extrabold text-xs block text-amber-950 uppercase tracking-wider">
            Final Semester Examinations • Offline Authorized Center Notice
          </span>
          <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
            Final written & listening semester examinations will be conducted <strong>in-person at designated offline centers</strong> nearby your institution. The official schedule, assigned exam venue, and hall ticket download dates <strong>will be announced soon</strong>.
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Currently Active: Online 1-on-1 Human Speaking Viva Assessments below</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {['AVAILABLE', 'UPCOMING', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors cursor-pointer ${
              activeTab === tab ? 'bg-[#0052CC] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab} Tests
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Mic className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No {activeTab.toLowerCase()} assessments scheduled</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Speaking assessments and oral evaluations assigned by your Academic Manager will appear here as your cohort progresses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map((exam) => {
            const isOfflineFinal = exam.type === 'FINAL_EXAM' || exam.examDeliveryMode === 'OFFLINE_CENTER_ONLY';
            const isSpeakingExam = exam.isSpeakingExam || exam.examDeliveryMode === 'ONLINE_HUMAN_SPEAKING_SLOT' || exam.lsrwFocus === 'SPEAKING';

            return (
              <div
                key={exam.id}
                className={`p-5 rounded-2xl border shadow-2xs space-y-4 flex flex-col justify-between transition-all ${
                  isSpeakingExam
                    ? 'bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white border-purple-300 ring-2 ring-purple-100 hover:border-purple-500'
                    : isOfflineFinal
                    ? 'bg-amber-50/20 border-amber-200 hover:border-amber-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {exam.type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {exam.lsrwFocus} FOCUS
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {exam.subjectCode}
                      </span>

                      {/* Distinct Delivery Mode Badges */}
                      {isSpeakingExam ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-600 text-white flex items-center gap-1 shadow-2xs animate-pulse">
                          <Mic className="w-3 h-3 text-cyan-300" />
                          <span>Speaking Slot (Human Tutor • Online Only)</span>
                        </span>
                      ) : isOfflineFinal ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-700" />
                          <span>Offline Center Only</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Online Written CBT
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 shrink-0">
                      <Clock className="w-3.5 h-3.5" /> {exam.durationMins} Mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#0B2447]">{exam.title}</h3>

                  <div className="p-3 bg-white/90 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                    <p className="font-semibold text-slate-800">
                      Course Track: <span className="font-bold text-[#0052CC]">{exam.courseName}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Enrolled Cohort: <strong className="text-slate-700">{exam.batchName}</strong>
                    </p>

                    {/* 🎙️ SPEAKING EXAM: DEDICATED ONLINE HUMAN EXAMINER CARD */}
                    {isSpeakingExam && (
                      <div className="p-3 rounded-xl bg-purple-50/90 border border-purple-200 text-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-extrabold text-purple-950 text-xs">
                            <Users className="w-4 h-4 text-purple-700" />
                            <span>1-on-1 Assigned Human Examiner:</span>
                          </div>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Live Video Viva
                          </span>
                        </div>
                        <p className="font-extrabold text-xs text-purple-900">
                          {exam.examinerName || 'DELF Certified Native Human Examiner'}
                        </p>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-purple-200/80">
                          <span className="text-slate-600">Scheduled Oral Slot:</span>
                          <span className="font-bold text-purple-800">{exam.liveHumanTutorSlot || exam.scheduledWindow}</span>
                        </div>
                        <p className="text-[10px] text-purple-700 font-medium">
                          ✓ Interactive viva evaluation: Spontaneous dialogue, pronunciation, and CEFR oral fluency scoring.
                        </p>
                      </div>
                    )}

                    {/* 🏢 FINAL EXAM: OFFLINE CENTER DETAILS CARD */}
                    {!isSpeakingExam && isOfflineFinal && exam.offlineCenterName && (
                      <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 space-y-1 text-slate-800">
                        <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                          <Building2 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Designated Physical Examination Hall:</span>
                        </div>
                        <p className="font-extrabold text-[11px] text-slate-900">{exam.offlineCenterName}</p>
                        <p className="text-[10px] text-slate-600">{exam.offlineCenterAddress}</p>
                        {exam.hallTicketRef && (
                          <div className="flex items-center justify-between pt-1 border-t border-amber-200/80 text-[10px]">
                            <span className="text-slate-500 font-medium">Hall Ticket Reference:</span>
                            <span className="font-mono font-bold text-blue-700">{exam.hallTicketRef}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 font-mono pt-0.5">{exam.scheduledWindow}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isSpeakingExam ? (
                  <div className="space-y-2">
                    <a
                      href={exam.liveVideoMeetingUrl || '/live-classes'}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-600/20 transition-all"
                    >
                      <Video className="w-4 h-4 text-cyan-300" />
                      <span>Join 1:1 Live Oral Viva Studio (Online)</span>
                    </a>
                    <p className="text-[10px] text-center text-purple-700 font-semibold">
                      Ensure microphone & camera are permitted before joining the examiner.
                    </p>
                  </div>
                ) : isOfflineFinal ? (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-amber-100/60 border border-amber-200 text-center">
                      <span className="text-xs font-bold text-amber-950 flex items-center justify-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        <span>Must attend in-person at campus center</span>
                      </span>
                    </div>
                    <button
                      onClick={() => alert(`Hall Ticket Generated:\nStudent: ${exam.batchName}\nCenter: ${exam.offlineCenterName}\nRef: ${exam.hallTicketRef || 'HT-2026-FINAL'}\n\nPlease bring a printed copy and valid College ID card to the exam hall.`)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-[#0052CC] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Official Hall Ticket</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {exam.status === 'AVAILABLE' && (
                      <button
                        onClick={() => { setActiveExam(exam); setSubmitted(false); }}
                        className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Start Online Test Now</span>
                      </button>
                    )}

                    {exam.status === 'COMPLETED' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between">
                        <span>Score: {exam.scoreAchieved} / {exam.totalMarks}</span>
                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px]">{exam.resultStatus}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* 🧪 INTERACTIVE TEST TAKING ENGINE MODAL */}
      {activeExam && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-4 p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#0052CC] uppercase font-mono">{activeExam.type}</span>
                <h3 className="text-base font-bold text-[#0B2447]">{activeExam.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-rose-50 text-rose-600 font-mono text-xs font-bold rounded-full border border-rose-200">
                  Timer: 42:15 Mins
                </span>
                <button onClick={() => setActiveExam(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!submitted ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span>Question {currentQuestionIdx + 1} of {sampleQuestions.length}</span>
                  <span>Multiple Choice Question</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <p className="text-sm font-bold text-slate-800">
                    {currentQuestionIdx + 1}. {sampleQuestions[currentQuestionIdx].text}
                  </p>
                  <div className="space-y-2">
                    {sampleQuestions[currentQuestionIdx].options.map((opt, idx) => {
                      const isSelected = answers[currentQuestionIdx] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setAnswers(prev => ({ ...prev, [currentQuestionIdx]: idx }))}
                          className={`w-full p-3 rounded-lg text-xs font-semibold text-left border transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#0052CC] text-white border-[#0052CC]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {currentQuestionIdx < sampleQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                      className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={() => setSubmitted(true)}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Submit Examination Paper
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-900">Exam Submitted Successfully!</h4>
                <p className="text-xs text-emerald-700">Your test answers have been submitted. Official report card will be published after tutor verification.</p>
                <button
                  onClick={() => setActiveExam(null)}
                  className="px-6 py-2 bg-[#0052CC] text-white text-xs font-bold rounded-lg"
                >
                  Return to Exams List
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
