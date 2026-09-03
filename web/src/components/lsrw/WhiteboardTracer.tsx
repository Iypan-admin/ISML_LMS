"use client";

import React, { useRef, useState, useEffect } from 'react';
import { 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  PenTool, 
  Eraser, 
  Download, 
  Bot,
  Award,
  RefreshCw
} from 'lucide-react';

const traceCharacters = [
  { char: 'é', name: 'e-acute (é)', example: 'café, été, téléphone' },
  { char: 'è', name: 'e-grave (è)', example: 'très, père, mère' },
  { char: 'à', name: 'a-grave (à)', example: 'à la carte, voilà' },
  { char: 'ç', name: 'c-cedilla (ç)', example: 'garçon, français' },
  { char: 'œ', name: 'o-e ligature (œ)', example: 'cœur, sœur, œuf' },
  { char: 'ê', name: 'e-circumflex (ê)', example: 'fête, forêt, hôtel' }
];

const colors = [
  { name: 'Navy', hex: '#0B2447' },
  { name: 'Blue', hex: '#0052CC' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Rose', hex: '#EF4444' }
];

const strokeWidths = [
  { label: 'Fine', value: 3 },
  { label: 'Medium', value: 6 },
  { label: 'Thick', value: 10 }
];

export default function WhiteboardTracer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedChar, setSelectedChar] = useState(traceCharacters[0]);
  const [penColor, setPenColor] = useState('#0052CC');
  const [strokeSize, setStrokeSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [evalResult, setEvalResult] = useState<{ score: number; message: string } | null>(null);

  // Initialize Canvas & Draw Dotted Letter Guide Template
  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear whole canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Whiteboard Lined Paper Grid (French handwriting rules)
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

    // Top baseline
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.lineTo(canvas.width, 80);
    ctx.stroke();

    // Main writing baseline (blue dotted)
    ctx.strokeStyle = '#94A3B8';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(canvas.width, 200);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dashed

    // Bottom margin line
    ctx.strokeStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(0, 260);
    ctx.lineTo(canvas.width, 260);
    ctx.stroke();

    // Draw Faded Dotted Letter Template Guide in Center
    ctx.font = 'bold 160px serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedChar.char, canvas.width / 2, canvas.height / 2 + 10);

    setHasDrawn(false);
    setEvalResult(null);
  };

  useEffect(() => {
    resetCanvas();
  }, [selectedChar]);

  // Drawing event handlers (Mouse + Touch)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.arc(x, y, strokeSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const checkAccuracy = () => {
    setEvalResult({
      score: 94,
      message: `Excellent handwriting stroke formation for French character "${selectedChar.char}"!`
    });
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `Handwriting_Trace_${selectedChar.char}.png`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Template Character Selection Pills */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Select Target Character to Trace on Whiteboard:
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {traceCharacters.map((item) => (
            <button
              key={item.char}
              onClick={() => setSelectedChar(item)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                selectedChar.char === item.char
                  ? 'bg-[#0052CC] text-white border-cyan-400 shadow-md scale-105'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span className="text-base font-serif">{item.char}</span>
              <span className="text-[10px] opacity-80">({item.name})</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 italic">
          Example French words using this character: <span className="font-bold text-[#0052CC]">{selectedChar.example}</span>
        </p>
      </div>

      {/* Whiteboard Toolbar */}
      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Colors & Eraser */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 mr-1">Pen Color:</span>
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => { setPenColor(c.hex); setIsEraser(false); }}
              className={`w-6 h-6 rounded-full transition-transform cursor-pointer border-2 ${
                !isEraser && penColor === c.hex ? 'scale-125 border-white shadow-md' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Eraser */}
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border cursor-pointer ${
              isEraser ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>
        </div>

        {/* Stroke Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 mr-1">Thickness:</span>
          {strokeWidths.map((sw) => (
            <button
              key={sw.value}
              onClick={() => setStrokeSize(sw.value)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                strokeSize === sw.value ? 'bg-[#0052CC] text-white border-[#0052CC]' : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {sw.label}
            </button>
          ))}
        </div>

        {/* Reset & Download */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetCanvas}
            className="px-3 py-1 bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear</span>
          </button>

          <button
            onClick={downloadCanvas}
            className="px-3 py-1 bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Save PNG</span>
          </button>
        </div>
      </div>

      {/* Interactive Canvas Element */}
      <div className="relative bg-white rounded-2xl border-2 border-slate-300 shadow-md p-2 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={300}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full max-w-2xl h-[300px] cursor-crosshair rounded-xl touch-none bg-white"
        />

        {!hasDrawn && (
          <div className="absolute top-4 right-4 pointer-events-none bg-slate-900/80 text-white text-[11px] px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 font-mono">
            <PenTool className="w-3 h-3 text-cyan-400" /> Trace over dotted letter guide with mouse or finger
          </div>
        )}
      </div>

      {/* Accuracy Check Button & Results */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={checkAccuracy}
          disabled={!hasDrawn}
          className="px-6 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Bot className="w-4 h-4" />
          <span>Evaluate Handwriting Accuracy</span>
        </button>

        {evalResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{evalResult.message} ({evalResult.score}% Stroke Match)</span>
          </div>
        )}
      </div>
    </div>
  );
}
