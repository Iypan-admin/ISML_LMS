"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";

import SuperAdminAppShell from "@/components/super-admin/layout/SuperAdminAppShell";
import FinanceManagerAppShell from "@/components/finance-manager/layout/FinanceManagerAppShell";
import { ToastProvider } from "@/context/ToastContext";
import { CollegeProvider } from "@/context/CollegeContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  if (pathname.startsWith("/super-admin")) {
    return <SuperAdminAppShell>{children}</SuperAdminAppShell>;
  }

  if (pathname.startsWith("/academic-manager")) {
    return <>{children}</>;
  }

  if (pathname.startsWith("/tutor")) {
    return <>{children}</>;
  }

  if (pathname.startsWith("/parent")) {
    return <>{children}</>;
  }

  if (pathname.startsWith("/college-admin")) {
    return <>{children}</>;
  }

  if (pathname.startsWith("/finance-manager")) {
    return <FinanceManagerAppShell>{children}</FinanceManagerAppShell>;
  }

  return (
    <CollegeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased w-full max-w-full overflow-x-hidden relative">
          {/* Desktop Navy Sidebar — Fixed to Left Viewport */}
          <Sidebar />

          {/* Main Student Portal Content — Offset by Sidebar Width (lg:pl-72) */}
          <div className="flex-1 flex flex-col min-w-0 w-full max-w-full min-h-screen pb-24 lg:pb-0 lg:pl-72 overflow-x-hidden pt-[53px] lg:pt-0">
            <Header />
            <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
              {children}
            </main>
          </div>

          {/* Mobile-first Bottom Bar & Drawer */}
          <MobileNav />
        </div>
      </ToastProvider>
    </CollegeProvider>
  );
}
