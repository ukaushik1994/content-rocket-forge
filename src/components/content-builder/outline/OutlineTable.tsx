
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
import { Edit2, Save, Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { OutlineSection } from '@/contexts/content-builder/types';

interface OutlineTableProps {
  outline: string[];
  onSave: (updatedOutline: string[]) => void;
}

export const OutlineTable: React.FC<OutlineTableProps> = ({ outline, onSave }) => {
  const [editableOutline, setEditableOutline] = useState<string[]>(outline);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Update editable outline when outline prop changes
  useEffect(() => {
    console.log('OutlineTable: outline prop changed:', outline);
    setEditableOutline(outline);
  }, [outline]);

  const handleEdit = (index: number, value: string) => {
    const newOutline = [...editableOutline];
    newOutline[index] = value;
    setEditableOutline(newOutline);
  };

  const handleAddSection = () => {
    setEditableOutline([...editableOutline, 'New Section']);
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
    if (editableOutline.some(section => section.trim() === '')) {
      toast.error("Section titles cannot be empty");
      return;
    }

    onSave(editableOutline);
    setIsEditing(false);
    setEditingIndex(null);
    toast.success("Outline saved successfully");
  };

  const handleCancelEditing = () => {
    setEditableOutline(outline); // Reset to original
    setIsEditing(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Content Outline</h3>
          {editableOutline.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({editableOutline.length} sections)
            </span>
          )}
        </div>
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
                variant="outline" 
                size="sm" 
                onClick={handleCancelEditing}
              >
                Cancel
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
              disabled={editableOutline.length === 0}
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
                <TableRow key={index}>
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell>
                    {isEditing && editingIndex === index ? (
                      <Input
                        value={section}
                        onChange={(e) => handleEdit(index, e.target.value)}
                        autoFocus
                        onBlur={() => setEditingIndex(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingIndex(null);
                          if (e.key === 'Escape') {
                            setEditingIndex(null);
                            setEditableOutline(outline); // Reset to original
                          }
                        }}
                      />
                    ) : (
                      <div 
                        className={isEditing ? "cursor-pointer hover:bg-muted px-2 py-1 rounded" : ""}
                        onClick={() => isEditing && setEditingIndex(index)}
                      >
                        {section}
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
                <TableCell colSpan={isEditing ? 3 : 2} className="text-center text-muted-foreground py-8">
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p>No outline sections yet.</p>
                    <p className="text-sm">Use the AI Outline Generator to create one automatically.</p>
                  </div>
                </TableCell>
              )}
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
