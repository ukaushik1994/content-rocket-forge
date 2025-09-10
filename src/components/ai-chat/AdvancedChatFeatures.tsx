import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Mic,
  MicOff,
  Users,
  History,
  Bookmark,
  Share2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Camera,
  Monitor
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { useToast } from '@/hooks/use-toast';

interface AdvancedChatFeaturesProps {
  onFileUpload: (files: File[]) => void;
  onVoiceInput: (audioBlob: Blob) => void;
  onScreenCapture: () => void;
  isRecording: boolean;
  collaborators?: string[];
  typingUsers?: string[];
}

export const AdvancedChatFeatures: React.FC<AdvancedChatFeaturesProps> = ({
  onFileUpload,
  onVoiceInput,
  onScreenCapture,
  isRecording,
  collaborators = [],
  typingUsers = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'processing'>('idle');
  
  const { 
    contextHistory, 
    saveContextSnapshot, 
    loadContextSnapshot,
    conversationType,
    switchToStreaming,
    switchToRegular
  } = useChatContextBridge();
  const { toast } = useToast();

  const [contextSuggestions, setContextSuggestions] = useState<string[]>([]);

  // File upload handling
  const handleFiles = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'text/plain', 'text/markdown', 'text/csv',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} type is not supported`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  }, [onFileUpload, toast]);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Voice recording
  const startVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        onVoiceInput(audioBlob);
        setRecordingState('idle');
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setRecordingState('recording');
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  }, [onVoiceInput, toast]);

  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      setRecordingState('processing');
      mediaRecorderRef.current.stop();
    }
  }, [recordingState]);

  // Screen sharing
  const toggleScreenCapture = useCallback(async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
    } else {
      try {
        onScreenCapture();
        setIsScreenSharing(true);
        
        // Auto-disable after 5 seconds (demo)
        setTimeout(() => {
          setIsScreenSharing(false);
        }, 5000);
      } catch (error) {
        toast({
          title: "Screen capture failed",
          description: "Could not capture screen",
          variant: "destructive"
        });
      }
    }
  }, [isScreenSharing, onScreenCapture, toast]);

  // Context management
  const handleSaveContext = useCallback(async () => {
    try {
      const title = `Context ${new Date().toLocaleTimeString()}`;
      await saveContextSnapshot(title);
      toast({
        title: "Context saved",
        description: "Current conversation context has been saved",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save context",
        variant: "destructive"
      });
    }
  }, [saveContextSnapshot, toast]);

  const loadSuggestions = useCallback(async () => {
    try {
    // Placeholder context suggestions
    const suggestions = ['Quick optimization', 'Generate summary', 'Extract actions'];
      setContextSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }, [toast]);

  // Switch chat modes
  const handleModeSwitch = useCallback(() => {
    if (conversationType === 'regular') {
      switchToStreaming(true);
      toast({
        title: "Switched to Streaming Mode",
        description: "Real-time streaming chat activated",
      });
    } else {
      switchToRegular(true);
      toast({
        title: "Switched to Regular Mode", 
        description: "Standard chat mode activated",
      });
    }
  }, [conversationType, switchToStreaming, switchToRegular, toast]);

  return (
    <div className="space-y-4">
      {/* Drag and Drop Overlay */}
      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary/50"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Drop files here</h3>
              <p className="text-muted-foreground">Images, documents, and text files are supported</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collaboration Status */}
      {(collaborators.length > 0 || typingUsers.length > 0) && (
        <motion.div 
          className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2 items-center">
            {collaborators.map((user, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {user}
              </Badge>
            ))}
            {typingUsers.length > 0 && (
              <motion.div 
                className="text-xs text-muted-foreground"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.length} users typing...`}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Quick Action Bar */}
      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
        {/* File Upload */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 px-2"
        >
          <Upload className="h-4 w-4" />
        </Button>

        {/* Voice Recording */}
        <Button
          variant="ghost"
          size="sm"
          onClick={recordingState === 'recording' ? stopVoiceRecording : startVoiceRecording}
          disabled={recordingState === 'processing'}
          className={`h-8 px-2 ${recordingState === 'recording' ? 'text-red-500' : ''}`}
        >
          <motion.div
            animate={recordingState === 'recording' ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: recordingState === 'recording' ? Infinity : 0 }}
          >
            {recordingState === 'recording' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </motion.div>
        </Button>

        {/* Screen Capture */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleScreenCapture}
          className={`h-8 px-2 ${isScreenSharing ? 'text-blue-500' : ''}`}
        >
          {isScreenSharing ? <Monitor className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
        </Button>

        {/* Mode Switch */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleModeSwitch}
          className="h-8 px-2"
        >
          <Badge variant={conversationType === 'streaming' ? 'default' : 'secondary'}>
            {conversationType === 'streaming' ? 'Streaming' : 'Regular'}
          </Badge>
        </Button>

        {/* Context Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveContext}
          className="h-8 px-2"
        >
          <Bookmark className="h-4 w-4" />
        </Button>

        {/* Expand Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 px-2 ml-auto"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Advanced Features Panel */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent className="space-y-4">
          {/* Context History */}
          <div className="p-4 bg-muted/20 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Context History
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {contextHistory.slice(0, 4).map((snapshot) => (
                <Button
                  key={snapshot.id}
                  variant="outline"
                  size="sm"
                  onClick={() => loadContextSnapshot(snapshot.id)}
                  className="justify-start text-left h-auto py-2"
                >
                  <div>
                    <div className="font-medium text-xs">{snapshot.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {snapshot.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Smart Suggestions */}
          <div className="p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Smart Suggestions
              </h4>
              <Button variant="ghost" size="sm" onClick={loadSuggestions}>
                Refresh
              </Button>
            </div>
            <div className="space-y-2">
              {contextSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm p-2 bg-background/50 rounded border border-border/50"
                >
                  {suggestion}
                </motion.div>
              ))}
              {contextSuggestions.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No suggestions available
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.txt,.md,.csv,.pdf,.doc,.docx"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
};