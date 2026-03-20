import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Mic,
  MicOff,
} from 'lucide-react';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { useToast } from '@/hooks/use-toast';

interface AdvancedChatFeaturesProps {
  onFileUpload: (files: File[]) => void;
  onVoiceInput: (audioBlob: Blob) => void;
  onScreenCapture?: () => void;
  isRecording: boolean;
  collaborators?: string[];
  typingUsers?: string[];
}

export const AdvancedChatFeatures: React.FC<AdvancedChatFeaturesProps> = ({
  onFileUpload,
  onVoiceInput,
  isRecording,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'processing'>('idle');
  
  const { 
    conversationType,
    switchToStreaming,
    switchToRegular
  } = useChatContextBridge();
  const { toast } = useToast();

  // File upload handling
  const handleFiles = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const maxSize = 10 * 1024 * 1024;
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'text/plain', 'text/markdown', 'text/csv',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (file.size > maxSize) {
        toast({ title: "File too large", description: `${file.name} is larger than 10MB`, variant: "destructive" });
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Unsupported file type", description: `${file.name} type is not supported`, variant: "destructive" });
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
      
      mediaRecorder.ondataavailable = (event) => { audioChunks.push(event.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        onVoiceInput(audioBlob);
        setRecordingState('idle');
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setRecordingState('recording');
    } catch {
      toast({ title: "Recording failed", description: "Could not access microphone", variant: "destructive" });
    }
  }, [onVoiceInput, toast]);

  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      setRecordingState('processing');
      mediaRecorderRef.current.stop();
    }
  }, [recordingState]);

  // Switch chat modes
  const handleModeSwitch = useCallback(() => {
    if (conversationType === 'regular') {
      switchToStreaming(true);
      toast({ title: "Switched to Streaming Mode", description: "Real-time streaming chat activated" });
    } else {
      switchToRegular(true);
      toast({ title: "Switched to Regular Mode", description: "Standard chat mode activated" });
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

      {/* Quick Action Bar */}
      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
        {/* File Upload */}
        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 px-2">
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

        {/* Mode Switch */}
        <Button variant="ghost" size="sm" onClick={handleModeSwitch} className="h-8 px-2">
          <Badge variant={conversationType === 'streaming' ? 'default' : 'secondary'}>
            {conversationType === 'streaming' ? 'Streaming' : 'Regular'}
          </Badge>
        </Button>
      </div>

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
