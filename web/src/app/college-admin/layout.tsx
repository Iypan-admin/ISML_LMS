// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN ROOT LAYOUT
// ============================================================================

import React from 'react';
import type { Metadata } from 'next';
import CollegeAdminAppShell from '@/components/college-admin/layout/CollegeAdminAppShell';
import { ToastProvider } from '@/context/ToastContext';
import { CollegeProvider } from '@/context/CollegeContext';
import { AuthRbacProvider } from '@/context/AuthRbacContext';

export const metadata: Metadata = {
  title: 'College Admin Portal — ISML Campus Management',
  description: 'Campus Student Enrollment, Bulk Fees Pay & Access Unlock, Batch Timetables and Attendance Management',
  icons: {
    icon: '/logo.png',
  },
};

export default function CollegeAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthRbacProvider>
      <CollegeProvider>
        <ToastProvider>
          <CollegeAdminAppShell>{children}</CollegeAdminAppShell>
        </ToastProvider>
      </CollegeProvider>
    </AuthRbacProvider>
  );
}
