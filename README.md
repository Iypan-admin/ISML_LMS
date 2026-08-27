<div align="center">

# 🌍 ISML LMS v1.0 — Enterprise Foreign Language SaaS

### *Multi-Tenant B2B • AI-Powered LSRW • Real-Time LiveKit Webinars*

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.2-blue?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-v5%2Fv6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![pgvector](https://img.shields.io/badge/pgvector-1536--dim-00D9A5?style=for-the-badge&logo=supabase&logoColor=white)](https://github.com/pgvector/pgvector)
[![NestJS Core](https://img.shields.io/badge/NestJS-Core%20API-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Python AI](https://img.shields.io/badge/FastAPI-Python%20AI-3776AB?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LiveKit Cloud](https://img.shields.io/badge/LiveKit-CloudStream-0052CC?style=for-the-badge&logo=livekit&logoColor=white)](https://livekit.io/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2%20Storage-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)

---

</div>

## 📌 Master Architecture Artifacts & Source Links

The entire backend and database infrastructure of **ISML LMS v1.0** is fully designed, normalized in 3NF, formatted, and verified. Access the 3 master production files below (click any link to open directly in GitHub):

<table>
  <thead>
    <tr>
      <th>Deliverable Document</th>
      <th>Architectural Summary</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="./prisma/schema.prisma"><b>Master Prisma Schema</b></a></td>
      <td>Production schema powering PostgreSQL & Supabase <code>pgvector</code> (195 Models, 41 Enums).</td>
    </tr>
    <tr>
      <td><a href="./ISML_LMS_COMPLETE_ERD_DOCUMENTATION.md"><b>Master ERD Documentation</b></a></td>
      <td>Complete ERD reference featuring 36 visual Mermaid diagrams & explicit 1:1, 1:N, N:M tables.</td>
    </tr>
    <tr>
      <td><a href="./ISML_LMS_ERD_PRISMA_CROSS_VALIDATION_REPORT.md"><b>Cross-Validation Audit Report</b></a></td>
      <td>Architectural audit report (Score 10/10, ZERO critical bugs, ready for DB freeze).</td>
    </tr>
  </tbody>
</table>

---

## 📊 Database Statistics & High-Level System Architecture

<div align="center">

| Metric | System Total | Architectural Guarantee |
| :--- | :---: | :--- |
| 🗄️ **Database Models** | **`195`** | 100% Normalized in 3NF (Zero Fake Padding) |
| 🔢 **System Enums** | **`41`** | Strongly Typed CEFR Levels, States & Protocols |
| 🧩 **Business Modules** | **`36`** | Decoupled Domain Architecture |
| 🔀 **Junction Tables (N:M)** | **`14`** | Explicit Metadata-backed M:N Relationships |
| 🧠 **AI Vector Search Engine** | **`pgvector`** | `vector(1536)` OpenAI Embeddings |
| 🔑 **Primary Key Standard** | **`UUID v4`** | Distributed Security Across Tenants |

</div>

---

## 🧩 Complete 36 Business Domains & 195 Models Inventory

<details>
<summary><a href="#-complete-36-business-domains--195-models-inventory"><b>👉 Click Here to Expand All 36 Business Domains & 195 Models List (Domains 01 to 36)</b></a></summary>

<br/>

### 1. 🏢 Domain 01: Multi-Tenant Organization (8 Models)
- `Institutions` (Root B2B Partner College Tenant)
- `Campuses` (Physical Campus Branches)
- `Departments` (Academic Departments)
- `AcademicYears` (Calendar Year Sessions)
- `InstitutionSettings` (Portal Security & 2FA Configuration)
- `InstitutionDomains` (Custom Subdomains e.g. `lms.annauniv.edu`)
- `InstitutionSubscriptions` (SaaS Enterprise Plan Contracts)
- `InstitutionBranding` (Custom Logos, Primary Colors & CSS Themes)

### 2. 🔐 Domain 02: User Identity & Authentication (9 Models)
- `Users` (Central Identity Record for All Roles)
- `UserSessions` (Active Login Sessions)
- `RefreshTokens` (JWT Token Family Rotation)
- `OTPVerifications` (2FA & Password Reset OTPs)
- `PasswordResetTokens` (Hashed Reset Tokens)
- `LoginHistory` (IP Address & Browser Audit Logs)
- `UserDevices` (Registered FCM Push Notification Devices)
- `UserPreferences` (Personal Dark/Light Mode & Locales)
- `EmergencyContacts` (Guardian / Parent Contact Details)

### 3. 🛡️ Domain 03: Dynamic Menu-Based RBAC (6 Models)
- `Menus` (UI Sidebar Tree Node with Parent-Child Hierarchy)
- `PermissionGroups` (Categorized Permission Groups)
- `Permissions` (Atomic Actions: `CREATE`, `READ`, `EXPORT`, `APPROVE`)
- `Roles` (System & Custom Tenant Roles)
- `RoleMenuVisibility` (Junction Mapping Menu IDs to Roles)
- `RolePermissions` (Junction Mapping Action Permissions to Roles)
- `UserRoles` (Dynamic User-Role Assignments with Date Windows)

### 4. 👤 Domain 04: Core User Profiles (5 Models)
- `StudentProfiles` (Academic Profile & Status)
- `TutorProfiles` (Main & Backup Tutor Teaching Profile)
- `AssistantTutorProfiles` (Doubt-Clearing Assistant Tutor Profile)
- `CollegeAdminProfiles` (College Principal / Staff Profile)
- `SuperAdminProfiles` (ISML Central Platform Admin Profile)

### 5. 🌐 Domain 05: Foreign Languages Engine (4 Models)
- `Languages` (Master Table for Languages: French, German, Japanese)
- `LanguageVariants` (Regional Dialects e.g. Metropolitan French)
- `LanguageProficiencyLevels` (CEFR Bands: A1, A2, B1, B2, C1, C2)
- `LanguageSettings` (Virtual Keyboard Accents & Speech STT Locales)

### 6. 📚 Domain 06: Course Architecture (8 Models)
- `CourseCategories` (European Languages, Exam Prep)
- `Courses` (Master Course Entity e.g. French A1)
- `CourseLevels` (CEFR Level Instance)
- `CourseSubLevels` (Sub-level breakdowns A1.1, A1.2)
- `CourseVersions` (Curriculum Version History)
- `CourseModules` (Structural Modules in 100-Hour Syllabus)
- `CourseUnits` (Structural Units within Modules)
- `Lessons` (Individual Learning Lessons)

### 7. 📖 Domain 07: Curriculum & Topics (4 Models)
- `Topics` (Coverage Topics within Lessons)
- `TopicItems` (Granular Texts, Audios, Videos & Exercises)
- `LearningObjectives` (Bloom's Taxonomy Learning Goals)
- `CoursePrerequisites` (Prerequisite Requirements)

### 8. ⏱️ Domain 08: 3 Duration Patterns Engine (3 Models)
- `CourseDurationPatterns` (1 Course Mapped to 12Mo, 6Mo, or 3Mo Options)
- `PatternSchedules` (Weekly Timetable Templates per Pattern)
- `PatternPacingRules` (Target Module Speed Rules per Pattern)

### 9. 🏫 Domain 09: Batches & Enrollment (6 Models)
- `Batches` (Webinar Batch Instance)
- `BatchInstitutions` (Junction Mapping Multiple Colleges to 1 Batch)
- `BatchSchedules` (Recurring Webinar Days and Times)
- `BatchTutors` (Assigned Main, Backup & Assistant Tutors)
- `StudentBatchEnrollments` (Student Enrollment with 1-Year Expiration)
- `EnrollmentHistory` (Audit Log of Enrollment Changes)

### 10. 📅 Domain 10: Timetable & Scheduling (6 Models)
- `Timetables` (Master Timetable Container)
- `ScheduleEntries` (Individual Class Occurrences)
- `TutorAvailabilities` (Tutor Free/Busy Slots)
- `Holidays` (Institutional Holidays)
- `ScheduleExceptions` (Rescheduled / Cancelled Class Overrides)
- `CalendarEvents` (Calendar Feed Entries)

### 11. 📹 Domain 11: LiveKit Webinar System (7 Models)
- `LiveClasses` (Scheduled Webinar Master Record)
- `LiveSessions` (Execution Attempt of Live Session)
- `LiveKitRooms` (LiveKit Cloud Credentials & Tokens)
- `LiveClassParticipants` (Student & Tutor Connection Log)
- `LiveClassAccessLogs` (Token Verification Log)
- `AttendanceSessions` (Automated Attendance derived from Stay Duration)
- `ClassEvents` (In-Class Event Stream: Polls, Hand Raises)

### 12. 📼 Domain 12: Cloudflare R2 Recordings Pipeline (6 Models)
- `Recordings` (Recording Metadata with 24h SLA & 1-Year Access Rule)
- `RecordingFiles` (Physical mp4 files stored in Cloudflare R2)
- `RecordingVersions` (Transcoded 1080p, 720p Resolution Variants)
- `RecordingProcessingJobs` (BullMQ Transcoding Queue Jobs)
- `RecordingAccessLogs` (Student Viewing Duration Analytics)
- `RecordingViewingHistory` (Detailed Play/Pause/Seek Events)

### 13. 📄 Domain 13: Learning Resources (6 Models)
- `Resources` (Master Study Material Entity)
- `ResourceFiles` (Physical Files in Cloudflare R2)
- `ResourceCategories` (PDF, PPT, Audio Classifications)
- `ResourceVersions` (Study Material Versions)
- `ResourceTags` (Search Discovery Tags)
- `LessonResources` (Junction Linking Resources to Curriculum Lessons)

### 14. 🎧 Domain 14: LSRW — Listening Engine (4 Models)
- `ListeningActivities` (Listening Practice Master)
- `ListeningAudios` (Native Speaker Tracks with Speed Controls)
- `ListeningAttempts` (Student Listening Task Log)
- `ListeningAnswers` (Detailed Listening Answer Breakdown)

### 15. 🎙️ Domain 15: LSRW — Speaking & Whisper STT (4 Models)
- `SpeakingActivities` (Speaking Practice Master)
- `SpeakingPrompts` (Sentence / Phrase Card Prompts)
- `SpeakingAudioSubmissions` (Student Recorded Voice Files in R2)
- `SpeakingAIEvaluations` (Whisper STT Pronunciation AI Score)

### 16. 📖 Domain 16: LSRW — Reading Engine (4 Models)
- `ReadingActivities` (Reading Practice Master)
- `ReadingPassages` (Comprehension Passage Texts)
- `ReadingQuestions` (Passage-based Questions)
- `ReadingAttempts` (Student Reading Comprehension Log)

### 17. ✍️ Domain 17: LSRW — Writing Engine & Accents (5 Models)
- `WritingActivities` (Writing Exercise Master)
- `WritingPrompts` (Prose & Essay Prompts)
- `WritingSubmissions` (Student Typed Essay Submissions)
- `WritingAIEvaluations` (AI Grammar & Spelling Evaluation)
- `VirtualKeyboardConfigs` (French/German Soft Keyboard Layout Matrix)

### 18. 📝 Domain 18: Assignments & Homework (5 Models)
- `Assignments` (Homework Master)
- `AssignmentQuestions` (Questions within Assignment)
- `AssignmentSubmissions` (Student Homework Submission)
- `SubmissionFiles` (Files Uploaded with Homework)
- `AssignmentGradings` (Question-level Tutor Grades)

### 19. ❓ Domain 19: Question Bank Engine (6 Models)
- `QuestionBanks` (Master Repository per Language)
- `Questions` (MCQ, Fill in blanks, Dictation Items)
- `QuestionOptions` (Multiple Choice Options)
- `QuestionExplanations` (Audio / Video / Text Solutions)
- `QuestionTags` (Subject Matter Search Tags)
- `QuestionDifficultyLevels` (Difficulty Bands & Scoring Weights)

### 20. 🎓 Domain 20: Examinations & Proctoring (7 Models)
- `Exams` (Exam Master Record)
- `ExamSections` (Structural Sections inside Exam)
- `ExamSchedules` (Active Window for Exam)
- `ExamAttempts` (Student Exam Attempt & Proctor Logs)
- `StudentExamAnswers` (Detailed Answers Submitted)
- `ExamResults` (Published Score Card Report)
- `TutorReviews` (Manual Grade Adjustments by Tutors)

### 21. 📜 Domain 21: QR Digital Certification (5 Models)
- `CertificateTemplates` (SVG / HTML Certificate Templates)
- `Certificates` (Issued Digital Certificate with Unique QR Code)
- `CertificateIssuances` (Automated Completion Log)
- `CertificateVerifications` (Public QR Scan Audit Trail)
- `CertificateDownloads` (PDF Download Analytics)

### 22. 🤖 Domain 22: AI Platform Core Agents (6 Models)
- `AIAgents` (Registration for Python FastAPI Agents)
- `AgentVersions` (Version Control for AI Agent Code & Prompts)
- `AgentConfigurations` (Temperature, Max Tokens, System Prompts)
- `AITasks` (Async Background Task Queue)
- `AIExecutions` (Runtime Execution Logs)
- `AIEvaluations` (Tutor Quality Rating of AI Output)

### 23. 📊 Domain 23: AI Request & Token Audit (5 Models)
- `AIRequests` (API Request Log to OpenAI / Claude)
- `AIResponses` (Raw LLM Response Payload & Latency)
- `AIProviders` (LLM Provider Configs)
- `AIModels` (Model Token Pricing Tiers)
- `TokenUsageLogs` (Daily Token Cost Aggregation per College)

### 24. 📝 Domain 24: AI Prompts & Tutor Approvals (4 Models)
- `PromptTemplates` (Base Agent Prompt Templates)
- `PromptVersions` (Prompt Version History)
- `AIGeneratedContents` (Generated Materials Awaiting Tutor Review)
- `ContentApprovals` (Review & Approval Log by Main Tutors)

### 25. 🔍 Domain 25: RAG & `pgvector` Search (6 Models)
- `KnowledgeBases` (Vector Store Container per Course)
- `KnowledgeSources` (PDF, PPT, Audio Ingest Sources)
- `KnowledgeDocuments` (Processed Document Records)
- `DocumentChunks` (Text Chunking Output)
- `DocumentEmbeddings` (`pgvector` 1536-dim Vector Store)
- `RAGQueries` (Student Queries & Retrieved Chunk Matches)

### 26. 🔌 Domain 26: MCP Protocol Integration (4 Models)
- `MCPServers` (Registered Model Context Protocol Servers)
- `MCPTools` (Tools Exposed to AI Agents via MCP)
- `MCPConnections` (Active Agent-Tool Connection Sessions)
- `MCPExecutionLogs` (Log of Tool Execution Calls)

### 27. 💳 Domain 27: Payment Gateway & Razorpay (6 Models)
- `PaymentProviders` (Razorpay / Stripe Gateway Setup)
- `PaymentOrders` (Order Request Creation)
- `PaymentTransactions` (Financial Transaction Log)
- `PaymentAttempts` (Payment Gateway Attempt Log)
- `PaymentWebhooks` (Idempotency Log with Unique `eventId`)
- `PaymentReceipts` (Generated Tax Receipts)

### 28. 🧾 Domain 28: Subscriptions & Billing (5 Models)
- `Invoices` (B2B Enterprise GST Tax Invoices)
- `SubscriptionPlans` (SaaS Pricing Tiers)
- `Subscriptions` (Active College Subscription)
- `BillingRecords` (Billing Ledger History)
- `InstitutionPayments` (Offline / Wire Payments)

### 29. 🔔 Domain 29: Multi-Channel Notifications (6 Models)
- `Notifications` (User Notification Inbox)
- `NotificationTemplates` (Multi-Channel Message Templates)
- `NotificationPreferences` (User Delivery Preferences)
- `NotificationChannels` (SMS, Email, WhatsApp, Push Gateways)
- `DeliveryLogs` (Gateway Delivery Status Logs)
- `NotificationEvents` (Automated System Event Triggers)

### 30. 💬 Domain 30: Academic Doubt Q&A Chat (5 Models)
- `AcademicConversations` (Doubt Thread between Student & Assistant Tutors)
- `AcademicChatMembers` (Members in Doubt Thread)
- `AcademicChatMessages` (Messages in Doubt Chat)
- `DoubtTickets` (Ticket Assigned to Assistant Tutor)
- `DoubtResponses` (AI Suggested Answer for Doubt Tickets)

### 31. 🎧 Domain 31: Customer Helpdesk & Support (6 Models)
- `SupportTickets` (Technical Support Ticket)
- `TicketCategories` (Category & SLA Resolution Rules)
- `TicketMessages` (Messages inside Ticket)
- `TicketAttachments` (Screenshots / Logs Attached)
- `TicketAssignments` (Support Agent Assigned)
- `TicketStatusHistory` (Status Change Log)

### 32. 💼 Domain 32: Career Portal & Placement (6 Models)
- `CareerPrograms` (Career Prep Program)
- `CareerResources` (Placement Guides & Resume Templates)
- `Companies` (Partner Hiring Companies)
- `JobOpportunities` (Job Postings for Language Graduates)
- `StudentCareerProfiles` (Student Career Profile & Resume)
- `JobApplications` (Job Application Tracking)

### 33. 📈 Domain 33: Student Progress & Streaks (5 Models)
- `StudentCourseProgress` (Course Completion Metrics)
- `ActivityProgressLogs` (Activity Completion Log with Time Spent)
- `LSRWProgressSummaries` (Competency Breakdown across LSRW)
- `LearningStreaks` (Daily Gamified Learning Streak Tracker)
- `StudentAchievements` (Badges & Milestones Earned)

### 34. 📊 Domain 34: System Analytics & Reports (4 Models)
- `BatchAnalytics` (Attendance & Exam Score Metrics per Batch)
- `ExamAnalytics` (Difficulty & Pass Rate Analytics)
- `AIUsageAnalytics` (Daily LLM Token Cost Analytics per College)
- `InstitutionReports` (Executive Summary Reports for Principals)

### 35. 🛡️ Domain 35: Enterprise Audit & Security Logs (5 Models)
- `AuditLogs` (Low-Level Data Mutation Audit Trail)
- `LoginLogs` (Dedicated Security Log for User Logins)
- `SecurityEvents` (Security Alerts for Brute Force or RLS Violations)
- `APIAccessLogs` (API Endpoint Response Time & Status Log)
- `PermissionChangeLogs` (Audit Trail of RBAC Edits)

### 36. ⚙️ Domain 36: System Configurations (3 Models)
- `SystemSettings` (Global Platform Runtime Configuration)
- `FeatureFlags` (System Feature Toggles & Rollout Rules)
- `MaintenanceWindows` (Scheduled Downtime Windows)

</details>

---

## 🔐 Menu ID-Based Dynamic RBAC Architecture

The system features a **100% Database-Driven Menu-Based Access Control Engine**. No sidebar links or action permissions are hardcoded!

```
               [Menus Table (Menu ID / Parent-Child Sidebar Tree)]
                                      │
                                      ▼
[Users] ──(1:N)──► [UserRoles] ──(N:M)──► [Roles] ──(N:M)──► [RoleMenuVisibility] (Controls Sidebar UI)
                                            │
                                            └─(N:M)──► [RolePermissions] ──► [Permissions] (Action: CREATE, EXPORT, etc.)
```

---

## 👥 System & Custom User Roles Matrix

| Role | Type | Scope | Primary Function |
| :--- | :---: | :---: | :--- |
| **👑 Super Admin** | `SYSTEM` | Global | Full platform control & college tenant onboarding. |
| **🏫 College Admin / Principal** | `CUSTOM` | Tenant | College portal setup, student import & staff role management. |
| **👨‍🏫 Main Tutor** | `CUSTOM` | Batch | Teaches live webinars on LiveKit Cloud & approves AI content. |
| **🔄 Substitute Backup Tutor** | `CUSTOM` | Batch | Standby main tutor ready to take over stream on network failure. |
| **💬 Assistant Doubt Tutor** | `CUSTOM` | College | Handles student Q&A chat & resolves doubt tickets. |
| **🎓 Student** | `SYSTEM` | Enrolled | Attends live webinars, practices LSRW, takes exams & gets QR certs. |
| **👨‍👩‍👧 Parent / Guardian** | `SYSTEM` | Student | Views student attendance %, LSRW score cards & exam report cards. |

---

## 🛠️ Microservice Technology Stack

- **Core LMS Service**: NestJS (TypeScript), Prisma ORM, PostgreSQL.
- **AI Microservice**: Python FastAPI, LangGraph, Pydantic AI, Whisper STT, OpenAI, `pgvector`.
- **Realtime Streaming**: LiveKit Cloud Webhooks & WebRTC.
- **Media Storage**: Cloudflare R2 (24-hour upload SLA & 1-Year access validity).
- **Background Workers**: BullMQ Queue Engine & Redis.
- **Payments**: Razorpay Gateway (Unique `eventId` webhook idempotency).

---

<div align="center">

### Copyright © 2026 ISML LMS (Indian School for Modern Languages)
*Designed for 5,000+ to 50,000+ Enrolled Students Across B2B Partner Universities*

</div>
