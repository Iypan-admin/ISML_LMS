// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN NOTIFICATIONS PAGE
// ============================================================================

"use client";

import React from 'react';
import NotificationsHubView from '@/components/common/NotificationsHubView';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function CollegeAdminNotificationsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'College Admin', href: '/college-admin/dashboard' }, { label: 'Notifications' }]} />
      <NotificationsHubView
        portalName="College Admin"
        portalRole="Campus Administrator"
        portalKey="COLLEGE_ADMIN"
        primaryColor="#0052CC"
      />
    </div>
  );
}

