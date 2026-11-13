"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RemovedAssessmentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tutor/assignments');
  }, [router]);

  return (
    <div className="p-8 text-center text-slate-500">
      <p>Redirecting to Assignments & Homework...</p>
    </div>
  );
}
