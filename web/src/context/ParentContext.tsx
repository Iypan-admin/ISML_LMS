// ============================================================================
// ISML COLLEGE LMS — PARENT CONTEXT PROVIDER
// Multi-child selection, active ward switching, parent profile & alerts
// ============================================================================

"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import { mockParentUser, ParentProfile, StudentChild } from '@/mock/parentData';

interface ParentContextType {
  parent: ParentProfile;
  selectedChild: StudentChild;
  selectedChildId: string;
  selectChild: (childId: string) => void;
  allChildren: StudentChild[];
  switchChild: (index: number) => void;
}

const ParentContext = createContext<ParentContextType | null>(null);

export function ParentProvider({ children }: { children: React.ReactNode }) {
  const [parent, setParent] = useState<ParentProfile>(mockParentUser);
  const [selectedChildId, setSelectedChildId] = useState<string>(
    mockParentUser.linkedChildren[0]?.id || ''
  );

  const selectedChild = useMemo(() => {
    return (
      parent.linkedChildren.find((c) => c.id === selectedChildId) ||
      parent.linkedChildren[0]
    );
  }, [parent, selectedChildId]);

  const selectChild = (childId: string) => {
    setSelectedChildId(childId);
  };

  const switchChild = (index: number) => {
    if (parent.linkedChildren[index]) {
      setSelectedChildId(parent.linkedChildren[index].id);
    }
  };

  return (
    <ParentContext.Provider
      value={{
        parent,
        selectedChild,
        selectedChildId,
        selectChild,
        allChildren: parent.linkedChildren,
        switchChild,
      }}
    >
      {children}
    </ParentContext.Provider>
  );
}

export function useParent() {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
}
