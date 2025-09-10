import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { StreamingChatInterface } from './StreamingChatInterface';
import { RealTimeCollaboration } from './RealTimeCollaboration';
import { SmartActionsIntegration } from './SmartActionsIntegration';
import { AdvancedChatFeatures } from './AdvancedChatFeatures';
import { RichMediaRenderer } from './RichMediaRenderer';
import { RealtimeNotificationCenter } from '../notifications/RealtimeNotificationCenter';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedStreamingInterfaceProps {
  onClearConversation?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const EnhancedStreamingInterface: React.FC<EnhancedStreamingInterfaceProps> = ({
  onClearConversation,
  onToggleSidebar,
  isSidebarOpen
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const chatInterfaceRef = useRef(null);
  const { toast } = useToast();

  const {
    activeConversationId,
    collaborators
  } = useChatContextBridge();

  // Enhanced context for smart actions
  const smartContext = {
    contentId: activeConversationId,
    approvalStatus: 'draft',
    isSubmitting: false,
    hasNotes: messages.length > 0
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      console.log('Files uploaded:', files);
      
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          
          // Create a message with file content
          const fileMessage = {
            id: Date.now().toString() + Math.random(),
            type: 'user',
            content: `📎 **File: ${file.name}**\n\n${file.type.includes('text') ? content : 'File uploaded: ' + file.name}`,
            timestamp: new Date(),
            status: 'delivered',
            attachments: [{
              name: file.name,
              type: file.type,
              size: file.size
            }]
          };
          
          setMessages(prev => [...prev, fileMessage]);
        };
        
        if (file.type.includes('text')) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      }
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) processed successfully`,
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: "Could not process uploaded files",
        variant: "destructive"
      });
    }
  };

  const handleVoiceInput = async (audioBlob: Blob) => {
    try {
      console.log('Voice input received:', audioBlob);
      toast({
        title: "Processing voice input",
        description: "Transcribing audio...",
      });

      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          // Call AI proxy for transcription
          const { data, error } = await supabase.functions.invoke('ai-proxy', {
            body: {
              service: 'openai',
              endpoint: 'transcribe',
              apiKey: 'user-configured', // Will be fetched by the edge function
              params: {
                audio: base64Audio,
                mimeType: audioBlob.type,
                model: 'whisper-1'
              }
            }
          });

          if (error) {
            throw new Error(error.message || 'Transcription failed');
          }

          if (data?.success && data?.data?.text) {
            const transcriptText = data.data.text.trim();
            if (transcriptText) {
              // Add transcribed text as user message
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'user',
                content: transcriptText,
                timestamp: new Date(),
                status: 'delivered'
              }]);
              
              toast({
                title: "Voice transcribed",
                description: `"${transcriptText.substring(0, 50)}${transcriptText.length > 50 ? '...' : ''}"`,
              });
            } else {
              toast({
                title: "No speech detected",
                description: "Please try speaking more clearly",
                variant: "destructive"
              });
            }
          } else {
            throw new Error('Invalid transcription response');
          }
        } catch (transcriptionError: any) {
          console.error('Transcription error:', transcriptionError);
          toast({
            title: "Transcription failed",
            description: transcriptionError.message || "Could not process voice input",
            variant: "destructive"
          });
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error: any) {
      console.error('Voice input error:', error);
      toast({
        title: "Voice input failed",
        description: error.message || "Could not process voice input",
        variant: "destructive"
      });
    }
  };

  const handleScreenCapture = () => {
    console.log('Screen capture requested');
    toast({
      title: "Screen capture",
      description: "Screen sharing activated",
    });
  };

  const handleClear = () => {
    setMessages([]);
    onClearConversation?.();
  };

  const handleSmartAction = (action: string) => {
    console.log('Smart action triggered:', action);
    
    // Handle built-in actions
    switch (action) {
      case 'clear-conversation':
        handleClear();
        break;
      case 'export-chat':
        // Export functionality
        break;
      case 'analyze-performance':
        // Analytics functionality
        break;
      default:
        // Custom action handling
        toast({
          title: "Action executed",
          description: `Performed: ${action}`,
        });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Real-time Collaboration */}
      {activeConversationId && (
        <RealTimeCollaboration 
          conversationId={activeConversationId}
        />
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        <StreamingChatInterface 
          ref={chatInterfaceRef}
          onClearConversation={handleClear}
          onToggleSidebar={onToggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        
        <AdvancedChatFeatures
          onFileUpload={handleFileUpload}
          onVoiceInput={handleVoiceInput}
          onScreenCapture={handleScreenCapture}
          isRecording={false}
        />

        {/* Notification Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <span className="text-sm">🔔 Notifications</span>
          </button>
        </div>

        {/* Rich Media Renderer for enhanced responses */}
        <div id="rich-media-container" className="space-y-4">
          {/* This will be populated by AI responses with visual data */}
        </div>
      </div>

      {/* Smart Actions Integration */}
      <SmartActionsIntegration 
        context={smartContext}
        onAction={handleSmartAction}
      />

      {/* Realtime Notification Center */}
      <RealtimeNotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationClick={(notification) => {
          console.log('Notification clicked:', notification);
          // Handle notification actions
        }}
      />
    </div>
  );
};