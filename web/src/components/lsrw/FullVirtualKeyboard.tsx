"use client";

import React, { useState } from 'react';
import { Key, Delete, Globe, ArrowUp, Sparkles, BookOpen } from 'lucide-react';

interface FullVirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onClear: () => void;
}

const quickFrenchWords = [
  "Bonjour!",
  "Je m'appelle",
  "s'il vous plaît",
  "Merci",
  "C'est",
  "L'addition",
  "étudiant",
  "française",
  "Enchanté!",
  "Au revoir",
  "Oui",
  "Non"
];

export default function FullVirtualKeyboard({
  onKeyPress,
  onBackspace,
  onSpace,
  onClear
}: FullVirtualKeyboardProps) {
  const [layoutMode, setLayoutMode] = useState<'AZERTY' | 'QWERTY'>('AZERTY');
  const [isShift, setIsShift] = useState(false);

  // Accent & Number Row
  const accentRow = ['é', 'è', 'à', 'ç', 'œ', 'ê', 'ù', 'î', 'ô', 'ë', 'ä', 'ï', 'ü', '«', '»'];
  const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', "'"];

  // AZERTY Rows (Native French Standard)
  const azertyRow1 = ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const azertyRow2 = ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'];
  const azertyRow3 = ['w', 'x', 'c', 'v', 'b', 'n', ',', ';', ':', '!'];

  // QWERTY Rows
  const qwertyRow1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const qwertyRow2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'];
  const qwertyRow3 = ['z', 'x', 'c', 'v', 'b', 'n', ',', '.', '?', '!'];

  const currentRow1 = layoutMode === 'AZERTY' ? azertyRow1 : qwertyRow1;
  const currentRow2 = layoutMode === 'AZERTY' ? azertyRow2 : qwertyRow2;
  const currentRow3 = layoutMode === 'AZERTY' ? azertyRow3 : qwertyRow3;

  const handleKeyClick = (char: string) => {
    const finalChar = isShift ? char.toUpperCase() : char;
    onKeyPress(finalChar);
  };

  const handleWordClick = (word: string) => {
    onKeyPress(word + " ");
  };

  return (
    <div className="p-4 bg-slate-900 rounded-2xl border-2 border-slate-800 space-y-3 shadow-2xl text-white select-none">
      {/* Keyboard Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">🇫🇷</span>
          <span className="font-bold text-[#0052CC] font-mono uppercase tracking-wider">Clavier Virtuel Français</span>
          <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">(Native French Keyboard Studio)</span>
        </div>

        {/* Layout Switcher (AZERTY vs QWERTY) */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <button
            onClick={() => setLayoutMode('AZERTY')}
            className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${
              layoutMode === 'AZERTY' ? 'bg-[#0052CC] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AZERTY (FR)
          </button>
          <button
            onClick={() => setLayoutMode('QWERTY')}
            className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${
              layoutMode === 'QWERTY' ? 'bg-[#0052CC] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            QWERTY (IN)
          </button>
        </div>
      </div>

      {/* Quick French Words / Expressions Buttons Bar */}
      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 font-mono">
          <BookOpen className="w-3 h-3 text-cyan-400" /> Mots et Expressions Françaises (Tap to insert word):
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {quickFrenchWords.map((word, idx) => (
            <button
              key={idx}
              onClick={() => handleWordClick(word)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-[#0052CC] border border-slate-700 text-xs font-bold text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Dedicated French Special Accents */}
      <div className="flex justify-center gap-1 sm:gap-1.5 flex-wrap">
        {accentRow.map((keyChar) => (
          <button
            key={keyChar}
            onClick={() => handleKeyClick(keyChar)}
            className="px-2.5 py-2 bg-[#1E293B] hover:bg-[#0052CC] border border-slate-700 hover:border-cyan-400 rounded-lg text-sm sm:text-base font-bold text-cyan-300 shadow-sm transition-all transform active:scale-95 cursor-pointer min-w-[34px]"
          >
            {isShift ? keyChar.toUpperCase() : keyChar}
          </button>
        ))}
      </div>

      {/* Row 2: Numbers */}
      <div className="flex justify-center gap-1 sm:gap-1.5 flex-wrap">
        {numberRow.map((num) => (
          <button
            key={num}
            onClick={() => handleKeyClick(num)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-300 transition-colors active:scale-95 cursor-pointer min-w-[28px]"
          >
            {num}
          </button>
        ))}
      </div>

      {/* Row 3: Top Letters */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {currentRow1.map((char) => (
          <button
            key={char}
            onClick={() => handleKeyClick(char)}
            className="flex-1 py-2 sm:py-2.5 bg-slate-800 hover:bg-[#0052CC] border border-slate-700 hover:border-cyan-400 rounded-lg text-xs sm:text-sm font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer max-w-[45px] text-center"
          >
            {isShift ? char.toUpperCase() : char}
          </button>
        ))}
      </div>

      {/* Row 4: Middle Letters */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {currentRow2.map((char) => (
          <button
            key={char}
            onClick={() => handleKeyClick(char)}
            className="flex-1 py-2 sm:py-2.5 bg-slate-800 hover:bg-[#0052CC] border border-slate-700 hover:border-cyan-400 rounded-lg text-xs sm:text-sm font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer max-w-[45px] text-center"
          >
            {isShift ? char.toUpperCase() : char}
          </button>
        ))}
      </div>

      {/* Row 5: French MAJ (Shift) + Bottom Letters + Effacer (Backspace) */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        <button
          onClick={() => setIsShift(!isShift)}
          className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
            isShift ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-extrabold' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
          title="Basculez Majuscules (Shift)"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>MAJ</span>
        </button>

        {currentRow3.map((char) => (
          <button
            key={char}
            onClick={() => handleKeyClick(char)}
            className="flex-1 py-2 sm:py-2.5 bg-slate-800 hover:bg-[#0052CC] border border-slate-700 hover:border-cyan-400 rounded-lg text-xs sm:text-sm font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer max-w-[45px] text-center"
          >
            {isShift ? char.toUpperCase() : char}
          </button>
        ))}

        <button
          onClick={onBackspace}
          className="px-3 py-2 bg-rose-600/80 hover:bg-rose-600 border border-rose-500 rounded-lg text-xs font-bold text-white flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          title="Effacer"
        >
          <Delete className="w-4 h-4" />
          <span className="hidden sm:inline">Effacer</span>
        </button>
      </div>

      {/* Row 6: Espace & Effacer Tout */}
      <div className="flex justify-center gap-2 pt-1">
        <button
          onClick={onClear}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
        >
          Effacer Tout
        </button>

        <button
          onClick={onSpace}
          className="flex-1 max-w-lg py-2.5 bg-slate-800 hover:bg-[#0052CC] text-white border border-slate-700 hover:border-cyan-400 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>␣ Espace</span>
        </button>
      </div>
    </div>
  );
}
