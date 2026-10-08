// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN APP SHELL
// Layout Container with AuthRbacProvider, Route Protection Guard & Responsive Frame
// ============================================================================

"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthRbacProvider, useRbac } from '@/context/AuthRbacContext';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminHeader from './SuperAdminHeader';
import SuperAdminMobileNav from './SuperAdminMobileNav';
import AccessDenied from '@/components/common/AccessDenied';
import { findMenuByRoute } from '@/config/menu';

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { canAccessRoute } = useRbac();

  const isAllowed = canAccessRoute(pathname);
  const activeMenu = findMenuByRoute(pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased w-full relative">
      {/* Desktop Navy Sidebar — Fixed to Left Viewport (100vh) */}
      <SuperAdminSidebar />

      {/* Main Administrative Workplace — Offset by Sidebar Width (lg:pl-72) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-24 lg:pb-0 lg:pl-72">
        <SuperAdminHeader />
        
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {!isAllowed ? (
            <AccessDenied
              requiredPermissionName={activeMenu?.requiredPermissions.join(', ')}
              customMessage={`You need administrative authorization to access the ${activeMenu?.label || 'requested'} module.`}
            />
          ) : (
            children
          )}
        </main>
      </div>

      {/* Mobile-first Bottom Bar & Drawer */}
      <SuperAdminMobileNav />
    </div>
  );
}

import { ToastProvider } from '@/context/ToastContext';
import { CollegeProvider } from '@/context/CollegeContext';

export default function SuperAdminAppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthRbacProvider>
      <CollegeProvider>
        <ToastProvider>
          <ShellContent>{children}</ShellContent>
        </ToastProvider>
      </CollegeProvider>
    </AuthRbacProvider>
  );
}
