"use client";

import UniversalChangePasswordView from '@/components/common/UniversalChangePasswordView';

export default function SuperAdminChangePasswordPage() {
  return (
    <UniversalChangePasswordView
      portalRole="SUPER_ADMIN"
      portalTitle="Super Admin Governance Portal"
      defaultBreadcrumbParent="System Administration"
      accentColor="#4F46E5"
    />
  );
}

