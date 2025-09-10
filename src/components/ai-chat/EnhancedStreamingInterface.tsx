import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreamingChatInterface } from './StreamingChatInterface';
import { useStreamingChatDB } from '@/hooks/useStreamingChatDB';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, MessageSquare } from 'lucide-react';

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const chatInterfaceRef = useRef(null);
  
  const {
    messages,
    isConnected,
    isAIThinking,
    sendMessage,
    clearMessages
  } = useStreamingChatDB();

  const { updateActiveConversation, activeConversationId } = useChatContextBridge();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    setUploadedFiles(fileArray);
    
    try {
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) ready for analysis`,
      });
      
      // Send file info to chat
      const fileMessage = `📎 **Files Uploaded**\n\n${fileArray.map(file => 
        `📄 **${file.name}** (${(file.size / 1024).toFixed(1)} KB)`
      ).join('\n')}\n\nHow would you like me to analyze these files?`;
      
      await sendMessage(fileMessage);
    } catch (error) {
      toast({
        title: "Upload error",
        description: "Failed to upload files",
        variant: "destructive"
      });
    }
  };

  const handleClear = () => {
    clearMessages();
    setUploadedFiles([]);
    onClearConversation?.();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20 relative">
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        <StreamingChatInterface
          onClearConversation={handleClear}
          onToggleSidebar={onToggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      {/* Simple File Upload Area */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-muted/50 border-t"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Uploaded Files</span>
              </div>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-background rounded">
                    <span>{file.name}</span>
                    <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setUploadedFiles([])}
              >
                Clear Files
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Hidden File Input for Upload */}
      <input
        type="file"
        id="fileUpload"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
      />
    </div>
  );
};