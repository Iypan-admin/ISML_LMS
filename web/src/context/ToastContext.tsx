// ============================================================================
// ISML COLLEGE LMS — TOAST NOTIFICATION SYSTEM
// Non-intrusive, animated, accessible feedback toasts (Replaces native alerts)
// ============================================================================

"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const showSuccess = useCallback((message: string, title = 'Action Approved') => {
    addToast('SUCCESS', message, title);
  }, [addToast]);

  const showError = useCallback((message: string, title = 'Error') => {
    addToast('ERROR', message, title);
  }, [addToast]);

  const showWarning = useCallback((message: string, title = 'Warning') => {
    addToast('WARNING', message, title);
  }, [addToast]);

  const showInfo = useCallback((message: string, title = 'Information') => {
    addToast('INFO', message, title);
  }, [addToast]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{ showSuccess, showError, showWarning, showInfo, dismissToast }}
    >
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2 font-sans">
        {toasts.map((toast) => {
          const config = {
            SUCCESS: {
              icon: CheckCircle2,
              bg: 'bg-white',
              border: 'border-emerald-200',
              text: 'text-emerald-700',
              badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            },
            ERROR: {
              icon: AlertCircle,
              bg: 'bg-white',
              border: 'border-rose-200',
              text: 'text-rose-700',
              badge: 'bg-rose-50 text-rose-700 border-rose-200',
            },
            WARNING: {
              icon: AlertTriangle,
              bg: 'bg-white',
              border: 'border-amber-200',
              text: 'text-amber-700',
              badge: 'bg-amber-50 text-amber-700 border-amber-200',
            },
            INFO: {
              icon: Info,
              bg: 'bg-white',
              border: 'border-blue-200',
              text: 'text-[#0052CC]',
              badge: 'bg-blue-50 text-[#0052CC] border-blue-200',
            },
          }[toast.type];

          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 rounded-xl border ${config.border} ${config.bg} shadow-xl flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2 fade-in duration-200`}
            >
              <div className={`p-1.5 rounded-lg border ${config.badge} shrink-0 mt-0.5`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-xs font-bold text-[#0B2447] leading-none mb-1">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 leading-snug">{toast.message}</p>
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer shrink-0"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
