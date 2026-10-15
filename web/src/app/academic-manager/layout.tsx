import type { Metadata } from 'next';
import AcademicManagerAppShell from '@/components/academic-manager/layout/AcademicManagerAppShell';

export const metadata: Metadata = {
  title: 'Academic Manager Portal — ISML College LMS',
  description: 'Enterprise Academic Management System: Departments, Programs, Courses Builder, Batches, Live Classes, Recorded Sessions & Attendance',
};

export default function AcademicManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AcademicManagerAppShell>{children}</AcademicManagerAppShell>;
}
