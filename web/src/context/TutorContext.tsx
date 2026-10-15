// ============================================================================
// ISML COLLEGE LMS — TUTOR / FACULTY CONTEXT & ALLOCATION ENGINE
// Simulates Multi-Role Faculty Profiles (Marie, Kenji, Anandhakumar, Priya, etc.)
// Dynamic Permissions: LEAD_TRAINER, SUBSTITUTE_TUTOR, DOUBT_SOLVING_TUTOR, ASSISTANT_TUTOR
// ============================================================================

"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  FacultyMember,
  FacultyAllocationItem,
  TutorRoleType,
  mockFacultyMembers,
  mockFacultyAllocations,
} from '@/mock/facultyAssignments';

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
  // Default to Jay (fac-jay) who has French A1 Lead, A2/A3 Substitute, B1 Doubt Clearance
  const [activeFacultyId, setActiveFacultyId] = useState<string>('fac-jay');
  const [activeRoleFilter, setActiveRoleFilter] = useState<'ALL' | TutorRoleType>('ALL');

  const currentFaculty = useMemo(() => {
    return mockFacultyMembers.find((f) => f.id === activeFacultyId) || mockFacultyMembers[0];
  }, [activeFacultyId]);

  // All allocations where this faculty is assigned across different batches
  const myAllocations = useMemo(() => {
    return mockFacultyAllocations.filter((alloc) => alloc.facultyId === activeFacultyId);
  }, [activeFacultyId]);

  // Role Checker per Batch
  const getTutorRoleForBatch = (batchId: string): TutorRoleType | null => {
    const alloc = myAllocations.find((a) => a.batchId === batchId);
    return alloc ? alloc.tutorRole : null;
  };

  // Rule: ONLY Lead Trainer or active Substitute Standby can start live classes!
  const canStartLiveClassForBatch = (batchId: string): boolean => {
    const role = getTutorRoleForBatch(batchId);
    return role === 'LEAD_TRAINER' || role === 'SUBSTITUTE_TUTOR';
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
        allFacultyList: mockFacultyMembers,
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
