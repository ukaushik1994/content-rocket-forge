
import React, { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { TagIcon, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface ApprovalMetadataProps {
  content: ContentItemType;
}

export const ApprovalMetadata: React.FC<ApprovalMetadataProps> = ({ content }) => {
  const [metaTitle, setMetaTitle] = useState(content.title || '');
  const [metaDescription, setMetaDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateContentItem } = useContent();
  
  const handleSaveMetadata = async () => {
    setIsUpdating(true);
    try {
      await updateContentItem(content.id, { title: metaTitle });
      toast.success('Metadata updated successfully');
    } catch (error) {
      toast.error('Failed to update metadata');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl overflow-hidden">
      <CardHeader className="pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-neon-blue" />
          <CardTitle className="text-sm font-medium text-white/80">SEO Metadata</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-white/60" />
            <Label htmlFor="metaTitle" className="text-white/80">Title</Label>
          </div>
          <Input 
            id="metaTitle"
            value={metaTitle} 
            onChange={(e) => setMetaTitle(e.target.value)} 
            placeholder="SEO Title" 
            maxLength={60}
            className="bg-gray-800/30 border-white/10 focus-visible:ring-neon-purple/50"
          />
          <div className="text-xs text-white/50 flex justify-between">
            <span>Recommended: 50-60 characters</span>
            <span className={metaTitle.length > 55 ? "text-amber-400" : "text-white/50"}>
              {metaTitle.length}/60
            </span>
          </div>
        </motion.div>
        
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-white/60" />
            <Label htmlFor="metaDescription" className="text-white/80">Meta Description</Label>
          </div>
          <Input
            id="metaDescription"
            value={metaDescription} 
            onChange={(e) => setMetaDescription(e.target.value)} 
            placeholder="SEO Meta Description" 
            maxLength={160}
            className="bg-gray-800/30 border-white/10 focus-visible:ring-neon-purple/50"
          />
          <div className="text-xs text-white/50 flex justify-between">
            <span>Recommended: 140-160 characters</span>
            <span className={metaDescription.length > 155 ? "text-amber-400" : "text-white/50"}>
              {metaDescription.length}/160
            </span>
          </div>
        </motion.div>
        
        <div className="md:col-span-2 flex justify-end">
          <Button 
            onClick={handleSaveMetadata} 
            disabled={isUpdating}
            size="sm"
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
          >
            Save Metadata
          </Button>
        </div>
      </CardContent>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-purple/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>
    </Card>
  );
};
