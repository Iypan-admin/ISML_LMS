"use client";

import React, { useEffect, useState } from 'react';
import '@livekit/components-styles';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useSpeakingParticipants,
  useLocalParticipant,
  useTracks,
  VideoTrack,
  AudioVisualizer,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Volume2,
  Sparkles,
  Loader2,
  MessageSquare,
  Share2,
} from 'lucide-react';

interface RealLiveKitStageProps {
  classId: string;
  identity: string;
  name: string;
  role: 'teacher' | 'student' | 'academic' | 'admin';
  onDisconnect?: () => void;
  hideControls?: boolean;
  externalMicOn?: boolean;
  externalVideoOn?: boolean;
  canUnmute?: boolean;
  canShareVideo?: boolean;
}

// Suppress harmless WebRTC unmount / disconnect abort logs from spamming dev console
if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;

  const isWebRtcAbort = (...args: any[]) => {
    const str = args.map((a) => (typeof a === 'string' ? a : a?.message || '')).join(' ');
    return (
      str.includes('User-Initiated Abort') ||
      str.includes('closed unexpectedly') ||
      str.includes('DataChannel error on') ||
      str.includes('publisher data channel')
    );
  };

  console.error = (...args: any[]) => {
    if (isWebRtcAbort(...args)) return;
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    if (isWebRtcAbort(...args)) return;
    originalWarn.apply(console, args);
  };
}

export default function RealLiveKitStage({
  classId,
  identity,
  name,
  role,
  onDisconnect,
  hideControls = false,
  externalMicOn,
  externalVideoOn,
  canUnmute = true,
  canShareVideo = true,
}: RealLiveKitStageProps) {
  const [token, setToken] = useState<string>('');
  const [serverUrl, setServerUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchToken = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:4000/api/live-classes/${classId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity,
            name,
            role,
          }),
        });

        const json = await res.json();
        if (json.status === 'success' && json.data?.token) {
          if (!isCancelled) {
            setToken(json.data.token);
            setServerUrl(json.data.livekitUrl || 'wss://neet-n80sqwyo.livekit.cloud');
          }
        } else {
          throw new Error(json.message || 'Failed to acquire live video token');
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Error connecting to LiveKit media server');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchToken();
    return () => {
      isCancelled = true;
    };
  }, [classId, identity, name, role]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center bg-slate-950 text-white space-y-3 rounded-2xl p-4">
        <Loader2 className="w-9 h-9 text-cyan-400 animate-spin" />
        <p className="text-sm font-bold text-slate-200">Joining Classroom Studio...</p>
        <p className="text-[11px] text-slate-400">Microphone and Camera kept OFF by default</p>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center bg-slate-950 text-white p-6 space-y-3 rounded-2xl border border-rose-500/30 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg">!</div>
        <p className="text-sm font-bold text-rose-300">Class Not Live Yet</p>
        <p className="text-xs text-slate-300 max-w-md font-medium">
          {error?.includes('not started yet')
            ? 'Live class has not been started yet by the tutor. Please wait for the faculty to launch the broadcast.'
            : error || 'Live class has not started yet by tutor.'}
        </p>
        <div className="flex items-center gap-2 pt-2">
          {onDisconnect && (
            <button
              onClick={onDisconnect}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
            >
              Close Studio
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 rounded-2xl overflow-hidden relative isolate select-none">
      <LiveKitRoom
        video={false} // Default audio and video OFF
        audio={false} // Default audio and video OFF
        token={token}
        serverUrl={serverUrl}
        connect={true}
        data-lk-theme="default"
        options={{
          publishDefaults: {
            simulcast: false,
            videoCodec: 'vp8',
          },
        }}
        onError={(err) => {
          // Suppress standard WebRTC unmount / User-Initiated Abort data channel notices
          if (err && err.message && (err.message.includes('User-Initiated') || err.message.includes('closed unexpectedly'))) {
            return;
          }
        }}
        className="w-full h-full flex-1 flex flex-col relative"
      >
        <RoomAudioRenderer />
        <CustomLiveStage
          onDisconnect={onDisconnect}
          role={role}
          hideControls={hideControls}
          externalMicOn={externalMicOn}
          externalVideoOn={externalVideoOn}
          canUnmute={canUnmute}
          canShareVideo={canShareVideo}
        />
      </LiveKitRoom>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM RESPONSIVE MOBILE-FIRST LIVE WEBRTC STAGE
// ─────────────────────────────────────────────────────────────────────────────
function CustomLiveStage({
  onDisconnect,
  role,
  hideControls,
  externalMicOn,
  externalVideoOn,
  canUnmute = true,
  canShareVideo = true,
}: {
  onDisconnect?: () => void;
  role: 'teacher' | 'student' | 'academic' | 'admin';
  hideControls?: boolean;
  externalMicOn?: boolean;
  externalVideoOn?: boolean;
  canUnmute?: boolean;
  canShareVideo?: boolean;
}) {
  const participants = useParticipants();
  const speakingParticipants = useSpeakingParticipants();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();

  // If student and permissions are revoked by Lead Tutor, immediately mute mic and disable video
  useEffect(() => {
    if (role === 'student' && !canUnmute && isMicrophoneEnabled && localParticipant) {
      localParticipant.setMicrophoneEnabled(false).catch(() => {});
    }
  }, [role, canUnmute, isMicrophoneEnabled, localParticipant]);

  useEffect(() => {
    if (role === 'student' && !canShareVideo && isCameraEnabled && localParticipant) {
      localParticipant.setCameraEnabled(false).catch(() => {});
    }
  }, [role, canShareVideo, isCameraEnabled, localParticipant]);

  // Sync external bottom dock controls (Tutor Studio Dock) with LiveKit WebRTC state
  useEffect(() => {
    if (externalMicOn !== undefined && localParticipant) {
      if (role === 'student' && !canUnmute && externalMicOn) return;
      if (isMicrophoneEnabled !== externalMicOn) {
        localParticipant.setMicrophoneEnabled(externalMicOn).catch(() => {});
      }
    }
  }, [externalMicOn, localParticipant, isMicrophoneEnabled, role, canUnmute]);

  useEffect(() => {
    if (externalVideoOn !== undefined && localParticipant) {
      if (role === 'student' && !canShareVideo && externalVideoOn) return;
      if (isCameraEnabled !== externalVideoOn) {
        localParticipant.setCameraEnabled(externalVideoOn).catch(() => {});
      }
    }
  }, [externalVideoOn, localParticipant, isCameraEnabled, role, canShareVideo]);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // Active speaker names
  const speakingNames = speakingParticipants.map((p) => p.name || p.identity).filter(Boolean);

  const toggleMic = async () => {
    if (role === 'student' && !canUnmute && !isMicrophoneEnabled) {
      alert('Microphone is locked by the Lead Tutor. Please raise your hand.');
      return;
    }
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (e) {
      console.error('Error toggling microphone:', e);
    }
  };

  const toggleCamera = async () => {
    if (role === 'student' && !canShareVideo && !isCameraEnabled) {
      alert('Camera access is locked by the Lead Tutor.');
      return;
    }
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (e) {
      console.error('Error toggling camera:', e);
    }
  };

  const toggleScreenShare = async () => {
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
    } catch (e) {
      console.error('Error toggling screenshare:', e);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between overflow-hidden relative p-2 sm:p-3">
      {/* ─── Top Active Speaker Notification Banner ─── */}
      <div className="z-10 flex items-center justify-between gap-2 shrink-0 pb-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {speakingNames.length > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold animate-pulse">
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="truncate max-w-[200px] sm:max-w-md">
                Speaking: <strong>{speakingNames.join(', ')}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>All mics quiet</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-semibold">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>{participants.length} Active</span>
        </div>
      </div>

      {/* ─── Responsive Video Tile Grid (Mobile 1st: 1 col on mobile, 2-3 on tablet/desktop) ─── */}
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto rounded-xl">
        {participants.map((participant) => {
          const isSpeaking = speakingParticipants.some((p) => p.identity === participant.identity);
          const isLocal = participant.isLocal;
          const camPublication = participant.getTrackPublication(Track.Source.Camera);
          const hasVideo = !!(camPublication && !camPublication.isMuted && camPublication.track);
          const trackRef = tracks.find((t) => t.participant.identity === participant.identity && t.source === Track.Source.Camera) || (camPublication?.track ? {
            participant,
            publication: camPublication,
            source: Track.Source.Camera,
          } as any : null);

          return (
            <div
              key={participant.identity}
              className={`relative aspect-video rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center transition-all ${
                isSpeaking
                  ? 'border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                  : 'border border-slate-800'
              }`}
            >
              {/* Actual Video or Fallback Avatar */}
              {hasVideo && trackRef ? (
                <VideoTrack trackRef={trackRef} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
                  <div className="relative">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl text-white shadow-lg transition-transform ${
                        isSpeaking
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 scale-105 ring-4 ring-emerald-400/50'
                          : 'bg-gradient-to-tr from-blue-700 to-indigo-600'
                      }`}
                    >
                      {(participant.name || participant.identity).slice(0, 2).toUpperCase()}
                    </div>
                    {/* Animated Mic Waveform Badge */}
                    {isSpeaking && (
                      <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-slate-950 shadow-md">
                        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
                    {participant.name || participant.identity}
                  </p>
                </div>
              )}

              {/* Participant Pill (Bottom) */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
                <span className="truncate flex items-center gap-1.5">
                  <span className="truncate">{participant.name || participant.identity}</span>
                  {isLocal && <span className="text-[9px] px-1 bg-blue-500/30 text-cyan-300 rounded">You</span>}
                </span>

                {/* Mic Status Icon */}
                <span className="shrink-0">
                  {participant.isMicrophoneEnabled ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <Mic className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-rose-400">
                      <MicOff className="w-3.5 h-3.5" />
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Compact Icon-Only Floating Bottom Control Bar (Mobile-Optimized) ─── */}
      {!hideControls && (
        <div className="pt-2 shrink-0 flex items-center justify-center">
          <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 bg-slate-900/90 backdrop-blur-lg border border-white/15 rounded-full shadow-2xl">
            {/* Mic Toggle Button */}
            <button
              onClick={toggleMic}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isMicrophoneEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30'
              }`}
              title={isMicrophoneEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicrophoneEnabled ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Camera Toggle Button */}
            <button
              onClick={toggleCamera}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isCameraEnabled
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title={isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isCameraEnabled ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Disconnect / Leave Call Button */}
            <button
              onClick={onDisconnect}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all shadow-md shadow-rose-600/40 cursor-pointer hover:scale-105"
              title="Leave Classroom"
            >
              <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
