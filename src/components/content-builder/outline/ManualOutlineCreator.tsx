
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ManualOutlineCreatorProps {
  onSubmit: (outline: string[]) => void;
}

export const ManualOutlineCreator: React.FC<ManualOutlineCreatorProps> = ({ onSubmit }) => {
  const [sections, setSections] = useState<string[]>(['Introduction', 'Conclusion']);
  const [newSection, setNewSection] = useState('');
  
  const addSection = () => {
    if (!newSection.trim()) {
      toast.error("Please enter a section title");
      return;
    }
    
    setSections([...sections, newSection]);
    setNewSection('');
  };
  
  const removeSection = (index: number) => {
    const updatedSections = [...sections];
    updatedSections.splice(index, 1);
    setSections(updatedSections);
  };
  
  const handleSubmit = () => {
    if (sections.length < 3) {
      toast.error("Please add at least one more section");
      return;
    }
    onSubmit(sections);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-4 mb-6">
        <div className="text-sm text-muted-foreground mb-2">
          Add sections to your content outline. You already have Introduction and Conclusion.
        </div>
        
        {/* Add section form */}
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Enter section title"
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addSection()}
          />
          <Button onClick={addSection} size="sm" className="shrink-0">
            <PlusCircle className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
      
      {/* Section list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {sections.map((section, index) => (
          <div 
            key={index}
            className="flex items-center justify-between bg-card p-3 rounded-md border"
          >
            <span className="flex items-center gap-2">
              <span className="text-xs bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {index + 1}
              </span>
              <span>{section}</span>
            </span>
            
            {index > 0 && index < sections.length - 1 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => removeSection(index)}
                className="h-7 w-7 p-0"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      {/* Submit button */}
      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit}>
          Save Outline
        </Button>
      </div>
    </div>
  );
};
