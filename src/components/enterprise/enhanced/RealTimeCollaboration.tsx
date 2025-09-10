import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Users,
  Video,
  Share2,
  MessageCircle,
  MousePointer,
  Eye,
  Hand,
  Mic,
  MicOff,
  VideoOff,
  ScreenShare,
  UserPlus,
  Copy,
  Clock,
  Activity
} from 'lucide-react';
import { useEnterpriseRBAC } from '@/contexts/EnterpriseRBACContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CollaborationSession {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  participants: Participant[];
  status: 'active' | 'paused' | 'ended';
  startTime: string;
  shareUrl: string;
  features: {
    videoCall: boolean;
    screenShare: boolean;
    realTimeChat: boolean;
    cursorTracking: boolean;
  };
}

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'host' | 'moderator' | 'participant';
  status: 'online' | 'away' | 'offline';
  joinedAt: string;
  cursor?: {
    x: number;
    y: number;
  };
  isVideoOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'system' | 'file';
}

export const RealTimeCollaboration: React.FC = () => {
  const { hasPermission, auditLog, userProfile } = useEnterpriseRBAC();
  const [activeSessions, setActiveSessions] = useState<CollaborationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userPresence, setUserPresence] = useState<Record<string, any>>({});

  useEffect(() => {
    if (hasPermission('collaboration', 'read')) {
      loadActiveSessions();
      setupRealtimeSubscriptions();
    }
  }, [hasPermission]);

  const setupRealtimeSubscriptions = useCallback(() => {
    // Set up real-time presence tracking
    const presenceChannel = supabase.channel('collaboration_presence');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setUserPresence(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && userProfile) {
          await presenceChannel.track({
            user_id: userProfile.id,
            name: userProfile.email,
            online_at: new Date().toISOString(),
            status: 'online'
          });
          setIsConnected(true);
        }
      });

    // Set up chat message subscriptions (simplified for demo)
    const chatChannel = supabase
      .channel('collaboration_chat')
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(chatChannel);
    };
  }, [userProfile]);

  const loadActiveSessions = async () => {
    try {
      const { data: sessions, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedSessions: CollaborationSession[] = sessions?.map(session => ({
        id: session.id,
        name: session.session_name,
        hostId: session.host_user_id,
        hostName: 'Host User', // TODO: Join with profiles
        participants: [], // TODO: Load participants
        status: session.status as 'active' | 'paused' | 'ended',
        startTime: session.started_at,
        shareUrl: `${window.location.origin}/collaboration/${session.id}`,
        features: {
          videoCall: true,
          screenShare: true,
          realTimeChat: true,
          cursorTracking: true
        }
      })) || [];

      setActiveSessions(formattedSessions);
      await auditLog('collaboration_sessions_loaded', 'collaboration', { count: formattedSessions.length });
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load collaboration sessions');
    }
  };

  const createSession = async (sessionName: string) => {
    if (!hasPermission('collaboration', 'create')) {
      toast.error('You do not have permission to create collaboration sessions');
      return;
    }

    try {
      const { data: session, error } = await supabase
        .from('collaboration_sessions')
        .insert({
          session_name: sessionName,
          host_user_id: userProfile?.id,
          status: 'active',
          participants: JSON.stringify([{
            id: userProfile?.id,
            name: userProfile?.email,
            role: 'host',
            status: 'online',
            joinedAt: new Date().toISOString(),
            isVideoOn: false,
            isMicOn: true,
            isScreenSharing: false
          }]),
          session_data: JSON.stringify({
            features: {
              videoCall: true,
              screenShare: true,
              realTimeChat: true,
              cursorTracking: true
            }
          })
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      await auditLog('collaboration_session_created', 'collaboration', { 
        sessionId: session.id, 
        sessionName 
      });

      toast.success('Collaboration session created successfully');
      loadActiveSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create collaboration session');
    }
  };

  const joinSession = async (sessionId: string) => {
    if (!hasPermission('collaboration', 'join')) {
      toast.error('You do not have permission to join collaboration sessions');
      return;
    }

    try {
      // Find the session
      const session = activeSessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Add current user as participant
      const newParticipant: Participant = {
        id: userProfile?.id || 'anonymous',
        name: userProfile?.email || 'Anonymous',
        email: userProfile?.email || 'anonymous@example.com',
        role: 'participant',
        status: 'online',
        joinedAt: new Date().toISOString(),
        isVideoOn: false,
        isMicOn: true,
        isScreenSharing: false
      };

      // Update session participants
      session.participants.push(newParticipant);
      setCurrentSession(session);

      await auditLog('collaboration_session_joined', 'collaboration', { 
        sessionId, 
        participantId: userProfile?.id 
      });

      toast.success(`Joined collaboration session: ${session.name}`);
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join collaboration session');
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;

    try {
      // For demo purposes, add message to local state
      const newChatMessage: ChatMessage = {
        id: crypto.randomUUID(),
        senderId: userProfile?.id || 'anonymous',
        senderName: userProfile?.email || 'Anonymous',
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setChatMessages(prev => [...prev, newChatMessage]);

      setChatMessages(prev => [...prev, newChatMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const toggleVideo = (participantId: string) => {
    if (!currentSession) return;
    
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: prev.participants.map(p => 
          p.id === participantId ? { ...p, isVideoOn: !p.isVideoOn } : p
        )
      };
    });
  };

  const toggleMic = (participantId: string) => {
    if (!currentSession) return;
    
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: prev.participants.map(p => 
          p.id === participantId ? { ...p, isMicOn: !p.isMicOn } : p
        )
      };
    });
  };

  const shareScreen = async () => {
    if (!hasPermission('collaboration', 'screenshare')) {
      toast.error('You do not have permission to share screen');
      return;
    }

    try {
      // In a real implementation, you would integrate with WebRTC
      toast.info('Screen sharing would be implemented with WebRTC');
      
      await auditLog('screen_share_started', 'collaboration', { 
        sessionId: currentSession?.id 
      });
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast.error('Failed to start screen sharing');
    }
  };

  const copyShareUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Share URL copied to clipboard');
  };

  if (!hasPermission('collaboration', 'read')) {
    return (
      <Alert>
        <Users className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to access collaboration features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Collaboration</h2>
          <p className="text-muted-foreground">
            Share workspaces and collaborate in real-time
          </p>
        </div>
        <div className="flex gap-2">
          {isConnected && (
            <Badge variant="secondary" className="text-green-600">
              <Activity className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          )}
          <Button onClick={() => createSession('New Collaboration Session')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Start Session
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid gap-4">
            {activeSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        {session.participants.slice(0, 3).map((participant, index) => (
                          <Avatar key={participant.id} className="border-2 border-background">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>
                              {participant.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {session.participants.length > 3 && (
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-background text-xs">
                            +{session.participants.length - 3}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{session.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Host: {session.hostName} • {session.participants.length} participants
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Started {new Date(session.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="text-green-600">
                        {session.status}
                      </Badge>
                      <Button size="sm" onClick={() => joinSession(session.id)}>
                        <Users className="mr-1 h-3 w-3" />
                        Join
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copyShareUrl(session.shareUrl)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workspace" className="space-y-4">
          {currentSession ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Shared Workspace: {currentSession.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={shareScreen}>
                          <ScreenShare className="mr-1 h-3 w-3" />
                          Share Screen
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="mr-1 h-3 w-3" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Shared workspace content would appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Participants ({currentSession.participants.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentSession.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="text-xs">
                              {participant.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{participant.name}</p>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {participant.role}
                              </Badge>
                              <div className={`w-2 h-2 rounded-full ${
                                participant.status === 'online' ? 'bg-green-500' : 
                                participant.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                              }`} />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="p-1 h-7 w-7"
                            onClick={() => toggleMic(participant.id)}
                          >
                            {participant.isMicOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="p-1 h-7 w-7"
                            onClick={() => toggleVideo(participant.id)}
                          >
                            {participant.isVideoOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Session Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Video Call</span>
                      <Badge variant={currentSession.features.videoCall ? 'default' : 'secondary'}>
                        {currentSession.features.videoCall ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Screen Share</span>
                      <Badge variant={currentSession.features.screenShare ? 'default' : 'secondary'}>
                        {currentSession.features.screenShare ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Real-time Chat</span>
                      <Badge variant={currentSession.features.realTimeChat ? 'default' : 'secondary'}>
                        {currentSession.features.realTimeChat ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Cursor Tracking</span>
                      <Badge variant={currentSession.features.cursorTracking ? 'default' : 'secondary'}>
                        {currentSession.features.cursorTracking ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No Active Workspace</p>
                <p className="text-muted-foreground mb-4">
                  Join or start a collaboration session to begin working together
                </p>
                <Button onClick={() => createSession('New Workspace')}>
                  Start New Session
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          {currentSession ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Chat - {currentSession.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-2">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {message.senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{message.senderName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <Button onClick={sendChatMessage}>
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No Chat Available</p>
                <p className="text-muted-foreground">
                  Join a collaboration session to start chatting
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};