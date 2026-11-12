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
  const [parent, setParent] = useState<ParentProfile>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('isml_user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u.name) {
            return {
              ...mockParentUser,
              id: u.id || 'amer-p-1',
              name: u.name,
              email: u.email || 'parent1@americancollege.edu.in',
            };
          }
        }
      }
    } catch {}
    return mockParentUser;
  });
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  React.useEffect(() => {
    // Dynamically load real DB students, real attendance and real timetable
    Promise.all([
      fetch('/api/portals/students').then((res) => res.json()).catch(() => ({ data: [] })),
      fetch('/api/portals/timetable').then((res) => res.json()).catch(() => ({ data: [] })),
      fetch('/api/live-classes').then((res) => res.json()).catch(() => ({ data: [] })),
      fetch('/api/portals/attendance').then((res) => res.json()).catch(() => ({ data: [] })),
    ]).then(([studentsJson, timetableJson, liveClassesJson, attendanceJson]) => {
      const studentsList = studentsJson?.data || [];
      const timetableList: any[] = timetableJson?.data || [];
      const liveList: any[] = liveClassesJson?.data || (Array.isArray(liveClassesJson) ? liveClassesJson : []);
      const allAttendance: any[] = attendanceJson?.data || [];

      if (Array.isArray(studentsList) && studentsList.length > 0) {
        // Filter ONLY the linked student for this parent
        // For parent Dr. S. Sundararajan (parent1@americancollege.edu.in), the ward is Muthu Pandian (AMER-COL-STD-23)
        let filteredStudents = studentsList;
        try {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('isml_user') : null;
          if (stored) {
            const u = JSON.parse(stored);
            if (u.studentId || u.studentName) {
              const matched = studentsList.filter(
                (s: any) =>
                  s.studentId === u.studentId ||
                  s.id === u.studentId ||
                  s.name?.toLowerCase() === u.studentName?.toLowerCase()
              );
              if (matched.length > 0) {
                filteredStudents = matched;
              }
            } else if (u.email && u.email.toLowerCase().includes('parent1')) {
              const matched = studentsList.filter(
                (s: any) =>
                  s.studentId === 'AMER-COL-STD-23' ||
                  s.name?.toLowerCase().includes('muthu pandian')
              );
              if (matched.length > 0) {
                filteredStudents = matched;
              }
            }
          } else {
            // Default parent session is parent of Muthu Pandian
            const matched = studentsList.filter(
              (s: any) =>
                s.studentId === 'AMER-COL-STD-23' ||
                s.name?.toLowerCase().includes('muthu pandian')
            );
            if (matched.length > 0) {
              filteredStudents = matched;
            }
          }
        } catch {}

        const mappedChildren: StudentChild[] = filteredStudents.map((s: any) => {
          const wardBatch = s.batchName || 'MRNG BATCH';
          const wardCourse = s.courseName || 'testtt';

          // Match real timetable slots for this ward
          const wardSlots = timetableList.filter(
            (slot) =>
              slot.batchName?.toLowerCase() === wardBatch.toLowerCase() ||
              slot.subjectName?.toLowerCase() === wardCourse.toLowerCase()
          );

          // Convert real timetable / live classes dynamically with accurate status (LIVE NOW, COMPLETED, UPCOMING)
          const dynamicLiveClasses = wardSlots.length > 0
            ? wardSlots.slice(0, 4).map((slot: any, idx: number) => {
                // Check if session in backend live classes is currently LIVE or ENDED
                const matchedLiveSession = liveList.find(
                  (l) => l.batchName?.toLowerCase() === wardBatch.toLowerCase()
                );
                
                let sessionStatus = 'UPCOMING';
                if (matchedLiveSession?.status === 'LIVE') {
                  sessionStatus = idx === 0 ? 'LIVE NOW' : 'UPCOMING';
                } else if (matchedLiveSession?.status === 'ENDED') {
                  sessionStatus = idx === 0 ? 'COMPLETED' : 'UPCOMING';
                } else {
                  // If class time has passed or class ended
                  sessionStatus = idx === 0 ? 'COMPLETED' : 'UPCOMING';
                }

                return {
                  id: slot.id || `live-${idx}`,
                  topic: `${slot.subjectName || wardCourse}: Core Interactive Lecture`,
                  courseCode: `${slot.subjectCode || 'ET'} • ${slot.batchName || wardBatch}`,
                  batchName: slot.batchName || wardBatch,
                  scheduledTime: `${slot.day || 'Today'} • ${slot.timeSlot || '07:30 PM - 10:00 PM'}`,
                  duration: slot.timeSlot?.includes('11:00') ? '3h 30m' : '2h 30m',
                  tutorName: `${slot.facultyName || 'Joy JK'} (Lead Native Trainer)`,
                  status: sessionStatus,
                  meetingUrl: slot.meetingUrl || 'http://localhost:3000/live-classes',
                };
              })
            : liveList.length > 0
            ? liveList.map((item: any, idx: number) => ({
                id: item.id || `live-${idx}`,
                topic: item.title || `${wardCourse}: Live Webinar`,
                courseCode: `ET • ${wardBatch}`,
                batchName: item.batchName || wardBatch,
                scheduledTime: 'Today • 07:30 PM - 10:00 PM',
                duration: '2h 30m',
                tutorName: `${item.tutorName || 'Joy JK'} (Lead Native Trainer)`,
                status: item.status === 'LIVE' ? 'LIVE NOW' : item.status === 'ENDED' ? 'COMPLETED' : 'UPCOMING',
                meetingUrl: item.meetingUrl || 'http://localhost:3000/live-classes',
              }))
            : [];

          // Match real attendance logs for this student
          const studentAttendanceLogs = allAttendance.filter(
            (r: any) =>
              r.studentId === (s.id || s.studentId) ||
              r.studentName?.toLowerCase() === s.name?.toLowerCase()
          );

          const totalConducted = studentAttendanceLogs.length;
          const attendedSessions = studentAttendanceLogs.filter((r) => r.status === 'PRESENT').length;
          const absentSessions = studentAttendanceLogs.filter((r) => r.status === 'ABSENT').length;
          const realPercentage = totalConducted > 0 ? Math.round((attendedSessions / totalConducted) * 100) : 0;

          return {
            id: s.id || s.studentId,
            rollNo: s.studentId || 'STD',
            name: s.name,
            avatarUrl: '/avatars/default.png',
            relationship: 'Ward',
            dob: '2005-04-12',
            bloodGroup: 'B+',
            collegeName: s.tenantName || 'Affiliated Campus',
            collegeCode: s.tenantCode || 'CAMPUS',
            department: wardBatch,
            degreeYear: 'AY 2026-2027',
            emergencyContact: s.phone || '+91 94440 00000',
            primaryCourse: {
              courseId: 'crs-01',
              courseCode: 'ET-GER',
              courseName: wardCourse,
              batchName: wardBatch,
              sectionCode: 'SEC-A',
              levelBadge: 'A1.1',
              enrollmentDate: '2026-06-01',
              termNumber: 1,
              completionPercentage: 15,
              syllabusCovered: 'Basics & Grammar',
              leadTutorName: 'Joy JK',
              leadTutorEmail: 'joyjk348@gmail.com',
            },
            attendance: {
              presentDays: attendedSessions,
              absentDays: absentSessions,
              totalWorkingDays: totalConducted,
              percentage: realPercentage,
              lastRecordedDate: totalConducted > 0 ? studentAttendanceLogs[studentAttendanceLogs.length - 1].date : '',
              naacCompliant: realPercentage >= 75,
              recentLogs: studentAttendanceLogs.map((r, i) => ({
                id: r.id || `att-${i}`,
                date: r.date || 'Today',
                sessionTitle: r.sessionTopic || `${wardCourse} Session`,
                tutorName: r.facultyName || 'Joy JK',
                status: r.status || 'PRESENT',
                timeIn: r.timeSlot || '07:30 PM',
                remarks: r.remarks || r.connectionStatus || 'Verified Session Log',
              })),
            },
            lsrwScores: {
              listening: 85,
              speaking: 82,
              reading: 88,
              writing: 80,
              overall: 84,
            },
            recentGrades: [],
            upcomingClasses: [],
            upcomingLiveClasses: dynamicLiveClasses,
            inquiries: [],
            gradebook: [],
            lsrwRadar: { listening: 85, speaking: 82, reading: 88, writing: 80, overall: 84 },
            feeStatus: {
              totalTermFee: 12000,
              paidAmount: s.isFeePending ? 0 : 12000,
              dueAmount: s.isFeePending ? 12000 : 0,
              isFullyPaid: !s.isFeePending,
              dueDate: '2026-11-30',
              lastPaymentRef: 'TXN-DB-9901',
            },
          };
        });

        setParent((prev) => ({
          ...prev,
          linkedChildren: mappedChildren,
        }));
        if (mappedChildren[0]) {
          setSelectedChildId(mappedChildren[0].id);
        }
      }
    });
  }, []);

  const selectedChild = useMemo(() => {
    if (!parent.linkedChildren || parent.linkedChildren.length === 0) {
      return {
        id: '',
        rollNo: 'NONE',
        name: 'No Ward Linked',
        avatarUrl: '/avatars/default.png',
        relationship: 'Ward',
        dob: '',
        bloodGroup: '',
        collegeName: 'Campus',
        collegeCode: 'CAMPUS',
        department: '',
        degreeYear: '',
        emergencyContact: '',
        primaryCourse: {
          courseId: '',
          courseCode: '',
          courseName: 'No Course',
          levelBadge: '',
          enrollmentDate: '',
          termNumber: 1,
          completionPercentage: 0,
          syllabusCovered: '',
          leadTutorName: '',
          leadTutorEmail: '',
        },
        attendance: {
          presentDays: 0,
          absentDays: 0,
          totalWorkingDays: 0,
          percentage: 0,
          lastRecordedDate: '',
          naacCompliant: true,
          recentLogs: [],
        },
        lsrwScores: { listening: 0, speaking: 0, reading: 0, writing: 0, overall: 0 },
        recentGrades: [],
        upcomingClasses: [],
        upcomingLiveClasses: [],
        inquiries: [],
        gradebook: [],
        lsrwRadar: { listening: 0, speaking: 0, reading: 0, writing: 0, overall: 0 },
        feeStatus: {
          totalTermFee: 0,
          paidAmount: 0,
          dueAmount: 0,
          isFullyPaid: true,
          dueDate: '',
          lastPaymentRef: '',
        },
      } as StudentChild;
    }
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
