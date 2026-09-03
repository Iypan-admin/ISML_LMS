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
  X
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExams.map((exam) => (
          <div key={exam.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {exam.type}
                </span>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {exam.durationMins} Mins
                </span>
              </div>

              <h3 className="text-base font-bold text-[#0B2447]">{exam.title}</h3>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>Total Questions: <span className="font-bold text-slate-800">{exam.totalQuestions}</span></p>
                <p>Passing Mark: <span className="font-bold text-slate-800">{exam.passingMarks} / {exam.totalMarks}</span></p>
                <p className="text-[11px] text-slate-500 font-mono">{exam.scheduledWindow}</p>
                {exam.proctoringEnabled && (
                  <p className="text-[10px] text-cyan-700 font-bold">🔒 Optional Automated Proctoring</p>
                )}
              </div>
            </div>

            {exam.status === 'AVAILABLE' && (
              <button
                onClick={() => { setActiveExam(exam); setSubmitted(false); }}
                className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Test Now</span>
              </button>
            )}

            {exam.status === 'COMPLETED' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between">
                <span>Score: {exam.scoreAchieved} / {exam.totalMarks}</span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px]">{exam.resultStatus}</span>
              </div>
            )}
          </div>
        ))}
      </div>

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
