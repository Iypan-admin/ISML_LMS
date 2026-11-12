"use client";

import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Square,
  Circle,
  Download,
  Palette,
  Eye,
} from 'lucide-react';

interface InteractiveWhiteboardProps {
  classId: string;
  isHost: boolean;
  onStrokeBroadcast?: (stroke: any) => void;
  onBackToGrid?: () => void;
}

export default function InteractiveWhiteboard({
  classId,
  isHost,
  onStrokeBroadcast,
  onBackToGrid,
}: InteractiveWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#0f172a');
  const [brushSize, setBrushSize] = useState(3);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-resize canvas to match real bounding client width and height with Retina scale
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
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
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
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

  // Sync with remote strokes received via SSE
  useEffect(() => {
    const handleStroke = (e: any) => {
      const detail = e?.detail;
      if (detail?.type === 'WHITEBOARD_STROKE' && detail?.payload?.classId === classId) {
        const { x0, y0, x1, y1, strokeColor, strokeWidth, isEraser } = detail.payload.stroke;
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = container.getBoundingClientRect();

        ctx.save();
        ctx.strokeStyle = isEraser ? '#ffffff' : strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x0 * rect.width, y0 * rect.height);
        ctx.lineTo(x1 * rect.width, y1 * rect.height);
        ctx.stroke();
        ctx.restore();
      }
    };

    window.addEventListener('isml-realtime-event', handleStroke);
    return () => window.removeEventListener('isml-realtime-event', handleStroke);
  }, [classId]);

  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Exact 1:1 Pixel Mapping Coordinate Resolver
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    return {
      pixelX: x,
      pixelY: y,
      ratioX: x / rect.width,
      ratioY: y / rect.height,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isHost) return;
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (!coords) return;
    lastPos.current = { x: coords.ratioX, y: coords.ratioY };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x * rect.width, lastPos.current.y * rect.height);
      ctx.lineTo(coords.ratioX * rect.width, coords.ratioY * rect.height);
      ctx.stroke();
      ctx.restore();
    }

    const strokeData = {
      x0: lastPos.current.x,
      y0: lastPos.current.y,
      x1: coords.ratioX,
      y1: coords.ratioY,
      strokeColor: color,
      strokeWidth: brushSize,
      isEraser: tool === 'eraser',
    };

    fetch(`https://ismllms-production.up.railway.app/api/live-classes/${classId}/whiteboard-stroke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stroke: strokeData }),
    }).catch(() => {});

    lastPos.current = { x: coords.ratioX, y: coords.ratioY };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    if (!isHost || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden relative border border-slate-300 shadow-2xl select-none">
      {/* Top Professional Toolbar */}
      <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs z-10 shadow-xs">
        <div className="flex items-center gap-2">
          {onBackToGrid && (
            <button
              onClick={onBackToGrid}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-slate-700 active:scale-95"
              title="Return to Video Grid"
            >
              <span>← Back to Video Grid</span>
            </button>
          )}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-[#0052CC] font-bold text-xs border border-blue-200">
            <PenTool className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>Interactive Whiteboard</span>
          </span>
          {!isHost && (
            <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
              <Eye className="w-3 h-3 text-blue-600" />
              <span>Learner View</span>
            </span>
          )}
        </div>

        {isHost && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTool('pen')}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                tool === 'pen' ? 'bg-[#0052CC] text-white border-blue-700 shadow-xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Pen Tool"
            >
              <PenTool className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                tool === 'eraser' ? 'bg-rose-600 text-white border-rose-700 shadow-xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>

            {/* Marker Color Pickers (Black, Blue, Red, Green, Purple) */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-300 rounded-lg shadow-2xs">
              {['#0f172a', '#0052cc', '#dc2626', '#16a34a', '#7c3aed'].map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setTool('pen'); }}
                  className="w-4 h-4 rounded-full border border-black/20 cursor-pointer transition-transform"
                  style={{
                    backgroundColor: c,
                    transform: color === c ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: color === c ? '0 0 0 2px #fff, 0 0 0 3px #0052cc' : 'none',
                  }}
                />
              ))}
            </div>

            <button
              onClick={clearCanvas}
              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300 transition-colors cursor-pointer"
              title="Clear Whiteboard"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Pure Crisp White Canvas Stage */}
      <div ref={containerRef} className="flex-1 relative w-full h-full bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 block cursor-crosshair touch-none bg-white"
        />
      </div>
    </div>
  );
}

