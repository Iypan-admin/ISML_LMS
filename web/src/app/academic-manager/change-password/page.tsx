"use client";

import UniversalChangePasswordView from '@/components/common/UniversalChangePasswordView';

export default function AcademicManagerChangePasswordPage() {
  return (
    <UniversalChangePasswordView
      portalRole="ACADEMIC_MANAGER"
      portalTitle="Academic Management Hub"
      defaultBreadcrumbParent="Academic Leadership"
      accentColor="#0284C7"
    />
  );
}

