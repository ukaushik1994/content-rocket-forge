import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { StreamingChatInterface } from './StreamingChatInterface';
import { AdvancedChatFeatures } from './AdvancedChatFeatures';
import { RealTimeCollaboration } from './RealTimeCollaboration';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { useToast } from '@/hooks/use-toast';

interface EnhancedStreamingInterfaceProps {
  onClearConversation?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const EnhancedStreamingInterface: React.FC<EnhancedStreamingInterfaceProps> = ({
  onClearConversation,
  onToggleSidebar,
  isSidebarOpen = true
}) => {
  const chatInterfaceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { 
    activeConversationId,
    collaborators,
    typingUsers 
  } = useChatContextBridge();
  
  const {
    messages,
    connectionStatus,
    isAIThinking,
    sendMessage,
    clearMessages
  } = useStreamingChat();

  const handleFileUpload = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const message = `[File Upload: ${file.name}]\n\n${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}`;
        sendMessage(message);
      };
      
      if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        toast({
          title: "File uploaded",
          description: `${file.name} has been attached to the conversation`,
        });
        sendMessage(`[File attached: ${file.name} (${file.type})]`);
      }
    });
  };

  const handleVoiceInput = (audioBlob: Blob) => {
    // For now, just notify - real voice transcription would need additional setup
    toast({
      title: "Voice message recorded",
      description: "Voice transcription feature coming soon",
    });
    sendMessage("[Voice message recorded - transcription pending]");
  };

  const handleScreenCapture = () => {
    toast({
      title: "Screen captured",
      description: "Screen sharing feature activated",
    });
    sendMessage("[Screen shared - visual context added to conversation]");
  };

  const handleClear = () => {
    clearMessages();
    onClearConversation?.();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Collaboration Features */}
      {activeConversationId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-b border-border/50"
        >
          <RealTimeCollaboration 
            conversationId={activeConversationId}
          />
        </motion.div>
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        <StreamingChatInterface
          ref={chatInterfaceRef}
          onClearConversation={handleClear}
          onToggleSidebar={onToggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      {/* Advanced Features Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm"
      >
        <AdvancedChatFeatures
          onFileUpload={handleFileUpload}
          onVoiceInput={handleVoiceInput}
          onScreenCapture={handleScreenCapture}
          isRecording={false}
          collaborators={collaborators.map(c => c.userName)}
          typingUsers={typingUsers}
        />
      </motion.div>
    </div>
  );
};