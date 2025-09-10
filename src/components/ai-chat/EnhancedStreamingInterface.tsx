import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreamingChatInterface } from './StreamingChatInterface';
import { RealTimeCollaboration } from './RealTimeCollaboration';
import { SmartActionsIntegration } from './SmartActionsIntegration';
import { AdvancedChatFeatures } from './AdvancedChatFeatures';
import { RichMediaRenderer } from './RichMediaRenderer';
import { EnhancedFileProcessor } from './EnhancedFileProcessor';
import { PerformanceAnalyticsWidget } from './PerformanceAnalyticsWidget';
import { EnhancedContextSidebar } from '@/components/context/EnhancedContextSidebar';
import { SmartWorkflowAutomation } from './SmartWorkflowAutomation';
import { CollaborationManager } from '@/components/collaboration/CollaborationManager';
import { RealtimeNotificationCenter } from '../notifications/RealtimeNotificationCenter';
import { useEnhancedStreamingChat } from '@/hooks/useEnhancedStreamingChat';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { useAuth } from '@/contexts/AuthContext';
import { realTimePerformanceService } from '@/services/analytics/RealTimePerformanceService';
import { advancedFileAnalyzer } from '@/services/fileAnalysis/AdvancedFileAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Brain, TrendingUp, Zap } from 'lucide-react';
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
  const [showContextSidebar, setShowContextSidebar] = useState(false);
  const [showWorkflowAutomation, setShowWorkflowAutomation] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const chatInterfaceRef = useRef(null);
  
  const {
    messages,
    isAIThinking,
    sendMessage,
    analyzeFile,
    handleAction,
    getPerformanceAnalytics,
    clearMessages,
    contextData
  } = useEnhancedStreamingChat();

  const { updateActiveConversation, activeConversationId } = useChatContextBridge();
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize real-time performance service
  useEffect(() => {
    if (user) {
      realTimePerformanceService.setUserId(user.id);
      loadRealTimePerformanceData();
      
      // Subscribe to real-time updates
      const subscription = realTimePerformanceService.subscribeToPerformanceUpdates(
        (data) => {
          setPerformanceData(data);
        }
      );

      return () => {
        realTimePerformanceService.unsubscribeFromPerformanceUpdates();
      };
    }
  }, [user]);

  const loadRealTimePerformanceData = async () => {
    try {
      const data = await realTimePerformanceService.getRealtimePerformanceData();
      setPerformanceData(data);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setUploadedFiles(files);
    
    // Enhanced file analysis
    try {
      const analysisResults = await Promise.all(
        files.map(async (file) => {
          return await advancedFileAnalyzer.analyzeExcelFile(file);
        })
      );
      
      toast({
        title: "Files analyzed",
        description: `${files.length} file(s) analyzed successfully`,
      });
      
      handleFileAnalysisComplete(analysisResults);
    } catch (error) {
      toast({
        title: "Analysis error",
        description: "Failed to analyze some files",
        variant: "destructive"
      });
    }
  };

  const handleFileAnalysisComplete = async (analysisResults: any[]) => {
    const analysisMessage = `📊 **Advanced File Analysis Complete**\n\n${analysisResults.map(result => 
      `📄 **${result.file_name || result.name}** (${result.file_type || result.type})\n` +
      `💡 **Key Insights:**\n${result.insights?.join('\n• ') || 'Basic analysis completed'}\n` +
      `${result.extracted_text ? `📝 **Extracted Content:** ${result.extracted_text.substring(0, 200)}...\n` : ''}` +
      `🎯 **Optimization Suggestions:** ${result.optimization_suggestions?.length || 0} recommendations\n`
    ).join('\n')}`;
    
    await sendMessage(analysisMessage, { fileAnalysis: analysisResults });
  };

  const handleFileAnalysis = async (file: File) => {
    try {
      const result = await advancedFileAnalyzer.analyzeExcelFile(file);
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        content: result.extractedText || '',
        insights: result.insights || [],
        wordCount: result.extractedText?.split(' ').length || 0
      };
    } catch (error) {
      console.error('File analysis error:', error);
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        error: 'Failed to analyze file'
      };
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

  const handleSmartAction = async (action: string, data?: any) => {
    switch (action) {
      case 'clear':
        handleClear();
        break;
      case 'export':
        toast({
          title: "Export started",
          description: "Your conversation is being exported",
        });
        break;
      case 'analyze':
        handleRequestAnalytics();
        break;
      case 'context-sidebar':
        setShowContextSidebar(true);
        break;
      case 'workflow-automation':
        setShowWorkflowAutomation(true);
        break;
      case 'performance-forecast':
        await handlePerformanceForecast();
        break;
      case 'ab-test-suggestions':
        await handleABTestSuggestions();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleRequestAnalytics = async () => {
    await getPerformanceAnalytics();
    setShowAnalytics(true);
    
    // Load real-time data for enhanced analytics
    if (performanceData) {
      const enhancedMessage = `🚀 **Real-time Performance Dashboard**\n\n` +
        `📈 **Overview Metrics:**\n` +
        `• Content Views: ${performanceData.overview?.contentViews || 0}\n` +
        `• Engagement Rate: ${performanceData.overview?.engagementRate || 0}%\n` +
        `• SEO Score: ${performanceData.overview?.seoScore || 0}\n` +
        `• Conversion Rate: ${performanceData.overview?.conversionRate || 0}%\n\n` +
        `🎯 **Top Performers:** ${performanceData.topPerformers?.length || 0} content pieces\n` +
        `⚠️ **Active Alerts:** ${performanceData.alerts?.length || 0} items need attention\n` +
        `🔮 **Predictive Insights:** ${performanceData.insights?.length || 0} forecasts available`;
        
      await sendMessage(enhancedMessage, { performanceData });
    }
  };

  const handlePerformanceForecast = async () => {
    try {
      const insights = await realTimePerformanceService.generatePredictiveInsights(
        performanceData?.overview || {}
      );
      
      const forecastMessage = `🔮 **Performance Forecast & Predictions**\n\n${
        insights.map(insight => 
          `📊 **${insight.metric}**\n` +
          `Current: ${insight.currentValue}\n` +
          `Predicted (${insight.timeframe}): ${insight.predictedValue}\n` +
          `Trend: ${insight.trend} (${Math.round(insight.confidence * 100)}% confidence)\n` +
          `💡 ${insight.recommendation}\n`
        ).join('\n')
      }`;
      
      await sendMessage(forecastMessage, { insights });
    } catch (error) {
      toast({
        title: "Forecast Error",
        description: "Unable to generate performance forecast",
        variant: "destructive"
      });
    }
  };

  const handleABTestSuggestions = async () => {
    try {
      const suggestions = await realTimePerformanceService.generateABTestingSuggestions();
      
      const testMessage = `🧪 **A/B Testing Recommendations**\n\n${
        suggestions.map(test => 
          `🎯 **${test.testName}**\n` +
          `Hypothesis: ${test.hypothesis}\n` +
          `Variants: ${test.variants.join(' vs ')}\n` +
          `Expected Impact: ${test.expectedImpact}\n` +
          `Duration: ${test.duration}\n`
        ).join('\n')
      }`;
      
      await sendMessage(testMessage, { abTests: suggestions });
    } catch (error) {
      toast({
        title: "Testing Error", 
        description: "Unable to generate A/B test suggestions",
        variant: "destructive"
      });
    }
  };

  const handleNavigateToConversation = (conversationId: string) => {
    updateActiveConversation(conversationId);
    toast({
      title: "Conversation switched",
      description: "Switched to selected conversation"
    });
  };

  const handleClear = () => {
    clearMessages();
    onClearConversation?.();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20 relative">
      {/* Enhanced Context Sidebar */}
      <AnimatePresence>
        {showContextSidebar && (
          <EnhancedContextSidebar
            isOpen={showContextSidebar}
            onClose={() => setShowContextSidebar(false)}
            currentConversationId={activeConversationId || undefined}
            onNavigateToConversation={handleNavigateToConversation}
          />
        )}
      </AnimatePresence>

      {/* Real-time Collaboration */}
      <RealTimeCollaboration conversationId={activeConversationId || ''} />
      
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        <StreamingChatInterface
          onClearConversation={handleClear}
          onToggleSidebar={onToggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      {/* Advanced Chat Features */}
      <AdvancedChatFeatures
        onFileUpload={handleFileUpload}
        onVoiceInput={handleVoiceInput}
        onScreenCapture={handleScreenCapture}
        isRecording={false}
      />

      {/* Enhanced File Processor */}
      {uploadedFiles.length > 0 && (
        <EnhancedFileProcessor
          files={uploadedFiles}
          onAnalysisComplete={handleFileAnalysisComplete}
          onAnalyzeFile={handleFileAnalysis}
        />
      )}

      {/* Rich Media Renderer */}
      <RichMediaRenderer />

      {/* Enhanced Performance Analytics Widget */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-4 z-50 bg-background border border-border rounded-lg shadow-2xl"
        >
          <PerformanceAnalyticsWidget
            onRequestAnalysis={handleRequestAnalytics}
            onGenerateReport={() => {
              toast({
                title: "Report Generation",
                description: "Enhanced performance report with predictions is being generated",
              });
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => setShowAnalytics(false)}
          >
            ×
          </Button>
        </motion.div>
      )}

      {/* Collaboration Manager */}
      <CollaborationManager />

      {/* Smart Actions Integration */}
      <SmartActionsIntegration onAction={handleSmartAction} />

      {/* Realtime Notification Center */}
      {showNotifications && (
        <div className="fixed bottom-24 right-4 z-50">
          <RealtimeNotificationCenter 
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>
      )}
    </div>
  );
};