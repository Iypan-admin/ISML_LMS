// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER NOTIFICATIONS PAGE
// ============================================================================

"use client";

import React from 'react';
import NotificationsHubView from '@/components/common/NotificationsHubView';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function FinanceManagerNotificationsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Finance Desk', href: '/finance-manager/dashboard' }, { label: 'Notifications' }]} />
      <NotificationsHubView
        portalName="Finance Desk"
        portalRole="Finance Controller"
        portalKey="FINANCE"
        primaryColor="#0052CC"
      />
    </div>
  );
}

