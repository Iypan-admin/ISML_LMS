// ============================================================================
// ISML COLLEGE LMS — PARENT & GUARDIAN NOTIFICATIONS PAGE
// ============================================================================

"use client";

import React from 'react';
import NotificationsHubView from '@/components/common/NotificationsHubView';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function ParentNotificationsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Parent Portal', href: '/parent/dashboard' }, { label: 'Notifications' }]} />
      <NotificationsHubView
        portalName="Parent Portal"
        portalRole="Parent & Guardian"
        portalKey="PARENT"
        primaryColor="#0052CC"
      />
    </div>
  );
}

