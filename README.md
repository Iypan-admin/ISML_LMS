# ISML LMS v1.0 — B2B Enterprise Foreign Language LMS Infrastructure

[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-blue.svg)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma%20v5%2Fv6-1B222D.svg)](https://www.prisma.io/)
[![pgvector](https://img.shields.io/badge/AI%20Vector-pgvector%201536dim-00D9A5.svg)](https://github.com/pgvector/pgvector)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E.svg)](https://nestjs.com/)
[![Python AI](https://img.shields.io/badge/AI%20Microservice-FastAPI%20%7C%20LangGraph-3776AB.svg)](https://fastapi.tiangolo.com/)
[![LiveKit](https://img.shields.io/badge/LiveStream-LiveKit%20Cloud-0052CC.svg)](https://livekit.io/)
[![Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare%20R2-F38020.svg)](https://www.cloudflare.com/developer-platform/r2/)

---

## 📌 Core Architecture Deliverables & Source Links

The database and system architecture of **ISML LMS v1.0** is fully specified, normalized in 3NF, formatted, and validated. Below are the 3 master reference documents:

| Deliverable | Description | File Link |
| :--- | :--- | :--- |
| **1. Master Prisma Schema** | Complete 195-Model production schema powering PostgreSQL & Supabase `pgvector`. | 📄 [`prisma/schema.prisma`](file:///d:/ISML/ISML_LMS/prisma/schema.prisma) |
| **2. Master ERD Documentation** | Complete ERD with all 36 domain Mermaid diagrams, 1:1 / 1:N / N:M cardinality tables & beginner guide. | 📘 [`ISML_LMS_COMPLETE_ERD_DOCUMENTATION.md`](file:///d:/ISML/ISML_LMS/ISML_LMS_COMPLETE_ERD_DOCUMENTATION.md) |
| **3. Cross-Validation Audit Report** | Architectural audit report (Score 10/10, ZERO critical bugs, ready for database freeze). | 📋 [`ISML_LMS_ERD_PRISMA_CROSS_VALIDATION_REPORT.md`](file:///d:/ISML/ISML_LMS/ISML_LMS_ERD_PRISMA_CROSS_VALIDATION_REPORT.md) |

---

## 📊 System Scale & Inventory Statistics

- **Total Database Models**: `195` (100% Business-Justified & Normalized in 3NF)
- **Total System Enums**: `41`
- **Total Business Modules**: `36`
- **Junction Tables (N:M)**: `14`
- **Vector Search Engine**: `pgvector` (`vector(1536)` OpenAI embeddings)
- **Primary Key Strategy**: UUID v4 across all entities

---

## 🧩 36 Business Modules & Sub-Modules Breakdown

```
+-----------------------------------------------------------------------------------+
|                            ISML LMS MODULE ECOSYSTEM                              |
|                                                                                   |
|  1. Organization & Multi-Tenancy        13. Learning Resource Bank                |
|  2. User Identity & Authentication      14. LSRW - Listening Engine               |
|  3. Dynamic Menu-Based RBAC             15. LSRW - Speaking Engine (Whisper STT)  |
|  4. Core User Profiles                  16. LSRW - Reading Engine                 |
|  5. Foreign Languages Engine            17. LSRW - Writing Engine & Keyboard      |
|  6. Course Architecture Hierarchy       18. Assignments & Grading                 |
|  7. Curriculum & Topics                 19. Question Bank & Tagging               |
|  8. Course Duration Patterns (12/6/3Mo) 20. Exams & Proctoring Engine             |
|  9. Multi-College Batches & Enrollment  21. QR Digital Certificates               |
| 10. Timetable & Conflict Scheduling     22. AI Platform Core Agents               |
| 11. LiveKit Webinar Classrooms          23. AI Request & Token Billing            |
| 12. Cloudflare R2 Recording Pipeline    24. AI Prompts & Tutor Approvals          |
|                                         ... and 12 System & Analytics Modules     |
+-----------------------------------------------------------------------------------+
```

### Detailed Module Breakdown:

1. **Domain 01: Organization & Tenant Management (8 Models)** — `Institutions`, `Campuses`, `Departments`, `AcademicYears`, `InstitutionSettings`, `InstitutionDomains`, `InstitutionSubscriptions`, `InstitutionBranding`
2. **Domain 02: User Identity & Authentication (9 Models)** — `Users`, `UserSessions`, `RefreshTokens`, `OTPVerifications`, `PasswordResetTokens`, `LoginHistory`, `UserDevices`, `UserPreferences`, `EmergencyContacts`
3. **Domain 03: Dynamic Menu-Based RBAC (6 Models)** — `Menus`, `PermissionGroups`, `Permissions`, `Roles`, `RoleMenuVisibility`, `RolePermissions`, `UserRoles`
4. **Domain 04: Core User Profiles (5 Models)** — `StudentProfiles`, `TutorProfiles`, `AssistantTutorProfiles`, `CollegeAdminProfiles`, `SuperAdminProfiles`
5. **Domain 05: Foreign Languages Engine (4 Models)** — `Languages`, `LanguageVariants`, `LanguageProficiencyLevels`, `LanguageSettings`
6. **Domain 06: Course Architecture (8 Models)** — `CourseCategories`, `Courses`, `CourseLevels`, `CourseSubLevels`, `CourseVersions`, `CourseModules`, `CourseUnits`, `Lessons`
7. **Domain 07: Curriculum & Topics (4 Models)** — `Topics`, `TopicItems`, `LearningObjectives`, `CoursePrerequisites`
8. **Domain 08: Course Duration Patterns (3 Models)** — `CourseDurationPatterns`, `PatternSchedules`, `PatternPacingRules`
9. **Domain 09: Batches & Enrollment (6 Models)** — `Batches`, `BatchInstitutions`, `BatchSchedules`, `BatchTutors`, `StudentBatchEnrollments`, `EnrollmentHistory`
10. **Domain 10: Timetable & Scheduling (6 Models)** — `Timetables`, `ScheduleEntries`, `TutorAvailabilities`, `Holidays`, `ScheduleExceptions`, `CalendarEvents`
11. **Domain 11: LiveKit Webinar System (7 Models)** — `LiveClasses`, `LiveSessions`, `LiveKitRooms`, `LiveClassParticipants`, `LiveClassAccessLogs`, `AttendanceSessions`, `ClassEvents`
12. **Domain 12: Cloudflare R2 Recordings (6 Models)** — `Recordings`, `RecordingFiles`, `RecordingVersions`, `RecordingProcessingJobs`, `RecordingAccessLogs`, `RecordingViewingHistory`
13. **Domain 13: Learning Resources (6 Models)** — `Resources`, `ResourceFiles`, `ResourceCategories`, `ResourceVersions`, `ResourceTags`, `LessonResources`
14. **Domain 14: LSRW Listening (4 Models)** — `ListeningActivities`, `ListeningAudios`, `ListeningAttempts`, `ListeningAnswers`
15. **Domain 15: LSRW Speaking & Whisper STT (4 Models)** — `SpeakingActivities`, `SpeakingPrompts`, `SpeakingAudioSubmissions`, `SpeakingAIEvaluations`
16. **Domain 16: LSRW Reading (4 Models)** — `ReadingActivities`, `ReadingPassages`, `ReadingQuestions`, `ReadingAttempts`
17. **Domain 17: LSRW Writing & Accents (5 Models)** — `WritingActivities`, `WritingPrompts`, `WritingSubmissions`, `WritingAIEvaluations`, `VirtualKeyboardConfigs`
18. **Domain 18: Assignments & Grading (5 Models)** — `Assignments`, `AssignmentQuestions`, `AssignmentSubmissions`, `SubmissionFiles`, `AssignmentGradings`
19. **Domain 19: Question Bank (6 Models)** — `QuestionBanks`, `Questions`, `QuestionOptions`, `QuestionExplanations`, `QuestionTags`, `QuestionDifficultyLevels`
20. **Domain 20: Examinations & Proctoring (7 Models)** — `Exams`, `ExamSections`, `ExamSchedules`, `ExamAttempts`, `StudentExamAnswers`, `ExamResults`, `TutorReviews`
21. **Domain 21: Digital Certification (5 Models)** — `CertificateTemplates`, `Certificates`, `CertificateIssuances`, `CertificateVerifications`, `CertificateDownloads`
22. **Domain 22: AI Platform Core (6 Models)** — `AIAgents`, `AgentVersions`, `AgentConfigurations`, `AITasks`, `AIExecutions`, `AIEvaluations`
23. **Domain 23: AI Request & Token Audit (5 Models)** — `AIRequests`, `AIResponses`, `AIProviders`, `AIModels`, `TokenUsageLogs`
24. **Domain 24: AI Content & Approvals (4 Models)** — `PromptTemplates`, `PromptVersions`, `AIGeneratedContents`, `ContentApprovals`
25. **Domain 25: RAG & Vector Search (6 Models)** — `KnowledgeBases`, `KnowledgeSources`, `KnowledgeDocuments`, `DocumentChunks`, `DocumentEmbeddings`, `RAGQueries`
26. **Domain 26: MCP Protocol Integration (4 Models)** — `MCPServers`, `MCPTools`, `MCPConnections`, `MCPExecutionLogs`
27. **Domain 27: Payment Gateway (7 Models)** — `PaymentProviders`, `PaymentOrders`, `PaymentTransactions`, `PaymentAttempts`, `PaymentWebhooks`, `PaymentReceipts`, `Invoices`
28. **Domain 28: Subscriptions & Billing (4 Models)** — `SubscriptionPlans`, `Subscriptions`, `BillingRecords`, `InstitutionPayments`
29. **Domain 29: Multi-Channel Notifications (6 Models)** — `Notifications`, `NotificationTemplates`, `NotificationPreferences`, `NotificationChannels`, `DeliveryLogs`, `NotificationEvents`
30. **Domain 30: Academic Doubt Q&A Chat (5 Models)** — `AcademicConversations`, `AcademicChatMembers`, `AcademicChatMessages`, `DoubtTickets`, `DoubtResponses`
31. **Domain 31: Customer Support (6 Models)** — `SupportTickets`, `TicketCategories`, `TicketMessages`, `TicketAttachments`, `TicketAssignments`, `TicketStatusHistory`
32. **Domain 32: Career Guidance & Jobs (6 Models)** — `CareerPrograms`, `CareerResources`, `Companies`, `JobOpportunities`, `StudentCareerProfiles`, `JobApplications`
33. **Domain 33: Student Progress & Streaks (5 Models)** — `StudentCourseProgress`, `ActivityProgressLogs`, `LSRWProgressSummaries`, `LearningStreaks`, `StudentAchievements`
34. **Domain 34: System Analytics & Reports (4 Models)** — `BatchAnalytics`, `ExamAnalytics`, `AIUsageAnalytics`, `InstitutionReports`
35. **Domain 35: Enterprise Audit Logs (5 Models)** — `AuditLogs`, `LoginLogs`, `SecurityEvents`, `APIAccessLogs`, `PermissionChangeLogs`
36. **Domain 36: System Configurations (3 Models)** — `SystemSettings`, `FeatureFlags`, `MaintenanceWindows`

---

## 🔐 Menu ID-Based Dynamic RBAC Architecture

The system implements a **100% Database-Driven Menu-Based Access Control Architecture**. No roles, menu links, or action permissions are hard-coded in frontend source code!

```
               [Menus Table (Menu ID / Parent-Child Sidebar Tree)]
                                      │
                                      ▼
[Users] ──(1:N)──► [UserRoles] ──(N:M)──► [Roles] ──(N:M)──► [RoleMenuVisibility] (Controls Sidebar UI)
                                            │
                                            └─(N:M)──► [RolePermissions] ──► [Permissions] (Action: CREATE, EXPORT, etc.)
```

### Key Elements of Dynamic RBAC:
1. **`Menus`**: Contains `code` (Unique Menu ID e.g. `MENU_LSRW_SPEAKING`), `route` (`/dashboard/lsrw/speaking`), `menuType` (`MODULE`, `GROUP`, `MENU`, `ACTION`), and self-referential `parentId` for rendering nested sidebar trees.
2. **`RoleMenuVisibility`**: Maps Menu IDs directly to Roles (`roleId`, `menuId`). Toggling a menu ID in the database instantly hides/shows that sidebar tab for all users with that role.
3. **`Permissions`**: Atomic action capabilities (`permissionKey`: `student.export`, `exam.approve`).
4. **`RolePermissions`**: Maps atomic action permissions directly to Roles.

---

## 👥 System & Custom User Roles Matrix

| Role | Role Type | Scope | Key Capabilities & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `SYSTEM` | Global Platform | Full system control, partner institution onboarding, global SaaS analytics. |
| **College Admin / Principal** | `CUSTOM` | Institution Tenant | College portal setup, student bulk import, college staff role assignment. |
| **Main Tutor** | `CUSTOM` | Webinar Batch | Conducts live webinars on LiveKit Cloud, approves AI-generated content. |
| **Substitute Backup Tutor** | `CUSTOM` | Webinar Batch | Standby main tutor ready to take over webinar stream instantly on network failure. |
| **Assistant Doubt Tutor** | `CUSTOM` | College-Assigned | Handles student Q&A chat, clears academic doubt tickets for assigned colleges. |
| **Student** | `SYSTEM` | Enrolled Batches | Attends live webinars, practices LSRW, takes exams, receives QR certificates. |
| **Parent / Guardian** | `SYSTEM` | Linked Student | Views student attendance percentage, LSRW score cards, and exam reports. |

---

## 🛠️ Microservice Technology Stack

- **Core LMS Service**: NestJS (TypeScript), Prisma ORM, PostgreSQL.
- **AI Microservice**: Python FastAPI, LangGraph, LangChain, Pydantic AI, Whisper STT, OpenAI LLM, `pgvector`.
- **Realtime Webinars**: LiveKit Cloud Webhooks & WebRTC.
- **Media Storage**: Cloudflare R2 (24-hour upload SLA & 1-Year access validity).
- **Background Workers**: BullMQ Queue Engine & Redis.
- **Payments**: Razorpay Gateway (Unique `eventId` webhook idempotency).

---

## 🚀 Quick Start / Development Verification

```bash
# Clone the repository
git clone https://github.com/Iypan-admin/ISML_LMS.git
cd ISML_LMS

# Install Prisma dependencies
npm install prisma @prisma/client

# Format and validate Prisma Schema
npx prisma format
```

---

## 📄 License & Intellectual Property

Copyright © 2026 ISML LMS (Indian School for Modern Languages). All rights reserved. Production-grade B2B enterprise platform architecture.
