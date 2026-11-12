"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * MobileBackHandler
 * Prevents mobile back button or browser back gesture from accidentally
 * popping back to /login or /auth/login and logging the user out.
 * When on a root dashboard page, back button stays constant on that dashboard.
 */
export default function MobileBackHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const lastPathRef = useRef(pathname);

  useEffect(() => {
    lastPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // Only apply in client environment
    if (typeof window === "undefined") return;

    // Do not interfere if user intentionally visited login or register page
    const isAuth = pathname === "/login" || pathname === "/auth/login" || pathname === "/register";
    if (isAuth) return;

    // Check if the current route is a dashboard home
    const isDashboardRoot =
      pathname === "/dashboard" ||
      pathname === "/super-admin/dashboard" ||
      pathname === "/academic-manager/dashboard" ||
      pathname === "/tutor/dashboard" ||
      pathname === "/parent/dashboard" ||
      pathname === "/college-admin/dashboard" ||
      pathname === "/school-admin/dashboard" ||
      pathname === "/finance-manager/dashboard" ||
      pathname === "/sales-manager/dashboard";

    const handlePopState = (e: PopStateEvent) => {
      // Check if user is logged in
      let loggedInUser: any = null;
      try {
        const stored = localStorage.getItem("isml_user");
        if (stored) loggedInUser = JSON.parse(stored);
      } catch {}

      const nextTarget = window.location.pathname;

      // If user popped back into /login or / but has active session
      if (loggedInUser && (nextTarget === "/login" || nextTarget === "/auth/login" || nextTarget === "/")) {
        const targetPortal = loggedInUser.portalRoute || "/dashboard";
        // Push state forward to lock back stack and redirect to dashboard
        window.history.pushState({ locked: true }, "", targetPortal);
        router.replace(targetPortal);
        return;
      }

      // If already on a dashboard root and user presses mobile back, keep user firmly on dashboard
      if (isDashboardRoot && loggedInUser) {
        window.history.pushState({ dashboardStay: true }, "", pathname);
      }
    };

    // Prime history state when entering dashboard so initial pop doesn't fall out of portal
    if (isDashboardRoot) {
      window.history.pushState({ dashboardStay: true }, "", pathname);
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname, router]);

  return null;
}

