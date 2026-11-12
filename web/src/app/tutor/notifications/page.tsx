// ============================================================================
// ISML COLLEGE LMS — TUTOR / FACULTY NOTIFICATIONS PAGE
// ============================================================================

"use client";

import React from 'react';
import NotificationsHubView from '@/components/common/NotificationsHubView';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function TutorNotificationsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Tutor Portal', href: '/tutor/dashboard' }, { label: 'Notifications' }]} />
      <NotificationsHubView
        portalName="Faculty & Tutor"
        portalRole="Master Language Trainer"
        portalKey="TUTOR"
        primaryColor="#7C3AED"
      />
    </div>
  );
}

