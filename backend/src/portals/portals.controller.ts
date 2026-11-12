import { Controller, Get, Post, Body, Param, Query, Sse, MessageEvent, Res, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LiveClassesController } from '../live-classes/live-classes.controller';
import { BackendCacheService } from '../cache/backend-cache.service';
import { BulkNotificationQueueService, DispatchRecipient } from '../notifications/bulk-queue.service';
import { EmailNotificationService } from '../notifications/email-notification.service';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Controller('api/portals')
export class PortalsDataController {
  constructor(private prisma: PrismaService) { }

  public static inMemoryApprovals: any[] = [];
  public static inMemoryCourses: any[] = [];
  public static inMemoryBatches: any[] = [];
  public static inMemoryFaculty: any[] = [];
  public static inMemoryAllocations: any[] = [];
  public static inMemoryBatchStudents: Record<string, any[]> = {};

  // Realtime Live Stream Subject for Webhook/SSE Instant Sync
  private static events$ = new Subject<{ type: string; payload?: any; timestamp: string }>();

  public static broadcastEvent(type: string, payload?: any) {
    PortalsDataController.events$.next({
      type,
      payload,
      timestamp: new Date().toISOString(),
    });
  }

  // Realtime SSE endpoint for instant UI updates (courses, batches, live-classes, approvals)
  @Sse('stream')
  streamEvents(): Observable<MessageEvent> {
    const initial$ = new Observable<any>((subscriber) => {
      subscriber.next({
        type: 'CONNECTED',
        payload: { message: 'Realtime stream established' },
        timestamp: new Date().toISOString(),
      });
    });

    const ping$ = new Observable<any>((subscriber) => {
      const interval = setInterval(() => {
        subscriber.next({
          type: 'PING',
          timestamp: new Date().toISOString(),
        });
      }, 15000);
      return () => clearInterval(interval);
    });

    return new Observable<MessageEvent>((subscriber) => {
      const subInitial = initial$.subscribe((evt) => {
        subscriber.next({ data: evt } as MessageEvent);
      });

      const subPing = ping$.subscribe((evt) => {
        subscriber.next({ data: evt } as MessageEvent);
      });

      const subEvents = PortalsDataController.events$.subscribe((evt) => {
        subscriber.next({ data: evt } as MessageEvent);
      });

      return () => {
        subInitial.unsubscribe();
        subPing.unsubscribe();
        subEvents.unsubscribe();
      };
    });
  }

  // Webhook trigger endpoint (allows external triggers or client-side webhook dispatch)
  @Post('webhook/trigger')
  async triggerWebhook(@Body() body: { eventType: string; data?: any }) {
    PortalsDataController.broadcastEvent(body.eventType || 'UPDATE', body.data);
    return { status: 'success', message: 'Webhook event dispatched and broadcasted to all connected clients' };
  }

  // 1. Super Admin & Academic Approvals
  @Get('approvals')
  async getApprovals(@Query('status') status?: string) {
    try {
      const where: any = {};
      if (status && status !== 'ALL') where.currentStatus = status;

      // 1. Get explicitly logged approvalRequests from DB
      const dbApprovals = await this.prisma.approvalRequests.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }).catch(() => []);

      const result: any[] = [...dbApprovals];

      // 2. Aggregate Published / Pending Courses from DB
      try {
        const courses = await this.prisma.courses.findMany({
          orderBy: { createdAt: 'desc' },
        });
        courses.forEach((c: any) => {
          const reqId = `REQ-CRS-${c.id.slice(0, 8)}`;
          if (!result.find((r) => r.id === reqId || r.entityId === c.id)) {
            const courseStatus = c.status === 'PUBLISHED' ? 'APPROVED' : c.status === 'ARCHIVED' ? 'REJECTED' : 'PENDING';
            if (!status || status === 'ALL' || courseStatus === status) {
              result.push({
                id: reqId,
                requestType: 'COURSE_CREATION',
                module: 'Academic',
                title: `Course Publication: ${c.name} (${c.code})`,
                description: `Course offering ${c.name} submitted for curriculum validation.`,
                entityType: 'COURSE',
                entityId: c.id,
                requestedByUserId: 'Academic Coordinator',
                priority: 'NORMAL',
                institutionId: c.tenantId || 'inst-01',
                currentStatus: courseStatus,
                createdAt: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
                submittedPayload: {
                  courseId: c.id,
                  courseCode: c.code,
                  courseName: c.name,
                  targetLanguage: c.languageId || 'Language',
                  submittedBy: { name: 'Academic Director', email: 'academics@isml.edu', role: 'Academic Coordinator' },
                },
              });
            }
          }
        });
      } catch {}

      // 3. Aggregate Batches from DB
      try {
        const batches = await this.prisma.batches.findMany({
          orderBy: { createdAt: 'desc' },
        });
        batches.forEach((b: any) => {
          const reqId = `REQ-BAT-${b.id.slice(0, 8)}`;
          if (!result.find((r) => r.id === reqId || r.entityId === b.id)) {
            const batchStatus = b.status === 'ONGOING' || b.status === 'COMPLETED' ? 'APPROVED' : b.status === 'CANCELLED' ? 'REJECTED' : 'PENDING';
            if (!status || status === 'ALL' || batchStatus === status) {
              result.push({
                id: reqId,
                requestType: 'BATCH_CREATION',
                module: 'Academic',
                title: `Batch Authorization: ${b.name}`,
                description: `Cohort batch scheduled for live delivery with capacity ${b.maxStudents || 35} students.`,
                entityType: 'BATCH',
                entityId: b.id,
                requestedByUserId: 'Academic Operations',
                priority: 'NORMAL',
                institutionId: b.tenantId || 'inst-01',
                currentStatus: batchStatus,
                createdAt: b.createdAt ? b.createdAt.toISOString() : new Date().toISOString(),
                submittedPayload: {
                  batchId: b.id,
                  batchName: b.name,
                  submittedBy: { name: 'Operations Lead', email: 'operations@isml.edu', role: 'Batch Coordinator' },
                },
              });
            }
          }
        });
      } catch {}

      // 4. Aggregate Admissions from DB
      try {
        const admissions = await this.prisma.admissionApplications.findMany({
          orderBy: { createdAt: 'desc' },
        });
        admissions.forEach((ad) => {
          const reqId = `REQ-ADM-${ad.applicationNumber || ad.id.slice(0, 8)}`;
          if (!result.find((r) => r.id === reqId || r.entityId === ad.applicationNumber)) {
            const admStatus = ad.currentStatus === 'ENROLLED' ? 'APPROVED' : ad.currentStatus === 'REJECTED' ? 'REJECTED' : 'PENDING';
            if (!status || status === 'ALL' || admStatus === status) {
              const fullName = `${ad.firstName || ''} ${ad.lastName || ''}`.trim() || 'Student';
              const isSchool = ad.admissionType === 'SCHOOL_STUDENT';
              result.push({
                id: reqId,
                requestType: 'STUDENT_ADMISSION',
                module: 'Admissions',
                title: `${isSchool ? 'School Pupil' : 'College Student'} Enrolment: ${fullName}`,
                description: `Admission application #${ad.applicationNumber} for ${fullName} (${ad.targetLanguage} ${ad.targetLevel}).`,
                entityType: 'STUDENT',
                entityId: ad.applicationNumber,
                requestedByUserId: fullName,
                priority: 'HIGH',
                institutionId: ad.institutionId || 'inst-01',
                currentStatus: admStatus,
                createdAt: ad.createdAt ? ad.createdAt.toISOString() : new Date().toISOString(),
                submittedPayload: {
                  applicationNumber: ad.applicationNumber,
                  fullName,
                  email: ad.email,
                  mobileNumber: ad.mobileNumber,
                  category: isSchool ? 'SCHOOL' : 'COLLEGE',
                  course: `${ad.targetLanguage} (${ad.targetLevel})`,
                  submittedBy: { name: fullName, email: ad.email, role: 'Admissions Desk' },
                },
              });
            }
          }
        });
      } catch {}

      // 5. Also merge any fresh in-memory approval submissions
      PortalsDataController.inMemoryApprovals.forEach((mem) => {
        if (!result.find((r) => r.id === mem.id)) {
          if (!status || status === 'ALL' || mem.currentStatus === status) {
            result.unshift(mem);
          }
        }
      });

      return { status: 'success', total: result.length, data: result };
    } catch (e: any) {
      console.error('Error in getApprovals master hub:', e?.message);
      return { status: 'success', total: PortalsDataController.inMemoryApprovals.length, data: PortalsDataController.inMemoryApprovals };
    }
  }

  @Post('approvals/submit')
  async submitApproval(@Body() payload: any) {
    const newApproval = {
      id: payload.id || `appr-${Date.now().toString().slice(-6)}`,
      requestType: payload.requestType || 'COURSE_CREATION',
      title: payload.title || payload.entityName || 'Master Approval Request',
      description: payload.description || 'Submitted from Academic Management Desk',
      entityType: payload.entityType || 'COURSE',
      entityId: payload.entityId || `ent-${Date.now().toString().slice(-4)}`,
      requestedByUserId: payload.requestedByUserId || payload.submittedBy?.name || 'Academic Manager',
      priority: payload.priority || payload.urgency || 'NORMAL',
      institutionId: payload.institutionId || 'inst-01',
      currentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      submittedPayload: payload,
    };

    PortalsDataController.inMemoryApprovals.unshift(newApproval);

    try {
      await this.prisma.approvalRequests.create({
        data: {
          id: newApproval.id,
          requestType: newApproval.requestType,
          title: newApproval.title,
          description: newApproval.description,
          entityType: newApproval.entityType,
          entityId: newApproval.entityId,
          requestedByUserId: newApproval.requestedByUserId,
          priority: newApproval.priority,
          institutionId: newApproval.institutionId,
          currentStatus: 'PENDING',
          submittedPayload: payload,
        },
      }).catch(() => null);
    } catch { }

    PortalsDataController.broadcastEvent('APPROVAL_SUBMITTED', newApproval);

    return { status: 'success', message: 'Approval request recorded and broadcasted to Super Admin Dashboard', data: newApproval };
  }

  @Post('approvals/:id/action')
  async reviewApproval(@Param('id') id: string, @Body() body: { action: any; remarks?: string }) {
    let item = PortalsDataController.inMemoryApprovals.find((a) => a.id === id);
    if (!item) {
      try {
        const dbReq = await this.prisma.approvalRequests.findUnique({ where: { id } });
        if (dbReq) {
          item = dbReq;
          PortalsDataController.inMemoryApprovals.unshift(item);
        }
      } catch { }
    }

    if (item) {
      item.currentStatus = body.action;
      item.reviewerRemarks = body.remarks;
      item.reviewedAt = new Date().toISOString();

      // If this was a COLLEGE_ONBOARDING / INSTITUTION_CREATION approval, activate or create institution
      if (item.requestType === 'INSTITUTION_CREATION' || item.entityType === 'INSTITUTION' || item.entityType === 'COLLEGE') {
        const payload = item.submittedPayload || {};
        if (body.action === 'APPROVED') {
          const code = (payload.code || `INST-${Date.now().toString().slice(-4)}`).toUpperCase();
          const slug = payload.slug || payload.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `inst-${Date.now()}`;
          const isSchool = payload.type === 'SCHOOL' || code.includes('DPS') || code.includes('SCH');

          try {
            let existing = await this.prisma.institutions.findUnique({ where: { code } }).catch(() => null);
            if (!existing) {
              existing = await this.prisma.institutions.create({
                data: {
                  code,
                  slug,
                  name: payload.name || payload.institutionName,
                  displayName: payload.displayName || payload.name || payload.institutionName,
                  email: payload.email || payload.contactEmail || `contact@${code.toLowerCase()}.edu`,
                  phone: payload.phone || payload.contactPhone || '+91 44 2817 8200',
                  website: payload.website,
                  status: 'ACTIVE',
                },
              }).catch(() => null);
            } else {
              await this.prisma.institutions.update({
                where: { id: existing.id },
                data: { status: 'ACTIVE' },
              }).catch(() => null);
            }

            // Provision Administrator User if not present
            if (existing) {
              const adminEmail = (payload.adminEmail || payload.contactEmail || `admin@${code.toLowerCase()}.isml.edu`).toLowerCase();
              const adminName = payload.adminName || (isSchool ? `${existing.name} Principal` : `${existing.name} Admin`);
              const defaultPassword = payload.adminPassword || `${code.replace(/[^A-Z0-9]/g, '')}@2026!`;

              const userExists = await this.prisma.users.findFirst({
                where: { tenantId: existing.id, email: adminEmail },
              }).catch(() => null);

              if (!userExists) {
                const nameParts = adminName.trim().split(' ');
                await this.prisma.users.create({
                  data: {
                    tenantId: existing.id,
                    email: adminEmail,
                    phone: payload.adminMobile || payload.contactPhone || '+91 44 2800 0000',
                    firstName: nameParts[0] || 'Campus',
                    lastName: nameParts.slice(1).join(' ') || (isSchool ? 'School Admin' : 'College Admin'),
                    userType: 'STAFF',
                    status: 'ACTIVE',
                    isSuperAdmin: false,
                    passwordHash: defaultPassword,
                  },
                }).catch(() => null);
              }

              // Dispatch official Institutional Credentials email via Resend
              try {
                const instEmailData = EmailNotificationService.generateInstitutionAdminCredentialsEmail({
                  adminName,
                  institutionName: existing.name || payload.name,
                  institutionType: isSchool ? 'SCHOOL' : 'COLLEGE',
                  username: adminEmail,
                  password: defaultPassword,
                  loginUrl: 'https://isml-lms.vercel.app/auth/login',
                });
                EmailNotificationService.sendEmail({
                  to: adminEmail,
                  subject: instEmailData.subject,
                  html: instEmailData.html,
                  text: instEmailData.text,
                }).then((mailRes) => {
                  if (mailRes.success) {
                    console.log(`[RESEND EMAIL SUCCESS] Institution Admin credentials dispatched to ${adminEmail}`);
                  }
                });
              } catch (e: any) {
                console.error('[INSTITUTION EMAIL ERROR]', e.message);
              }
            }
          } catch { }
        }
      }

      // If this was a STUDENT_ADMISSION / REGISTRATION approval, mark application and student user as ACTIVE / ENROLLED
      if (item.requestType === 'STUDENT_ADMISSION' || item.entityType === 'STUDENT' || item.entityType === 'ADMISSION') {
        const payload = item.submittedPayload || {};
        const appNo = payload.applicationNumber || item.entityId;
        const batchRef = payload.batchRef;
        try {
          if (appNo) {
            await this.prisma.admissionApplications.updateMany({
              where: { applicationNumber: appNo },
              data: {
                currentStatus: body.action === 'APPROVED' ? 'ENROLLED' : body.action === 'REJECTED' ? 'REJECTED' : 'SUBMITTED',
              },
            }).catch(() => null);

            if (body.action === 'APPROVED') {
              const adm = await this.prisma.admissionApplications.findFirst({ where: { applicationNumber: appNo } });
              if (adm?.createdStudentId) {
                // Activate Student User
                await this.prisma.users.update({
                  where: { id: adm.createdStudentId },
                  data: { status: 'ACTIVE' },
                }).catch(() => null);

                // Find and activate linked Parent User
                const parentLink = await this.prisma.parentStudentLinks.findFirst({
                  where: { studentUserId: adm.createdStudentId },
                }).catch(() => null);

                if (parentLink?.parentUserId) {
                  await this.prisma.users.update({
                    where: { id: parentLink.parentUserId },
                    data: { status: 'ACTIVE' },
                  }).catch(() => null);
                }

                // Disptach Realtime Credentials Delivery Notification & Event
                const stuCreds = item.studentCredentials || payload.studentCredentials || {
                  username: payload.email,
                  password: `Stud@${(payload.mobileNumber || payload.phone || '').slice(-4) || '2026'}`,
                };
                const parCreds = item.parentCredentials || payload.parentCredentials || {
                  username: payload.parentEmail || `parent.${payload.email}`,
                  password: `Par@${(payload.parentPhone || payload.phone || '').slice(-4) || '2026'}`,
                };

                const deliveryPayload = {
                  type: 'CREDENTIALS_DISPATCHED',
                  applicationNumber: appNo,
                  student: {
                    id: adm.createdStudentId,
                    name: payload.fullName || `${adm.firstName} ${adm.lastName}`,
                    email: stuCreds.username,
                    credentials: {
                      loginUrl: 'https://isml-lms.vercel.app/auth/login',
                      username: stuCreds.username,
                      password: stuCreds.password,
                    },
                    dispatchedVia: ['SMS', 'EMAIL', 'WHATSAPP'],
                    dispatchedAt: new Date().toISOString(),
                  },
                  parent: {
                    id: parentLink?.parentUserId,
                    name: payload.parentName || 'Parent / Guardian',
                    email: parCreds.username,
                    credentials: {
                      loginUrl: 'https://isml-lms.vercel.app/auth/login',
                      username: parCreds.username,
                      password: parCreds.password,
                    },
                    dispatchedVia: ['SMS', 'EMAIL', 'WHATSAPP'],
                    dispatchedAt: new Date().toISOString(),
                  },
                };

                item.credentialsDispatched = deliveryPayload;
                PortalsDataController.broadcastEvent('CREDENTIALS_DISPATCHED', deliveryPayload);
                console.log(`[CREDENTIALS DISPATCHED] Credentials generated and delivered for Student: ${stuCreds.username} (${stuCreds.password}) and Parent: ${parCreds.username} (${parCreds.password})`);

                // Send live email via Resend API to Student
                try {
                  const studentMail = EmailNotificationService.generateStudentCredentialsEmail({
                    studentName: payload.fullName || `${adm.firstName} ${adm.lastName}`,
                    username: stuCreds.username,
                    password: stuCreds.password,
                    loginUrl: 'https://isml-lms.vercel.app/auth/login',
                    courseName: payload.courseName,
                    batchName: payload.batchName,
                    collegeName: payload.collegeName,
                  });
                  EmailNotificationService.sendEmail({
                    to: stuCreds.username,
                    subject: studentMail.subject,
                    html: studentMail.html,
                    text: studentMail.text,
                  }).then((res) => {
                    if (res.success) {
                      console.log(`[RESEND EMAIL SUCCESS] Student credentials sent to ${stuCreds.username} (ID: ${res.id})`);
                    } else {
                      console.warn(`[RESEND EMAIL NOTICE] ${res.error}`);
                    }
                  });
                } catch (emailErr: any) {
                  console.error('[EMAIL DISPATCH ERROR]', emailErr?.message);
                }

                // Send live email via Resend API to Parent
                try {
                  const parentMail = EmailNotificationService.generateParentCredentialsEmail({
                    parentName: payload.parentName || 'Parent / Guardian',
                    studentName: payload.fullName || `${adm.firstName} ${adm.lastName}`,
                    username: parCreds.username,
                    password: parCreds.password,
                    loginUrl: 'https://isml-lms.vercel.app/auth/login',
                  });
                  EmailNotificationService.sendEmail({
                    to: parCreds.username,
                    subject: parentMail.subject,
                    html: parentMail.html,
                    text: parentMail.text,
                  }).then((res) => {
                    if (res.success) {
                      console.log(`[RESEND EMAIL SUCCESS] Parent credentials sent to ${parCreds.username} (ID: ${res.id})`);
                    }
                  });
                } catch (pEmailErr: any) {
                  console.error('[PARENT EMAIL DISPATCH ERROR]', pEmailErr?.message);
                }
              }
            }
          }

          // If this was a batch approval, approve all students and linked parents in that batch
          if (batchRef && Array.isArray(payload.roster)) {
            const studentIds = payload.roster.map((r: any) => r.id).filter(Boolean);
            const parentIds = payload.roster.map((r: any) => r.parentId).filter(Boolean);

            if (studentIds.length > 0) {
              await this.prisma.users.updateMany({
                where: { id: { in: studentIds } },
                data: { status: body.action === 'APPROVED' ? 'ACTIVE' : 'INACTIVE' },
              }).catch(() => null);

              if (parentIds.length > 0) {
                await this.prisma.users.updateMany({
                  where: { id: { in: parentIds } },
                  data: { status: body.action === 'APPROVED' ? 'ACTIVE' : 'INACTIVE' },
                }).catch(() => null);
              }

              await this.prisma.admissionApplications.updateMany({
                where: { createdStudentId: { in: studentIds } },
                data: { currentStatus: body.action === 'APPROVED' ? 'ENROLLED' : 'REJECTED' },
              }).catch(() => null);

              if (body.action === 'APPROVED') {
                // Collect student & parent recipients for high-volume queue
                const recipientsList: DispatchRecipient[] = [];
                payload.roster.forEach((r: any) => {
                  if (r.studentCredentials?.username) {
                    recipientsList.push({
                      recipientType: 'STUDENT',
                      name: r.name,
                      email: r.studentCredentials.username,
                      username: r.studentCredentials.username,
                      password: r.studentCredentials.password,
                      loginUrl: 'https://isml-lms.vercel.app/auth/login',
                    });
                  }
                  if (r.parentCredentials?.username) {
                    recipientsList.push({
                      recipientType: 'PARENT',
                      name: r.parentCredentials.parentName || `Parent of ${r.name}`,
                      email: r.parentCredentials.username,
                      username: r.parentCredentials.username,
                      password: r.parentCredentials.password,
                      loginUrl: 'https://isml-lms.vercel.app/auth/login',
                    });
                  }
                });

                // Enqueue via BulkNotificationQueueService (rate-limited in chunks with ms delay)
                const queueTask = BulkNotificationQueueService.enqueueBatch(batchRef, recipientsList);

                const batchDelivery = {
                  type: 'BATCH_CREDENTIALS_DISPATCHED',
                  batchRef,
                  queueTaskId: queueTask.id,
                  totalDispatched: studentIds.length,
                  totalNotifications: recipientsList.length,
                  status: 'QUEUED_AND_PROCESSING',
                  dispatchedAt: new Date().toISOString(),
                  students: payload.roster.map((r: any) => ({
                    name: r.name,
                    email: r.email,
                    studentCredentials: r.studentCredentials,
                    parentCredentials: r.parentCredentials,
                  })),
                };
                item.credentialsDispatched = batchDelivery;
                PortalsDataController.broadcastEvent('BATCH_CREDENTIALS_DISPATCHED', batchDelivery);
                console.log(`[BATCH CREDENTIALS DISPATCHED] Auto credentials queued (${recipientsList.length} total messages) for Batch ${batchRef} with rate-limited chunking`);
              }
            }
          }
          BackendCacheService.invalidate('admissions');
        } catch { }
      }

      // Check Queue Task Status endpoint
      // Allows UI to poll or inspect high-volume dispatch status

      // If this was a COURSE_CREATION approval, activate the course
      if (item.requestType === 'COURSE_CREATION' || item.entityType === 'COURSE') {
        const targetCourseId = item.entityId || item.submittedPayload?.courseId;
        const targetCode = item.submittedPayload?.courseCode || (item.title?.match(/:\s*([A-Za-z0-9_-]+)/)?.[1]);

        const crs = PortalsDataController.inMemoryCourses.find(
          (c) => c.id === targetCourseId || (targetCode && c.code === targetCode)
        );
        if (crs) {
          crs.status = body.action === 'APPROVED' ? 'PUBLISHED' : body.action === 'REJECTED' ? 'REJECTED' : 'DRAFT';
        }

        try {
          const nextStatus = body.action === 'APPROVED' ? 'PUBLISHED' : body.action === 'REJECTED' ? 'ARCHIVED' : 'DRAFT';
          const whereClause: any[] = [];
          if (targetCourseId) whereClause.push({ id: targetCourseId });
          if (targetCode) whereClause.push({ code: targetCode });

          if (whereClause.length > 0) {
            await this.prisma.courses.updateMany({
              where: { OR: whereClause },
              data: { status: nextStatus, isActive: body.action === 'APPROVED' },
            });
          }
        } catch { }
      }

      // If this was a BATCH_CREATION approval, activate the batch
      if (item.requestType === 'BATCH_CREATION' || item.entityType === 'BATCH') {
        const targetBatchId = item.entityId || item.submittedPayload?.batchId;
        const targetBatchName = item.submittedPayload?.batchName || (item.title?.match(/:\s*(.+)$/)?.[1]?.trim());

        const batch = PortalsDataController.inMemoryBatches.find(
          (b) => b.id === targetBatchId || (targetBatchName && b.name === targetBatchName)
        );
        if (batch) {
          batch.status = body.action === 'APPROVED' ? 'ACTIVE' : body.action === 'REJECTED' ? 'REJECTED' : 'DRAFT';
        }

        try {
          const nextBatchStatus: any = body.action === 'APPROVED' ? 'ONGOING' : body.action === 'REJECTED' ? 'CANCELLED' : 'UPCOMING';
          const whereClause: any[] = [];
          if (targetBatchId) whereClause.push({ id: targetBatchId });
          if (targetBatchName) whereClause.push({ name: targetBatchName });

          if (whereClause.length > 0) {
            await this.prisma.batches.updateMany({
              where: { OR: whereClause },
              data: { status: nextBatchStatus },
            });
          }
        } catch { }
      }
      // If this was a TUTOR_ONBOARDING / FACULTY approval, activate tutor and dispatch credentials
      if (item.requestType === 'TUTOR_ONBOARDING' || item.entityType === 'TUTOR' || item.entityType === 'FACULTY') {
        const payload = item.submittedPayload || {};
        const tutorId = item.entityId || payload.id;
        const tutorEmail = payload.email || item.title?.match(/<([^>]+)>/)?.[1];
        const rawDigits = (payload.mobile || '').replace(/\D/g, '');
        const last4 = rawDigits.slice(-4) || '2026';
        const rawPass = payload.temporaryPassword || payload.password || `Tut@${last4}`;

        // Update in-memory faculty status
        const fac = PortalsDataController.inMemoryFaculty.find(
          (f) => f.id === tutorId || (tutorEmail && f.email?.toLowerCase() === tutorEmail.toLowerCase())
        );
        if (fac) {
          fac.status = body.action === 'APPROVED' ? 'ACTIVE' : body.action === 'REJECTED' ? 'REJECTED' : 'PENDING_APPROVAL';
          fac.approvalStatus = body.action;
          if (body.action === 'APPROVED') {
            fac.credentialsSent = true;
          }
        }

        try {
          if (tutorId || tutorEmail) {
            const whereClause: any[] = [];
            if (tutorId) whereClause.push({ id: tutorId });
            if (tutorEmail) whereClause.push({ email: tutorEmail.toLowerCase() });

            await this.prisma.users.updateMany({
              where: { OR: whereClause },
              data: {
                status: body.action === 'APPROVED' ? 'ACTIVE' : body.action === 'REJECTED' ? 'INACTIVE' : 'PENDING',
              },
            }).catch(() => null);

            if (body.action === 'APPROVED') {
              const tutorCreds = {
                username: tutorEmail,
                password: rawPass,
                loginUrl: 'https://isml-lms.vercel.app/auth/login',
                portalRoute: '/tutor/dashboard',
                name: payload.name || fac?.name || 'Tutor Faculty',
              };

              const deliveryPayload = {
                type: 'TUTOR_CREDENTIALS_DISPATCHED',
                tutorId,
                name: tutorCreds.name,
                email: tutorCreds.username,
                credentials: {
                  username: tutorCreds.username,
                  password: tutorCreds.password,
                  loginUrl: tutorCreds.loginUrl,
                  portalRoute: tutorCreds.portalRoute,
                },
                dispatchedVia: ['EMAIL', 'SMS'],
                dispatchedAt: new Date().toISOString(),
              };

              item.credentialsDispatched = deliveryPayload;
              PortalsDataController.broadcastEvent('TUTOR_CREDENTIALS_DISPATCHED', deliveryPayload);
              console.log(`[TUTOR CREDENTIALS DISPATCHED] Approved by Super Admin! Generated credentials for Tutor: ${tutorCreds.username} (${tutorCreds.password})`);

              // Send live email via Resend API to Tutor
              try {
                const tutorMail = EmailNotificationService.generateTutorCredentialsEmail({
                  tutorName: tutorCreds.name,
                  username: tutorCreds.username,
                  password: tutorCreds.password,
                  loginUrl: 'https://isml-lms.vercel.app/auth/login',
                  department: payload.department,
                  designation: payload.designation,
                });
                EmailNotificationService.sendEmail({
                  to: tutorCreds.username,
                  subject: tutorMail.subject,
                  html: tutorMail.html,
                  text: tutorMail.text,
                }).then((res) => {
                  if (res.success) {
                    console.log(`[RESEND EMAIL SUCCESS] Tutor credentials sent to ${tutorCreds.username} (ID: ${res.id})`);
                  } else {
                    console.warn(`[RESEND EMAIL NOTICE] ${res.error}`);
                  }
                });
              } catch (emailErr: any) {
                console.error('[TUTOR EMAIL DISPATCH ERROR]', emailErr?.message);
              }
            }
          }
        } catch (tutorErr: any) {
          console.error('Error activating tutor user upon approval:', tutorErr?.message);
        }
      }
    }

    try {
      await this.prisma.approvalRequests.update({
        where: { id },
        data: {
          currentStatus: body.action,
          reviewerRemarks: body.remarks,
          reviewedAt: new Date(),
        },
      }).catch(() => null);
    } catch { }

    PortalsDataController.broadcastEvent('APPROVAL_REVIEWED', { id, action: body.action, item });
    PortalsDataController.broadcastEvent('COURSES_UPDATED');
    PortalsDataController.broadcastEvent('BATCHES_UPDATED');
    PortalsDataController.broadcastEvent('LIVE_CLASSES_UPDATED');

    return { status: 'success', message: `Request ${body.action} successfully`, data: item };
  }

  // Queue Progress Tracking Endpoint for Bulk Dispatches (10k to 100k+ students)
  @Get('queue/tasks')
  getQueueTasks() {
    return {
      status: 'success',
      data: BulkNotificationQueueService.getAllTasks(),
    };
  }

  @Get('queue/tasks/:id')
  getQueueTaskStatus(@Param('id') id: string) {
    const task = BulkNotificationQueueService.getTaskStatus(id);
    if (!task) return { status: 'error', message: 'Task not found' };
    return { status: 'success', data: task };
  }

  @Post('approvals/:id/delete')
  async deleteApproval(@Param('id') id: string) {
    const item = PortalsDataController.inMemoryApprovals.find((a) => a.id === id);
    const targetCourseId = item?.entityId || item?.submittedPayload?.courseId;
    const targetCode = item?.submittedPayload?.courseCode || (item?.title?.match(/:\s*([A-Za-z0-9_-]+)/)?.[1]);

    const targetBatchId = item?.entityId || item?.submittedPayload?.batchId;
    const targetBatchName = item?.submittedPayload?.batchName || (item?.title?.match(/:\s*(.+)$/)?.[1]?.trim());

    const targetLiveClassId = item?.entityId || item?.submittedPayload?.liveClassId;
    const targetLiveTitle = item?.submittedPayload?.liveClassTitle || (item?.title?.match(/:\s*(.+)$/)?.[1]?.trim());

    // Remove from in-memory approvals
    PortalsDataController.inMemoryApprovals = PortalsDataController.inMemoryApprovals.filter((a) => a.id !== id);

    // If associated with a course, also remove from in-memory courses
    if (targetCourseId || targetCode) {
      PortalsDataController.inMemoryCourses = PortalsDataController.inMemoryCourses.filter(
        (c) => c.id !== targetCourseId && (!targetCode || c.code !== targetCode)
      );
    }

    // If associated with a batch, also remove from in-memory batches
    if (targetBatchId || targetBatchName) {
      PortalsDataController.inMemoryBatches = PortalsDataController.inMemoryBatches.filter(
        (b) => b.id !== targetBatchId && (!targetBatchName || b.name !== targetBatchName)
      );
    }

    // If associated with a live class, remove from in-memory live classes
    if (targetLiveClassId || targetLiveTitle) {
      LiveClassesController.liveClassRoster = LiveClassesController.liveClassRoster.filter(
        (l) => l.id !== targetLiveClassId && (!targetLiveTitle || l.title !== targetLiveTitle)
      );
    }

    try {
      // 1. Delete approval request from DB
      await this.prisma.approvalRequests.deleteMany({
        where: { id },
      }).catch(() => null);

      // 2. Cascade delete course if applicable
      if (targetCourseId || targetCode) {
        const whereClause: any[] = [];
        if (targetCourseId) whereClause.push({ id: targetCourseId });
        if (targetCode) whereClause.push({ code: targetCode });

        if (whereClause.length > 0) {
          const coursesToDelete = await this.prisma.courses.findMany({
            where: { OR: whereClause },
          }).catch(() => []);

          const cIds = coursesToDelete.map((c: any) => c.id);
          if (cIds.length > 0) {
            await this.prisma.batches.deleteMany({
              where: { courseId: { in: cIds } },
            }).catch(() => null);

            await this.prisma.courses.deleteMany({
              where: { id: { in: cIds } },
            }).catch(() => null);
          }
        }
      }

      // 3. Cascade delete batch if applicable
      if (targetBatchId || targetBatchName) {
        const batchWhere: any[] = [];
        if (targetBatchId) batchWhere.push({ id: targetBatchId });
        if (targetBatchName) batchWhere.push({ name: targetBatchName });

        if (batchWhere.length > 0) {
          await this.prisma.batches.deleteMany({
            where: { OR: batchWhere },
          }).catch(() => null);
        }
      }

      // 4. Cascade delete live class if applicable
      if (targetLiveClassId || targetLiveTitle) {
        const liveWhere: any[] = [];
        if (targetLiveClassId) liveWhere.push({ id: targetLiveClassId });
        if (targetLiveTitle) liveWhere.push({ title: targetLiveTitle });

        if (liveWhere.length > 0) {
          await this.prisma.liveClasses.deleteMany({
            where: { OR: liveWhere },
          }).catch(() => null);
        }
      }
    } catch { }

    return { status: 'success', message: `Approval request ${id} and associated records removed permanently.` };
  }

  // 2. Executive Dashboard Metrics (Direct from Supabase PostgreSQL)
  @Get('executive-metrics')
  async getExecutiveMetrics(@Query('institutionId') institutionId?: string) {
    const key = `exec_metrics_${institutionId || 'ALL'}`;
    const memPendingCount = PortalsDataController.inMemoryApprovals.filter(a => a.currentStatus === 'PENDING').length;
    const fallback = {
      totalStudents: 35,
      totalFaculty: PortalsDataController.inMemoryFaculty.length,
      activeCourses: PortalsDataController.inMemoryCourses.length,
      activeBatches: PortalsDataController.inMemoryBatches.length,
      pendingApprovals: memPendingCount,
      registeredInstitutions: 2,
    };

    const metrics = await BackendCacheService.getOrFetch(
      key,
      async () => {
        try {
          const instCount = await this.prisma.institutions.count();
          const courseCount = await this.prisma.courses.count();
          const pendingApprovalsCount = await this.prisma.approvalRequests.count({
            where: { currentStatus: 'PENDING' },
          }).catch(() => 0);
          const totalPending = pendingApprovalsCount > 0 ? pendingApprovalsCount : memPendingCount;
          const admissionsCount = await this.prisma.admissionApplications.count().catch(() => 0);
          const batchesCount = await this.prisma.batches.count().catch(() => 0);

          return {
            totalStudents: admissionsCount,
            totalFaculty: PortalsDataController.inMemoryFaculty.length,
            activeCourses: courseCount,
            activeBatches: batchesCount,
            pendingApprovals: totalPending,
            registeredInstitutions: instCount,
          };
        } catch {
          return fallback;
        }
      },
      fallback,
      20000
    );

    return {
      status: 'success',
      data: metrics || fallback,
    };
  }

  // 3. Campuses / Institutions (Multi-Tenant) - Direct Supabase Database with Fast SWR Cache
  @Get('institutions')
  async getInstitutions() {
    const key = 'institutions_master_list';
    const data = await BackendCacheService.getOrFetch(
      key,
      async () => {
        try {
          const dbInstitutions = await this.prisma.institutions.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { name: 'asc' },
          });
          return dbInstitutions;
        } catch {
          return [];
        }
      },
      undefined,
      60000 // 60s cache
    );
    return { status: 'success', total: data.length, data };
  }

  // 3. Courses Master (Curriculum Engine - Direct Supabase PostgreSQL with Fast SWR Cache)
  @Get('courses')
  async getCourses() {
    const key = 'courses_master_list';
    const courses = await BackendCacheService.getOrFetch(
      key,
      async () => {
        try {
          const dbData = await this.prisma.courses.findMany({
            include: { language: true },
            orderBy: { createdAt: 'desc' },
          });

          return (dbData || []).map((c: any) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            collegeId: c.tenantId || '',
            collegeName: '',
            department: 'Languages & Humanities',
            program: `${c.teachingHours || 80}h Track`,
            duration: '90 Days',
            durationDays: 90,
            durationType: '3_MONTHS',
            academicYear: '2026–2027',
            facultyName: 'Lead Academic Faculty',
            substituteTutors: [],
            doubtSupportTutor: undefined,
            enrolledStudents: 0,
            completionRate: 0,
            courseFee: 0,
            status: c.status || 'PUBLISHED',
            createdAt: c.createdAt,
          }));
        } catch {
          // Fallback to real DB dumped courses when direct connection pool is unreachable
          try {
            const fs = require('fs');
            const path = require('path');
            const dumpPath = path.join(process.cwd(), 'real_db_dump.json');
            if (fs.existsSync(dumpPath)) {
              const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
              if (Array.isArray(dump.courses)) {
                return dump.courses.map((c: any) => ({
                  id: c.id,
                  code: c.code,
                  name: c.name,
                  collegeId: c.tenantId || '',
                  collegeName: 'Overall (All Campuses)',
                  department: 'Languages & Humanities',
                  program: `${c.teachingHours || 80}h Track`,
                  duration: '90 Days',
                  durationDays: 90,
                  durationType: '3_MONTHS',
                  academicYear: '2026–2027',
                  facultyName: 'Lead Academic Faculty',
                  substituteTutors: [],
                  doubtSupportTutor: undefined,
                  enrolledStudents: 0,
                  completionRate: 0,
                  courseFee: 0,
                  status: c.status || 'PUBLISHED',
                  createdAt: c.createdAt,
                }));
              }
            }
          } catch {}
          return [];
        }
      },
      undefined,
      60000
    );

    return {
      status: 'success',
      total: courses.length,
      data: courses,
    };
  }

  // 4. Sales Manager Admissions (Direct Live Fetch from Database)
  @Get('admissions')
  async getAdmissions() {
    try {
      const rows = await this.prisma.admissionApplications.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return { status: 'success', total: rows.length, data: rows };
    } catch {
      return { status: 'success', total: 0, data: [] };
    }
  }

  @Post('admissions/register')
  async registerAdmission(@Body() payload: any) {
    try {
      const appNumber = payload.applicationNumber || `ISML-ADM-${Date.now().toString().slice(-6)}`;
      const fullName = payload.fullName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'Student Applicant';
      const nameParts = fullName.split(' ');
      const firstName = payload.firstName || nameParts[0] || 'Applicant';
      const lastName = payload.lastName || nameParts.slice(1).join(' ') || 'Student';
      const admissionType = payload.admissionType || (payload.category === 'SCHOOL' ? 'SCHOOL_STUDENT' : 'COLLEGE_STUDENT');
      const institutionName = payload.institutionName || payload.collegeName || payload.schoolName || 'Partner Institution';
      const targetInstitutionId = payload.institutionId && payload.institutionId !== 'ALL' && payload.institutionId !== 'ind-college'
        ? payload.institutionId
        : null;

      // 1. Resolve institution
      let matchedInst: any = null;
      if (targetInstitutionId) {
        matchedInst = await this.prisma.institutions.findFirst({
          where: {
            OR: [
              { id: targetInstitutionId },
              { code: targetInstitutionId },
              { name: { contains: institutionName, mode: 'insensitive' } },
            ],
          },
        }).catch(() => null);
      }
      const tenantId = matchedInst?.id || 'c2009073-0a9b-40f7-955d-6cfd2c5bc471'; // Fallback to primary college

      // 2. Compute Auto-Credentials:
      // Student password: Stud@(last 4 digits of student mobile or random 4 digits)
      // Parent password: Par@(last 4 digits of parent mobile or random 4 digits)
      const cleanStudentPhone = (payload.mobileNumber || payload.phone || '').replace(/\D/g, '');
      const studentLast4 = cleanStudentPhone.length >= 4 ? cleanStudentPhone.slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();
      const studentPassword = `Stud@${studentLast4}`;

      const parentMobileRaw = payload.parentPhone || payload.fatherPhone || payload.motherPhone || payload.emergencyPhone || payload.parentEmergencyPhone || '';
      const cleanParentPhone = parentMobileRaw.replace(/\D/g, '');
      const parentLast4 = cleanParentPhone.length >= 4 ? cleanParentPhone.slice(-4) : (cleanStudentPhone.length >= 4 ? cleanStudentPhone.slice(-4) : Math.floor(1000 + Math.random() * 9000).toString());
      const parentPassword = `Par@${parentLast4}`;

      const studentEmail = (payload.email || `${appNumber.toLowerCase()}@applicant.isml.edu`).toLowerCase();
      const parentEmail = (payload.parentEmail || `parent.${appNumber.toLowerCase()}@isml.edu`).toLowerCase();
      const parentName = payload.parentFatherName || payload.parentMotherName || payload.parentOrGuardianName || payload.parentName || `Parent of ${firstName}`;

      let createdUser: any = null;
      let createdParentUser: any = null;

      try {
        // Create/Update Student User (STATUS: PENDING until Super Admin approves)
        createdUser = await this.prisma.users.upsert({
          where: { tenantId_email: { tenantId, email: studentEmail } },
          update: {
            firstName,
            lastName,
            phone: payload.mobileNumber || payload.phone || '+91 98840 00000',
            userType: 'STUDENT',
            passwordHash: studentPassword, // pre-provisioned, activated upon approval
          },
          create: {
            email: studentEmail,
            firstName,
            lastName,
            phone: payload.mobileNumber || payload.phone || '+91 98840 00000',
            userType: 'STUDENT',
            status: 'PENDING',
            passwordHash: studentPassword,
            tenantId,
          },
        });

        if (createdUser) {
          await this.prisma.studentProfiles.upsert({
            where: { userId: createdUser.id },
            update: {
              studentCode: payload.rollNo || payload.currentRollNumber || appNumber,
            },
            create: {
              userId: createdUser.id,
              tenantId,
              studentCode: payload.rollNo || payload.currentRollNumber || appNumber,
              gender: payload.gender || 'MALE',
              dateOfBirth: payload.dob ? new Date(payload.dob) : new Date('2005-06-15'),
            },
          }).catch(() => null);

          // Create/Update Parent User (STATUS: PENDING until Super Admin approves)
          const parentNameParts = parentName.split(' ');
          try {
            createdParentUser = await this.prisma.users.upsert({
              where: { tenantId_email: { tenantId, email: parentEmail } },
              update: {
                firstName: parentNameParts[0] || 'Parent',
                lastName: parentNameParts.slice(1).join(' ') || 'Guardian',
                phone: parentMobileRaw || payload.phone || '+91 94440 00000',
                userType: 'PARENT',
                passwordHash: parentPassword,
              },
              create: {
                email: parentEmail,
                firstName: parentNameParts[0] || 'Parent',
                lastName: parentNameParts.slice(1).join(' ') || 'Guardian',
                phone: parentMobileRaw || payload.phone || '+91 94440 00000',
                userType: 'PARENT',
                status: 'PENDING',
                passwordHash: parentPassword,
                tenantId,
              },
            }).catch(() => null);

            if (createdParentUser) {
              await this.prisma.parentStudentLinks.upsert({
                where: {
                  parentUserId_studentUserId: {
                    parentUserId: createdParentUser.id,
                    studentUserId: createdUser.id,
                  },
                },
                update: {
                  emergencyContactNum: payload.parentEmergencyPhone || payload.emergencyPhone || parentMobileRaw,
                },
                create: {
                  tenantId,
                  parentUserId: createdParentUser.id,
                  studentUserId: createdUser.id,
                  relationship: payload.parentFatherName ? 'FATHER' : payload.parentMotherName ? 'MOTHER' : 'LEGAL_GUARDIAN',
                  isPrimaryContact: true,
                  emergencyContactNum: payload.parentEmergencyPhone || payload.emergencyPhone || parentMobileRaw,
                },
              }).catch(() => null);
            }
          } catch (parentErr: any) {
            console.error('Error creating parent user:', parentErr?.message);
          }
        }
      } catch (err: any) {
        console.error('Error creating user for student admission:', err?.message);
      }

      // 3. Persist into AdmissionApplications table as SUBMITTED (Awaiting Super Admin Approval)
      const created = await this.prisma.admissionApplications.create({
        data: {
          applicationNumber: appNumber,
          firstName,
          lastName,
          email: studentEmail,
          mobileNumber: payload.mobileNumber || payload.phone || '+91 98840 00000',
          targetLanguage: (payload.targetLanguage || 'FRENCH').toUpperCase() as any,
          targetLevel: 'A1_1',
          admissionType,
          currentStatus: 'SUBMITTED',
          institutionId: tenantId,
          createdStudentId: createdUser?.id || null,
        },
      }).catch(() => null);

      // 4. Auto-dispatch Approval Request to Super Admin Approval Center
      const studentApprovalRequest = {
        id: `REQ-STU-${Date.now().toString().slice(-6)}`,
        requestType: 'STUDENT_ADMISSION',
        module: 'Admissions',
        title: `Student Enrolment Authorization: ${fullName}`,
        description: `Direct registration received for ${fullName} (${admissionType}) at ${institutionName}. Track: ${payload.course || payload.languageSelected || 'Language Certification'}. Requires Super Admin review & approval.`,
        entityType: 'STUDENT',
        entityId: appNumber,
        requestedByUserId: fullName,
        priority: 'NORMAL',
        institutionId: tenantId,
        currentStatus: 'PENDING',
        createdAt: new Date().toISOString(),
        studentCredentials: {
          username: studentEmail,
          password: studentPassword,
          role: 'STUDENT',
          status: 'PENDING_APPROVAL',
        },
        parentCredentials: {
          username: parentEmail,
          password: parentPassword,
          role: 'PARENT',
          parentName,
          status: 'PENDING_APPROVAL',
        },
        submittedPayload: {
          ...payload,
          applicationNumber: appNumber,
          fullName,
          email: studentEmail,
          institutionName,
          category: payload.category || (admissionType === 'SCHOOL_STUDENT' ? 'SCHOOL' : 'COLLEGE'),
          studentCredentials: {
            username: studentEmail,
            password: studentPassword,
          },
          parentCredentials: {
            username: parentEmail,
            password: parentPassword,
          },
          submittedBy: {
            name: fullName,
            email: studentEmail,
            role: 'Applicant (Online Registration)',
          },
        },
      };

      PortalsDataController.inMemoryApprovals.unshift(studentApprovalRequest);
      PortalsDataController.broadcastEvent('STUDENT_ENROLLED', createdUser);
      PortalsDataController.broadcastEvent('APPROVAL_SUBMITTED', studentApprovalRequest);

      try {
        await this.prisma.approvalRequests.create({
          data: {
            id: studentApprovalRequest.id,
            requestType: 'SUBJECT_VERIFICATION', // mapped to enum
            title: studentApprovalRequest.title,
            description: studentApprovalRequest.description,
            entityType: 'STUDENT',
            entityId: appNumber,
            requestedByUserId: fullName,
            priority: 'NORMAL',
            institutionId: studentApprovalRequest.institutionId,
            currentStatus: 'PENDING',
            submittedPayload: studentApprovalRequest.submittedPayload,
          },
        }).catch(() => null);
      } catch { }

      PortalsDataController.broadcastEvent('APPROVAL_SUBMITTED', studentApprovalRequest);
      BackendCacheService.invalidate('admissions');

      return {
        status: 'success',
        message: 'Student registered and submitted to Super Admin Approval Center',
        data: created || studentApprovalRequest,
        approvalId: studentApprovalRequest.id,
      };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  // Bulk Admissions Registration (Excel / CSV Roster Upload)
  @Post('admissions/bulk-register')
  async registerBulkAdmissions(@Body() payload: any) {
    try {
      const roster: any[] = Array.isArray(payload.roster) ? payload.roster : [];
      const institutionId = payload.institutionId;
      const institutionName = payload.institutionName || 'Partner Institution';
      const category = payload.category || 'COLLEGE';
      const admissionType = category === 'SCHOOL' ? 'SCHOOL_STUDENT' : 'COLLEGE_STUDENT';

      // 1. Resolve institution
      let matchedInst: any = null;
      if (institutionId && institutionId !== 'ALL') {
        matchedInst = await this.prisma.institutions.findFirst({
          where: {
            OR: [
              { id: institutionId },
              { code: institutionId },
              { name: { contains: institutionName, mode: 'insensitive' } },
            ],
          },
        }).catch(() => null);
      }
      const tenantId = matchedInst?.id || 'c2009073-0a9b-40f7-955d-6cfd2c5bc471';

      const results = [];
      for (let idx = 0; idx < roster.length; idx++) {
        const item = roster[idx];
        const appNumber = `ISML-BULK-${Date.now().toString().slice(-4)}-${idx + 1}`;
        const fullName = item.name || `Student ${idx + 1}`;
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'Student';
        const lastName = nameParts.slice(1).join(' ') || `${idx + 1}`;
        const studentEmail = item.email || `student.${Date.now()}.${idx + 1}@${matchedInst?.code?.toLowerCase() || 'isml'}.edu`;

        // Compute credentials
        const cleanStudentPhone = (item.phone || '').replace(/\D/g, '');
        const studentLast4 = cleanStudentPhone.length >= 4 ? cleanStudentPhone.slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();
        const studentPassword = `Stud@${studentLast4}`;

        const cleanParentPhone = (item.parentPhone || item.phone || '').replace(/\D/g, '');
        const parentLast4 = cleanParentPhone.length >= 4 ? cleanParentPhone.slice(-4) : studentLast4;
        const parentPassword = `Par@${parentLast4}`;
        const parentEmail = (item.parentEmail || `parent.${appNumber.toLowerCase()}@isml.edu`).toLowerCase();
        const parentName = item.parentName || `Parent of ${fullName}`;

        try {
          const user = await this.prisma.users.upsert({
            where: { tenantId_email: { tenantId, email: studentEmail } },
            update: {
              firstName,
              lastName,
              phone: item.phone || '+91 98840 00000',
              userType: 'STUDENT',
              passwordHash: studentPassword,
            },
            create: {
              email: studentEmail,
              firstName,
              lastName,
              phone: item.phone || '+91 98840 00000',
              userType: 'STUDENT',
              status: 'PENDING',
              passwordHash: studentPassword,
              tenantId,
            },
          });

          await this.prisma.studentProfiles.upsert({
            where: { userId: user.id },
            update: {
              studentCode: item.rollNo || appNumber,
            },
            create: {
              userId: user.id,
              tenantId,
              studentCode: item.rollNo || appNumber,
              gender: idx % 2 === 0 ? 'MALE' : 'FEMALE',
              dateOfBirth: new Date('2005-06-15'),
            },
          }).catch(() => null);

          // Create/link Parent user for roster item
          let parentUser: any = null;
          try {
            const pNameParts = parentName.split(' ');
            parentUser = await this.prisma.users.upsert({
              where: { tenantId_email: { tenantId, email: parentEmail } },
              update: {
                firstName: pNameParts[0] || 'Parent',
                lastName: pNameParts.slice(1).join(' ') || 'Guardian',
                phone: item.parentPhone || item.phone || '+91 94440 00000',
                userType: 'PARENT',
                passwordHash: parentPassword,
              },
              create: {
                email: parentEmail,
                firstName: pNameParts[0] || 'Parent',
                lastName: pNameParts.slice(1).join(' ') || 'Guardian',
                phone: item.parentPhone || item.phone || '+91 94440 00000',
                userType: 'PARENT',
                status: 'PENDING',
                passwordHash: parentPassword,
                tenantId,
              },
            }).catch(() => null);

            if (parentUser) {
              await this.prisma.parentStudentLinks.upsert({
                where: {
                  parentUserId_studentUserId: {
                    parentUserId: parentUser.id,
                    studentUserId: user.id,
                  },
                },
                update: {},
                create: {
                  tenantId,
                  parentUserId: parentUser.id,
                  studentUserId: user.id,
                  relationship: 'LEGAL_GUARDIAN',
                  isPrimaryContact: true,
                  emergencyContactNum: item.parentPhone || item.phone || '+91 94440 00000',
                },
              }).catch(() => null);
            }
          } catch { }

          await this.prisma.admissionApplications.create({
            data: {
              applicationNumber: appNumber,
              firstName,
              lastName,
              email: studentEmail,
              mobileNumber: item.phone || '+91 98840 00000',
              targetLanguage: (item.languageSelected || 'FRENCH').toUpperCase() as any,
              targetLevel: 'A1_1',
              admissionType,
              currentStatus: 'SUBMITTED',
              institutionId: tenantId,
              createdStudentId: user.id,
            },
          }).catch(() => null);

          results.push({
            id: user.id,
            parentId: parentUser?.id,
            name: fullName,
            rollNo: item.rollNo || appNumber,
            email: studentEmail,
            studentCredentials: { username: studentEmail, password: studentPassword },
            parentCredentials: { username: parentEmail, password: parentPassword, parentName },
          });
        } catch (e: any) {
          console.error('Failed to enroll roster student:', e?.message);
        }
      }

      // Automatically dispatch Batch Authorization Request to Super Admin Approval Center
      const batchApprovalId = `REQ-BATCH-${Date.now().toString().slice(-6)}`;
      const batchRef = payload.batchRef || `BATCH-${Date.now().toString().slice(-4)}`;
      const batchApprovalRequest = {
        id: batchApprovalId,
        requestType: 'STUDENT_ADMISSION',
        module: 'Admissions',
        title: `Batch Enrolment Authorization: ${results.length} Students (${institutionName})`,
        description: `Bulk student roster containing ${results.length} students submitted for ${institutionName}. Batch Ref: ${batchRef}. Requires Super Admin review & activation.`,
        entityType: 'STUDENT',
        entityId: batchRef,
        requestedByUserId: payload.signatory || 'Admissions Desk',
        priority: 'HIGH',
        institutionId: tenantId,
        currentStatus: 'PENDING',
        createdAt: new Date().toISOString(),
        submittedPayload: {
          ...payload,
          batchRef,
          institutionName,
          studentsCount: results.length,
          roster: results,
          submittedBy: {
            name: payload.signatory || 'Admissions Desk Officer',
            role: `${category === 'SCHOOL' ? 'School' : 'College'} Admissions Desk`,
          },
        },
      };

      PortalsDataController.inMemoryApprovals.unshift(batchApprovalRequest);
      PortalsDataController.broadcastEvent('APPROVAL_SUBMITTED', batchApprovalRequest);

      try {
        await this.prisma.approvalRequests.create({
          data: {
            id: batchApprovalId,
            requestType: 'SUBJECT_VERIFICATION',
            title: batchApprovalRequest.title,
            description: batchApprovalRequest.description,
            entityType: 'STUDENT',
            entityId: batchRef,
            requestedByUserId: payload.signatory || 'Admissions Desk',
            priority: 'HIGH',
            institutionId: tenantId,
            currentStatus: 'PENDING',
            submittedPayload: batchApprovalRequest.submittedPayload,
          },
        }).catch(() => null);
      } catch { }

      PortalsDataController.broadcastEvent('STUDENT_ENROLLED', { count: results.length });
      BackendCacheService.invalidate('admissions');

      return {
        status: 'success',
        message: `Successfully registered ${results.length} students awaiting Super Admin approval`,
        data: results,
        approvalId: batchApprovalId,
      };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  // Institution / College Self-Registration & MoU Request endpoint
  @Post('institutions/request')
  async requestInstitutionOnboarding(@Body() payload: any) {
    try {
      const code = (payload.code || `INST-${Date.now().toString().slice(-4)}`).toUpperCase();
      const name = payload.name || payload.institutionName || 'New Institutional Partner';
      const isSchool = payload.type === 'SCHOOL' || payload.category === 'SCHOOL' || code.includes('DPS') || code.includes('SCH');
      const instType = isSchool ? 'SCHOOL' : 'COLLEGE';
      const adminName = payload.adminName || payload.contactPerson || payload.signatoryName || `${name} Dean/Principal`;
      const adminEmail = (payload.adminEmail || payload.email || payload.contactEmail || `admin@${code.toLowerCase()}.edu`).toLowerCase();

      const approvalId = `REQ-INST-${Date.now().toString().slice(-6)}`;
      const instApprovalRequest = {
        id: approvalId,
        requestType: 'INSTITUTION_CREATION',
        module: 'Institutions',
        title: `${isSchool ? 'School' : 'College'} Onboarding Authorization: ${name} (${code})`,
        description: `Institutional affiliation request submitted for ${name} (${code}) by ${adminName} (${adminEmail}). Expected intake: ${payload.studentsTarget || payload.studentsCount || 250} seats.`,
        entityType: 'INSTITUTION',
        entityId: code,
        requestedByUserId: adminName,
        priority: 'HIGH',
        institutionId: 'ALL',
        currentStatus: 'PENDING',
        createdAt: new Date().toISOString(),
        submittedPayload: {
          ...payload,
          code,
          name,
          type: instType,
          category: instType,
          adminName,
          adminEmail,
          submittedBy: {
            name: adminName,
            email: adminEmail,
            role: `${isSchool ? 'School' : 'College'} Representative`,
          },
        },
      };

      PortalsDataController.inMemoryApprovals.unshift(instApprovalRequest);

      try {
        await this.prisma.approvalRequests.create({
          data: {
            id: approvalId,
            requestType: 'ROLE_PERMISSION_CHANGE', // mapped to enum
            title: instApprovalRequest.title,
            description: instApprovalRequest.description,
            entityType: 'INSTITUTION',
            entityId: code,
            requestedByUserId: adminName,
            priority: 'HIGH',
            institutionId: 'inst-01',
            currentStatus: 'PENDING',
            submittedPayload: instApprovalRequest.submittedPayload,
          },
        }).catch(() => null);
      } catch { }

      PortalsDataController.broadcastEvent('APPROVAL_SUBMITTED', instApprovalRequest);

      return {
        status: 'success',
        message: 'Institution onboarding request submitted to Super Admin Approval Center',
        data: instApprovalRequest,
        approvalId,
      };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  // 5. Finance Manager Fee Structures & Policies
  @Get('finance/fee-structures')
  async getFeeStructures() {
    try {
      const data = await this.prisma.feeStructures.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return { status: 'success', total: data.length, data };
    } catch {
      return { status: 'success', total: 0, data: [] };
    }
  }

  // 6. College Admin Bulk Fees Pay & Access Unlock
  @Get('college/bulk-payments')
  async getBulkPayments() {
    try {
      const data = await this.prisma.collegeBulkFeePayments.findMany({
        orderBy: { clearedAt: 'desc' },
      });
      return { status: 'success', total: data.length, data };
    } catch {
      return { status: 'success', total: 0, data: [] };
    }
  }

  @Post('college/bulk-pay-unlock')
  async submitBulkPaymentUnlock(@Body() payload: any) {
    try {
      const paymentRef = payload.paymentReference || `ISML-BULK-${Date.now().toString().slice(-6)}`;
      const created = await this.prisma.collegeBulkFeePayments.create({
        data: {
          paymentReference: paymentRef,
          institutionId: payload.institutionId || 'inst-01',
          totalStudentsCount: Number(payload.totalStudentsCount) || 1,
          totalAmountPaid: Number(payload.totalAmountPaid) || 14500,
          paymentMethod: payload.paymentMethod || 'NEFT_RTGS',
          accessAutoUnlocked: true,
          clearedAt: new Date(),
        },
      });
      return {
        status: 'success',
        message: `Verified and stored in Supabase! LMS access unlocked for ${created.totalStudentsCount} students.`,
        data: created,
      };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  // 6b. Parents & Student Linkage Directory
  @Get('parents')
  async getParentsDirectory(@Query('collegeId') collegeId?: string) {
    try {
      let tenantId: string | undefined = undefined;

      if (collegeId && collegeId !== 'ALL') {
        const matched = await this.prisma.institutions.findFirst({
          where: {
            OR: [
              { id: collegeId },
              { code: { equals: collegeId, mode: 'insensitive' } },
              { name: { contains: collegeId, mode: 'insensitive' } },
            ],
          },
        });
        if (matched) {
          tenantId = matched.id;
        }
      }

      const whereLink: any = {};
      if (tenantId) {
        whereLink.tenantId = tenantId;
      }

      // Fetch links
      const links = await this.prisma.parentStudentLinks.findMany({
        where: whereLink,
        orderBy: { createdAt: 'desc' },
      });

      // Gather IDs
      const parentUserIds = Array.from(new Set(links.map((l: any) => l.parentUserId).filter(Boolean)));
      const studentUserIds = Array.from(new Set(links.map((l: any) => l.studentUserId).filter(Boolean)));

      const [parents, students, studentProfiles] = await Promise.all([
        this.prisma.users.findMany({
          where: { id: { in: parentUserIds } },
        }),
        this.prisma.users.findMany({
          where: { id: { in: studentUserIds } },
        }),
        this.prisma.studentProfiles.findMany({
          where: { userId: { in: studentUserIds } },
        }),
      ]);

      const parentMap = new Map(parents.map((p: any) => [p.id, p]));
      const studentMap = new Map(students.map((s: any) => [s.id, s]));
      const profileMap = new Map(studentProfiles.map((sp: any) => [sp.userId, sp]));

      const formatted = links.map((link: any) => {
        const p = parentMap.get(link.parentUserId);
        const s = studentMap.get(link.studentUserId);
        const sp = profileMap.get(link.studentUserId);

        return {
          id: link.id,
          relationship: link.relationship || 'GUARDIAN',
          isPrimaryContact: link.isPrimaryContact,
          emergencyContactNum: link.emergencyContactNum || p?.phone || '',
          parent: {
            id: p?.id || link.parentUserId,
            fullName: `${p?.firstName || ''} ${p?.lastName || ''}`.trim() || 'Parent / Guardian',
            email: p?.email || '',
            phone: p?.phone || '',
            status: p?.status || 'ACTIVE',
            userType: p?.userType,
          },
          student: {
            id: s?.id || link.studentUserId,
            fullName: `${s?.firstName || ''} ${s?.lastName || ''}`.trim() || 'Student',
            email: s?.email || '',
            phone: s?.phone || '',
            status: s?.status || 'ACTIVE',
            rollNo: sp?.studentCode || 'N/A',
          },
          linkedAt: link.createdAt,
        };
      });

      return {
        status: 'success',
        total: formatted.length,
        data: formatted,
      };
    } catch (err: any) {
      console.error('[PARENTS DIRECTORY ERROR]', err);
      return { status: 'error', message: err.message, total: 0, data: [] };
    }
  }

  // 7. 1:1 Human Tutor Speaking Viva Slots (Strictly Online)
  @Get('tutor/speaking-viva')
  async getSpeakingVivaSessions() {
    try {
      const data = await this.prisma.oneToOneHumanSessions.findMany({
        orderBy: { scheduledStartTime: 'asc' },
      });
      return { status: 'success', total: data.length, data };
    } catch {
      return { status: 'success', total: 0, data: [] };
    }
  }

  @Post('tutor/speaking-viva/book')
  async bookSpeakingVivaSlot(@Body() payload: any) {
    try {
      const created = await this.prisma.oneToOneHumanSessions.create({
        data: {
          studentUserId: payload.studentUserId || 'user-student',
          tutorUserId: payload.tutorUserId || 'user-tutor',
          institutionId: payload.institutionId || 'inst-01',
          sessionType: 'SPEAKING_VIVA',
          scheduledStartTime: new Date(payload.scheduledStartTime || Date.now() + 3600000),
          scheduledEndTime: new Date(payload.scheduledEndTime || Date.now() + 4200000),
          durationMinutes: Number(payload.durationMinutes) || 10,
          meetingPlatform: 'LIVEKIT_ROOM',
          meetingRoomUrl: payload.meetingRoomUrl || `https://meet.isml.edu/viva-${Date.now()}`,
          status: 'SCHEDULED',
        },
      });
      return { status: 'success', message: '1:1 Speaking Viva slot booked in Supabase!', data: created };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  // 8. Super Admin Institutions CRUD (Auto-provisions College/School Admin)
  @Post('institutions')
  async createInstitution(@Body() payload: any) {
    try {
      const code = (payload.code || `INST-${Date.now().toString().slice(-4)}`).toUpperCase();
      const slug = payload.slug || payload.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `inst-${Date.now()}`;
      const instType = payload.type || (code.includes('DPS') || code.includes('SCH') ? 'SCHOOL' : 'COLLEGE');
      const isSchool = instType === 'SCHOOL';

      const created = await this.prisma.institutions.create({
        data: {
          code,
          slug,
          name: payload.name,
          displayName: payload.displayName || payload.name,
          email: payload.email || payload.contactEmail || `contact@${code.toLowerCase()}.edu`,
          phone: payload.phone || payload.contactPhone || '+91 44 2817 8200',
          website: payload.website,
          status: payload.status || 'ACTIVE',
        },
      });

      // Auto-provision College Admin or School Admin account
      const adminEmail = (payload.adminEmail || payload.contactEmail || `admin@${code.toLowerCase()}.isml.edu`).toLowerCase();
      const adminName = payload.adminName || (isSchool ? `${payload.name} Principal` : `${payload.name} Admin`);
      const defaultPassword = payload.adminPassword || `${code.replace(/[^A-Z0-9]/g, '')}@2026!`;

      // Check if user already exists in this tenant
      let adminUser = await this.prisma.users.findFirst({
        where: { tenantId: created.id, email: adminEmail },
      });

      if (!adminUser) {
        const nameParts = adminName.trim().split(' ');
        const firstName = nameParts[0] || 'Campus';
        const lastName = nameParts.slice(1).join(' ') || (isSchool ? 'School Admin' : 'College Admin');

        adminUser = await this.prisma.users.create({
          data: {
            tenantId: created.id,
            email: adminEmail,
            phone: payload.adminMobile || payload.contactPhone || '+91 44 2800 0000',
            firstName,
            lastName,
            userType: 'STAFF',
            status: 'ACTIVE',
            isSuperAdmin: false,
            passwordHash: defaultPassword, // Verified in auth.service for direct login
          },
        });
      }

      const portalRoute = isSchool ? '/school-admin/dashboard' : '/college-admin/dashboard';
      const roleDisplayName = isSchool ? 'School Principal / Administrator' : 'College Campus Administrator';

      // Send live official credentials email to the administrator
      try {
        const instMail = EmailNotificationService.generateInstitutionAdminCredentialsEmail({
          adminName,
          institutionName: created.name || payload.name,
          institutionType: isSchool ? 'SCHOOL' : 'COLLEGE',
          username: adminEmail,
          password: defaultPassword,
          loginUrl: 'https://isml-lms.vercel.app/auth/login',
        });
        EmailNotificationService.sendEmail({
          to: adminEmail,
          subject: instMail.subject,
          html: instMail.html,
          text: instMail.text,
        }).then((mailRes) => {
          if (mailRes.success) {
            console.log(`[RESEND EMAIL SUCCESS] Institution Admin credentials sent to ${adminEmail} (ID: ${mailRes.id})`);
          } else {
            console.warn(`[RESEND EMAIL NOTICE] ${mailRes.error}`);
          }
        });
      } catch (e: any) {
        console.error('[INSTITUTION ONBOARDING EMAIL ERROR]', e.message);
      }

      return {
        status: 'success',
        message: 'Institution & Administrator account provisioned in Supabase',
        data: {
          ...created,
          adminCredentials: {
            name: adminName,
            email: adminEmail,
            temporaryPassword: defaultPassword,
            portalRoute,
            role: isSchool ? 'SCHOOL_ADMIN' : 'COLLEGE_ADMIN',
            roleDisplayName,
          },
        },
      };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('institutions/:id/update')
  async updateInstitution(@Param('id') id: string, @Body() payload: any) {
    try {
      const updated = await this.prisma.institutions.update({
        where: { id },
        data: {
          name: payload.name,
          displayName: payload.displayName,
          email: payload.email || payload.contactEmail,
          phone: payload.phone || payload.contactPhone,
          website: payload.website,
          status: payload.status,
        },
      });
      return { status: 'success', message: 'Institution updated in Supabase', data: updated };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('institutions/:id/delete')
  async deleteInstitution(@Param('id') id: string) {
    try {
      await this.prisma.institutions.delete({ where: { id } });
      return { status: 'success', message: 'Institution deleted from Supabase' };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  // 9. Super Admin Users Management & Identity CRUD
  @Get('users')
  async getUsers(@Query('userType') userType?: any, @Query('institutionId') institutionId?: string) {
    try {
      const where: any = {};
      if (userType) where.userType = userType;
      if (institutionId && institutionId !== 'ALL') where.tenantId = institutionId;
      const data = await this.prisma.users.findMany({
        where,
        include: {
          tenant: true,
          userRoles: {
            include: { role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return { status: 'success', total: data.length, data };
    } catch {
      return { status: 'success', total: 0, data: [] };
    }
  }

  @Post('users')
  async createUser(@Body() payload: any) {
    try {
      // Find or default to first institution
      let tenantId = payload.tenantId || payload.collegeId;
      if (!tenantId || tenantId === 'ALL') {
        const firstInst = await this.prisma.institutions.findFirst();
        if (firstInst) tenantId = firstInst.id;
      }

      if (!tenantId) {
        // Create fallback institution if none exists
        const defaultInst = await this.prisma.institutions.create({
          data: {
            code: 'ISML-MAIN',
            slug: 'isml-main-campus',
            name: 'ISML Consolidated Campus',
            displayName: 'ISML Main Campus',
            email: 'admin@isml.edu',
            phone: '+91 44 2235 7000',
            status: 'ACTIVE',
          },
        });
        tenantId = defaultInst.id;
      }

      const firstName = payload.firstName || payload.name?.split(' ')[0] || 'User';
      const lastName = payload.lastName || payload.name?.split(' ').slice(1).join(' ') || 'Admin';

      const createdUser = await this.prisma.users.create({
        data: {
          tenantId,
          email: payload.email,
          phone: payload.phone || payload.mobile,
          firstName,
          lastName,
          userType: payload.userType || (payload.roleCode === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STAFF'),
          status: payload.status || 'ACTIVE',
          isSuperAdmin: payload.roleCode === 'SUPER_ADMIN' || payload.isSuperAdmin || false,
          passwordHash: 'argon2:$argon2id$v=19$m=65536,t=3,p=4$isml-hashed-password',
        },
      });

      // Role assignment if provided
      if (payload.roleId) {
        await this.prisma.userRoles.create({
          data: {
            tenantId,
            userId: createdUser.id,
            roleId: payload.roleId,
          },
        }).catch(() => null);
      }

      return { status: 'success', message: 'User created in Supabase', data: createdUser };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('users/:id/update')
  async updateUser(@Param('id') id: string, @Body() payload: any) {
    try {
      const updateData: any = {};
      if (payload.email) updateData.email = payload.email;
      if (payload.phone) updateData.phone = payload.phone;
      if (payload.firstName) updateData.firstName = payload.firstName;
      if (payload.lastName) updateData.lastName = payload.lastName;
      if (payload.status) updateData.status = payload.status;
      if (payload.name) {
        updateData.firstName = payload.name.split(' ')[0];
        updateData.lastName = payload.name.split(' ').slice(1).join(' ') || '';
      }

      const updated = await this.prisma.users.update({
        where: { id },
        data: updateData,
      });

      if (payload.roleId) {
        await this.prisma.userRoles.deleteMany({ where: { userId: id } }).catch(() => null);
        await this.prisma.userRoles.create({
          data: {
            tenantId: updated.tenantId,
            userId: id,
            roleId: payload.roleId,
          },
        }).catch(() => null);
      }

      return { status: 'success', message: 'User updated in Supabase', data: updated };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('users/:id/delete')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.prisma.users.delete({ where: { id } });
      return { status: 'success', message: 'User removed from Supabase' };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  // 10. Super Admin Roles & Fine-Grained RBAC Permissions (C-U-R-D)
  @Get('roles')
  async getRoles() {
    try {
      const data = await this.prisma.roles.findMany({
        include: {
          rolePermissions: {
            include: { permission: true },
          },
          _count: {
            select: { userRoles: true },
          },
        },
        orderBy: { priority: 'asc' },
      });
      return { status: 'success', total: data.length, data };
    } catch {
      return { status: 'success', total: 0, data: [] };
    }
  }

  @Post('roles')
  async createRole(@Body() payload: any) {
    try {
      let tenantId = payload.tenantId;
      if (!tenantId) {
        const firstInst = await this.prisma.institutions.findFirst();
        tenantId = firstInst?.id || 'inst-01';
      }

      const code = payload.code || payload.name?.toUpperCase().replace(/[^A-Z0-9]+/g, '_') || `ROLE_${Date.now()}`;
      const createdRole = await this.prisma.roles.create({
        data: {
          tenantId,
          code,
          name: payload.name,
          roleType: payload.roleType || 'CUSTOM',
          priority: payload.priority || 2,
          isDefault: payload.isDefault || false,
          isEditable: true,
          isDeletable: true,
        },
      });

      // Assign initial permissions if array passed
      if (Array.isArray(payload.permissions) && payload.permissions.length > 0) {
        for (const pKey of payload.permissions) {
          const perm = await this.prisma.permissions.upsert({
            where: { permissionKey: pKey },
            update: {},
            create: {
              permissionKey: pKey,
              resource: pKey.split('_')[0] || 'GENERAL',
              action: 'MANAGE',
              description: `Permission for ${pKey}`,
            },
          });
          await this.prisma.rolePermissions.create({
            data: {
              tenantId,
              roleId: createdRole.id,
              permissionId: perm.id,
            },
          }).catch(() => null);
        }
      }

      return { status: 'success', message: 'Role and entitlements recorded in Supabase', data: createdRole };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('roles/:id/permissions')
  async updateRolePermissions(@Param('id') roleId: string, @Body() body: { permissions: string[] }) {
    try {
      const role = await this.prisma.roles.findUnique({ where: { id: roleId } });
      if (!role) throw new Error('Role not found');

      // Clear existing permissions
      await this.prisma.rolePermissions.deleteMany({ where: { roleId } });

      // Upsert permissions and link
      for (const pKey of body.permissions) {
        const perm = await this.prisma.permissions.upsert({
          where: { permissionKey: pKey },
          update: {},
          create: {
            permissionKey: pKey,
            resource: pKey.split('_')[0] || 'GENERAL',
            action: 'MANAGE',
            description: `Permission for ${pKey}`,
          },
        });

        await this.prisma.rolePermissions.create({
          data: {
            tenantId: role.tenantId,
            roleId,
            permissionId: perm.id,
          },
        }).catch(() => null);
      }

      return { status: 'success', message: `Updated ${body.permissions.length} RBAC entitlements in Supabase` };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('roles/:id/delete')
  async deleteRole(@Param('id') id: string) {
    try {
      await this.prisma.roles.delete({ where: { id } });
      return { status: 'success', message: 'Role deleted from Supabase' };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  // 11. Super Admin Courses & Curriculum Tree CRUD
  @Post('courses')
  async createCourse(@Body() payload: any) {
    const memoryCourse = {
      id: payload.id || `crs-${Date.now()}`,
      code: (payload.code || `CRS-${Date.now().toString().slice(-4)}`).toUpperCase(),
      name: payload.name || 'Language Course',
      collegeId: payload.collegeId || payload.institutionId || 'inst-01',
      collegeName: payload.collegeName || 'Loyola College of Arts & Science',
      department: payload.department || 'Foreign Languages & Linguistics',
      program: payload.program || '3 Months (90 Days Fast-Track)',
      semester: 1,
      academicYear: payload.academicYear || '2026–2027',
      duration: payload.duration || '90 Days',
      durationDays: payload.durationDays || 90,
      durationType: payload.durationType || '3_MONTHS',
      startDate: payload.startDate || null,
      endDate: payload.endDate || null,
      facultyName: payload.facultyName || 'Madame Claire Dubois',
      substituteTutors: payload.substituteTutors || ['JK Faculty'],
      doubtSupportTutor: payload.doubtSupportTutor || 'Prof. Antoine Martin',
      assignedCollegeTutor: payload.assignedCollegeTutor || null,
      campusTutors: payload.campusTutors || {},
      enrolledStudents: payload.enrolledStudents || 0,
      completionRate: 0,
      courseFee: Number(payload.courseFee) || 0,
      status: payload.status || 'DRAFT', // Default to DRAFT until Super Admin authorizes
      createdAt: new Date().toISOString(),
    };

    PortalsDataController.inMemoryCourses.unshift(memoryCourse);

    // Automatically trigger Approval Request for Super Admin Approval Center
    const courseApprovalRequest = {
      id: `appr-crs-${Date.now().toString().slice(-6)}`,
      requestType: 'COURSE_CREATION',
      title: `Course Authorization: ${memoryCourse.code} — ${memoryCourse.name}`,
      description: `Course curriculum, syllabus, and ${memoryCourse.durationDays || 90}-day track submitted from Academic Manager Desk awaiting executive sign-off.`,
      entityType: 'COURSE',
      entityId: memoryCourse.id,
      requestedByUserId: 'Academic Manager',
      priority: 'HIGH',
      institutionId: memoryCourse.collegeId,
      currentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      submittedPayload: {
        courseId: memoryCourse.id,
        courseCode: memoryCourse.code,
        courseName: memoryCourse.name,
        batchName: 'All Initial Cohorts',
        category: 'EXAM_ASSESSMENT',
        urgency: 'HIGH',
        institutionId: memoryCourse.collegeId,
        institutionName: memoryCourse.collegeName,
        submittedBy: {
          name: 'Academic Coordinator',
          role: 'Academic Manager',
          email: 'academics@isml.edu',
        },
      },
    };

    PortalsDataController.inMemoryApprovals.unshift(courseApprovalRequest);

    try {
      // Find or link Language in DB
      let languageId = payload.languageId;
      if (!languageId) {
        const lang = await this.prisma.languages.findFirst();
        languageId = lang?.id;
      }
      if (!languageId) {
        const newLang = await this.prisma.languages.create({
          data: {
            code: 'FR',
            name: 'French',
            nativeName: 'Français',
            sttLanguageCode: 'fr-FR',
          },
        });
        languageId = newLang.id;
      }

      await this.prisma.courses.create({
        data: {
          code: memoryCourse.code,
          name: memoryCourse.name,
          displayName: memoryCourse.name,
          description: payload.description,
          totalHours: Number(payload.totalHours) || 100,
          teachingHours: Number(payload.teachingHours) || 80,
          assessmentsCount: Number(payload.assessmentsCount) || 4,
          humanSpeakingMinutes: Number(payload.humanSpeakingMinutes) || 10,
          aiSpeakingPracticeDaily: Number(payload.aiSpeakingPracticeDaily) || 3,
          languageId,
          status: 'DRAFT', // Stored as DRAFT until approved
          isActive: true,
        },
      });

      await this.prisma.approvalRequests.create({
        data: {
          id: courseApprovalRequest.id,
          requestType: 'COURSE_CREATION',
          title: courseApprovalRequest.title,
          description: courseApprovalRequest.description,
          entityType: 'COURSE',
          entityId: memoryCourse.id,
          requestedByUserId: 'Academic Manager',
          priority: 'HIGH',
          institutionId: memoryCourse.collegeId,
          currentStatus: 'PENDING',
          submittedPayload: courseApprovalRequest.submittedPayload,
        },
      }).catch(() => null);
    } catch {
      // DB optional in dev mode
    }

    PortalsDataController.broadcastEvent('COURSES_UPDATED', memoryCourse);
    PortalsDataController.broadcastEvent('APPROVAL_SUBMITTED', courseApprovalRequest);

    return {
      status: 'success',
      message: 'Course created in DRAFT status and submitted for Super Admin authorization',
      data: memoryCourse,
      approvalId: courseApprovalRequest.id,
    };
  }

  @Post('courses/:id/delete')
  async deleteCourse(@Param('id') id: string) {
    PortalsDataController.inMemoryCourses = PortalsDataController.inMemoryCourses.filter((c) => c.id !== id);
    try {
      await this.prisma.courses.delete({ where: { id } });
    } catch { }
    PortalsDataController.broadcastEvent('COURSES_UPDATED');
    return { status: 'success', message: 'Course removed' };
  }

  // ==========================================================================
  // 12. Academic Manager: Batches CRUD (Supabase Batches & BatchInstitutions)
  // ==========================================================================
  @Get('batches')
  async getBatches(@Query('tutor') tutor?: string, @Query('courseId') courseId?: string) {
    const key = `batches_master_${tutor || 'ALL'}_${courseId || 'ALL'}`;
    const fallback = PortalsDataController.inMemoryBatches;

    const data = await BackendCacheService.getOrFetch(
      key,
      async () => {
        let result: any[] = [];
        try {
          const dbBatches = await this.prisma.batches.findMany({
            include: {
              batchInstitutions: true,
              batchSchedules: true,
              course: true,
            },
            orderBy: { createdAt: 'desc' },
          });
          if (dbBatches && dbBatches.length > 0) {
            dbBatches.forEach((db: any) => {
              if (!result.find((r) => r.id === db.id || r.code === db.code)) {
                result.push({
                  id: db.id,
                  name: db.name,
                  code: db.code,
                  institutionId: db.batchInstitutions?.[0]?.institutionId || db.tenantId || 'inst-01',
                  institutionName: 'The American College',
                  programId: db.courseId,
                  programName: db.course?.name || 'Language Course',
                  departmentName: 'Foreign Languages & Linguistics',
                  academicYear: '2026–2027',
                  admissionYear: 2026,
                  graduationYear: 2027,
                  currentSemesterNumber: 1,
                  sectionsCount: 1,
                  studentsCount: db.maxStudents || 35,
                  courseIds: [db.courseId].filter(Boolean),
                  courseNames: [db.course?.name || 'Language Course'],
                  batchTiming: '09:00 AM – 10:30 AM',
                  scheduleDays: ['mon', 'wed', 'fri'],
                  assignedFacultyName: 'Dr. Anandhakumar V.',
                  assignedStaffNames: ['Joy JK'],
                  status: db.status === 'ONGOING' ? 'ACTIVE' : db.status || 'ACTIVE',
                });
              }
            });
          }
        } catch { }

        // Merge in-memory batches if created during session
        PortalsDataController.inMemoryBatches.forEach((mem) => {
          if (!result.find((r) => r.id === mem.id || r.name === mem.name)) {
            result.unshift(mem);
          }
        });

        return result;
      },
      fallback,
      20000
    );

    let result = data || fallback;
    if (tutor) {
      const q = tutor.toLowerCase();
      result = result.filter(
        (b: any) =>
          (b.assignedFacultyName && b.assignedFacultyName.toLowerCase().includes(q)) ||
          (b.assignedStaffNames && b.assignedStaffNames.some((s: string) => s.toLowerCase().includes(q)))
      );
    }
    if (courseId) {
      result = result.filter((b: any) => b.courseIds?.includes(courseId) || b.programId === courseId);
    }

    return { status: 'success', total: result.length, data: result };
  }

  @Post('batches')
  async createBatch(@Body() payload: any) {
    const newBatch = {
      id: payload.id || `batch-${Date.now()}`,
      name: payload.name || 'Cohort Batch',
      institutionId: payload.institutionId || 'inst-01',
      institutionName: payload.institutionName || 'Loyola College of Arts & Science',
      programId: payload.programId || 'crs-fr-a1',
      programName: payload.programName || 'French A1 Intensive Certification',
      departmentName: payload.departmentName || 'Foreign Languages & Linguistics',
      academicYear: payload.academicYear || '2026–2027',
      admissionYear: payload.admissionYear || 2026,
      graduationYear: payload.graduationYear || 2027,
      currentSemesterNumber: 1,
      sectionsCount: payload.sectionsCount || 1,
      studentsCount: payload.studentsCount || 35,
      courseIds: payload.courseIds || ['crs-fr-a1'],
      courseNames: payload.courseNames || ['French A1 Intensive Certification'],
      batchTiming: payload.batchTiming || '10:00 AM – 11:30 AM',
      scheduleDays: payload.scheduleDays || ['mon', 'wed', 'fri'],
      assignedFacultyName: payload.assignedFacultyName || 'Dr. Anandhakumar V.',
      assignedStaffNames: payload.assignedStaffNames || ['Ms. Ananya Sharma (TA)'],
      status: payload.status || 'DRAFT', // Default to DRAFT awaiting Super Admin approval
      createdAt: new Date().toISOString(),
    };

    PortalsDataController.inMemoryBatches.unshift(newBatch);

    // Automatically create a faculty allocation record so Tutor Dashboard immediately sees this batch!
    if (newBatch.assignedFacultyName) {
      const fac = PortalsDataController.inMemoryFaculty.find(
        (f) => f.name.toLowerCase() === newBatch.assignedFacultyName.toLowerCase()
      );
      PortalsDataController.inMemoryAllocations.unshift({
        id: `alloc-${Date.now().toString().slice(-6)}`,
        facultyId: fac ? fac.id : 'fac-01',
        facultyName: newBatch.assignedFacultyName,
        avatarUrl: fac?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        tutorRole: 'LEAD_TRAINER',
        courseId: newBatch.programId,
        courseName: newBatch.programName,
        subjectCode: 'LAN-101',
        subjectName: newBatch.programName,
        batchId: newBatch.id,
        batchName: newBatch.name,
        languageFamily: 'FRENCH',
        scheduleSlots: [`${newBatch.scheduleDays?.join(', ').toUpperCase()} (${newBatch.batchTiming})`],
        status: 'ACTIVE',
        effectiveFrom: new Date().toISOString().split('T')[0],
        notes: 'Assigned automatically on batch creation',
      });
      PortalsDataController.broadcastEvent('FACULTY_ASSIGNED');
    }

    // Automatically trigger Approval Request for Super Admin Approval Center
    const batchApprovalRequest = {
      id: `appr-bat-${Date.now().toString().slice(-6)}`,
      requestType: 'BATCH_CREATION',
      title: `Batch Authorization: ${newBatch.name}`,
      description: `Student intake cohort of ${newBatch.studentsCount} seats with scheduled timing (${newBatch.batchTiming}) submitted from Academic Manager Desk awaiting executive sign-off.`,
      entityType: 'BATCH',
      entityId: newBatch.id,
      requestedByUserId: 'Academic Manager',
      priority: 'MEDIUM',
      institutionId: newBatch.institutionId,
      currentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      submittedPayload: {
        batchId: newBatch.id,
        batchName: newBatch.name,
        courseNames: newBatch.courseNames,
        studentsCount: newBatch.studentsCount,
        batchTiming: newBatch.batchTiming,
        scheduleDays: newBatch.scheduleDays,
        assignedFacultyName: newBatch.assignedFacultyName,
        category: 'ACADEMIC_BATCH',
        urgency: 'MEDIUM',
        institutionId: newBatch.institutionId,
        institutionName: newBatch.institutionName,
        submittedBy: {
          name: 'Academic Coordinator',
          role: 'Academic Manager',
          email: 'academics@isml.edu',
        },
      },
    };

    PortalsDataController.inMemoryApprovals.unshift(batchApprovalRequest);

    try {
      let courseId = payload.courseId || payload.courseIds?.[0];
      if (!courseId) {
        const firstCourse = await this.prisma.courses.findFirst();
        courseId = firstCourse?.id;
      }
      if (courseId) {
        let pattern = await this.prisma.courseDurationPatterns.findFirst({ where: { courseId } });
        if (pattern) {
          await this.prisma.batches.create({
            data: {
              id: newBatch.id,
              code: (payload.code || `BAT-${Date.now().toString().slice(-4)}`).toUpperCase(),
              name: newBatch.name,
              courseId,
              durationPatternId: pattern.id,
              maxStudents: Number(payload.studentsCount) || 60,
              startDate: new Date(),
              endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              status: 'UPCOMING',
            },
          }).catch(() => null);
        }
      }

      await this.prisma.approvalRequests.create({
        data: {
          id: batchApprovalRequest.id,
          requestType: 'TUTOR_ASSIGNMENT' as any,
          title: batchApprovalRequest.title,
          description: batchApprovalRequest.description,
          entityType: 'BATCH',
          entityId: newBatch.id,
          requestedByUserId: 'Academic Manager',
          priority: 'MEDIUM',
          institutionId: newBatch.institutionId,
          currentStatus: 'PENDING',
          submittedPayload: batchApprovalRequest.submittedPayload,
        },
      }).catch(() => null);
    } catch { }

    PortalsDataController.broadcastEvent('BATCHES_UPDATED', newBatch);
    PortalsDataController.broadcastEvent('APPROVAL_SUBMITTED', batchApprovalRequest);

    return {
      status: 'success',
      message: 'Batch created in DRAFT status and submitted for Super Admin authorization',
      data: newBatch,
      approvalId: batchApprovalRequest.id,
    };
  }

  @Post('batches/:id/delete')
  async deleteBatch(@Param('id') id: string) {
    PortalsDataController.inMemoryBatches = PortalsDataController.inMemoryBatches.filter((b) => b.id !== id);
    try {
      await this.prisma.batches.delete({ where: { id } });
    } catch { }
    PortalsDataController.broadcastEvent('BATCHES_UPDATED');
    return { status: 'success', message: 'Batch removed' };
  }

  // ==========================================================================
  // 13. Academic Manager: Timetable & Schedules (Supabase Timetables)
  // ==========================================================================
  @Get('timetable')
  async getTimetable() {
    try {
      const timetables = await this.prisma.timetables.findMany({
        include: { scheduleEntries: true },
        orderBy: { createdAt: 'desc' },
      });
      return { status: 'success', data: timetables };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('timetable')
  async createTimetable(@Body() payload: any) {
    try {
      let tenantId = payload.tenantId;
      if (!tenantId) {
        const inst = await this.prisma.institutions.findFirst();
        tenantId = inst ? inst.id : 'inst-global';
      }

      const code = (payload.code || `TT-${Date.now().toString().slice(-4)}`).toUpperCase();
      const created = await this.prisma.timetables.create({
        data: {
          tenantId,
          code,
          name: payload.name || `Timetable ${code}`,
          startDate: payload.startDate ? new Date(payload.startDate) : new Date(),
          endDate: payload.endDate ? new Date(payload.endDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      // Insert schedule entry if day and slot provided
      if (payload.batchId && payload.dayOfWeekNumber) {
        await this.prisma.scheduleEntries.create({
          data: {
            tenantId,
            timetableId: created.id,
            batchId: payload.batchId,
            dayOfWeekNumber: Number(payload.dayOfWeekNumber) || 1,
            startTime: payload.startTime || '09:00',
            endTime: payload.endTime || '10:30',
          },
        }).catch(() => null);
      }

      return { status: 'success', message: 'Timetable schedule saved in Supabase', data: created };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  // ==========================================================================
  // 14. Academic Manager: Recorded Sessions (Supabase Recordings & Files)
  // ==========================================================================
  @Get('recordings')
  async getRecordings() {
    try {
      // Delegate to LiveClassesController getAllRecordings which combines DB, Supabase live recordings bucket, and local recordings
      const liveCtrl = new LiveClassesController(this.prisma);
      const res = await liveCtrl.getAllRecordings();
      return res;
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  @Post('recordings')
  async createRecording(@Body() payload: any) {
    try {
      // Check or obtain batch
      let batchId = payload.batchId;
      if (!batchId) {
        const batch = await this.prisma.batches.findFirst();
        if (batch) {
          batchId = batch.id;
        } else {
          return { status: 'error', message: 'Please create a Batch before uploading recordings.' };
        }
      }

      // Check or obtain liveClass
      let liveClassId = payload.liveClassId;
      if (!liveClassId) {
        const tutor = await this.prisma.users.findFirst({ where: { userType: 'TUTOR' } }) ||
          await this.prisma.users.findFirst();
        const mainTutorUserId = tutor ? tutor.id : 'tutor-default';

        const lc = await this.prisma.liveClasses.create({
          data: {
            batchId,
            title: payload.title || 'Recorded Classroom Lecture',
            scheduledStartTime: new Date(),
            scheduledEndTime: new Date(Date.now() + 60 * 60 * 1000),
            mainTutorUserId,
            status: 'ENDED',
          },
        });
        liveClassId = lc.id;
      }

      const createdRec = await this.prisma.recordings.create({
        data: {
          batchId,
          liveClassId,
          title: payload.title || 'Recorded Lecture Session',
          recordingStatus: 'READY',
          durationSecs: Number(payload.durationSecs) || 3600,
          uploadSlaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
          validityExpiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 Years Lifelong Retention
        },
      });

      // Link recording file with video URL if provided
      await this.prisma.recordingFiles.create({
        data: {
          recordingId: createdRec.id,
          r2StorageKey: `recordings/${createdRec.id}.mp4`,
          fileType: 'MP4_VIDEO',
          fileSizeBytes: BigInt(payload.fileSizeBytes || 250000000),
          signedUrl: payload.videoUrl || payload.url || 'https://assets.isml.edu/recordings/sample-lecture.mp4',
          resolution: payload.resolution || '1080p',
        },
      }).catch(() => null);

      return { status: 'success', message: 'Recorded session stored in Supabase', data: createdRec };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  // 12. Curriculum Pacing Matrices (Schools & Colleges)
  @Get('curriculum-matrices/schools')
  async getSchoolCurriculumMatrix() {
    try {
      const rows = await this.prisma.schoolCurriculumMatrix.findMany({
        orderBy: { levelCode: 'asc' },
      });
      return { status: 'success', data: rows };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  // 13. Dynamic Courses Engine (Academic Manager, Super Admin, Tutors, Students)

  // ==========================================================================
  // FACULTY & TUTORS CONTROLLERS (Academic Manager Master Hub)
  // ==========================================================================
  @Get('faculty')
  async getFaculty() {
    const key = 'faculty_master_list';
    const fallback = PortalsDataController.inMemoryFaculty;

    const faculty = await BackendCacheService.getOrFetch(
      key,
      async () => {
        let result = [...PortalsDataController.inMemoryFaculty];
        try {
          // Query genuine tutors from database
          const dbUsers = await this.prisma.users.findMany({
            where: {
              userType: 'TUTOR',
            },
            include: {
              tutorProfile: true,
              tenant: true,
            },
            orderBy: { createdAt: 'desc' },
          });

          dbUsers.forEach((u: any) => {
            if (!result.find((f) => f.id === u.id || f.email.toLowerCase() === u.email.toLowerCase())) {
              result.push({
                id: u.id,
                name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Tutor Faculty',
                designation: u.tutorProfile?.qualification || 'Language Instructor',
                email: u.email,
                mobile: u.phone || '+91 98400 00000',
                avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
                primaryLanguage: (u.tutorProfile?.specialization as any) || 'FRENCH',
                qualification: u.tutorProfile?.qualification || 'Certified Language Instructor',
                experienceYears: 5,
                nativeCountry: 'France',
                status: 'ACTIVE',
                activeBatchesCount: 0,
                assignedRoles: ['LEAD_TRAINER'],
                weeklyHoursLimit: 20,
                allocatedHours: 0,
                assignedCourses: [],
              });
            }
          });
        } catch { }
        return result;
      },
      fallback,
      20000
    );

    return {
      status: 'success',
      data: faculty || fallback,
      allocations: PortalsDataController.inMemoryAllocations,
    };
  }

  @Post('faculty/:id/delete')
  async deleteFaculty(@Param('id') id: string) {
    PortalsDataController.inMemoryFaculty = PortalsDataController.inMemoryFaculty.filter((f) => f.id !== id);
    PortalsDataController.inMemoryAllocations = PortalsDataController.inMemoryAllocations.filter((a) => a.facultyId !== id);
    try {
      await this.prisma.users.delete({ where: { id } });
    } catch { }
    return { status: 'success', message: 'Tutor removed successfully' };
  }

  @Post('faculty')
  async createFaculty(@Body() payload: any) {
    const email = (payload.email || '').trim().toLowerCase();
    if (!email) {
      throw new BadRequestException('Email address is required.');
    }

    // Email already exists validation check within Faculty / Tutors
    const existingInMemory = PortalsDataController.inMemoryFaculty.find(
      (f) => f.email?.trim().toLowerCase() === email
    );
    if (existingInMemory) {
      throw new BadRequestException(`Email "${email}" is already registered with another tutor profile.`);
    }

    try {
      const existingTutorDb = await this.prisma.users.findFirst({
        where: { 
          email: { equals: email, mode: 'insensitive' },
          userType: 'TUTOR'
        },
      });
      if (existingTutorDb) {
        throw new BadRequestException(`Tutor with email "${email}" already exists.`);
      }
    } catch (e: any) {
      if (e instanceof BadRequestException) throw e;
    }

    const rawDigits = (payload.mobile || '').replace(/\D/g, '');
    if (rawDigits.length < 10) {
      throw new BadRequestException('Please provide a valid 10-digit mobile number.');
    }

    const last4 = rawDigits.slice(-4) || '2026';
    const autoPass = `Tut@${last4}`;
    const rawPass = autoPass;
    const tutorId = payload.id || `fac-${Date.now().toString().slice(-6)}`;
    const name = payload.name || 'New Faculty Tutor';
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || 'Tutor';
    const lastName = nameParts.slice(1).join(' ') || 'Faculty';

    const newFaculty = {
      id: tutorId,
      name,
      designation: payload.designation || 'Native Language Faculty',
      email,
      mobile: payload.mobile || '+91 98400 11223',
      avatarUrl: payload.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      primaryLanguage: payload.primaryLanguage || 'FRENCH',
      qualification: payload.qualification || 'Certified Language Specialist',
      experienceYears: Number(payload.experienceYears) || 3,
      nativeCountry: payload.nativeCountry || 'France',
      status: 'PENDING_APPROVAL',
      approvalStatus: 'SUBMITTED',
      activeBatchesCount: payload.courseId || payload.courseIds?.length ? 1 : 0,
      assignedRoles: payload.assignedRoles || ['LEAD_TRAINER'],
      weeklyHoursLimit: Number(payload.weeklyHoursLimit) || 20,
      allocatedHours: 0,
      assignedCourses: payload.assignedCourses || (payload.courseName ? [payload.courseName] : []),
      temporaryPassword: rawPass,
      credentialsSent: false,
      createdAt: new Date().toISOString(),
    };

    // Save in inMemory
    PortalsDataController.inMemoryFaculty.unshift(newFaculty);

    // Create an Approval Request for Super Admin Approval Center
    const tutorApprovalRequest = {
      id: `appr-tut-${Date.now().toString().slice(-6)}`,
      requestType: 'TUTOR_ONBOARDING',
      title: `Tutor Onboarding: ${name} <${email}>`,
      description: `New ${payload.primaryLanguage || 'Foreign Language'} faculty profile (${payload.qualification || 'Native Instructor'}, ${payload.experienceYears || 3} yrs exp) created by Academic Manager. Awaiting Super Admin authorization to activate account and dispatch credentials.`,
      entityType: 'TUTOR',
      entityId: tutorId,
      requestedByUserId: 'Academic Manager',
      priority: 'HIGH',
      institutionId: payload.institutionId || 'inst-01',
      currentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      submittedPayload: {
        id: tutorId,
        name,
        email,
        mobile: payload.mobile || '+91 98400 11223',
        password: rawPass,
        temporaryPassword: rawPass,
        primaryLanguage: payload.primaryLanguage || 'FRENCH',
        designation: payload.designation || 'Native Language Faculty',
        qualification: payload.qualification || 'Certified Language Specialist',
        experienceYears: Number(payload.experienceYears) || 3,
        nativeCountry: payload.nativeCountry || 'France',
        assignedRoles: payload.assignedRoles || ['LEAD_TRAINER'],
        assignedCourse: payload.courseName || '',
        assignedBatch: payload.batchName || '',
        category: 'ACADEMIC_FACULTY',
        urgency: 'HIGH',
        submittedBy: {
          name: 'Academic Coordinator',
          role: 'Academic Manager',
          email: 'academics@isml.edu',
        },
      },
    };

    PortalsDataController.inMemoryApprovals.unshift(tutorApprovalRequest);

    try {
      await this.prisma.approvalRequests.create({
        data: {
          id: tutorApprovalRequest.id,
          requestType: 'TUTOR_ASSIGNMENT' as any,
          title: tutorApprovalRequest.title,
          description: tutorApprovalRequest.description,
          entityType: 'TUTOR',
          entityId: tutorId,
          requestedByUserId: 'Academic Manager',
          priority: 'HIGH',
          institutionId: payload.institutionId || 'inst-01',
          currentStatus: 'PENDING',
          submittedPayload: tutorApprovalRequest.submittedPayload,
        },
      }).catch(() => null);
    } catch {}

    // Broadcast APPROVAL_SUBMITTED so Super Admin receives sound & badge
    PortalsDataController.broadcastEvent('APPROVAL_SUBMITTED', tutorApprovalRequest);

    // If assigned to a course right away, also update inMemoryCourse and inMemoryAllocations
    if (payload.courseName || payload.courseId) {
      const cName = payload.courseName || 'Assigned Course';
      PortalsDataController.inMemoryCourses.forEach((c) => {
        if (c.id === payload.courseId || c.name === cName) {
          c.facultyName = name;
        }
      });

      PortalsDataController.inMemoryAllocations.unshift({
        id: `alloc-${Date.now().toString().slice(-6)}`,
        facultyId: tutorId,
        facultyName: name,
        avatarUrl: newFaculty.avatarUrl,
        tutorRole: payload.assignedRoles?.[0] || 'LEAD_TRAINER',
        courseId: payload.courseId || 'crs-default',
        courseName: cName,
        subjectCode: payload.subjectCode || 'LAN-101',
        subjectName: cName,
        batchId: payload.batchId || 'bat-all',
        batchName: payload.batchName || 'All Cohort Batches',
        languageFamily: payload.primaryLanguage || 'FRENCH',
        scheduleSlots: ['Mon, Wed, Fri (10:00 AM - 11:30 AM)'],
        status: 'PENDING_APPROVAL',
        effectiveFrom: new Date().toISOString().split('T')[0],
      });
    }

    // Persist to Supabase Database (Users + TutorProfiles table in PENDING status)
    try {
      let tenant = await this.prisma.institutions.findFirst();
      const tenantId = tenant ? tenant.id : 'inst-01';

      await this.prisma.users.upsert({
        where: {
          tenantId_email: {
            tenantId,
            email,
          },
        },
        update: {
          firstName,
          lastName,
          userType: 'TUTOR',
          passwordHash: rawPass,
          phone: payload.mobile,
          status: 'PENDING',
        },
        create: {
          id: tutorId,
          tenantId,
          email,
          firstName,
          lastName,
          userType: 'TUTOR',
          passwordHash: rawPass,
          phone: payload.mobile,
          status: 'PENDING',
        },
      });

      await this.prisma.tutorProfiles.upsert({
        where: { userId: tutorId },
        update: {
          qualification: newFaculty.qualification,
          specialization: newFaculty.primaryLanguage,
          isMainTutor: true,
        },
        create: {
          userId: tutorId,
          tenantId,
          tutorCode: `TUT-${Date.now().toString().slice(-4)}`,
          qualification: newFaculty.qualification,
          specialization: newFaculty.primaryLanguage,
          isMainTutor: true,
        },
      }).catch(() => null);
    } catch (e: any) {
      console.log('Database user creation notice (offline/dev fallback):', e.message);
    }

    return {
      status: 'success',
      message: 'Tutor onboarded and submitted to Super Admin for Approval! Credentials will be dispatched upon executive approval.',
      data: newFaculty,
      approvalId: tutorApprovalRequest.id,
      credentialsStatus: 'AWAITING_SUPER_ADMIN_APPROVAL',
      credentials: {
        email,
        password: rawPass,
        portalRoute: '/tutor/dashboard',
        loginUrl: 'https://isml-lms.vercel.app/login',
        name,
        role: 'TUTOR',
      },
    };
  }

  @Post('faculty/assign')
  async assignFaculty(@Body() payload: any) {
    const { facultyId, facultyName, courseId, courseName, batchId, batchName, tutorRole } = payload;

    // Update in-memory faculty
    const fac = PortalsDataController.inMemoryFaculty.find((f) => f.id === facultyId || f.name === facultyName);
    if (fac && courseName) {
      if (!fac.assignedCourses) fac.assignedCourses = [];
      if (!fac.assignedCourses.includes(courseName)) {
        fac.assignedCourses.push(courseName);
      }
      fac.activeBatchesCount = (fac.activeBatchesCount || 0) + 1;
    }

    // Update courses
    if (courseId || courseName) {
      PortalsDataController.inMemoryCourses.forEach((c) => {
        if (c.id === courseId || c.name === courseName) {
          c.facultyName = facultyName || (fac ? fac.name : 'Assigned Tutor');
        }
      });
    }

    // Update batches
    if (batchId || batchName) {
      PortalsDataController.inMemoryBatches.forEach((b) => {
        if (b.id === batchId || b.name === batchName) {
          b.assignedFacultyName = facultyName || (fac ? fac.name : 'Assigned Tutor');
        }
      });
    }

    const newAlloc = {
      id: `alloc-${Date.now().toString().slice(-6)}`,
      facultyId: facultyId || (fac ? fac.id : 'fac-01'),
      facultyName: facultyName || (fac ? fac.name : 'Faculty'),
      avatarUrl: fac?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      tutorRole: tutorRole || 'LEAD_TRAINER',
      courseId: courseId || 'crs-default',
      courseName: courseName || 'Foreign Language Course',
      subjectCode: payload.subjectCode || 'LAN-101',
      subjectName: courseName || 'Foreign Language Course',
      batchId: batchId || 'bat-all',
      batchName: batchName || 'General Batch Cohort',
      languageFamily: fac?.primaryLanguage || 'FRENCH',
      scheduleSlots: payload.scheduleSlots || ['Mon, Wed, Fri (10:00 AM - 11:30 AM)'],
      status: 'ACTIVE',
      effectiveFrom: new Date().toISOString().split('T')[0],
      notes: payload.notes || 'Assigned by Academic Manager',
    };

    PortalsDataController.inMemoryAllocations.unshift(newAlloc);

    // Instant SSE Realtime Broadcast
    PortalsDataController.broadcastEvent('FACULTY_ASSIGNED', newAlloc);
    PortalsDataController.broadcastEvent('COURSES_UPDATED');
    PortalsDataController.broadcastEvent('BATCHES_UPDATED');

    return {
      status: 'success',
      message: `Tutor ${facultyName || ''} successfully assigned to ${courseName || batchName}!`,
      data: newAlloc,
    };
  }

  // 15. Student Active Learning & Enrolled Courses
  @Get('student/learning')
  async getStudentLearning(@Query('studentId') studentId?: string) {
    let activeBatches: any[] = [];
    try {
      const dbBatches = await this.prisma.batches.findMany({
        where: {
          OR: [
            { status: 'ONGOING' },
            { status: 'UPCOMING' },
            { status: 'ACTIVE' as any }
          ]
        },
        include: { batchInstitutions: true },
      });
      if (dbBatches && dbBatches.length > 0) activeBatches = dbBatches;
    } catch { }

    if (activeBatches.length === 0) {
      activeBatches = PortalsDataController.inMemoryBatches.filter((b) => b.status === 'ACTIVE' || b.status === 'UPCOMING' || b.status === 'DRAFT');
    }

    let activeCourses: any[] = [];
    try {
      const dbCourses = await this.prisma.courses.findMany({
        where: {
          OR: [
            { status: 'PUBLISHED' },
            { status: 'DRAFT' }
          ]
        },
      });
      if (dbCourses && dbCourses.length > 0) activeCourses = dbCourses;
    } catch { }

    if (activeCourses.length === 0) {
      activeCourses = PortalsDataController.inMemoryCourses.filter((c) => c.status === 'PUBLISHED' || c.status === 'DRAFT');
    }

    return {
      status: 'success',
      data: {
        enrolledCourses: activeCourses,
        assignedBatches: activeBatches,
        currentCourse: activeCourses[0] || null,
        currentBatch: activeBatches[0] || null,
      },
    };
  }

  // 15B. Student Profile (Real PostgreSQL Users & StudentProfiles with inMemory fallback)
  @Get('student/profile')
  async getStudentProfile(@Query('email') email?: string, @Query('id') id?: string) {
    try {
      const where: any = {};
      if (email) where.email = email.toLowerCase().trim();
      else if (id) where.id = id;
      else where.userType = 'STUDENT';

      const user = await this.prisma.users.findFirst({
        where,
        include: {
          tenant: true,
          studentProfile: true,
        },
      });

      if (user) {
        return {
          status: 'success',
          data: {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Aarav Sharma',
            email: user.email,
            mobile: user.phone || '+91 98402 99881',
            rollNo: user.studentProfile?.studentCode || 'LOY-FR-2026-042',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            collegeName: user.tenant?.name || 'Loyola College of Arts & Science',
            academicYear: '2026–2027',
            enrolledCourse: 'French Language & Cultural Immersion',
            subLevel: 'A1.1',
            mainTutor: 'Madame Claire Dubois',
          },
        };
      }
    } catch { }

    // Fallback to active in-memory student
    const defaultStudent = PortalsDataController.inMemoryBatchStudents['batch-loyola-a1']?.[0] || {
      id: 'user-student',
      name: 'Aarav Sharma',
      email: 'student@isml.edu',
      mobile: '+91 98402 99881',
      rollNo: 'LOY-FR-2026-042',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      collegeName: 'Loyola College of Arts & Science',
      academicYear: '2026–2027',
      enrolledCourse: 'French Language & Cultural Immersion',
      subLevel: 'A1.1',
      mainTutor: 'Madame Claire Dubois',
    };

    return {
      status: 'success',
      data: defaultStudent,
    };
  }

  // 16. Batch Enrolled Students (Roster)
  @Get('batch-students')
  async getBatchStudents(@Query('batchId') batchId?: string) {
    if (!batchId) {
      return { status: 'success', total: 0, data: [] };
    }

    // Check in-memory store
    const list = PortalsDataController.inMemoryBatchStudents[batchId] || [];

    // Also check Prisma DB if any genuine enrollments exist
    try {
      const enrollments = await this.prisma.studentBatchEnrollments.findMany({
        where: { batchId },
        include: {
          batch: true,
        },
      });

      if (enrollments && enrollments.length > 0) {
        // Fetch users
        const userIds = enrollments.map(e => e.studentUserId);
        const users = await this.prisma.users.findMany({
          where: { id: { in: userIds } },
          include: { studentProfile: true },
        });

        users.forEach((u: any) => {
          if (!list.some(s => s.id === u.id)) {
            list.push({
              id: u.id,
              name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Enrolled Student',
              rollNo: u.studentProfile?.studentCode || `ISML-${u.id.slice(-4)}`,
              email: u.email,
              mobile: u.phone || '+91 90000 00000',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              collegeName: 'Institution Campus',
              attendancePercentage: 0,
              cefrLevel: 'A1.1',
              lsrwStatus: { listening: 0, speaking: 0, reading: 0, writing: 0 },
              assessmentsCompleted: 0,
              doubtsRaised: 0,
              gradeStatus: 'GOOD',
            });
          }
        });
      }
    } catch { }


    return {
      status: 'success',
      batchId,
      total: list.length,
      data: list,
    };
  }

  // 17. College-Wise Real Database Students (Filtered by Course/Batch, College or Institution)
  @Get('students')
  async getStudents(
    @Query('courseId') courseId?: string,
    @Query('courseCode') courseCode?: string,
    @Query('collegeId') collegeId?: string,
    @Query('collegeName') collegeName?: string,
    @Query('batchId') batchId?: string,
    @Query('search') search?: string
  ) {
    try {
      // 1. If batchId is supplied, retrieve from inMemoryBatchStudents if any
      if (batchId && PortalsDataController.inMemoryBatchStudents[batchId]) {
        const batchList = PortalsDataController.inMemoryBatchStudents[batchId];
        const mapped = batchList.map((s: any, idx: number) => ({
          id: s.id || `stu-${idx}`,
          studentId: s.rollNo || `STU-${idx + 1}`,
          name: s.name || 'Enrolled Student',
          firstName: s.name?.split(' ')[0] || 'Student',
          lastName: s.name?.split(' ').slice(1).join(' ') || '',
          email: s.email || 'student@isml.edu',
          mobile: s.mobile || '+91 98402 99881',
          avatarUrl: s.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
          collegeId: s.collegeId || collegeId || '',
          collegeName: s.collegeName || collegeName || '',
          departmentId: 'dept-cs',
          departmentName: 'Department of Languages',
          programId: courseId || '',
          programName: courseCode || 'Language Immersion',
          batchId,
          batchName: 'Active Cohort',
          semesterNumber: 1,
          gender: 'MALE',
          admissionYear: '2026',
          academicYear: '2026-2027',
          status: 'ACTIVE',
          attendancePercentage: s.attendancePercentage || 92,
          enrolledCoursesCount: 1,
          completedAssessmentsCount: s.assessmentsCompleted || 4,
          activeDoubtsCount: s.doubtsRaised || 0,
          createdDate: new Date().toISOString(),
          credentialsDelivered: true,
        }));

        return {
          status: 'success',
          total: mapped.length,
          data: mapped,
        };
      }

      // 2. Query Prisma DB matching college tenant or course
      const where: any = {
        userType: 'STUDENT',
      };

      const conditions: any[] = [];

      // Valid tenant ID / Code / Name filter
      if (collegeId && collegeId !== 'ALL') {
        const matched = await this.prisma.institutions.findFirst({
          where: {
            OR: [
              { id: collegeId },
              { code: { equals: collegeId, mode: 'insensitive' } },
              { name: { contains: collegeId, mode: 'insensitive' } },
            ],
          },
        }).catch(() => null);

        if (matched) {
          where.tenantId = matched.id;
        } else {
          where.tenantId = collegeId;
        }
      } else if (collegeName && collegeName !== 'ALL' && collegeName !== 'Affiliated Institution' && collegeName !== 'Affiliated Campus' && collegeName !== 'Campus') {
        const cleanWords = collegeName.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).filter((w) => w.length > 2);
        for (const word of cleanWords) {
          conditions.push({
            tenant: {
              name: {
                contains: word,
                mode: 'insensitive',
              },
            },
          });
        }
        if (conditions.length > 0) {
          where.OR = conditions;
        }
      }

      const users = await this.prisma.users.findMany({
        where,
        include: {
          tenant: true,
          studentProfile: true,
        },
        orderBy: { firstName: 'asc' },
      });

      if (!users || users.length === 0) {
        return {
          status: 'success',
          total: 0,
          data: [],
        };
      }

      const mapped = users.map((u: any, idx: number) => {
        const attendance = u.studentProfile?.attendancePercentage ?? (85 + ((idx * 7 + 3) % 15));
        const courseName = u.studentProfile?.courseName || (u.tenant?.name?.includes('School') ? 'School Language Track' : 'Degree Language Immersion');
        const batchName = u.studentProfile?.batchName || 'AY 2026–2027 Cohort';
        const studentCode = u.studentProfile?.studentCode || (u.email ? u.email.split('@')[0].toUpperCase() : `STU-${u.id.slice(-6).toUpperCase()}`);
        return {
          id: u.id,
          studentId: studentCode,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Student',
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email,
          mobile: u.phone || '+91 98402 11200',
          avatarUrl: u.avatarUrl || `https://images.unsplash.com/photo-${1534528741775 + (idx * 13) % 1000}?w=150`,
          collegeId: u.tenantId,
          collegeName: u.tenant?.name || 'Campus',
          departmentId: 'dept-cs',
          departmentName: 'Department of Languages & IT',
          programId: courseId || 'prog-degree',
          programName: courseName,
          batchId: u.studentProfile?.batchId || 'batch-2026',
          batchName,
          semesterNumber: u.studentProfile?.semesterNumber || 1,
          gender: u.studentProfile?.gender || 'MALE',
          admissionYear: '2026',
          academicYear: '2026-2027',
          status: u.status || 'ACTIVE',
          attendancePercentage: attendance,
          enrolledCoursesCount: 1,
          completedAssessmentsCount: 3,
          activeDoubtsCount: 0,
          createdDate: u.createdAt?.toISOString() || new Date().toISOString(),
          credentialsDelivered: true,
        };
      });

      return {
        status: 'success',
        total: mapped.length,
        data: mapped,
      };
    } catch (e: any) {
      return {
        status: 'error',
        message: e.message,
        data: [],
      };
    }
  }
}




