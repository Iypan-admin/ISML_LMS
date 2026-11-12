'use client';

import React, { useEffect, useRef } from 'react';
import { Track } from 'livekit-client';

interface CameraStreamVideoProps {
  trackRef?: any;
  participant?: any;
  isLocal?: boolean;
  className?: string;
}

export const CameraStreamVideo: React.FC<CameraStreamVideoProps> = ({
  trackRef,
  participant,
  isLocal = false,
  className = "w-full h-full object-cover"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const mediaTrack =
      trackRef?.publication?.track ||
      trackRef?.track ||
      participant?.getTrackPublication(Track.Source.ScreenShare)?.track ||
      participant?.getTrackPublication(Track.Source.Camera)?.track;

    const trackId = mediaTrack?.sid || mediaTrack?.mediaStreamTrack?.id || null;

    if (mediaTrack && trackId) {
      if (currentTrackIdRef.current !== trackId || !el.srcObject) {
        currentTrackIdRef.current = trackId;
        if (typeof mediaTrack.attach === 'function') {
          mediaTrack.attach(el);
        } else if (mediaTrack.mediaStreamTrack) {
          el.srcObject = new MediaStream([mediaTrack.mediaStreamTrack]);
        }
        if (el.paused) {
          el.play().catch(() => {});
        }
      }
    } else {
      if (currentTrackIdRef.current) {
        currentTrackIdRef.current = null;
        el.srcObject = null;
      }
    }
  }, [trackRef?.publication?.track?.sid, trackRef?.publication?.track?.mediaStreamTrack?.id, participant]);

  useEffect(() => {
    return () => {
      const el = videoRef.current;
      if (el) {
        el.srcObject = null;
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className={className}
    />
  );
};