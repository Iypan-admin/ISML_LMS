"use client";

import UniversalChangePasswordView from '@/components/common/UniversalChangePasswordView';

export default function FinanceManagerChangePasswordPage() {
  return (
    <UniversalChangePasswordView
      portalRole="FINANCE_MANAGER"
      portalTitle="Finance Management Portal"
      defaultBreadcrumbParent="Institutional Finance"
      accentColor="#059669"
    />
  );
}

