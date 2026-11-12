// ============================================================================
// ISML SCHOOL LMS — SCHOOL ADMIN (PRINCIPAL DESK) LAYOUT
// ============================================================================

import React from 'react';
import SchoolAdminAppShell from '@/components/school-admin/layout/SchoolAdminAppShell';
import { ToastProvider } from '@/context/ToastContext';
import { AuthRbacProvider } from '@/context/AuthRbacContext';

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthRbacProvider>
      <ToastProvider>
        <SchoolAdminAppShell>{children}</SchoolAdminAppShell>
      </ToastProvider>
    </AuthRbacProvider>
  );
}

