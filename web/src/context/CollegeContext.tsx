// ============================================================================
// ISML COLLEGE LMS — INSTITUTION & COLLEGE SCOPING CONTEXT
// Global state for filtering and scoping across Super Admin modules
// Default is 'ALL' ("Overall / All Colleges")
// ============================================================================

"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Institution } from '@/types/rbac';
import { mockInstitutions } from '@/mock/superAdminData';

export const OVERALL_COLLEGE_ID = 'ALL';

interface CollegeContextType {
  selectedCollegeId: string;
  setSelectedCollegeId: (id: string) => void;
  selectedCollege: Institution | null;
  isOverall: boolean;
  institutions: Institution[];
  getCollegeName: (id?: string) => string;
  totalInstitutionsCount: number;
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export function CollegeProvider({ children }: { children: React.ReactNode }) {
  // Always initialize with OVERALL_COLLEGE_ID so server SSR matches initial client render
  const [selectedCollegeId, setSelectedCollegeIdState] = useState<string>(OVERALL_COLLEGE_ID);

  // Sync saved localStorage on mount without causing hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem('isml_superadmin_college_scope');
      if (saved && saved !== OVERALL_COLLEGE_ID) {
        setSelectedCollegeIdState(saved);
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const setSelectedCollegeId = (id: string) => {
    setSelectedCollegeIdState(id);
    try {
      localStorage.setItem('isml_superadmin_college_scope', id);
    } catch {
      // Ignore
    }
  };

  const institutions = mockInstitutions;

  const selectedCollege = useMemo(() => {
    if (selectedCollegeId === OVERALL_COLLEGE_ID) return null;
    return institutions.find((inst) => inst.id === selectedCollegeId) || null;
  }, [selectedCollegeId, institutions]);

  const isOverall = selectedCollegeId === OVERALL_COLLEGE_ID;

  const getCollegeName = (id?: string) => {
    if (!id || id === OVERALL_COLLEGE_ID) return 'Overall (All Colleges)';
    const found = institutions.find((inst) => inst.id === id);
    return found ? found.name : 'Unknown College';
  };

  return (
    <CollegeContext.Provider
      value={{
        selectedCollegeId,
        setSelectedCollegeId,
        selectedCollege,
        isOverall,
        institutions,
        getCollegeName,
        totalInstitutionsCount: institutions.length,
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
}

export function useCollege() {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
}
