"use client";

import UniversalChangePasswordView from '@/components/common/UniversalChangePasswordView';

export default function CollegeAdminChangePasswordPage() {
  return (
    <UniversalChangePasswordView
      portalRole="COLLEGE_ADMIN"
      portalTitle="College Administration Portal"
      defaultBreadcrumbParent="Campus Operations"
      accentColor="#2563EB"
    />
  );
}

