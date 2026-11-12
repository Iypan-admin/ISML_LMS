'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { soundNotification } from '@/lib/soundNotification';
import { notificationStore } from '@/services/notificationStore';
import { prefetchAllPortalData } from '@/lib/fastCache';

type RealtimeCallback = (payload: any) => void;

interface RealtimeSyncContextType {
  subscribe: (eventType: string, callback: RealtimeCallback) => () => void;
  triggerWebhook: (eventType: string, data?: any) => Promise<void>;
}

const RealtimeSyncContext = createContext<RealtimeSyncContextType | null>(null);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export function RealtimeSyncProvider({ children }: { children: React.ReactNode }) {
  const listenersRef = useRef<Map<string, Set<RealtimeCallback>>>(new Map());

  useEffect(() => {
    soundNotification.initUserInteraction();
    prefetchAllPortalData();
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let broadcastChannel: BroadcastChannel | null = null;

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('isml-realtime-channel');
        broadcastChannel.onmessage = (bcEvent) => {
          const { type, payload } = bcEvent.data || {};
          if (type) {
            console.log(`⚡ [BroadcastChannel] Local Instant Sync: ${type}`);
            window.dispatchEvent(new CustomEvent('isml-realtime-event', { detail: { type, payload } }));
          }
        };
      }
    } catch {}

    const connectSSE = () => {
      try {
        eventSource = new EventSource(`${BACKEND_URL}/api/portals/stream`);

        eventSource.onopen = () => {
          console.log('⚡ [ISML Realtime SSE] Connected to backend live stream');
        };

        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            const { type, payload } = parsed || {};

            if (type && type !== 'PING' && type !== 'CONNECTED') {
              console.log(`📡 [ISML Live Event] Received: ${type}`, payload);

              // 🔊 High-Fidelity 0ms Instant Audio Alert for all users in real time
              if (
                type === 'APPROVAL_SUBMITTED' ||
                type === 'APPROVAL_REVIEWED' ||
                type === 'ADMISSION_REGISTERED' ||
                type === 'INSTITUTION_REGISTERED'
              ) {
                soundNotification.playHighChime();

                // Record into reactive Notification Store with origin portal details
                if (type === 'APPROVAL_SUBMITTED') {
                  const req = payload || {};
                  const isStudent = req.requestType === 'STUDENT_ADMISSION' || req.entityType === 'STUDENT';
                  const isInst = req.requestType === 'INSTITUTION_CREATION' || req.entityType === 'INSTITUTION';
                  const isBatch = req.entityType === 'BATCH';
                  const isCourse = req.entityType === 'COURSE';
                  const isLive = req.entityType === 'LIVE_CLASS';
                  const isFee = req.module === 'Finance';
                  
                  const targetModule = isStudent ? 'ADMISSION' : isInst ? 'INSTITUTION' : isBatch ? 'BATCH' : isCourse ? 'COURSE' : isLive ? 'LIVE_CLASS' : isFee ? 'FEES' : 'COURSE';
                  const source = isStudent ? 'Student Public Registration' : isInst ? 'College/School MoU Desk' : isFee ? 'Finance Portal' : isLive ? 'Tutor Desk' : 'Academic Desk';
                  const adminName = req.requestedByUserId || req.submittedPayload?.submittedBy?.name || 'Academic Manager';
                  const adminRole = req.submittedPayload?.submittedBy?.role || (isFee ? 'Finance Manager' : 'Academic Coordinator');

                  notificationStore.addNotification({
                    title: req.title || req.entityName || (isStudent ? 'Student Admission' : isInst ? 'Institution Onboarding' : `Approval Request`),
                    message: `${req.title || req.entityName || req.id} submitted for executive authorization.`,
                    type: 'APPROVAL_REQUEST',
                    category: 'URGENT',
                    sourcePortal: source,
                    targetModule,
                    submittedBy: {
                      name: adminName,
                      role: adminRole,
                    },
                    institutionName: req.institutionName || req.submittedPayload?.institutionName,
                    actionUrl: '/super-admin/approvals',
                    metadata: req,
                  });
                } else if (type === 'APPROVAL_REVIEWED') {
                  const req = payload?.item || payload || {};
                  notificationStore.addNotification({
                    title: `Request ${payload?.action || 'Reviewed'}`,
                    message: `Request ${payload?.id || req.id} was ${payload?.action || 'reviewed'} by Super Admin.`,
                    type: 'APPROVAL_REVIEWED',
                    category: payload?.action === 'APPROVED' ? 'SUCCESS' : 'INFO',
                    sourcePortal: 'Executive Authorization Hub',
                    actionUrl: '/super-admin/approvals',
                    metadata: req,
                  });
                }
              }

              // Dispatch DOM window event for any standard listener
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('isml-realtime-event', {
                  detail: { type, payload }
                }));

                // Broadcast to other open tabs instantaneously
                if (broadcastChannel) {
                  broadcastChannel.postMessage({ type, payload });
                }
              }

              // Notify subscribers for this specific event type
              const callbacks = listenersRef.current.get(type);
              if (callbacks) {
                callbacks.forEach((cb) => {
                  try {
                    cb(payload);
                  } catch (err) {
                    console.error(`Error executing realtime callback for ${type}:`, err);
                  }
                });
              }

              // Also trigger wildcards if registered
              const wildcardCallbacks = listenersRef.current.get('*');
              if (wildcardCallbacks) {
                wildcardCallbacks.forEach((cb) => cb({ type, payload }));
              }
            }
          } catch (e) {
            console.error('Failed to parse SSE payload:', e);
          }
        };

        eventSource.onerror = () => {
          console.warn('⚠️ [ISML Realtime SSE] Stream connection interrupted. Reconnecting in 3s...');
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        console.error('SSE initialization error:', err);
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(connectSSE, 4000);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const subscribe = (eventType: string, callback: RealtimeCallback) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)!.add(callback);

    // Return unbind function
    return () => {
      const set = listenersRef.current.get(eventType);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          listenersRef.current.delete(eventType);
        }
      }
    };
  };

  const triggerWebhook = async (eventType: string, data?: any) => {
    try {
      await fetch(`${BACKEND_URL}/api/portals/webhook/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, data }),
      });
    } catch (e) {
      console.error('Trigger webhook failed:', e);
    }
  };

  return (
    <RealtimeSyncContext.Provider value={{ subscribe, triggerWebhook }}>
      {children}
    </RealtimeSyncContext.Provider>
  );
}

export function useRealtimeStream(eventType?: string, callback?: RealtimeCallback) {
  const context = useContext(RealtimeSyncContext);

  useEffect(() => {
    if (!context || !eventType || !callback) return;
    const unsubscribe = context.subscribe(eventType, callback);
    return () => {
      unsubscribe();
    };
  }, [context, eventType, callback]);

  return context;
}
