// ============================================================================
// ISML COLLEGE LMS — STUDENT NOTIFICATIONS PAGE
// ============================================================================

"use client";

import React from 'react';
import NotificationsHubView from '@/components/common/NotificationsHubView';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function StudentNotificationsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Student Desk', href: '/dashboard' }, { label: 'Notifications' }]} />
      <NotificationsHubView
        portalName="Student Desk"
        portalRole="Foreign Language Learner"
        portalKey="STUDENT"
        primaryColor="#0052CC"
      />
    </div>
  );
}
