import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { StreamingChatInterface } from './StreamingChatInterface';
import { RealTimeCollaboration } from './RealTimeCollaboration';
import { SmartActionsIntegration } from './SmartActionsIntegration';
import { AdvancedChatFeatures } from './AdvancedChatFeatures';
import { RichMediaRenderer } from './RichMediaRenderer';
import { EnhancedFileProcessor } from './EnhancedFileProcessor';
import { PerformanceAnalyticsWidget } from './PerformanceAnalyticsWidget';
import { RealtimeNotificationCenter } from '../notifications/RealtimeNotificationCenter';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const chatInterfaceRef = useRef(null);
  const { toast } = useToast();
  
  // Temporarily use the original streaming chat hook
  const {
    messages,
    isAIThinking,
    sendMessage,
    clearMessages
  } = useStreamingChat();

  // Mock enhanced features for now
  const currentVisualData = undefined;
  const currentActions = undefined;
  
  const analyzeFile = async (file: File) => {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      insights: ['File processed successfully']
    };
  };

  const handleAction = (action: any) => {
    toast({
      title: "Action Executed",
      description: action.label || 'Action completed'
    });
  };

  const getPerformanceAnalytics = async () => null;

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
      setUploadedFiles(files);
      
      toast({
        title: "Files received",
        description: `${files.length} file(s) ready for analysis`,
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

  const handleFileAnalysisComplete = async (analyses: any[]) => {
    try {
      // Create a comprehensive analysis message
      const analysisContent = `I've uploaded ${analyses.length} file(s) for analysis:\n\n` +
        analyses.map(analysis => 
          `**${analysis.name}** (${analysis.size} bytes)\n` +
          `${analysis.insights ? analysis.insights.join('\n') : 'Basic file processed'}`
        ).join('\n\n') +
        '\n\nPlease provide detailed insights and recommendations based on this content.';
      
      await sendMessage(analysisContent);
      setUploadedFiles([]);
    } catch (error) {
      console.error('Analysis completion error:', error);
      toast({
        title: "Analysis failed",
        description: "Could not process file analysis",
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
              apiKey: 'user-configured',
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
              await sendMessage(transcriptText);
              
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
    clearMessages();
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
        setShowAnalytics(true);
        sendMessage('Please provide a comprehensive performance analysis of my content including SEO metrics, publication rates, and optimization opportunities.');
        break;
      default:
        // Custom action handling
        toast({
          title: "Action executed",
          description: `Performed: ${action}`,
        });
    }
  };

  const handleRequestAnalytics = async () => {
    setShowAnalytics(true);
    await sendMessage('Show me my current performance analytics and provide insights for optimization.');
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

        {/* Enhanced File Processing */}
        {uploadedFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <Card>
              <CardContent className="p-4">
                <EnhancedFileProcessor
                  files={uploadedFiles}
                  onAnalysisComplete={handleFileAnalysisComplete}
                  onAnalyzeFile={analyzeFile}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Rich Media Renderer for enhanced responses */}
        {(currentVisualData || currentActions) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card>
              <CardContent className="p-4">
                <RichMediaRenderer
                  visualData={currentVisualData}
                  actions={currentActions}
                  onActionClick={handleAction}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Performance Analytics Widget */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <PerformanceAnalyticsWidget
              onRequestAnalysis={handleRequestAnalytics}
              onGenerateReport={() => sendMessage('Generate a comprehensive performance report with actionable recommendations.')}
            />
          </motion.div>
        )}
      </div>

      {/* Smart Actions Integration */}
      <SmartActionsIntegration 
        context={smartContext}
        onAction={handleSmartAction}
      />

      {/* Enhanced Features Separator */}
      {(currentVisualData || currentActions || showAnalytics || uploadedFiles.length > 0) && (
        <Separator className="my-4" />
      )}

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