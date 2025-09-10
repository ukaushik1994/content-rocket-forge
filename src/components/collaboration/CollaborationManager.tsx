import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WebRTCScreenSharing } from './WebRTCScreenSharing';
import { 
  Users, 
  Plus, 
  Settings, 
  Eye,
  MessageCircle,
  Monitor 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollaborationSession {
  id: string;
  sessionName: string;
  hostUserId: string;
  participants: Array<{
    userId: string;
    name: string;
    joinedAt: string;
  }>;
  screenSharingActive: boolean;
  status: 'active' | 'paused' | 'ended';
  startedAt: string;
}

interface CollaborationManagerProps {
  conversationId?: string;
  onSessionChange?: (session: CollaborationSession | null) => void;
}

export const CollaborationManager: React.FC<CollaborationManagerProps> = ({
  conversationId,
  onSessionChange
}) => {
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [availableSessions, setAvailableSessions] = useState<CollaborationSession[]>([]);
  const { toast } = useToast();

  // Load available sessions
  useEffect(() => {
    loadAvailableSessions();
  }, []);

  // Real-time session updates
  useEffect(() => {
    const channel = supabase
      .channel('collaboration-sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'collaboration_sessions'
      }, (payload) => {
        console.log('Session update:', payload);
        loadAvailableSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAvailableSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sessions: CollaborationSession[] = data.map(session => ({
        id: session.id,
        sessionName: session.session_name,
        hostUserId: session.host_user_id,
        participants: Array.isArray(session.participants) ? session.participants as Array<{
          userId: string;
          name: string;
          joinedAt: string;
        }> : [],
        screenSharingActive: session.screen_sharing_active,
        status: session.status as 'active' | 'paused' | 'ended',
        startedAt: session.started_at
      }));

      setAvailableSessions(sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const createSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: "Session name required",
        description: "Please enter a name for the collaboration session",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('collaboration_sessions')
        .insert({
          session_name: sessionName,
          host_user_id: user.id,
          conversation_id: conversationId,
          participants: [{
            userId: user.id,
            name: user.email || 'Host',
            joinedAt: new Date().toISOString()
          }],
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      const session: CollaborationSession = {
        id: data.id,
        sessionName: data.session_name,
        hostUserId: data.host_user_id,
        participants: Array.isArray(data.participants) ? data.participants as Array<{
          userId: string;
          name: string;
          joinedAt: string;
        }> : [],
        screenSharingActive: data.screen_sharing_active,
        status: data.status as 'active' | 'paused' | 'ended',
        startedAt: data.started_at
      };

      setCurrentSession(session);
      setSessionName('');
      setIsCreatingSession(false);
      onSessionChange?.(session);

      toast({
        title: "Session created",
        description: `Collaboration session "${sessionName}" is now active`,
      });

    } catch (error: any) {
      toast({
        title: "Failed to create session",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const session = availableSessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');

      // Add user to participants
      const updatedParticipants = [
        ...session.participants,
        {
          userId: user.id,
          name: user.email || 'Participant',
          joinedAt: new Date().toISOString()
        }
      ];

      const { error } = await supabase
        .from('collaboration_sessions')
        .update({
          participants: updatedParticipants
        })
        .eq('id', sessionId);

      if (error) throw error;

      const updatedSession = { ...session, participants: updatedParticipants };
      setCurrentSession(updatedSession);
      onSessionChange?.(updatedSession);

      toast({
        title: "Joined session",
        description: `You have joined "${session.sessionName}"`,
      });

    } catch (error: any) {
      toast({
        title: "Failed to join session",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const leaveSession = async () => {
    if (!currentSession) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Remove user from participants
      const updatedParticipants = currentSession.participants.filter(
        p => p.userId !== user.id
      );

      // If host leaves or no participants left, end session
      if (currentSession.hostUserId === user.id || updatedParticipants.length === 0) {
        await supabase
          .from('collaboration_sessions')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('id', currentSession.id);
      } else {
        await supabase
          .from('collaboration_sessions')
          .update({
            participants: updatedParticipants
          })
          .eq('id', currentSession.id);
      }

      setCurrentSession(null);
      onSessionChange?.(null);

      toast({
        title: "Left session",
        description: "You have left the collaboration session",
      });

    } catch (error: any) {
      toast({
        title: "Error leaving session",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSessionUpdate = (sessionData: any) => {
    if (currentSession) {
      const updatedSession: CollaborationSession = {
        ...currentSession,
        screenSharingActive: sessionData.screen_sharing_active,
        participants: sessionData.participants || currentSession.participants
      };
      setCurrentSession(updatedSession);
      onSessionChange?.(updatedSession);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Session */}
      {currentSession && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {currentSession.sessionName}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="default">Active</Badge>
                  {currentSession.screenSharingActive && (
                    <Badge variant="secondary">
                      <Monitor className="h-3 w-3 mr-1" />
                      Sharing
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Participants */}
              <div>
                <h4 className="font-medium mb-2">Participants ({currentSession.participants.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {currentSession.participants.map((participant, index) => (
                    <Badge key={index} variant="outline">
                      {participant.name}
                      {participant.userId === currentSession.hostUserId && ' (Host)'}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Screen Sharing Component */}
              <WebRTCScreenSharing
                sessionId={currentSession.id}
                participants={currentSession.participants.map(p => ({
                  id: p.userId,
                  name: p.name,
                  isHost: p.userId === currentSession.hostUserId
                }))}
                onSessionUpdate={handleSessionUpdate}
              />

              {/* Session Actions */}
              <div className="flex justify-end">
                <Button variant="outline" onClick={leaveSession}>
                  Leave Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Create or Join Session */}
      {!currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create New Session */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Create New Session</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingSession(!isCreatingSession)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <AnimatePresence>
                {isCreatingSession && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Input
                      placeholder="Enter session name..."
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && createSession()}
                    />
                    <div className="flex gap-2">
                      <Button onClick={createSession} className="flex-1">
                        Create Session
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreatingSession(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Available Sessions */}
            {availableSessions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Available Sessions</h4>
                <div className="space-y-2">
                  {availableSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{session.sessionName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{session.participants.length} participants</span>
                          {session.screenSharingActive && (
                            <>
                              <Monitor className="h-3 w-3 ml-2" />
                              <span>Screen sharing active</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => joinSession(session.id)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableSessions.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No active collaboration sessions
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};