import type { Metadata } from 'next';
import SalesManagerAppShell from '@/components/sales-manager/layout/SalesManagerAppShell';

export const metadata: Metadata = {
  title: 'Sales & Admissions Portal — ISML College & School LMS',
  description: 'Enterprise Admissions CRM: School vs College Registration Desks, Public Forms, Lead Pipeline & Fee Collections',
};

export default function SalesManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SalesManagerAppShell>{children}</SalesManagerAppShell>;
}
