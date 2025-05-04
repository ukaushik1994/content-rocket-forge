
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentEditor } from '@/components/content/ContentEditor';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { Eye, Edit } from 'lucide-react';

interface ContentReviewCardProps {
  content: string;
}

export const ContentReviewCard: React.FC<ContentReviewCardProps> = ({ content }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const { setContent } = useContentBuilder();

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };

  // Save changes
  const handleSave = () => {
    setContent(editedContent);
    setIsEditing(false);
    toast.success("Content updated successfully");
  };

  // Handle mode toggle
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedContent(content);
    }
  };

  return (
    <Card className="h-full shadow-lg overflow-hidden flex flex-col">
      <CardHeader className="pb-2 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
          Content Review
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={toggleEditMode}
          >
            {isEditing ? (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </>
            ) : (
              <>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </>
            )}
          </Button>
          {isEditing && (
            <Button 
              size="sm"
              className="text-xs bg-gradient-to-r from-neon-purple to-neon-blue"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        {isEditing ? (
          <ContentEditor 
            content={editedContent}
            onContentChange={handleContentChange}
          />
        ) : (
          <div className="prose prose-sm max-w-none p-4 overflow-y-auto max-h-[400px]">
            {content.split('\n').map((paragraph, idx) => (
              paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
