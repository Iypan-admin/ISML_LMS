// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN NOTIFICATIONS & BROADCAST CENTER
// ============================================================================

"use client";

import React from 'react';
import NotificationsHubView from '@/components/common/NotificationsHubView';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function SuperAdminNotificationsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'System Administration', href: '/super-admin/dashboard' }, { label: 'Notifications' }]} />
      <NotificationsHubView
        portalName="Super Admin"
        portalRole="Global Platform Administrator"
        portalKey="SUPER_ADMIN"
        primaryColor="#0052CC"
      />
    </div>
  );
}
