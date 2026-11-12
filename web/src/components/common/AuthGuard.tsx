"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Public unauthenticated routes
const PUBLIC_ROUTES = ["/login", "/register", "/auth/login"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isPublic = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
    if (isPublic) {
      setAuthorized(true);
      return;
    }

    try {
      const stored = localStorage.getItem("isml_user");
      if (!stored) {
        setAuthorized(false);
        const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        window.location.href = redirectUrl;
        return;
      }

      const user = JSON.parse(stored);
      if (!user || (!user.email && !user.role && !user.id)) {
        setAuthorized(false);
        window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
        return;
      }

      setAuthorized(true);
    } catch (e) {
      setAuthorized(false);
      window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
    }
  }, [pathname, router]);

  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
  if (!isPublic && !authorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
