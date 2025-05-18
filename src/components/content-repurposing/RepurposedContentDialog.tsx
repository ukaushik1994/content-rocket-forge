
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileEdit, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
import { useNavigate } from 'react-router-dom';
import { DeleteConfirmationDialog } from '@/components/content/repository/DeleteConfirmationDialog';

interface RepurposedContentDialogProps {
  open: boolean;
  onClose: () => void;
  content: {
    content: string;
    formatId: string;
    contentId: string;
    title: string;
  } | null;
  onCopy: (content: string) => void;
  onDownload: (content: string, formatName: string) => void;
  onDelete?: (contentId: string) => Promise<boolean>;
  isDeleting?: boolean;
}

const RepurposedContentDialog: React.FC<RepurposedContentDialogProps> = ({
  open, 
  onClose, 
  content, 
  onCopy, 
  onDownload,
  onDelete,
  isDeleting = false
}) => {
  const navigate = useNavigate();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  if (!content) return null;
  
  const formatInfo = contentFormats.find(f => f.id === content.formatId) || { 
    name: 'Content', 
    description: 'Repurposed content'
  };
  
  // Helper function to get format icon for a format ID
  const getFormatIcon = (formatId: string) => {
    switch (formatId) {
      case 'glossary':
        return <Book className="h-6 w-6" />;
      case 'carousel':
        return <Images className="h-6 w-6" />;
      case 'meme':
        return <Image className="h-6 w-6" />;
      case 'social-twitter':
        return <Twitter className="h-6 w-6" />;
      case 'social-linkedin':
        return <Linkedin className="h-6 w-6" />;
      case 'social-facebook':
        return <Facebook className="h-6 w-6" />;
      case 'email':
        return <Mail className="h-6 w-6" />;
      case 'script':
        return <FileText className="h-6 w-6" />;
      case 'infographic':
        return <BarChart className="h-6 w-6" />;
      case 'blog':
        return <FileText className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };
  
  const handleEditRedirect = () => {
    navigate(`/content-editor?id=${content.contentId}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (onDelete) {
      const success = await onDelete(content.contentId);
      if (success) {
        setShowDeleteConfirmation(false);
        onClose();
      }
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl bg-black/90 border border-white/10 backdrop-blur-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-blue/30">
                {getFormatIcon(content.formatId)}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl pb-1">{content.title}</DialogTitle>
                <p className="text-sm text-muted-foreground">{formatInfo.name} • {formatInfo.description}</p>
              </div>
            </div>
          </DialogHeader>
          
          <motion.div 
            className="mt-2 custom-scrollbar bg-black/40 border border-white/10 rounded-lg p-4 max-h-[350px] overflow-y-auto prose prose-invert prose-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {content.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </motion.div>
          
          <DialogFooter className="flex flex-row justify-between items-center mt-4 gap-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onClose()} 
                className="border-white/10 hover:bg-white/5"
              >
                <X className="h-4 w-4 mr-2" /> Close
              </Button>
              
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="bg-red-900/50 hover:bg-red-700/50 text-white border-white/5"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => onCopy(content.content)}
                className="border-white/10 hover:bg-white/5"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => onDownload(content.content, formatInfo.name)}
                className="border-white/10 hover:bg-white/5"
              >
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
              
              <Button 
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90"
                onClick={handleEditRedirect}
              >
                <FileEdit className="h-4 w-4 mr-2" /> Edit
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title={content.title}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default RepurposedContentDialog;

// Import the icons
import { Book, Images, Image, Twitter, Linkedin, Facebook, Mail, BarChart, FileText } from "lucide-react";
