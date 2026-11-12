// ============================================================================
// ISML COLLEGE LMS — SCHOOL ADMIN NOTIFICATIONS PAGE
// ============================================================================

"use client";

import React from 'react';
import NotificationsHubView from '@/components/common/NotificationsHubView';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function SchoolAdminNotificationsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'School Admin', href: '/school-admin/dashboard' }, { label: 'Notifications' }]} />
      <NotificationsHubView
        portalName="School Admin"
        portalRole="School Principal & Administrator"
        portalKey="SCHOOL_ADMIN"
        primaryColor="#059669"
      />
    </div>
  );
}

