"use client";

import UniversalChangePasswordView from '@/components/common/UniversalChangePasswordView';

export default function SalesManagerChangePasswordPage() {
  return (
    <UniversalChangePasswordView
      portalRole="SALES_MANAGER"
      portalTitle="Sales & Admissions Command"
      defaultBreadcrumbParent="Admissions & MoUs"
      accentColor="#E11D48"
    />
  );
}

