// ============================================================================
// ISML ENTERPRISE NOTIFICATIONS STORE & REALTIME DISPATCHER
// Reactive, synchronized across tabs (BroadcastChannel), live audio feedback
// Role-based / Portal-targeted notifications with instant chime audio
// ============================================================================

import { soundNotification } from '@/lib/soundNotification';

export type PortalTargetKey =
  | 'ALL'
  | 'SUPER_ADMIN'
  | 'ACADEMIC'
  | 'COLLEGE_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'TUTOR'
  | 'FINANCE'
  | 'SALES'
  | 'PARENT'
  | 'STUDENT';

export interface LiveNotification {
  id: string;
  title: string;
  message: string;
  type: 'APPROVAL_REQUEST' | 'APPROVAL_REVIEWED' | 'ADMISSION' | 'INSTITUTION' | 'SYSTEM' | 'ANNOUNCEMENT';
  category: 'URGENT' | 'NORMAL' | 'SUCCESS' | 'INFO';
  sourcePortal: string;
  targetPortals?: PortalTargetKey[]; // Which portals should receive this notification
  timestamp: string;
  actionUrl?: string;
  isRead: boolean;
  metadata?: any;
  targetModule?: 'BATCH' | 'COURSE' | 'LIVE_CLASS' | 'FEES' | 'ADMISSION' | 'INSTITUTION' | 'SYSTEM';
  submittedBy?: {
    name: string;
    role: string;
  };
  institutionName?: string;
  institutionId?: string;
}

const STORAGE_KEY = 'isml_enterprise_notifications';

// Clean initial portal-specific notifications
const DEFAULT_ALERTS: LiveNotification[] = [
  {
    id: 'notif-batch-active-1',
    title: 'Batch Authorization Approved: MRNG BATCH',
    message: 'MRNG BATCH cohort has been officially approved & activated by Super Admin.',
    type: 'APPROVAL_REVIEWED',
    category: 'SUCCESS',
    sourcePortal: 'Executive Desk',
    targetPortals: ['ACADEMIC', 'COLLEGE_ADMIN', 'TUTOR', 'SUPER_ADMIN'],
    targetModule: 'BATCH',
    submittedBy: {
      name: 'Super Administrator',
      role: 'Global Platform Head',
    },
    institutionName: 'The American College',
    institutionId: '521323cd-00da-49a6-98ed-6b7918d181b4',
    timestamp: new Date().toISOString(),
    actionUrl: '/academic-manager/batches',
    isRead: false,
  },
  {
    id: 'notif-sales-onboard-1',
    title: 'New Campus Onboarding Initiated: Sivakasi Lions',
    message: 'Sivakasi Lions Matriculation Higher Secondary School onboarding packet submitted.',
    type: 'ADMISSION',
    category: 'INFO',
    sourcePortal: 'Partnerships Desk',
    targetPortals: ['SALES', 'SCHOOL_ADMIN', 'SUPER_ADMIN'],
    targetModule: 'INSTITUTION',
    submittedBy: {
      name: 'Regional Growth Director',
      role: 'Institutional Sales',
    },
    institutionName: 'Sivakasi Lions Matriculation Higher Secondary School',
    institutionId: 'c37b62d5-6ca4-47cb-bed7-899ad75a3144',
    timestamp: new Date().toISOString(),
    actionUrl: '/sales-manager/onboard-institution',
    isRead: false,
  },
  {
    id: 'notif-academic-curriculum-1',
    title: 'Curriculum Published: French Language Track',
    message: 'Curriculum structure, units and lesson objectives synced for AY 2026-2027.',
    type: 'ANNOUNCEMENT',
    category: 'NORMAL',
    sourcePortal: 'Academic Desk',
    targetPortals: ['ACADEMIC', 'COLLEGE_ADMIN', 'SCHOOL_ADMIN', 'TUTOR'],
    targetModule: 'COURSE',
    submittedBy: {
      name: 'Prof. M. K. Sundaram',
      role: 'Academic Coordinator',
    },
    institutionName: 'The American College & Sivakasi Lions School',
    timestamp: new Date().toISOString(),
    actionUrl: '/academic-manager/curriculum',
    isRead: false,
  },
  {
    id: 'notif-tutor-schedule-1',
    title: 'Live Studio Schedule Assigned',
    message: 'You have been allocated as Lead Native Trainer for Monday & Wednesday sessions.',
    type: 'ANNOUNCEMENT',
    category: 'NORMAL',
    sourcePortal: 'Academic Scheduling',
    targetPortals: ['TUTOR'],
    targetModule: 'LIVE_CLASS',
    submittedBy: {
      name: 'Academic Manager',
      role: 'Batch Coordinator',
    },
    institutionName: 'The American College',
    timestamp: new Date().toISOString(),
    actionUrl: '/tutor/schedule',
    isRead: false,
  },
];

class EnterpriseNotificationStore {
  private notifications: LiveNotification[] = [];
  private listeners: Set<() => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.notifications = parsed;
            } else {
              this.notifications = [...DEFAULT_ALERTS];
              this.persist();
            }
          } catch {
            this.notifications = [...DEFAULT_ALERTS];
            this.persist();
          }
        } else {
          this.notifications = [...DEFAULT_ALERTS];
          this.persist();
        }

        // Clean stale legacy mock items if any
        const hasLegacy = this.notifications.some((n) => n.id === 'notif-init-1' || n.title?.includes('Loyola'));
        if (hasLegacy) {
          this.notifications = [...DEFAULT_ALERTS];
          this.persist();
        }

        if ('BroadcastChannel' in window) {
          this.broadcastChannel = new BroadcastChannel('isml_notifications_sync');
          this.broadcastChannel.onmessage = (event) => {
            if (event.data?.type === 'SYNC') {
              this.notifications = event.data.notifications || [];
              this.notify();
            } else if (event.data?.type === 'PLAY_SOUND') {
              try {
                soundNotification.playHighChime();
              } catch {}
            }
          };
        }

        // Window listener for real-time app events
        window.addEventListener('isml-realtime-event', (e: any) => {
          const detail = e.detail;
          if (detail?.type === 'APPROVAL_REVIEWED') {
            const isApproved = detail.action === 'APPROVED';
            this.addNotification({
              title: `Batch Authorization ${isApproved ? 'Approved' : 'Rejected'}`,
              message: `Approval request ${detail.requestId || ''} was ${isApproved ? 'authorized and activated' : 'rejected'} by Super Admin.`,
              type: 'APPROVAL_REVIEWED',
              category: isApproved ? 'SUCCESS' : 'URGENT',
              sourcePortal: 'Super Admin',
              targetPortals: ['ACADEMIC', 'COLLEGE_ADMIN', 'TUTOR', 'SUPER_ADMIN'],
              targetModule: 'BATCH',
              actionUrl: isApproved ? '/academic-manager/batches' : '/super-admin/approvals',
            });
          }
        });
      } catch {
        this.notifications = [...DEFAULT_ALERTS];
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications.slice(0, 50)));
      } catch {}
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'SYNC', notifications: this.notifications });
    }
    this.notify();
  }

  /**
   * Filter notifications tailored for a specific portal
   */
  public getNotificationsForPortal(portalKey?: string): LiveNotification[] {
    if (!portalKey || portalKey === 'ALL' || portalKey === 'SUPER_ADMIN') {
      return [...this.notifications];
    }
    return this.notifications.filter((n) => {
      if (!n.targetPortals || n.targetPortals.length === 0 || n.targetPortals.includes('ALL')) {
        return true;
      }
      return n.targetPortals.includes(portalKey as PortalTargetKey);
    });
  }

  public getUnreadCountForPortal(portalKey?: string): number {
    return this.getNotificationsForPortal(portalKey).filter((n) => !n.isRead).length;
  }

  public getNotifications(): LiveNotification[] {
    return [...this.notifications];
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  public addNotification(
    notif: Omit<LiveNotification, 'id' | 'timestamp' | 'isRead'>,
    options?: { playSound?: boolean }
  ): LiveNotification {
    const newNotif: LiveNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    this.notifications = [newNotif, ...this.notifications];
    this.persist();

    // 🔔 Live Audio Chime Sound Trigger
    if (options?.playSound !== false && typeof window !== 'undefined') {
      try {
        soundNotification.playHighChime();
        if (this.broadcastChannel) {
          this.broadcastChannel.postMessage({ type: 'PLAY_SOUND' });
        }
      } catch {}
    }

    return newNotif;
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.persist();
  }

  public markAllAsRead(portalKey?: string) {
    if (!portalKey || portalKey === 'ALL' || portalKey === 'SUPER_ADMIN') {
      this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    } else {
      const allowedIds = new Set(this.getNotificationsForPortal(portalKey).map((n) => n.id));
      this.notifications = this.notifications.map((n) =>
        allowedIds.has(n.id) ? { ...n, isRead: true } : n
      );
    }
    this.persist();
  }

  public clearNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.persist();
  }

  public clearAll() {
    this.notifications = [];
    this.persist();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {}
    });
  }
}

export const notificationStore = new EnterpriseNotificationStore();
