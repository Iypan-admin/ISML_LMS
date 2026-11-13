"use client";

import UniversalChangePasswordView from '@/components/common/UniversalChangePasswordView';

export default function SchoolAdminChangePasswordPage() {
  return (
    <UniversalChangePasswordView
      portalRole="SCHOOL_ADMIN"
      portalTitle="School Administration Portal"
      defaultBreadcrumbParent="School Operations"
      accentColor="#0D9488"
    />
  );
}

