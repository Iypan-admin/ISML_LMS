"use client";

import React, { useState, useEffect } from 'react';
import { 
  Keyboard, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Key, 
  Bot,
  Award,
  Zap,
  Gauge,
  Clock
} from 'lucide-react';

import FullVirtualKeyboard from '@/components/lsrw/FullVirtualKeyboard';

const paragraphPrompts = [
  {
    id: 'p-1',
    title: 'Paragraph 1: Self Introduction & Accents',
    cefrLevel: 'CEFR A1.1',
    text: "Bonjour! Je m'appelle Arun. Je suis étudiant à l'université. J'aime apprendre la langue française et voyager à Paris. C'est magnifique!",
    translation: "Hello! My name is Arun. I am a university student. I like learning the French language and traveling to Paris. It is magnificent!"
  },
  {
    id: 'p-2',
    title: 'Paragraph 2: Ordering Food at a Café',
    cefrLevel: 'CEFR A1.2',
    text: "Bonjour Monsieur, je voudrais commander un café au lait et deux croissants chauds. L'addition, s'il vous plaît! Merci beaucoup.",
    translation: "Hello Sir, I would like to order a coffee with milk and two warm croissants. The bill, please! Thank you very much."
  },
  {
    id: 'p-3',
    title: 'Paragraph 3: Weather & Daily Routine',
    cefrLevel: 'CEFR A1.2',
    text: "Aujourd'hui, il fait très beau. Le matin, je me réveille à sept heures et je prends le petit déjeuner avec ma famille.",
    translation: "Today, the weather is very nice. In the morning, I wake up at seven o'clock and have breakfast with my family."
  }
];

export default function ParagraphTypingEngine() {
  const [selectedPrompt, setSelectedPrompt] = useState(paragraphPrompts[0]);
  const [typedInput, setTypedInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);

  const targetText = selectedPrompt.text;

  const updateTypedValue = (val: string) => {
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setTypedInput(val);

    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) {
        correctChars++;
      }
    }
    const currentAcc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
    setAccuracy(currentAcc);

    // Calculate WPM if started
    if (startTime) {
      const timeElapsedMins = (Date.now() - startTime) / 60000;
      const wordCount = val.trim().split(/\s+/).filter(Boolean).length;
      if (timeElapsedMins > 0) {
        setWpm(Math.round(wordCount / timeElapsedMins));
      }
    }

    // Check completion
    if (val === targetText) {
      setIsCompleted(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateTypedValue(e.target.value);
  };

  const resetTyping = () => {
    setTypedInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Paragraph Selection Tabs */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Select Target Paragraph Practice Prompt:
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {paragraphPrompts.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedPrompt(p); resetTyping(); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-2 ${
                selectedPrompt.id === p.id
                  ? 'bg-[#0052CC] text-white border-cyan-400 shadow-md scale-102'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span>{p.title}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                selectedPrompt.id === p.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                {p.cefrLevel}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Real-time Typing Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-0.5">
          <span className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-[#0052CC]" /> Typing Speed
          </span>
          <p className="text-xl font-extrabold text-[#0B2447]">{wpm} <span className="text-xs font-normal text-slate-500">WPM</span></p>
        </div>

        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-0.5">
          <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-600" /> Accuracy Rate
          </span>
          <p className="text-xl font-extrabold text-emerald-700">{accuracy}%</p>
        </div>

        <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl space-y-0.5">
          <span className="text-[10px] font-bold text-purple-700 uppercase flex items-center gap-1">
            <Keyboard className="w-3.5 h-3.5 text-purple-600" /> Progress
          </span>
          <p className="text-xl font-extrabold text-purple-900 font-mono">
            {typedInput.length} / {targetText.length} <span className="text-xs font-normal text-slate-500">chars</span>
          </p>
        </div>

        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-0.5 flex flex-col justify-center">
          <button
            onClick={resetTyping}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart Typing
          </button>
        </div>
      </div>

      {/* Target Paragraph Display Canvas (Real-time Color Coded Characters) */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
          <span className="font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
            <Keyboard className="w-4 h-4 text-cyan-400" /> Target Paragraph to Type Below:
          </span>
          <span className="text-[11px]">Green = Correct • Red = Accent Error • Gray = Untyped</span>
        </div>

        {/* Character-by-Character Color Highlight Renderer */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-base sm:text-lg leading-relaxed select-none tracking-wide">
          {targetText.split('').map((char, idx) => {
            let statusClass = 'text-slate-500'; // untyped
            if (idx < typedInput.length) {
              if (typedInput[idx] === char) {
                statusClass = 'bg-emerald-950 text-emerald-400 font-bold border-b-2 border-emerald-500'; // correct
              } else {
                statusClass = 'bg-rose-950 text-rose-400 font-bold underline border-b-2 border-rose-500'; // error
              }
            } else if (idx === typedInput.length) {
              statusClass = 'bg-cyan-500 text-slate-950 font-bold animate-pulse'; // active cursor
            }

            return (
              <span key={idx} className={`${statusClass} transition-colors px-0.5 rounded-2xs`}>
                {char}
              </span>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 italic">
          English Meaning: <span className="text-slate-300 font-sans">"{selectedPrompt.translation}"</span>
        </p>
      </div>

      {/* Interactive Textarea Input Box */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Type Paragraph Here (Use Hardware Keyboard OR Full On-Screen Virtual Keyboard Below):
        </label>
        <textarea
          rows={3}
          value={typedInput}
          onChange={handleInputChange}
          placeholder="Start typing the paragraph above... (Green highlights will confirm correct accents)"
          className="w-full bg-white border-2 border-[#0052CC] rounded-2xl p-4 text-sm font-mono text-slate-900 outline-none focus:ring-2 focus:ring-cyan-400 transition-all shadow-md"
        />
      </div>

      {/* ⌨️ FULL INTERACTIVE ON-SCREEN VIRTUAL KEYBOARD */}
      <FullVirtualKeyboard
        onKeyPress={(char) => updateTypedValue(typedInput + char)}
        onBackspace={() => updateTypedValue(typedInput.slice(0, -1))}
        onSpace={() => updateTypedValue(typedInput + ' ')}
        onClear={() => resetTyping()}
      />

      {/* Completion Banner */}
      {isCompleted && (
        <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 space-y-2 shadow-md">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-600" />
            <h3 className="text-base font-bold">🎉 Paragraph Typing Practice Completed!</h3>
          </div>
          <p className="text-xs text-emerald-800">
            Fantastic work! You achieved <span className="font-bold">{wpm} WPM</span> speed with <span className="font-bold">{accuracy}% accuracy</span> and perfect accent placement.
          </p>
        </div>
      )}
    </div>
  );
}
