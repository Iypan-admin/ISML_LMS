import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Admin Portal — ISML College LMS',
  description: 'Enterprise College LMS Super Administrator Portal with RBAC & Academic Hierarchy Management',
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
