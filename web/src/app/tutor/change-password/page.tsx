"use client";

import UniversalChangePasswordView from '@/components/common/UniversalChangePasswordView';

export default function TutorChangePasswordPage() {
  return (
    <UniversalChangePasswordView
      portalRole="TUTOR"
      portalTitle="Faculty & Tutor Portal"
      defaultBreadcrumbParent="Teaching Profile"
      accentColor="#0052CC"
    />
  );
}

