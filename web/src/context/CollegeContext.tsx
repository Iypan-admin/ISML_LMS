// ============================================================================
// ISML COLLEGE LMS — INSTITUTION & COLLEGE SCOPING CONTEXT
// Global state for filtering and scoping across Super Admin modules
// Default is 'ALL' ("Overall / All Colleges")
// ============================================================================

"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { fastFetch } from '@/lib/fastCache';
import { Institution } from '@/types/rbac';
import { mockInstitutions } from '@/mock/superAdminData';

export const OVERALL_COLLEGE_ID = 'ALL';

export type InstitutionCategory = 'COLLEGE' | 'SCHOOL' | 'ALL';

interface CollegeContextType {
  selectedCollegeId: string;
  setSelectedCollegeId: (id: string) => void;
  selectedCollege: Institution | null;
  isOverall: boolean;
  institutionCategory: InstitutionCategory;
  setInstitutionCategory: (cat: InstitutionCategory) => void;
  institutions: Institution[];
  filteredInstitutions: Institution[];
  getCollegeName: (id?: string) => string;
  totalInstitutionsCount: number;
  isSchoolMode: boolean;
  isCollegeMode: boolean;
  labels: {
    institution: string;
    institutionPlural: string;
    course: string;
    coursePlural: string;
    batch: string;
    batchPlural: string;
    academicTerm: string;
    student: string;
    studentPlural: string;
    faculty: string;
  };
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export function CollegeProvider({ children }: { children: React.ReactNode }) {
  // Always initialize with OVERALL_COLLEGE_ID so server SSR matches initial client render
  const [selectedCollegeId, setSelectedCollegeIdState] = useState<string>(OVERALL_COLLEGE_ID);
  const [institutionCategory, setInstitutionCategoryState] = useState<InstitutionCategory>('COLLEGE');

  // Sync saved localStorage on mount without causing hydration mismatch
  useEffect(() => {
    try {
      const savedScope = localStorage.getItem('isml_superadmin_college_scope');
      if (savedScope && savedScope !== OVERALL_COLLEGE_ID) {
        setSelectedCollegeIdState(savedScope);
      }
      const savedCategory = localStorage.getItem('isml_superadmin_institution_category') as InstitutionCategory;
      if (savedCategory && (savedCategory === 'COLLEGE' || savedCategory === 'SCHOOL' || savedCategory === 'ALL')) {
        setInstitutionCategoryState(savedCategory);
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

  const setInstitutionCategory = (cat: InstitutionCategory) => {
    setInstitutionCategoryState(cat);
    // When switching category, if current selection doesn't match the new category, reset to OVERALL
    if (selectedCollegeId !== OVERALL_COLLEGE_ID) {
      const current = mockInstitutions.find((i) => i.id === selectedCollegeId);
      if (current) {
        const matches = cat === 'ALL' || (cat === 'SCHOOL' ? current.type === 'SCHOOL' : current.type !== 'SCHOOL');
        if (!matches) {
          setSelectedCollegeId(OVERALL_COLLEGE_ID);
        }
      }
    }
    try {
      localStorage.setItem('isml_superadmin_institution_category', cat);
    } catch {
      // Ignore
    }
  };

  const [institutions, setInstitutions] = useState<Institution[]>([]);

  // Fetch only real institutions from Supabase Database on load with instant 0ms Fast Cache
  useEffect(() => {
    fastFetch('/api/portals/institutions', (json) => {
      if (json?.data && Array.isArray(json.data)) {
        const mapped: Institution[] = json.data.map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          displayName: item.displayName || item.name,
          city: 'Tamil Nadu',
          state: 'TN',
          country: 'India',
          status: item.status || 'ACTIVE',
          type: (item.code?.includes('DPS') || item.code?.includes('SCH') || item.name?.toLowerCase().includes('school')) ? 'SCHOOL' : 'COLLEGE',
          universityAffiliation: 'Partner Campus',
          naacAccreditation: 'NAAC A++',
          studentsCount: 0,
          facultyCount: 0,
          departmentsCount: 0,
          batchesCount: 0,
          coursesCount: 0,
          activeAcademicYear: '2026-2027',
          logoUrl: '/logo.png',
          primaryColor: '#0052CC',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        setInstitutions(mapped);
      }
    });
  }, []);

  const filteredInstitutions = useMemo(() => {
    if (institutionCategory === 'ALL') return institutions;
    if (institutionCategory === 'SCHOOL') {
      return institutions.filter((i) => i.type === 'SCHOOL');
    }
    return institutions.filter((i) => i.type !== 'SCHOOL');
  }, [institutions, institutionCategory]);

  const selectedCollege = useMemo(() => {
    if (selectedCollegeId === OVERALL_COLLEGE_ID) return null;
    return institutions.find((inst) => inst.id === selectedCollegeId) || null;
  }, [selectedCollegeId, institutions]);

  const isOverall = selectedCollegeId === OVERALL_COLLEGE_ID;

  // Determine whether active scope is School Mode
  const isSchoolMode = useMemo(() => {
    if (selectedCollege) {
      return selectedCollege.type === 'SCHOOL';
    }
    return institutionCategory === 'SCHOOL';
  }, [selectedCollege, institutionCategory]);

  const isCollegeMode = !isSchoolMode;

  const labels = useMemo(() => {
    if (isSchoolMode) {
      return {
        institution: 'School',
        institutionPlural: 'Schools',
        course: 'Grade / Subject',
        coursePlural: 'Grades & Subjects',
        batch: 'Class Section',
        batchPlural: 'Sections & Classes',
        academicTerm: 'Term / Academic Year',
        student: 'Student / Pupil',
        studentPlural: 'Students',
        faculty: 'School Teacher',
      };
    }
    return {
      institution: 'College',
      institutionPlural: 'Colleges',
      course: 'Course',
      coursePlural: 'Courses',
      batch: 'Batch',
      batchPlural: 'Batches',
      academicTerm: 'Semester',
      student: 'Student',
      studentPlural: 'Students',
      faculty: 'Faculty / Professor',
    };
  }, [isSchoolMode]);

  const getCollegeName = (id?: string) => {
    if (!id || id === OVERALL_COLLEGE_ID) {
      return institutionCategory === 'SCHOOL' ? 'Overall (All Schools)' : 'Overall (All Colleges)';
    }
    const found = institutions.find((inst) => inst.id === id);
    return found ? found.name : 'Unknown Campus';
  };

  return (
    <CollegeContext.Provider
      value={{
        selectedCollegeId,
        setSelectedCollegeId,
        selectedCollege,
        isOverall,
        institutionCategory,
        setInstitutionCategory,
        institutions,
        filteredInstitutions,
        getCollegeName,
        totalInstitutionsCount: filteredInstitutions.length,
        isSchoolMode,
        isCollegeMode,
        labels,
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
