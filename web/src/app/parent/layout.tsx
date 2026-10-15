import React from 'react';
import ParentAppShell from '@/components/parent/layout/ParentAppShell';

export const metadata = {
  title: 'Parent Oversight Portal | ISML College LMS',
  description: 'Multi-ward academic monitoring, attendance, live classes, marks & fee ledgers for Parents & Guardians.',
};

export default function ParentRootLayout({ children }: { children: React.ReactNode }) {
  return <ParentAppShell>{children}</ParentAppShell>;
}
