"use client";

import UniversalChangePasswordView from '@/components/common/UniversalChangePasswordView';

export default function StudentChangePasswordPage() {
  return (
    <UniversalChangePasswordView
      portalRole="STUDENT"
      portalTitle="Student Learning Portal"
      defaultBreadcrumbParent="My Account"
      accentColor="#0891B2"
    />
  );
}

