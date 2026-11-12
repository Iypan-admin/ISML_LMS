"use client";

import React, { useRef, useState, useEffect } from 'react';
import {
  FileText,
  Volume2,
  Video,
  ExternalLink,
  X,
  FileCheck2,
  PenTool,
  Eraser,
  RotateCcw,
} from 'lucide-react';

interface SharedContentStageProps {
  content: {
    type: 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'WHITEBOARD' | 'NONE';
    title: string;
    url?: string;
    senderName?: string;
  };
  isHost: boolean;
  onClose?: () => void;
  classId?: string;
}

export default function SharedContentStage({
  content,
  isHost,
  onClose,
  classId,
}: SharedContentStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#dc2626'); // High-contrast Red pen for document review by default
  const [annotateMode, setAnnotateMode] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(3.5);

  // Auto-resize canvas to match real bounding client width and height with Retina scale
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Save content before resize
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Restore previous content scaled
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
          ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Broadcast or sync marks across tutor & learners via SSE
  useEffect(() => {
    const handleStroke = (e: any) => {
      try {
        const detail = e?.detail;
        if (detail?.type === 'WHITEBOARD_STROKE' && (!classId || detail?.payload?.classId === classId)) {
          const payload = detail?.payload;
          if (!payload) return;

          const stroke = payload?.stroke || (payload?.x0 !== undefined ? payload : null);
          if (!stroke || typeof stroke !== 'object' || stroke.x0 === undefined || stroke.y0 === undefined) {
            return;
          }

          const { x0, y0, x1, y1, strokeColor, strokeWidth, isEraser } = stroke;
          const canvas = canvasRef.current;
          const container = containerRef.current;
          if (!canvas || !container) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const rect = canvas.getBoundingClientRect();
          ctx.save();
          ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
          ctx.strokeStyle = strokeColor || '#dc2626';
          ctx.lineWidth = strokeWidth || 3.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(x0 * rect.width, y0 * rect.height);
          ctx.lineTo(x1 * rect.width, y1 * rect.height);
          ctx.stroke();
          ctx.restore();
        }
      } catch (err) {
        console.warn('Silent fallback for whiteboard stroke sync event:', err);
      }
    };

    window.addEventListener('isml-realtime-event', handleStroke);
    return () => window.removeEventListener('isml-realtime-event', handleStroke);
  }, [classId]);

  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const strokeBufferRef = useRef<{ x0: number; y0: number; x1: number; y1: number }[]>([]);
  const broadcastThrottleRef = useRef<number>(0);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { pixelX: 0, pixelY: 0, ratioX: 0, ratioY: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const pixelX = clientX - rect.left;
    const pixelY = clientY - rect.top;
    return {
      pixelX,
      pixelY,
      ratioX: rect.width > 0 ? pixelX / rect.width : 0,
      ratioY: rect.height > 0 ? pixelY / rect.height : 0,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isHost || !annotateMode) return;
    setIsDrawing(true);
    const pos = getCanvasPos(e);
    lastPos.current = { x: pos.pixelX, y: pos.pixelY };

    // Draw single dot on click
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.pixelX, pos.pixelY, tool === 'eraser' ? 14 : brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPos.current || !isHost || !annotateMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getCanvasPos(e);
    const rect = canvas.getBoundingClientRect();

    const prevX = lastPos.current.x;
    const prevY = lastPos.current.y;
    const currX = currentPos.pixelX;
    const currY = currentPos.pixelY;

    ctx.save();
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === 'eraser' ? 28 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.stroke();
    ctx.restore();

    // Broadcast smooth stroke ratio coordinates to learners with throttle
    if (classId && rect.width > 0 && rect.height > 0) {
      const strokeData = {
        x0: prevX / rect.width,
        y0: prevY / rect.height,
        x1: currX / rect.width,
        y1: currY / rect.height,
        strokeColor: color,
        strokeWidth: tool === 'eraser' ? 28 : brushSize,
        isEraser: tool === 'eraser',
      };
      
      const now = Date.now();
      if (now - broadcastThrottleRef.current > 40) {
        broadcastThrottleRef.current = now;
        fetch(`http://localhost:4000/api/live-classes/${classId}/whiteboard-stroke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(strokeData),
        }).catch(() => {});
      }
    }

    lastPos.current = { x: currX, y: currY };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearAnnotationCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!content || content.type === 'NONE') return null;

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-b border-white/10 flex items-center justify-between text-xs text-white z-20">
        <div className="flex items-center gap-2 truncate">
          <span className="p-1 rounded bg-blue-500/20 text-cyan-400">
            {content.type === 'DOCUMENT' && <FileText className="w-4 h-4" />}
            {content.type === 'AUDIO' && <Volume2 className="w-4 h-4" />}
            {content.type === 'VIDEO' && <Video className="w-4 h-4" />}
          </span>
          <span className="font-bold truncate">{content.title}</span>
          <span className="text-[10px] text-slate-400">Shared by {content.senderName}</span>
        </div>

        {/* Live Document Annotation Controls for Tutor */}
        {content.type === 'DOCUMENT' && isHost && (
          <div className="flex items-center gap-2">
            {/* Toggle Scroll (Browse / Read) vs Draw (Annotate) Mode */}
            <button
              onClick={() => setAnnotateMode(!annotateMode)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                !annotateMode
                  ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/50'
                  : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/15'
              }`}
              title={!annotateMode ? 'Scroll Mode Active (Use mouse/scroll bar to scroll)' : 'Switch to Scroll Mode to scroll page'}
            >
              <span>{annotateMode ? '👆 Enable Scroll' : '✅ Scrolling Enabled'}</span>
            </button>

            <button
              onClick={() => { setTool('pen'); setAnnotateMode(true); }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                tool === 'pen' && annotateMode ? 'bg-[#0052CC] text-white border-blue-700 shadow-xs' : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/15'
              }`}
              title="Draw / Mark Document"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-bold">Pen</span>
            </button>
            <button
              onClick={() => { setTool('eraser'); setAnnotateMode(true); }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                tool === 'eraser' && annotateMode ? 'bg-rose-600 text-white border-rose-700 shadow-xs' : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/15'
              }`}
              title="Erase Markings"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-bold">Eraser</span>
            </button>

            {/* Color picker pills */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg border border-white/20">
              {[
                { hex: '#dc2626', label: 'Red' },
                { hex: '#0052cc', label: 'Blue' },
                { hex: '#16a34a', label: 'Green' },
                { hex: '#eab308', label: 'Yellow Highlight' },
              ].map(({ hex, label }) => (
                <button
                  key={hex}
                  onClick={() => { setColor(hex); setTool('pen'); setAnnotateMode(true); }}
                  className="w-4 h-4 rounded-full cursor-pointer transition-transform hover:scale-125"
                  title={label}
                  style={{
                    backgroundColor: hex,
                    transform: color === hex && tool === 'pen' ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: color === hex && tool === 'pen' ? '0 0 0 2px #fff, 0 0 6px rgba(0,0,0,0.5)' : 'none',
                  }}
                />
              ))}
            </div>

            {/* Thickness selector */}
            <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-lg border border-white/20">
              {[
                { size: 2.5, label: 'Fine' },
                { size: 4.5, label: 'Medium' },
                { size: 8, label: 'Thick' },
              ].map(({ size, label }) => (
                <button
                  key={size}
                  onClick={() => { setBrushSize(size); setAnnotateMode(true); }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                    brushSize === size ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                  title={`${label} Stroke (${size}px)`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={clearAnnotationCanvas}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/20 transition-colors cursor-pointer"
              title="Clear Markings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isHost && onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Stop Sharing Content"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content Viewer with Transparent Transparent Drawing Layer */}
      <div ref={containerRef} className="flex-1 bg-slate-950 flex items-center justify-center p-2 relative overflow-hidden">
        {/* PDF / PPT / Document Viewer */}
        {content.type === 'DOCUMENT' && (
          <div className="w-full h-full flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-white/10 relative">
            {content.url ? (
              <object
                data={content.url.startsWith('data:') ? content.url : `${content.url}#toolbar=0`}
                type="application/pdf"
                className="w-full h-full border-0 rounded-lg bg-white"
              >
                <iframe
                  src={content.url.startsWith('data:') ? content.url : `${content.url}#toolbar=0`}
                  className="w-full h-full border-0 rounded-lg bg-white"
                  title={content.title}
                />
              </object>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white">{content.title}</h4>
                <p className="text-xs text-slate-400">
                  Interactive lecture courseware & slides synchronized across student screens.
                </p>
              </div>
            )}

            {/* Transparent Interactive Drawing Overlay Canvas (Over PDF) */}
            {/* Note: Leaves 20px pointer margin on far right when not annotating so scrollbar is directly accessible */}
            <canvas
              ref={canvasRef}
              id="live-doc-annotation-canvas"
              data-type="annotation-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className={`absolute inset-0 z-10 w-full h-full cursor-crosshair ${
                annotateMode ? 'pointer-events-auto touch-none' : 'pointer-events-none'
              }`}
            />
          </div>
        )}

        {/* Audio Player (Listening Drill / Pronunciation) */}
        {content.type === 'AUDIO' && (
          <div className="w-full max-w-lg p-6 bg-slate-900 rounded-2xl border border-white/10 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Volume2 className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{content.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Native Phonetics & Listening Drill Audio</p>
            </div>
            <audio
              controls
              className="w-full rounded-lg"
              src={content.url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
            />
          </div>
        )}

        {/* Video Player */}
        {content.type === 'VIDEO' && (
          <div className="w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
            <video
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-full rounded-lg"
              src={content.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
            />
          </div>
        )}
      </div>
    </div>
  );
}

