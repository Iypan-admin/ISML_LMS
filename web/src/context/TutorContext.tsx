// ============================================================================
// ISML COLLEGE LMS — TUTOR / FACULTY CONTEXT & ALLOCATION ENGINE
// Simulates Multi-Role Faculty Profiles (Marie, Kenji, Anandhakumar, Priya, etc.)
// Dynamic Permissions: LEAD_TRAINER, SUBSTITUTE_TUTOR, DOUBT_SOLVING_TUTOR, ASSISTANT_TUTOR
// ============================================================================

"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  FacultyMember,
  FacultyAllocationItem,
  TutorRoleType,
  DEFAULT_FACULTY_FALLBACK,
} from '@/mock/facultyAssignments';
import { fastFetch } from '@/lib/fastCache';

interface TutorContextType {
  activeFacultyId: string;
  setActiveFacultyId: (id: string) => void;
  currentFaculty: FacultyMember;
  allFacultyList: FacultyMember[];
  myAllocations: FacultyAllocationItem[];
  
  // Active Duty Filter (ALL vs LEAD vs SUBSTITUTE vs DOUBT vs ASSISTANT)
  activeRoleFilter: 'ALL' | TutorRoleType;
  setActiveRoleFilter: (role: 'ALL' | TutorRoleType) => void;
  
  // Specific Batch Permission Resolver
  canStartLiveClassForBatch: (batchId: string) => boolean;
  canMarkAttendanceForBatch: (batchId: string) => boolean;
  canGradeAssignmentsForBatch: (batchId: string) => boolean;
  canAnswerDoubtsForBatch: (batchId: string) => boolean;
  getTutorRoleForBatch: (batchId: string) => TutorRoleType | null;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export function TutorProvider({ children }: { children: React.ReactNode }) {
  const [activeFacultyId, setActiveFacultyId] = useState<string>('');
  const [activeRoleFilter, setActiveRoleFilter] = useState<'ALL' | TutorRoleType>('ALL');
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [allAllocations, setAllAllocations] = useState<FacultyAllocationItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Initial Load: Check logged in user from localStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem('isml_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.id) {
          setActiveFacultyId(u.id);
        }
      }
    } catch {}
  }, []);

  // 2. Fetch live faculty and allocations from API with 0ms fast cache
  const fetchFacultyData = useCallback(async () => {
    fastFetch('/api/portals/faculty', (json) => {
      if (json) {
        const facs: FacultyMember[] = json.data || [];
        const allocs: FacultyAllocationItem[] = json.allocations || [];
        setFacultyList(facs);
        setAllAllocations(allocs);

        // If no active faculty is set, or current id not in list, auto-select matching user
        setActiveFacultyId((prev) => {
          if (prev && facs.some((f) => f.id === prev || f.email.toLowerCase() === prev.toLowerCase())) {
            return prev;
          }
          try {
            const stored = localStorage.getItem('isml_user');
            if (stored) {
              const u = JSON.parse(stored);
              const found = facs.find((f) => f.id === u.id || f.email?.toLowerCase() === u.email?.toLowerCase());
              if (found) return found.id;
            }
          } catch {}
          return facs[0]?.id || prev;
        });
      }
    });
  }, []);

  useEffect(() => {
    fetchFacultyData();

    // Instant SSE Realtime synchronization
    const handleRealtime = (e: any) => {
      const type = e?.detail?.type;
      if (
        type === 'FACULTY_ASSIGNED' ||
        type === 'COURSES_UPDATED' ||
        type === 'BATCHES_UPDATED' ||
        type === 'APPROVAL_REVIEWED'
      ) {
        console.log('⚡ [Tutor Context] Realtime Event Detected:', type);
        fetchFacultyData();
      }
    };

    window.addEventListener('isml-realtime-event', handleRealtime);

    return () => {
      window.removeEventListener('isml-realtime-event', handleRealtime);
    };
  }, [fetchFacultyData]);

  const currentFaculty: FacultyMember = useMemo(() => {
    if (!isMounted) {
      return DEFAULT_FACULTY_FALLBACK;
    }

    const found = facultyList.find((f) => f.id === activeFacultyId);
    if (found) return found;

    // Check if logged in user in localStorage
    try {
      const stored = localStorage.getItem('isml_user');
      if (stored) {
        const u = JSON.parse(stored);
        const fallback: FacultyMember = {
          id: u.id || 'fac-user',
          name: u.name || 'Tutor Faculty',
          designation: 'Native Language Faculty',
          email: u.email || 'tutor@isml.edu',
          mobile: '+91 98401 00000',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          primaryLanguage: 'FRENCH',
          qualification: 'Certified Language Specialist',
          experienceYears: 5,
          nativeCountry: 'France',
          status: 'ACTIVE',
          activeBatchesCount: 0,
          assignedRoles: ['LEAD_TRAINER'],
          weeklyHoursLimit: 20,
          allocatedHours: 0,
        };
        return fallback;
      }
    } catch {}

    return facultyList[0] || DEFAULT_FACULTY_FALLBACK;
  }, [activeFacultyId, facultyList, isMounted]);

  // All allocations where this faculty is assigned across different batches
  const myAllocations = useMemo(() => {
    const currentName = (currentFaculty.name || '').toLowerCase().trim();
    const currentEmail = (currentFaculty.email || '').toLowerCase().trim();
    const currentId = currentFaculty.id;

    return allAllocations.filter((alloc) => {
      const aId = alloc.facultyId;
      const aName = (alloc.facultyName || '').toLowerCase().trim();
      return (
        aId === currentId ||
        (currentName && aName === currentName) ||
        (currentName && aName.includes(currentName)) ||
        (currentName && currentName.includes(aName))
      );
    });
  }, [allAllocations, currentFaculty]);

  // Role Checker per Batch
  const getTutorRoleForBatch = (batchId: string): TutorRoleType | null => {
    const alloc = myAllocations.find((a) => a.batchId === batchId);
    return alloc ? alloc.tutorRole : null;
  };

  // Rule: EXCLUSIVELY Lead Native Trainer can start and end live studio broadcasts!
  const canStartLiveClassForBatch = (batchId: string): boolean => {
    const role = getTutorRoleForBatch(batchId);
    return role === 'LEAD_TRAINER';
  };

  // Rule: Lead Trainer and Substitute can mark formal attendance; Assistant can view/take roll-call if permitted
  const canMarkAttendanceForBatch = (batchId: string): boolean => {
    const role = getTutorRoleForBatch(batchId);
    return role === 'LEAD_TRAINER' || role === 'SUBSTITUTE_TUTOR' || role === 'ASSISTANT_TUTOR';
  };

  // Rule: Assistant and Lead can evaluate & grade homework
  const canGradeAssignmentsForBatch = (batchId: string): boolean => {
    const role = getTutorRoleForBatch(batchId);
    return role === 'LEAD_TRAINER' || role === 'ASSISTANT_TUTOR';
  };

  // Rule: Doubt Solver and Lead can answer student doubt threads
  const canAnswerDoubtsForBatch = (batchId: string): boolean => {
    const role = getTutorRoleForBatch(batchId);
    return role === 'LEAD_TRAINER' || role === 'DOUBT_SOLVING_TUTOR';
  };

  return (
    <TutorContext.Provider
      value={{
        activeFacultyId,
        setActiveFacultyId,
        currentFaculty,
        allFacultyList: facultyList,
        myAllocations,
        activeRoleFilter,
        setActiveRoleFilter,
        canStartLiveClassForBatch,
        canMarkAttendanceForBatch,
        canGradeAssignmentsForBatch,
        canAnswerDoubtsForBatch,
        getTutorRoleForBatch,
      }}
    >
      {children}
    </TutorContext.Provider>
  );
}

export function useTutor() {
  const context = useContext(TutorContext);
  if (!context) {
    throw new Error('useTutor must be used within a TutorProvider');
  }
  return context;
}
