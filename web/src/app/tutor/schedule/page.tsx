"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RemovedSchedulePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tutor/live-classes');
  }, [router]);

  return (
    <div className="p-8 text-center text-slate-500">
      <p>Redirecting to Live Classroom Hub...</p>
    </div>
  );
}
