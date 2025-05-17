
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List, Trash, Plus } from 'lucide-react';
import { OutlineSection } from '@/contexts/content-builder/types/outline-types';

interface OutlineEditorProps {
  outlineSections: OutlineSection[];
  mainKeyword: string;
}

export const OutlineEditor: React.FC<OutlineEditorProps> = ({
  outlineSections,
  mainKeyword
}) => {
  const [sections, setSections] = useState<OutlineSection[]>(outlineSections || []);

  // Handle adding a new section
  const handleAddSection = () => {
    const newSection: OutlineSection = {
      id: `section-${Date.now()}`,
      title: `New Section ${sections.length + 1}`,
      content: '',
      order: sections.length
    };
    
    setSections([...sections, newSection]);
  };
  
  // Handle removing a section
  const handleRemoveSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };
  
  // Handle updating a section title
  const handleUpdateTitle = (id: string, title: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, title } : section
    ));
  };
  
  return (
    <Card className="border-white/10 shadow-md bg-gradient-to-br from-gray-900/50 to-black/20">
      <CardHeader className="pb-3 border-b border-white/10 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center">
          <List className="h-4 w-4 mr-2" />
          Content Outline
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        {sections.length > 0 ? (
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div 
                key={section.id}
                className="border border-white/10 rounded-md p-3 bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs font-medium bg-white/10 rounded-full w-5 h-5 flex items-center justify-center mr-2">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleUpdateTitle(section.id, e.target.value)}
                      className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium"
                    />
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleRemoveSection(section.id)}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No outline sections yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add sections to structure your content about {mainKeyword || 'your topic'}.
            </p>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4 w-full border-dashed"
          onClick={handleAddSection}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Section
        </Button>
      </CardContent>
    </Card>
  );
};
