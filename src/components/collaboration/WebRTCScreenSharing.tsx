import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Monitor, 
  MonitorOff, 
  Users, 
  Eye,
  EyeOff,
  Square,
  Circle,
  Maximize,
  Minimize
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
}

interface WebRTCScreenSharingProps {
  sessionId?: string;
  participants: Participant[];
  onSessionUpdate?: (sessionData: any) => void;
}

export const WebRTCScreenSharing: React.FC<WebRTCScreenSharingProps> = ({
  sessionId,
  participants,
  onSessionUpdate
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const startScreenSharing = useCallback(async () => {
    try {
      // Request screen capture permission
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });

      setStream(screenStream);
      setIsSharing(true);

      // Display local stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      // Create peer connection for sharing
      const pc = new RTCPeerConnection(rtcConfig);
      setPeerConnection(pc);

      // Add stream to peer connection
      screenStream.getTracks().forEach(track => {
        pc.addTrack(track, screenStream);
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // In production, send via Supabase realtime
          console.log('ICE candidate:', event.candidate);
        }
      };

      // Update session in database
      if (sessionId) {
        const { error } = await supabase
          .from('collaboration_sessions')
          .update({
            screen_sharing_active: true,
            screen_sharing_user_id: (await supabase.auth.getUser()).data.user?.id,
            session_data: {
              ...sessionData,
              screenSharing: {
                active: true,
                startedAt: new Date().toISOString()
              }
            }
          })
          .eq('id', sessionId);

        if (error) {
          console.error('Error updating session:', error);
        }
      }

      // Listen for stream end
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenSharing();
      });

      toast({
        title: "Screen sharing started",
        description: "Your screen is now being shared with participants",
      });

    } catch (error) {
      console.error('Error starting screen share:', error);
      toast({
        title: "Screen sharing failed",
        description: "Could not start screen sharing. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [sessionId, sessionData, toast]);

  const stopScreenSharing = useCallback(async () => {
    try {
      // Stop all tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Close peer connection
      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }

      setIsSharing(false);

      // Clear local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      // Update session in database
      if (sessionId) {
        const { error } = await supabase
          .from('collaboration_sessions')
          .update({
            screen_sharing_active: false,
            screen_sharing_user_id: null,
            session_data: {
              ...sessionData,
              screenSharing: {
                active: false,
                endedAt: new Date().toISOString()
              }
            }
          })
          .eq('id', sessionId);

        if (error) {
          console.error('Error updating session:', error);
        }
      }

      toast({
        title: "Screen sharing stopped",
        description: "Screen sharing has been ended",
      });

    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  }, [stream, peerConnection, sessionId, sessionData, toast]);

  const joinAsViewer = useCallback(async () => {
    try {
      // Create peer connection for viewing
      const pc = new RTCPeerConnection(rtcConfig);
      setPeerConnection(pc);

      // Handle remote stream
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      setIsWatching(true);

      toast({
        title: "Joined as viewer",
        description: "You can now see the shared screen",
      });

    } catch (error) {
      console.error('Error joining as viewer:', error);
      toast({
        title: "Failed to join",
        description: "Could not join the screen sharing session",
        variant: "destructive"
      });
    }
  }, [toast]);

  const leaveAsViewer = useCallback(() => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsWatching(false);

    toast({
      title: "Left session",
      description: "You have left the screen sharing session",
    });
  }, [peerConnection, toast]);

  const toggleFullscreen = useCallback(() => {
    const videoElement = isSharing ? localVideoRef.current : remoteVideoRef.current;
    
    if (!videoElement) return;

    if (!isFullscreen) {
      videoElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, [isSharing, isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Real-time session updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel('screen-sharing-session')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'collaboration_sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        setSessionData(payload.new);
        onSessionUpdate?.(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, onSessionUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [stream, peerConnection]);

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <h3 className="font-semibold">Screen Sharing</h3>
              {sessionData?.screen_sharing_active && (
                <Badge variant="default" className="animate-pulse">
                  <Circle className="h-2 w-2 mr-1 fill-current" />
                  Live
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {!isSharing && !isWatching && (
              <>
                <Button onClick={startScreenSharing} className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Share Screen
                </Button>
                
                {sessionData?.screen_sharing_active && (
                  <Button variant="outline" onClick={joinAsViewer} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Watch Screen
                  </Button>
                )}
              </>
            )}

            {isSharing && (
              <Button variant="destructive" onClick={stopScreenSharing} className="flex items-center gap-2">
                <MonitorOff className="h-4 w-4" />
                Stop Sharing
              </Button>
            )}

            {isWatching && (
              <Button variant="outline" onClick={leaveAsViewer} className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                Stop Watching
              </Button>
            )}

            {(isSharing || isWatching) && (
              <Button variant="ghost" onClick={toggleFullscreen} className="flex items-center gap-2">
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Display */}
      <AnimatePresence>
        {(isSharing || isWatching) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <Card>
              <CardContent className="p-2">
                {isSharing && (
                  <div className="relative">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      className="w-full h-auto max-h-96 rounded-lg bg-black"
                      style={{ aspectRatio: '16/9' }}
                    />
                    <Badge className="absolute top-2 left-2">
                      Your Screen
                    </Badge>
                  </div>
                )}

                {isWatching && (
                  <div className="relative">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      className="w-full h-auto max-h-96 rounded-lg bg-black"
                      style={{ aspectRatio: '16/9' }}
                    />
                    <Badge className="absolute top-2 left-2">
                      Shared Screen
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participants List */}
      {participants.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Session Participants</h4>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between">
                  <span className="text-sm">{participant.name}</span>
                  <div className="flex gap-1">
                    {participant.isHost && (
                      <Badge variant="secondary" className="text-xs">Host</Badge>
                    )}
                    {sessionData?.screen_sharing_user_id === participant.id && (
                      <Badge variant="default" className="text-xs">Sharing</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};