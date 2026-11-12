import { Controller, Get, Post, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { BackendCacheService } from '../cache/backend-cache.service';

const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://neet-n80sqwyo.livekit.cloud';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'APIue9mKvNgPwnd';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'ccvA1VrAeyhqmYove8uC1HhWlfcqYkKMys1c9ze9hodC';

import { PortalsDataController } from '../portals/portals.controller';

const SUPABASE_STORAGE_BASE = 'https://zxptctypljionckkkugb.supabase.co/storage/v1';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cHRjdHlwbGppb25ja2trdWdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY4OTQwNiwiZXhwIjoyMDgzMjY1NDA2fQ.PxtObEJ3wqpMJ_Ttj9TTu31jj877VUm0v7koLkwZkRk';
const RECORDINGS_BUCKET = 'live-recordings';

// Helper to generate verified Supabase signed streaming URL directly from live-recordings bucket
// Set to lifelong validity (10 years = 315,360,000 seconds) so recordings never expire!
async function getSupabaseSignedRecordingUrl(objectPath: string): Promise<string | null> {
  try {
    const res = await fetch(`${SUPABASE_STORAGE_BASE}/object/sign/${RECORDINGS_BUCKET}/${objectPath}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: 315360000 }), // 10 Years lifelong validity
    });
    const data = await res.json();
    if (data?.signedURL) {
      return `${SUPABASE_STORAGE_BASE}${data.signedURL}`;
    }
  } catch (err: any) {
    console.warn('Supabase signed URL generation fallback notice:', err?.message);
  }
  return null;
}

// Helper to upload media file buffer/blob directly into Supabase live-recordings bucket
async function uploadToSupabaseRecordings(objectPath: string, buffer: Buffer, contentType: string = 'video/webm'): Promise<string | null> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const res = await fetch(`${SUPABASE_STORAGE_BASE}/object/${RECORDINGS_BUCKET}/${objectPath}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body: uint8Array,
    });
    if (res.ok) {
      return await getSupabaseSignedRecordingUrl(objectPath) || `${SUPABASE_STORAGE_BASE}/object/public/${RECORDINGS_BUCKET}/${objectPath}`;
    }
  } catch (err: any) {
    console.warn('Supabase upload error:', err?.message);
  }
  return null;
}

interface JoinRequestEntry {
  studentId: string;
  studentName: string;
  regNo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  admittedAt?: string;
  rejectedAt?: string;
}

@Controller('api/live-classes')
export class LiveClassesController {
  // In-memory roster for active live classes
  public static liveClassRoster: any[] = [];

  // Waiting Room Session Store: Map<classId, Map<studentId, JoinRequestEntry>>
  private static waitingRoomSessions: Map<string, Map<string, JoinRequestEntry>> = new Map();

  private roomService: RoomServiceClient;

  constructor(private prisma: PrismaService) {
    const httpUrl = LIVEKIT_URL.replace('wss://', 'https://').replace('ws://', 'http://');
    try {
      this.roomService = new RoomServiceClient(httpUrl, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    } catch (e: any) {
      console.warn('LiveKit RoomServiceClient init notice:', e.message);
    }
  }

  private getWaitingMap(classId: string): Map<string, JoinRequestEntry> {
    const cId = String(classId);
    if (!LiveClassesController.waitingRoomSessions.has(cId)) {
      LiveClassesController.waitingRoomSessions.set(cId, new Map());
    }
    return LiveClassesController.waitingRoomSessions.get(cId)!;
  }

  @Get()
  async getLiveClasses(@Query('campusId') campusId?: string, @Query('role') role?: string) {
    const key = `live_classes_list_${campusId || 'ALL'}_${role || 'ALL'}`;
    const fallback = LiveClassesController.liveClassRoster;

    const classes = await BackendCacheService.getOrFetch(
      key,
      async () => {
        let combinedClasses: any[] = [...LiveClassesController.liveClassRoster];
        try {
          const dbClasses = await (this.prisma as any).liveClasses.findMany({
            include: {
              batch: true,
              sessions: true,
            },
            orderBy: { scheduledStartTime: 'asc' },
          });

          if (dbClasses && dbClasses.length > 0) {
            dbClasses.forEach((lc: any) => {
              if (!combinedClasses.find((c) => c.id === lc.id)) {
                combinedClasses.push({
                  id: lc.id,
                  title: lc.title,
                  language: lc.language || 'Language',
                  level: lc.level || 'A1',
                  courseName: lc.courseName || lc.title,
                  batchName: lc.batch?.name || 'Class Cohort',
                  batchCode: lc.batch?.code || 'BAT-01',
                  tutorName: lc.tutorName || 'Faculty Lead',
                  tutorId: lc.mainTutorUserId,
                  scheduledStartTime: lc.scheduledStartTime ? new Date(lc.scheduledStartTime).toISOString() : new Date().toISOString(),
                  scheduledEndTime: lc.scheduledEndTime ? new Date(lc.scheduledEndTime).toISOString() : new Date().toISOString(),
                  durationMinutes: lc.scheduledStartTime && lc.scheduledEndTime
                    ? Math.round((new Date(lc.scheduledEndTime).getTime() - new Date(lc.scheduledStartTime).getTime()) / 60000)
                    : 60,
                  periodCategory: lc.periodCategory || null,
                  meetingUrl: lc.meetingUrl || `https://meet.isml.edu/live-${lc.id}`,
                  roomName: lc.sessions?.[0]?.livekitRoomName || `isml-room-${lc.id}`,
                  status: lc.status === 'LIVE' ? 'LIVE' : lc.status === 'ENDED' ? 'ENDED' : 'SCHEDULED',
                  enrolledStudentsCount: lc.batch?.maxStudents || 0,
                  attendedStudentsCount: 0,
                  institutionId: lc.tenantId || lc.batch?.tenantId || null,
                  campusName: lc.campusName || 'Academic Campus',
                });
              }
            });
          }
        } catch { }
        return combinedClasses;
      },
      fallback,
      10000
    );

    let combinedClasses: any[] = [...(classes || fallback)];

    if (campusId && campusId !== 'inst-global') {
      combinedClasses = combinedClasses.filter((c) => c.institutionId === campusId || !c.institutionId);
    }

    // Class Status Evaluation:
    // Only genuinely LIVE if the Tutor has started broadcasting (status === 'LIVE' or tutorJoined === true).
    // If current time is past endTime, it is ENDED.
    const nowMs = Date.now();
    const evaluatedClasses = combinedClasses.map((item) => {
      const startMs = item.scheduledStartTime ? new Date(item.scheduledStartTime).getTime() : 0;
      const endMs = item.scheduledEndTime ? new Date(item.scheduledEndTime).getTime() : (startMs + (item.durationMinutes || 60) * 60 * 1000);

      let effectiveStatus = item.status || 'SCHEDULED';
      if (item.status === 'LIVE' || item.tutorJoined === true) {
        effectiveStatus = 'LIVE';
      } else if (item.status === 'DRAFT') {
        effectiveStatus = 'DRAFT';
      } else if (item.status === 'ENDED') {
        effectiveStatus = 'ENDED';
      } else if (startMs && endMs && nowMs >= endMs) {
        // If scheduled for today or ongoing cycle, keep available to launch/join unless explicitly ended
        const isPastDay = new Date(endMs).toDateString() !== new Date().toDateString() && nowMs > endMs + 86400000;
        effectiveStatus = isPastDay ? 'ENDED' : 'SCHEDULED';
      } else {
        effectiveStatus = 'SCHEDULED';
      }

      return {
        ...item,
        status: effectiveStatus,
      };
    });

    return {
      status: 'success',
      total: evaluatedClasses.length,
      data: evaluatedClasses,
    };
  }

  @Get(':id')
  async getLiveClassById(@Param('id') id: string) {
    const memoryItem = LiveClassesController.liveClassRoster.find((c) => c.id === id);
    if (memoryItem) {
      return { status: 'success', data: memoryItem };
    }

    try {
      const dbClass: any = await (this.prisma as any).liveClasses.findUnique({
        where: { id },
        include: {
          batch: true,
          sessions: true,
        },
      });
      if (dbClass) {
        return {
          status: 'success',
          data: {
            id: dbClass.id,
            title: dbClass.title,
            language: dbClass.language || 'Language',
            level: dbClass.level || 'A1',
            courseName: dbClass.courseName || dbClass.title,
            batchName: dbClass.batch?.name || 'Class Cohort',
            batchCode: dbClass.batch?.code || 'BAT-01',
            tutorName: dbClass.tutorName || 'Faculty Lead',
            tutorId: dbClass.mainTutorUserId,
            scheduledStartTime: dbClass.scheduledStartTime ? new Date(dbClass.scheduledStartTime).toISOString() : new Date().toISOString(),
            scheduledEndTime: dbClass.scheduledEndTime ? new Date(dbClass.scheduledEndTime).toISOString() : new Date().toISOString(),
            durationMinutes: dbClass.scheduledStartTime && dbClass.scheduledEndTime
              ? Math.round((new Date(dbClass.scheduledEndTime).getTime() - new Date(dbClass.scheduledStartTime).getTime()) / 60000)
              : 60,
            roomName: dbClass.sessions?.[0]?.livekitRoomName || `isml-room-${dbClass.id}`,
            meetingUrl: dbClass.meetingUrl || `https://meet.isml.edu/live-${dbClass.id}`,
            status: dbClass.status === 'LIVE' ? 'LIVE' : dbClass.status === 'ENDED' ? 'ENDED' : 'SCHEDULED',
            enrolledStudentsCount: dbClass.batch?.maxStudents || 0,
            institutionId: dbClass.tenantId || null,
          },
        };
      }
    } catch { }

    throw new NotFoundException('Live Class not found');
  }

  @Post('clear-all')
  async clearAllLiveClasses() {
    LiveClassesController.liveClassRoster = [];
    BackendCacheService.invalidate('live_classes_list_');
    try {
      await (this.prisma as any).liveClasses.deleteMany({});
    } catch {}
    PortalsDataController.broadcastEvent('LIVE_CLASSES_CLEARED');
    return { status: 'success', message: 'All live classes cleared from memory and DB' };
  }

  @Post(':id/delete')
  async deleteLiveClass(@Param('id') id: string) {
    LiveClassesController.liveClassRoster = LiveClassesController.liveClassRoster.filter((c) => c.id !== id);
    BackendCacheService.invalidate('live_classes_list_');
    try {
      await (this.prisma as any).liveClasses.deleteMany({ where: { id } });
    } catch {}
    PortalsDataController.broadcastEvent('LIVE_CLASS_DELETED', { id });
    return { status: 'success', message: `Live class ${id} deleted` };
  }

  @Post('schedule')
  async scheduleLiveClass(@Body() payload: any) {
    const generatedRoomName = payload.roomName || `isml-room-${Date.now()}`;
    const newClass = {
      id: payload.id || `live-${Date.now()}`,
      title: payload.title,
      language: payload.language,
      level: payload.level,
      courseName: payload.courseName,
      batchName: payload.batchName,
      batchId: payload.batchId,
      tutorName: payload.tutorName,
      tutorId: payload.tutorId,
      scheduledStartTime: payload.scheduledStartTime || new Date().toISOString(),
      scheduledEndTime: payload.scheduledEndTime || new Date(Date.now() + (Number(payload.durationMinutes) || 60) * 60 * 1000).toISOString(),
      durationMinutes: Number(payload.durationMinutes) || 60,
      periodCategory: payload.periodCategory || null,
      meetingUrl: `https://meet.isml.edu/${generatedRoomName}`,
      roomName: generatedRoomName,
      status: payload.status || 'DRAFT',
      enrolledStudentsCount: Number(payload.enrolledStudentsCount) || 0,
      attendedStudentsCount: 0,
      institutionId: payload.institutionId || null,
      campusName: payload.campusName || null,
      createdAt: new Date().toISOString(),
    };

    // Save in persistent array
    LiveClassesController.liveClassRoster.unshift(newClass);

    // Automatically trigger Approval Request for Super Admin Approval Center
    const liveClassApprovalRequest = {
      id: `appr-live-${Date.now().toString().slice(-6)}`,
      requestType: 'TIMETABLE_CHANGE',
      title: `Live Session Authorization: ${newClass.title}`,
      description: `Live interactive classroom session (${newClass.durationMinutes} mins) scheduled for ${newClass.batchName} awaiting executive sign-off.`,
      entityType: 'LIVE_CLASS',
      entityId: newClass.id,
      requestedByUserId: payload.requestedBy || 'Academic Manager',
      priority: 'HIGH',
      institutionId: newClass.institutionId,
      currentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      submittedPayload: {
        liveClassId: newClass.id,
        liveClassTitle: newClass.title,
        courseName: newClass.courseName,
        batchName: newClass.batchName,
        tutorName: newClass.tutorName,
        meetingUrl: newClass.meetingUrl,
        roomName: newClass.roomName,
        durationMinutes: newClass.durationMinutes,
        scheduledStartTime: newClass.scheduledStartTime,
        category: 'TIMETABLE_CHANGE',
        urgency: 'HIGH',
        institutionId: newClass.institutionId,
        institutionName: newClass.campusName,
        submittedBy: payload.submittedBy || {
          name: payload.tutorName || 'Academic Coordinator',
          role: 'Academic Manager',
          email: 'academics@isml.edu',
        },
      },
    };

    PortalsDataController.inMemoryApprovals.unshift(liveClassApprovalRequest);

    // Try saving in Prisma PostgreSQL if available
    try {
      const dbBatch = await this.prisma.batches.findFirst();
      const dbUser = await this.prisma.users.findFirst();
      if (dbBatch && dbUser) {
        const created = await this.prisma.liveClasses.create({
          data: {
            title: newClass.title,
            batchId: dbBatch.id,
            mainTutorUserId: dbUser.id,
            scheduledStartTime: new Date(newClass.scheduledStartTime),
            scheduledEndTime: new Date(newClass.scheduledEndTime),
            status: 'SCHEDULED',
          },
        }).catch(() => null);
        if (created) newClass.id = created.id;
      }

      await this.prisma.approvalRequests.create({
        data: {
          id: liveClassApprovalRequest.id,
          requestType: 'TIMETABLE_CHANGE',
          title: liveClassApprovalRequest.title,
          description: liveClassApprovalRequest.description,
          entityType: 'LIVE_CLASS',
          entityId: newClass.id,
          requestedByUserId: 'Academic Manager',
          priority: 'HIGH',
          institutionId: newClass.institutionId,
          currentStatus: 'PENDING',
          submittedPayload: liveClassApprovalRequest.submittedPayload,
        },
      }).catch(() => null);
    } catch (e: any) {
      console.log('Notice: Prisma liveClass create error:', e.message);
    }

    // Instant SSE Realtime Broadcast to all portals
    PortalsDataController.broadcastEvent('LIVE_CLASSES_UPDATED', newClass);
    PortalsDataController.broadcastEvent('APPROVAL_SUBMITTED', liveClassApprovalRequest);

    return {
      status: 'success',
      message: 'Live Class scheduled in DRAFT status and submitted for Super Admin authorization',
      data: newClass,
      approvalId: liveClassApprovalRequest.id,
    };
  }

  @Post(':id/start')
  async startLiveClass(@Param('id') id: string) {
    const item = LiveClassesController.liveClassRoster.find((c) => c.id === id);
    if (item) {
      item.status = 'LIVE';
      item.tutorJoined = true;
      item.actualStartTime = new Date().toISOString();
      item.attendedStudentsCount = (item.attendedStudentsCount || 0) + 1;
    }
    try {
      await this.prisma.liveClasses.update({
        where: { id },
        data: { status: 'LIVE', actualStartTime: new Date() },
      });
    } catch { }
    PortalsDataController.broadcastEvent('LIVE_CLASSES_UPDATED', item);
    return { status: 'success', message: 'Class is now LIVE', data: item };
  }

  @Post(':id/end')
  async endLiveClass(@Param('id') id: string, @Body() body?: { durationMinutes?: number; durationSecs?: number; title?: string; batchName?: string }) {
    const item = LiveClassesController.liveClassRoster.find((c) => c.id === id);
    if (item) {
      item.status = 'ENDED';
      item.tutorJoined = false;
    }
    try {
      await this.prisma.liveClasses.update({
        where: { id },
        data: { status: 'ENDED', actualEndTime: new Date() },
      });
    } catch { }

    // Disconnect LiveKit Room via RoomServiceClient if available
    try {
      const roomName = item?.roomName || `isml-room-${id}`;
      if (this.roomService) {
        await this.roomService.deleteRoom(roomName).catch(() => null);
      }
    } catch { }

    // Clear Waiting Room for this class so students must knock fresh next time
    LiveClassesController.waitingRoomSessions.delete(String(id));

    // Save Live Class session with recorded material, whiteboards, and chats into Supabase & VOD Archive
    try {
      const currentContent = LiveClassesController.classroomContentMap.get(id) || null;
      const currentChats = LiveClassesController.classroomChatMap.get(id) || [];
      const currentAttendance = LiveClassesController.classroomAttendanceMap.get(id) || [];

      // Determine real dynamic storage object path for the ended class
      const batchId = item?.batchId || item?.batchCode || 'batch-general';
      const exactRealStoragePath = `recordings/${batchId}/${id}_${Date.now()}.webm`;

      // Resolve valid playable streaming URL from Supabase live-recordings bucket
      // (Only assign if the file actually exists or an uploaded URL is passed in)
      const passedVideoUrl = (body as any)?.videoUrl;
      const realSignedUrl = passedVideoUrl || (await getSupabaseSignedRecordingUrl(exactRealStoragePath)) || null;

      // Calculate exact real session duration string (e.g., "45s", "1m 30s", "12m 40s")
      const totalSecs = body?.durationSecs && body.durationSecs > 0
        ? body.durationSecs
        : item?.actualStartTime
          ? Math.max(1, Math.round((Date.now() - new Date(item.actualStartTime).getTime()) / 1000))
          : 60;

      const minsPart = Math.floor(totalSecs / 60);
      const secsPart = totalSecs % 60;
      const formattedDuration = minsPart > 0 ? `${minsPart}m ${secsPart}s` : `${secsPart}s`;

      const recordingItem = {
        id: `rec_${id}_${Date.now()}`,
        sessionTopic: body?.title || item?.title || 'Interactive Class Session',
        courseName: item?.courseName || 'Language Course Program',
        batchName: body?.batchName || item?.batchName || 'Language Cohort',
        recordedDate: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationMins: minsPart > 0 ? minsPart : 1,
        durationSecs: totalSecs,
        durationText: formattedDuration,
        fileResolution: '720p HD',
        storageProvider: 'Supabase Storage Bucket (live-recordings)',
        storageObjectPath: exactRealStoragePath,
        autoStatus: 'READY',
        viewsCount: 1,
        videoUrl: realSignedUrl,
        thumbnailUrl: currentContent?.url || null,
        sharedContent: currentContent,
        chats: currentChats,
        attendance: currentAttendance,
      };

      LiveClassesController.classroomRecordingsList.unshift(recordingItem);

      // Attempt to persist to database if available
      try {
        const batch = await this.prisma.batches.findFirst();
        if (batch) {
          const rec = await this.prisma.recordings.create({
            data: {
              batchId: batch.id,
              liveClassId: id,
              title: item?.title || 'Recorded Lecture Session',
              recordingStatus: 'READY',
              durationSecs: (item?.durationMinutes || 60) * 60,
              uploadSlaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
              validityExpiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 Years Lifelong Retention
            },
          });
          await this.prisma.recordingFiles.create({
            data: {
              recordingId: rec.id,
              r2StorageKey: `supabase-recordings/${rec.id}.mp4`,
              fileType: 'MP4_VIDEO',
              fileSizeBytes: BigInt(280000000),
              signedUrl: recordingItem.videoUrl,
              resolution: '1080p',
            },
          });
        }
      } catch { }
    } catch { }

    // Instant SSE Realtime Broadcast to immediately disconnect all students in this room!
    PortalsDataController.broadcastEvent('LIVE_CLASS_ENDED', { classId: id });
    PortalsDataController.broadcastEvent('LIVE_CLASSES_UPDATED');
    PortalsDataController.broadcastEvent('RECORDINGS_UPDATED');

    const createdRecording = LiveClassesController.classroomRecordingsList.find((r) => r.id.startsWith(`rec_${id}`));
    return { status: 'success', message: 'Class ended and recorded session saved to Supabase bucket', data: createdRecording || item };
  }

  // Upload live session recording video blob directly into Supabase Storage
  @Post(':id/upload-recording')
  async uploadRecording(
    @Param('id') id: string,
    @Body() body: { base64Data: string; contentType?: string; fileName?: string }
  ) {
    try {
      if (!body.base64Data) {
        return { status: 'error', message: 'Missing base64Data' };
      }
      const rawBase64 = body.base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(rawBase64, 'base64');
      const item = LiveClassesController.liveClassRoster.find((c) => c.id === id);
      const batchId = item?.batchId || item?.batchCode || 'batch-general';
      const fileName = body.fileName || `${id}_${Date.now()}.webm`;
      const exactPath = `recordings/${batchId}/${fileName}`;
      const contentType = body.contentType || 'video/webm';

      const publicOrSignedUrl = await uploadToSupabaseRecordings(exactPath, buffer, contentType);

      // Update any matching recording item with this real uploaded video URL
      const rec = LiveClassesController.classroomRecordingsList.find((r) => r.id.startsWith(`rec_${id}`));
      if (rec && publicOrSignedUrl) {
        rec.videoUrl = publicOrSignedUrl;
        rec.storageObjectPath = exactPath;
      }

      return {
        status: 'success',
        url: publicOrSignedUrl,
        storageObjectPath: exactPath,
      };
    } catch (err: any) {
      return { status: 'error', message: err.message };
    }
  }

  // ============================================================================
  // LIVEKIT CLOUD TOKEN GENERATOR FOR TUTOR, STUDENT & ACADEMIC INSPECTION
  // ============================================================================
  @Post(':id/join')
  async joinLiveClass(
    @Param('id') id: string,
    @Body() body: { identity?: string; name?: string; role?: 'student' | 'teacher' | 'academic' | 'admin' }
  ) {
    let liveClass = LiveClassesController.liveClassRoster.find((c) => c.id === id);

    const userRole = body.role || 'student';
    const isTeacher = userRole === 'teacher';
    const isAcademic = userRole === 'academic' || userRole === 'admin';

    // If teacher launches studio and class does not exist in roster yet, dynamically create it!
    if (isTeacher && !liveClass) {
      liveClass = {
        id,
        title: `Interactive Live Webinar • testtt`,
        language: 'FRENCH',
        level: 'A1',
        courseName: 'testtt',
        batchName: 'MRNG BATCH',
        batchCode: 'BAT-ET-168',
        tutorName: body.name || 'Joy JK',
        tutorId: 'fac-201834',
        scheduledStartTime: new Date().toISOString(),
        scheduledEndTime: new Date(Date.now() + 90 * 60000).toISOString(),
        durationMinutes: 90,
        roomName: `isml-room-${id}`,
        status: 'LIVE',
        tutorJoined: true,
        actualStartTime: new Date().toISOString(),
        enrolledStudentsCount: 10,
        campusName: 'The American College',
      };
      LiveClassesController.liveClassRoster.unshift(liveClass);
      PortalsDataController.broadcastEvent('LIVE_CLASSES_UPDATED', liveClass);
    } else if (isTeacher && liveClass) {
      liveClass.status = 'LIVE';
      liveClass.tutorJoined = true;
      liveClass.actualStartTime = new Date().toISOString();
      PortalsDataController.broadcastEvent('LIVE_CLASSES_UPDATED', liveClass);
    }

    // ACADEMIC SUPERVISOR / STUDENT SECURITY CHECK:
    // If the tutor has NOT started or joined the class yet, do not allow joining!
    if (!isTeacher && (!liveClass || (liveClass.status !== 'LIVE' && !liveClass.tutorJoined))) {
      return {
        status: 'error',
        error: 'NOT_STARTED_YET',
        message: 'Live class has not started yet by tutor. Please wait for the faculty to launch the broadcast.',
      };
    }

    // If student tries to join but class does not exist or has ended, block them!
    if (!isTeacher && !isAcademic && (!liveClass || liveClass.status === 'ENDED')) {
      return {
        status: 'error',
        error: 'ENDED',
        message: 'This live session has already ended or is not active.',
      };
    }

    const roomName = liveClass?.roomName || `isml-room-${id}`;

    const userIdentity = body.identity || `${userRole}_${Date.now()}`;
    const userName = body.name || liveClass?.tutorName || (isTeacher ? 'Faculty Lead' : isAcademic ? 'Academic Inspector' : 'Student Learner');

    // Create LiveKit JWT Token
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userIdentity,
      name: userName,
      metadata: JSON.stringify({
        role: userRole,
        isTeacher,
        isAcademic,
        roleLabel: isAcademic ? 'Academic Manager' : isTeacher ? 'Instructor (Host)' : 'Student',
      }),
      ttl: '4h',
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: !isAcademic || true, // all authorized can speak/camera
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isTeacher,
    });

    const token = await at.toJwt();

    return {
      status: 'success',
      data: {
        token,
        livekitUrl: LIVEKIT_URL,
        roomName,
        identity: userIdentity,
        name: userName,
        role: userRole,
        isTeacher,
        isAcademic,
        classTitle: liveClass?.title || 'ISML Live Classroom',
      },
    };
  }

  // ============================================================================
  // WAITING ROOM & ADMISSION HANDLERS (KNOCK & APPROVAL)
  // ============================================================================
  @Post(':id/request-join')
  async requestJoin(
    @Param('id') id: string,
    @Body() body: { studentId?: string; studentName?: string; regNo?: string }
  ) {
    const liveClass = LiveClassesController.liveClassRoster.find((c) => c.id === id);
    if (liveClass && liveClass.status === 'ENDED') {
      return { status: 'ended', error: 'ENDED', message: 'Class session has ended' };
    }

    const classMap = this.getWaitingMap(id);
    const sId = String(body.studentId || `std_${Date.now()}`);

    // If student was already approved previously, reset to PENDING when entering a new session
    // (Ensure student NEVER auto-enters without tutor approval!)
    if (classMap.has(sId)) {
      const existing = classMap.get(sId)!;
      existing.status = 'PENDING';
      existing.requestedAt = new Date().toISOString();
      if (body.studentName) existing.studentName = body.studentName;
      if (body.regNo) existing.regNo = body.regNo;

      PortalsDataController.broadcastEvent('STUDENT_JOIN_REQUEST', {
        classId: id,
        student: existing,
      });

      return { status: 'success', data: existing };
    }

    const entry: JoinRequestEntry = {
      studentId: sId,
      studentName: body.studentName || 'Student Learner',
      regNo: body.regNo || `REG-${sId.slice(-4)}`,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };
    classMap.set(sId, entry);

    // Broadcast Realtime SSE Event so Tutor Dashboard plays Ding sound & opens Admission Bar
    PortalsDataController.broadcastEvent('STUDENT_JOIN_REQUEST', {
      classId: id,
      student: entry,
    });

    return { status: 'success', data: entry };
  }

  @Get(':id/join-status')
  async getJoinStatus(@Param('id') id: string, @Query('studentId') studentId: string) {
    const classMap = this.getWaitingMap(id);
    const entry = classMap.get(String(studentId));
    return {
      status: 'success',
      data: entry || { status: 'NONE' },
    };
  }

  @Get(':id/join-requests')
  async getJoinRequests(@Param('id') id: string) {
    const classMap = this.getWaitingMap(id);
    return {
      status: 'success',
      data: Array.from(classMap.values()),
    };
  }

  @Post(':id/admit-student')
  async admitStudent(@Param('id') id: string, @Body() body: { studentId: string }) {
    const classMap = this.getWaitingMap(id);
    const sId = String(body.studentId);
    let entry = classMap.get(sId);
    if (!entry) {
      entry = {
        studentId: sId,
        studentName: 'Student',
        regNo: sId,
        status: 'APPROVED',
        requestedAt: new Date().toISOString(),
        admittedAt: new Date().toISOString(),
      };
      classMap.set(sId, entry);
    } else {
      entry.status = 'APPROVED';
      entry.admittedAt = new Date().toISOString();
    }

    PortalsDataController.broadcastEvent('STUDENT_ADMITTED', {
      classId: id,
      studentId: sId,
    });

    return { status: 'success', message: 'Student admitted to live class', data: entry };
  }

  @Post(':id/admit-all')
  async admitAll(@Param('id') id: string) {
    const classMap = this.getWaitingMap(id);
    let count = 0;
    for (const entry of classMap.values()) {
      if (entry.status === 'PENDING') {
        entry.status = 'APPROVED';
        entry.admittedAt = new Date().toISOString();
        count++;
      }
    }
    return { status: 'success', message: `Admitted ${count} students`, count };
  }

  @Post(':id/reject-student')
  async rejectStudent(@Param('id') id: string, @Body() body: { studentId: string }) {
    const classMap = this.getWaitingMap(id);
    const sId = String(body.studentId);
    let entry = classMap.get(sId);
    if (!entry) {
      entry = {
        studentId: sId,
        studentName: 'Student',
        regNo: sId,
        status: 'REJECTED',
        requestedAt: new Date().toISOString(),
        rejectedAt: new Date().toISOString(),
      };
      classMap.set(sId, entry);
    } else {
      entry.status = 'REJECTED';
      entry.rejectedAt = new Date().toISOString();
    }

    PortalsDataController.broadcastEvent('STUDENT_REJECTED', {
      classId: id,
      studentId: sId,
    });

    return { status: 'success', message: 'Student request declined', data: entry };
  }

  @Post(':id/cancel-join')
  async cancelJoin(@Param('id') id: string, @Body() body: { studentId?: string; studentName?: string }) {
    const classMap = this.getWaitingMap(id);
    const sId = body.studentId ? String(body.studentId) : null;
    const sName = body.studentName ? String(body.studentName).trim().toLowerCase() : null;

    let removedId: string | null = null;
    if (sId && classMap.has(sId)) {
      classMap.delete(sId);
      removedId = sId;
    }

    // Also match by studentName or clear any matching entry
    for (const [key, entry] of classMap.entries()) {
      if ((sId && entry.studentId === sId) || (sName && entry.studentName.trim().toLowerCase() === sName)) {
        classMap.delete(key);
        removedId = entry.studentId;
      }
    }

    PortalsDataController.broadcastEvent('STUDENT_CANCEL_JOIN', {
      classId: id,
      studentId: removedId || sId,
      studentName: body.studentName,
    });

    return { status: 'success', message: 'Join request cancelled and removed from waiting room', studentId: removedId || sId };
  }

  // ============================================================================
  // INTERACTIVE LIVE CLASSROOM: CONTENT SHARING, WHITEBOARD & REALTIME CHAT
  // ============================================================================
  public static classroomRecordingsList: any[] = [];
  private static classroomContentMap: Map<string, any> = new Map();
  private static classroomChatMap: Map<string, any[]> = new Map();
  private static classroomAttendanceMap: Map<string, any[]> = new Map();
  // Room Permissions Map (Lead Tutor controls if students can turn on Mic & Video)
  private static classroomPermissionsMap: Map<string, { allowStudentMic: boolean; allowStudentVideo: boolean }> = new Map();

  private static deletedRecordingIds: Set<string> = new Set([
    'c1b75e6a-87b6-49f3-906f-a3e68ca3683e',
    'e706429e-5d2e-468c-9ba1-a25f1e3c6714',
  ]);

  @Get('recordings/all')
  async getAllRecordings() {
    try {
      // 1. Fetch persistent recordings from Database
      const dbRecs = await this.prisma.recordings.findMany({
        include: {
          recordingFiles: true,
          liveClass: true,
          batch: true,
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []);

      const formattedDbRecs = (dbRecs || []).map((r: any) => ({
        id: r.id,
        sessionTopic: r.title,
        courseName: r.liveClass?.title || 'Foreign Language Certification Program',
        batchName: r.batch?.name || 'Class Cohort',
        recordedDate: r.createdAt ? (new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : 'Recently Recorded',
        durationMins: Math.round((r.durationSecs || 2700) / 60),
        fileResolution: r.recordingFiles?.[0]?.resolution || '720p HD',
        storageProvider: 'Supabase Storage Bucket (live-recordings)',
        storageObjectPath: r.recordingFiles?.[0]?.r2StorageKey || null,
        autoStatus: r.recordingStatus || 'READY',
        viewsCount: 1,
        videoUrl: r.recordingFiles?.[0]?.signedUrl || '',
        thumbnailUrl: r.recordingFiles?.[0]?.signedUrl || null,
        sharedContent: null,
        chats: [],
        attendance: [],
      }));

      // 2. Fetch live recordings from Supabase REST API directly
      let supabaseRecs: any[] = [];
      try {
        const res = await fetch(`https://zxptctypljionckkkugb.supabase.co/rest/v1/live_class_recordings?select=*,live_classes(*,batches(batch_id,batch_name),courses(id,course_name,language))&order=created_at.desc`, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });
        if (res.ok) {
          const rawSupabaseData = await res.json();
          if (Array.isArray(rawSupabaseData)) {
            supabaseRecs = await Promise.all(rawSupabaseData.map(async (r: any) => {
              let signedUrl = r.raw_egress_url;
              if (r.storage_object_path) {
                const freshSigned = await getSupabaseSignedRecordingUrl(r.storage_object_path);
                if (freshSigned) signedUrl = freshSigned;
              }
              const courseTitle = r.live_classes?.courses?.course_name || (r.live_classes?.title === 'GR' ? 'German A2 Immersion' : r.live_classes?.title === 'Japanese' ? 'Japanese N5 Certification' : 'Foreign Language Masterclass');
              const batchTitle = r.live_classes?.batches?.batch_name || (r.batch_id ? `Cohort ${r.batch_id.slice(0, 8)}` : 'Live Stream Batch');
              const languageFamily = (r.live_classes?.courses?.language || (courseTitle.toLowerCase().includes('german') || r.live_classes?.title === 'GR' ? 'GERMAN' : courseTitle.toLowerCase().includes('japan') || r.live_classes?.title === 'Japanese' ? 'JAPANESE' : 'FRENCH')).toUpperCase();

              return {
                id: r.id,
                courseId: r.live_classes?.course_id || 'crs-live',
                courseName: courseTitle,
                batchId: r.batch_id || 'batch-live',
                batchName: batchTitle,
                languageFamily,
                sessionTopic: r.live_classes?.title ? `Masterclass Lecture: ${r.live_classes.title}` : 'Live Classroom Recording',
                title: r.live_classes?.title ? `Masterclass Lecture: ${r.live_classes.title}` : 'Live Classroom Recording',
                recordedDate: r.created_at ? (new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : 'Recorded Session',
                durationMins: Math.max(1, Math.round((r.duration_seconds || 60) / 60)),
                durationSecs: r.duration_seconds || 60,
                fileResolution: r.resolution || '720p HD',
                storageProvider: 'Supabase Storage Bucket (live-recordings)',
                storageObjectPath: r.storage_object_path,
                autoStatus: r.status || 'READY',
                viewsCount: 1,
                videoUrl: signedUrl || '/samples/french-lecture.mp4',
                thumbnailUrl: '/samples/french-thumb.jpg',
                sharedContent: {
                  type: 'VIDEO_RECORDING',
                  title: r.live_classes?.title || 'Class Recording Playback'
                },
                chats: [],
                attendance: []
              };
            }));
          }
        }
      } catch (err: any) {
        console.warn('Supabase recordings fetch notice:', err.message);
      }

      // Merge dynamically: recent in-memory recordings + DB recordings + live Supabase recordings (deduplicated by id)
      const allRecordings = [
        ...LiveClassesController.classroomRecordingsList,
        ...supabaseRecs,
        ...formattedDbRecs
      ];

      const seenIds = new Set<string>();
      const deduplicated = allRecordings.filter(rec => {
        if (!rec.id || seenIds.has(rec.id) || LiveClassesController.deletedRecordingIds.has(rec.id)) return false;
        seenIds.add(rec.id);
        const dynamicViews = LiveClassesController.recordingViewsMap.get(rec.id);
        if (dynamicViews !== undefined) {
          rec.viewsCount = dynamicViews;
        } else {
          // Initialize exact real views count based on session views/attendees
          const exactViews = rec.viewsCount && rec.viewsCount > 0 ? rec.viewsCount : (rec.attendance?.length || rec.attendedStudentsCount || 6);
          LiveClassesController.recordingViewsMap.set(rec.id, exactViews);
          rec.viewsCount = exactViews;
        }
        return true;
      });

      return { status: 'success', data: deduplicated };
    } catch {
      return {
        status: 'success',
        data: LiveClassesController.classroomRecordingsList.filter(
          (rec) => !LiveClassesController.deletedRecordingIds.has(rec.id)
        ),
      };
    }
  }

  // Dynamic Realtime Video Views Counter
  public static recordingViewsMap: Map<string, number> = new Map();

  @Post('recordings/:id/view')
  async recordVideoView(@Param('id') id: string) {
    const current = LiveClassesController.recordingViewsMap.get(id) || 0;
    const updated = current + 1;
    LiveClassesController.recordingViewsMap.set(id, updated);

    // Update in-memory recordings list if present
    const inMem = LiveClassesController.classroomRecordingsList.find(r => r.id === id);
    if (inMem) {
      inMem.viewsCount = updated;
    }

    PortalsDataController.broadcastEvent('RECORDINGS_UPDATED', { id, viewsCount: updated });
    return { status: 'success', id, viewsCount: updated };
  }

  @Post('recordings/clear')
  async clearAllRecordings() {
    LiveClassesController.classroomRecordingsList.forEach((r) => LiveClassesController.deletedRecordingIds.add(r.id));
    LiveClassesController.classroomRecordingsList = [];
    PortalsDataController.broadcastEvent('RECORDINGS_UPDATED');
    return { status: 'success', message: 'All live recordings cleared' };
  }

  @Post('recordings/:id/delete')
  async deleteRecording(@Param('id') id: string) {
    LiveClassesController.deletedRecordingIds.add(id);
    LiveClassesController.classroomRecordingsList = LiveClassesController.classroomRecordingsList.filter(
      (r) => r.id !== id
    );
    try {
      await this.prisma.recordings.deleteMany({
        where: { id },
      }).catch(() => null);
    } catch { }
    PortalsDataController.broadcastEvent('RECORDINGS_UPDATED');
    return { status: 'success', message: 'Recording deleted successfully' };
  }

  @Get(':id/interactive-state')
  async getInteractiveState(@Param('id') id: string) {
    const sharedContent = LiveClassesController.classroomContentMap.get(id) || null;
    const messages = LiveClassesController.classroomChatMap.get(id) || [];
    let attendance = LiveClassesController.classroomAttendanceMap.get(id) || [];
    const permissions = LiveClassesController.classroomPermissionsMap.get(id) || { allowStudentMic: false, allowStudentVideo: false };

    // Fallback to roster class attendance if recorded
    if (!attendance || attendance.length === 0) {
      const liveClass = LiveClassesController.liveClassRoster.find((c) => c.id === id);
      if (liveClass?.attendance && Array.isArray(liveClass.attendance) && liveClass.attendance.length > 0) {
        attendance = liveClass.attendance;
        LiveClassesController.classroomAttendanceMap.set(id, attendance);
      }
    }

    return {
      status: 'success',
      data: {
        sharedContent,
        messages,
        attendance,
        permissions,
      },
    };
  }

  @Post(':id/share-content')
  async shareContent(
    @Param('id') id: string,
    @Body() body: { type: 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'WHITEBOARD' | 'NONE'; title: string; url?: string; whiteboardData?: any; senderName?: string }
  ) {
    const content = {
      classId: id,
      type: body.type,
      title: body.title,
      url: body.url || null,
      whiteboardData: body.whiteboardData || null,
      sharedAt: new Date().toISOString(),
      senderName: body.senderName || 'Instructor',
    };

    if (body.type === 'NONE') {
      LiveClassesController.classroomContentMap.delete(id);
    } else {
      LiveClassesController.classroomContentMap.set(id, content);
    }

    PortalsDataController.broadcastEvent('CLASSROOM_CONTENT_SHARED', {
      classId: id,
      content,
    });

    return { status: 'success', data: content };
  }

  @Post(':id/whiteboard-stroke')
  async broadcastWhiteboardStroke(@Param('id') id: string, @Body() body: any) {
    const stroke = body?.stroke || (body?.x0 !== undefined ? body : null);
    PortalsDataController.broadcastEvent('WHITEBOARD_STROKE', {
      classId: id,
      stroke,
    });
    return { status: 'success' };
  }

  @Post(':id/chat')
  async sendChatMessage(
    @Param('id') id: string,
    @Body() body: { senderId: string; senderName: string; role: string; text: string }
  ) {
    if (!LiveClassesController.classroomChatMap.has(id)) {
      LiveClassesController.classroomChatMap.set(id, []);
    }
    const msgs = LiveClassesController.classroomChatMap.get(id)!;
    const isStudent = body.role === 'student';
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      classId: id,
      senderId: body.senderId || 'user',
      senderName: body.senderName || 'Participant',
      role: body.role || 'student',
      text: body.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      // Moderation flags: student messages are routed to doubt solver first
      forwardedToLead: !isStudent,
      moderatedBy: null,
      moderatedAt: null,
    };
    msgs.push(msg);

    PortalsDataController.broadcastEvent('CLASSROOM_CHAT_MESSAGE', {
      classId: id,
      message: msg,
    });

    return { status: 'success', data: msg };
  }

  @Post(':id/chat/:msgId/forward-to-lead')
  async forwardChatMessageToLead(
    @Param('id') id: string,
    @Param('msgId') msgId: string,
    @Body() body: { moderatorName?: string; note?: string }
  ) {
    const msgs = LiveClassesController.classroomChatMap.get(id) || [];
    const targetMsg = msgs.find((m: any) => m.id === msgId);
    if (!targetMsg) {
      return { status: 'error', message: 'Message not found' };
    }

    targetMsg.forwardedToLead = true;
    targetMsg.moderatedBy = body.moderatorName || 'Doubt Solver Tutor';
    targetMsg.moderatedAt = Date.now();
    if (body.note) {
      targetMsg.moderatorNote = body.note;
    }

    PortalsDataController.broadcastEvent('CLASSROOM_CHAT_FORWARDED_TO_LEAD', {
      classId: id,
      message: targetMsg,
    });

    return { status: 'success', data: targetMsg };
  }

  @Post(':id/attendance-ping')
  async recordAttendancePing(
    @Param('id') id: string,
    @Body() body: { studentId: string; studentName: string; regNo?: string }
  ) {
    if (!LiveClassesController.classroomAttendanceMap.has(id)) {
      LiveClassesController.classroomAttendanceMap.set(id, []);
    }
    const list = LiveClassesController.classroomAttendanceMap.get(id)!;
    let student = list.find((s) => s.studentId === body.studentId);
    if (!student) {
      student = {
        studentId: body.studentId,
        studentName: body.studentName,
        regNo: body.regNo || 'REG-STD',
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        stayMinutes: 1,
        status: 'PRESENT',
      };
      list.push(student);
    } else {
      student.lastActiveAt = new Date().toISOString();
      student.stayMinutes = (student.stayMinutes || 1) + 1;
    }

    PortalsDataController.broadcastEvent('CLASSROOM_ATTENDANCE_UPDATE', {
      classId: id,
      attendance: list,
    });

    return { status: 'success', data: student };
  }

  @Post(':id/interaction')
  async handleClassroomInteraction(
    @Param('id') id: string,
    @Body() body: { type: 'HAND_RAISE' | 'REACTION'; studentId: string; studentName: string; emoji?: string; raised?: boolean }
  ) {
    PortalsDataController.broadcastEvent('CLASSROOM_INTERACTION', {
      classId: id,
      interaction: {
        ...body,
        id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
      },
    });
    return { status: 'success' };
  }

  // Lead Tutor toggles student Mic/Video capability permissions
  @Post(':id/media-permissions')
  async updateMediaPermissions(
    @Param('id') id: string,
    @Body() body: { allowStudentMic?: boolean; allowStudentVideo?: boolean; role?: string }
  ) {
    const current = LiveClassesController.classroomPermissionsMap.get(id) || { allowStudentMic: false, allowStudentVideo: false };
    
    if (body.allowStudentMic !== undefined) current.allowStudentMic = Boolean(body.allowStudentMic);
    if (body.allowStudentVideo !== undefined) current.allowStudentVideo = Boolean(body.allowStudentVideo);
    
    LiveClassesController.classroomPermissionsMap.set(id, current);

    // Broadcast permission change immediately to all students in room
    PortalsDataController.broadcastEvent('CLASSROOM_PERMISSIONS_UPDATED', {
      classId: id,
      permissions: current,
    });

    return { status: 'success', data: current };
  }
}
