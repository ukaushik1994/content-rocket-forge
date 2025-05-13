
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { OutlineSection } from '@/contexts/content-builder/types';

interface OutlineTableProps {
  outline: (string | OutlineSection)[];
  onSave: (updatedOutline: (string | OutlineSection)[]) => void;
}

export const OutlineTable: React.FC<OutlineTableProps> = ({ outline, onSave }) => {
  const [editableOutline, setEditableOutline] = useState<(string | OutlineSection)[]>(outline);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Update editableOutline when outline prop changes
  useEffect(() => {
    setEditableOutline(outline);
  }, [outline]);

  const handleEdit = (index: number, value: string) => {
    const newOutline = [...editableOutline];
    if (typeof newOutline[index] === 'string') {
      newOutline[index] = value;
    } else {
      newOutline[index] = { ...newOutline[index] as OutlineSection, title: value };
    }
    setEditableOutline(newOutline);
  };

  const handleAddSection = () => {
    // Ensure the new section has the correct type structure
    const newSection: OutlineSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Section',
      level: 1 as const, // Explicitly use a const assertion for the level type
      type: 'heading',
      content: ''
    };
    setEditableOutline([...editableOutline, newSection]);
    setEditingIndex(editableOutline.length);
  };

  const handleRemoveSection = (index: number) => {
    const newOutline = editableOutline.filter((_, i) => i !== index);
    setEditableOutline(newOutline);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleSaveOutline = () => {
    // Validate that no empty sections exist
    if (editableOutline.some(section => {
      const title = typeof section === 'string' ? section : section.title;
      return title.trim() === '';
    })) {
      toast.error("Section titles cannot be empty");
      return;
    }

    onSave(editableOutline);
    setIsEditing(false);
    setEditingIndex(null);
    toast.success("Outline saved successfully");
  };

  const getSectionTitle = (section: string | OutlineSection): string => {
    return typeof section === 'string' ? section : section.title;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Content Outline</h3>
        <div className="space-x-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddSection}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Section
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSaveOutline}
              >
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleStartEditing}
            >
              <Edit2 className="h-4 w-4 mr-1" /> Edit Outline
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">#</TableHead>
              <TableHead>Section Title</TableHead>
              {isEditing && <TableHead className="w-16">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {editableOutline.length > 0 ? (
              editableOutline.map((section, index) => (
                <TableRow key={typeof section === 'string' ? index : section.id}>
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell>
                    {isEditing && editingIndex === index ? (
                      <Input
                        value={getSectionTitle(section)}
                        onChange={(e) => handleEdit(index, e.target.value)}
                        autoFocus
                        onBlur={() => setEditingIndex(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingIndex(null);
                        }}
                      />
                    ) : (
                      <div 
                        className={isEditing ? "cursor-pointer hover:bg-muted px-2 py-1 rounded" : ""}
                        onClick={() => isEditing && setEditingIndex(index)}
                      >
                        {getSectionTitle(section)}
                      </div>
                    )}
                  </TableCell>
                  {isEditing && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSection(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isEditing ? 3 : 2} className="text-center text-muted-foreground py-6">
                  No outline sections yet. {isEditing && "Click 'Add Section' to create one."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
