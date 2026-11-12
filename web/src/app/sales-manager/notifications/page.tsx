// ============================================================================
// ISML COLLEGE LMS — SALES & ADMISSIONS NOTIFICATIONS PAGE
// ============================================================================

"use client";

import React from 'react';
import NotificationsHubView from '@/components/common/NotificationsHubView';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function SalesManagerNotificationsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Institutional Growth', href: '/sales-manager/dashboard' }, { label: 'Notifications' }]} />
      <NotificationsHubView
        portalName="Admissions & Institutional Growth"
        portalRole="Regional Partnerships Lead"
        portalKey="SALES"
        primaryColor="#0052CC"
      />
    </div>
  );
}

