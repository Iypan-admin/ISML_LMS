"use client";

import UniversalChangePasswordView from '@/components/common/UniversalChangePasswordView';

export default function ParentChangePasswordPage() {
  return (
    <UniversalChangePasswordView
      portalRole="PARENT"
      portalTitle="Parent Oversight Portal"
      defaultBreadcrumbParent="Parent Account"
      accentColor="#9333EA"
    />
  );
}

