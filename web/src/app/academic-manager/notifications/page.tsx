// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER NOTIFICATIONS PAGE
// ============================================================================

"use client";

import React from 'react';
import NotificationsHubView from '@/components/common/NotificationsHubView';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function AcademicManagerNotificationsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Academic Overview', href: '/academic-manager/dashboard' }, { label: 'Notifications' }]} />
      <NotificationsHubView
        portalName="Academic Manager"
        portalRole="Academic Coordinator"
        portalKey="ACADEMIC"
        primaryColor="#0052CC"
      />
    </div>
  );
}
