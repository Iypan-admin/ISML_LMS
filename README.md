<div align="center">

# 🌍 ISML LMS v1.0 — Enterprise Foreign Language SaaS

### *Mobile-First • Multi-Tenant B2B • AI-Powered LSRW • Real-Time LiveKit Webinars*

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.2-blue?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-v5%2Fv6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![pgvector](https://img.shields.io/badge/pgvector-1536--dim-00D9A5?style=for-the-badge&logo=supabase&logoColor=white)](https://github.com/pgvector/pgvector)
[![NestJS Core](https://img.shields.io/badge/NestJS-Core%20API-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Python AI](https://img.shields.io/badge/FastAPI-Python%20AI-3776AB?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LiveKit Cloud](https://img.shields.io/badge/LiveKit-CloudStream-0052CC?style=for-the-badge&logo=livekit&logoColor=white)](https://livekit.io/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2%20Storage-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)
[![Mobile First](https://img.shields.io/badge/Mobile--First-100%25%20Responsive-7C3AED?style=for-the-badge&logo=pwa&logoColor=white)](#-mobile-first-responsive-experience)

---

</div>

## 📌 Master Architecture Artifacts & Source Links

The entire backend and database infrastructure of **ISML LMS v1.0** is fully designed, normalized in 3NF, formatted, and verified. Access the 3 master production files below:

<table>
  <thead>
    <tr>
      <th>Icon</th>
      <th>Deliverable Document</th>
      <th>Architectural Summary</th>
      <th>Direct Repository Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">📄</td>
      <td><b>Master Prisma Schema</b></td>
      <td>Production schema powering PostgreSQL & Supabase <code>pgvector</code> (195 Models, 41 Enums).</td>
      <td><a href="file:///d:/ISML/ISML_LMS/prisma/schema.prisma"><code>prisma/schema.prisma</code></a></td>
    </tr>
    <tr>
      <td align="center">📘</td>
      <td><b>Master ERD Documentation</b></td>
      <td>Complete ERD reference featuring 36 visual Mermaid diagrams & explicit 1:1, 1:N, N:M tables.</td>
      <td><a href="file:///d:/ISML/ISML_LMS/ISML_LMS_COMPLETE_ERD_DOCUMENTATION.md"><code>ISML_LMS_COMPLETE_ERD_DOCUMENTATION.md</code></a></td>
    </tr>
    <tr>
      <td align="center">📋</td>
      <td><b>Cross-Validation Audit Report</b></td>
      <td>Architectural audit report (Score 10/10, ZERO critical bugs, ready for DB freeze).</td>
      <td><a href="file:///d:/ISML/ISML_LMS/ISML_LMS_ERD_PRISMA_CROSS_VALIDATION_REPORT.md"><code>ISML_LMS_ERD_PRISMA_CROSS_VALIDATION_REPORT.md</code></a></td>
    </tr>
  </tbody>
</table>

---

## 📱 Mobile-First Responsive Experience

ISML LMS is architected **strictly from a Mobile-First perspective**. Over 85% of college students access foreign language webinars, practice LSRW exercises, and take exams directly on smartphones.

```
+-------------------------------------------------------------------------------+
|                       SMARTPHONE / TABLET RESPONSIVE PWA                      |
|                                                                               |
|  [📱 1-Tap LiveKit Stream]  [🎙️ Mobile Speech STT]  [⌨️ Accent Keyboard]      |
|  Auto 720p/1080p WebRTC      Whisper Pronunciation    French Accent Overlay   |
|                                                                               |
|  [💬 Realtime Doubt Q&A]    [📜 QR Certificates]    [🔔 Push Notifications]   |
|  Assistant Tutor Chat        Instant PDF Download    FCM Mobile Alerts        |
+-------------------------------------------------------------------------------+
```

### 📱 Key Mobile UX Capabilities:
- ⚡ **Touch-Optimized Accent Keyboards**: Dynamic soft-keyboard overlays for French/German accents (`é`, `è`, `à`, `ç`, `ä`, `ö`, `ü`).
- 🎙️ **Low-Latency Voice Recording**: Native WebAudio API integration for recording student voice submissions directly on Android/iOS browsers.
- 📡 **Adaptive WebRTC Webinar Streams**: LiveKit Cloud automatically scales down stream resolution to 360p/720p on 3G/4G mobile networks without dropping audio.
- 📲 **PWA & Mobile Push Alerts**: Real-time push notifications for live class start alerts, homework due dates, and doubt resolution replies.

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

## 🧩 36 Business Modules & Sub-Modules Tree

<details>
<summary><b>👉 Click to Expand All 36 Business Domains & 195 Models List</b></summary>

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

### 14. 🎧 Domain 14: LSRW Listening (4 Models)
- `ListeningActivities`, `ListeningAudios`, `ListeningAttempts`, `ListeningAnswers`

### 15. 🎙️ Domain 15: LSRW Speaking & Whisper STT (4 Models)
- `SpeakingActivities`, `SpeakingPrompts`, `SpeakingAudioSubmissions`, `SpeakingAIEvaluations`

### 16. 📖 Domain 16: LSRW Reading (4 Models)
- `ReadingActivities`, `ReadingPassages`, `ReadingQuestions`, `ReadingAttempts`

### 17. ✍️ Domain 17: LSRW Writing & Accents (5 Models)
- `WritingActivities`, `WritingPrompts`, `WritingSubmissions`, `WritingAIEvaluations`, `VirtualKeyboardConfigs`

### 18. 📝 Domain 18–21: Assignments, Exams & QR Certificates (23 Models)
- `Assignments`, `AssignmentSubmissions`, `QuestionBanks`, `Questions`, `Exams`, `ExamAttempts`, `ExamResults`, `Certificates`, `CertificateVerifications`

### 19. 🤖 Domain 22–26: AI Platform, RAG (`pgvector`) & MCP (25 Models)
- `AIAgents`, `AITasks`, `AIRequests`, `TokenUsageLogs`, `KnowledgeBases`, `DocumentEmbeddings`, `MCPServers`, `MCPTools`

### 20. 💳 Domain 27–36: Payments, Doubt Chat, Support, Career & Security Audit (45 Models)
- `PaymentOrders`, `PaymentWebhooks`, `AcademicConversations`, `DoubtTickets`, `SupportTickets`, `JobOpportunities`, `AuditLogs`, `APIAccessLogs`

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
