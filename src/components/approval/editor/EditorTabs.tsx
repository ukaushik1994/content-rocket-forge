
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ContentEditor } from '@/components/content/ContentEditor';

interface EditorTabsProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  editedContent: string;
  handleContentChange: (newContent: string) => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  activeTab,
  setActiveTab,
  editedContent,
  handleContentChange
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-2 mx-4 my-2 bg-gray-900/60">
        <TabsTrigger value="edit" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple">Edit</TabsTrigger>
        <TabsTrigger value="preview" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple">Preview</TabsTrigger>
      </TabsList>
      
      <TabsContent value="edit" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
        <div className="h-[60vh]">
          <ContentEditor
            content={editedContent}
            onContentChange={handleContentChange}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="preview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
        <div className="h-[60vh] p-6 overflow-y-auto prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg max-w-none text-white/90">
          {editedContent.split('\n\n').map((paragraph, idx) => (
            paragraph.startsWith('# ') ? (
              <h1 key={idx}>{paragraph.substring(2)}</h1>
            ) : paragraph.startsWith('## ') ? (
              <h2 key={idx}>{paragraph.substring(3)}</h2>
            ) : paragraph.startsWith('### ') ? (
              <h3 key={idx}>{paragraph.substring(4)}</h3>
            ) : paragraph ? (
              <p key={idx}>{paragraph}</p>
            ) : <br key={idx} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
