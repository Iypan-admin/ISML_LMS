import type { Metadata } from 'next';
import TutorAppShell from '@/components/tutor/layout/TutorAppShell';

export const metadata: Metadata = {
  title: 'Tutor / Faculty Portal — ISML College LMS',
  description: 'Master Tutor Teaching Hub: Multi-Role Batches, Live Classes, Attendance Marking, Doubt Clearance, Assignments & Assessments',
};

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TutorAppShell>{children}</TutorAppShell>;
}
