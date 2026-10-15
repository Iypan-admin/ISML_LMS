import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finance Manager Portal — ISML College LMS',
  description: 'Enterprise Campus Finance & Fee Collection Portal with Online Fee Verification, Surcharges & Approvals',
  icons: {
    icon: '/logo.png',
  },
};

export default function FinanceManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
