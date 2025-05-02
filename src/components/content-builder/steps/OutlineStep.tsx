
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult 
} from 'react-beautiful-dnd';
import {
  GripVertical,
  Plus,
  Trash2,
  Pencil,
  Save,
  FileUp,
} from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { ContentOutlineSection } from '@/contexts/ContentBuilderContext';

export const OutlineStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { outline, serpData, mainKeyword } = state;
  
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  useEffect(() => {
    // If we have no outline but have SERP data, generate a default outline
    if (outline.length === 0 && serpData) {
      generateDefaultOutline();
    }
    
    // Mark as complete if we have an outline with at least 3 sections
    if (outline.length >= 3) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
    }
  }, [outline, serpData]);
  
  const generateDefaultOutline = () => {
    const defaultSections: ContentOutlineSection[] = [
      { id: uuid(), title: `Introduction to ${mainKeyword}` },
      { id: uuid(), title: `What is ${mainKeyword}?` },
      { id: uuid(), title: `Benefits of ${mainKeyword}` },
      { id: uuid(), title: `How to Use ${mainKeyword}` },
      { id: uuid(), title: `${mainKeyword} Best Practices` },
      { id: uuid(), title: 'Conclusion' }
    ];
    
    dispatch({ type: 'SET_OUTLINE', payload: defaultSections });
  };
  
  const handleAddSection = () => {
    const newSection: ContentOutlineSection = {
      id: uuid(),
      title: 'New Section',
    };
    dispatch({ type: 'ADD_OUTLINE_SECTION', payload: newSection });
    setEditingSectionId(newSection.id);
    setEditTitle(newSection.title);
  };
  
  const handleEditSection = (id: string, title: string) => {
    setEditingSectionId(id);
    setEditTitle(title);
  };
  
  const handleSaveSection = (id: string) => {
    if (editTitle.trim()) {
      dispatch({
        type: 'UPDATE_OUTLINE_SECTION',
        payload: { id, section: { title: editTitle } }
      });
    }
    setEditingSectionId(null);
  };
  
  const handleDeleteSection = (id: string) => {
    dispatch({ type: 'REMOVE_OUTLINE_SECTION', payload: id });
  };
  
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    // If dropped outside the list or at the same position
    if (!destination || destination.index === source.index) {
      return;
    }
    
    // Reorder the outline
    const newOutline = Array.from(outline);
    const [removed] = newOutline.splice(source.index, 1);
    newOutline.splice(destination.index, 0, removed);
    
    dispatch({ type: 'SET_OUTLINE', payload: newOutline });
  };
  
  const handleGenerateFromSerp = () => {
    if (!serpData) {
      return;
    }
    
    const serpBasedOutline: ContentOutlineSection[] = [
      { id: uuid(), title: `Introduction to ${mainKeyword}` }
    ];
    
    // Add sections based on related searches
    if (serpData.relatedSearches && serpData.relatedSearches.length > 0) {
      serpData.relatedSearches.slice(0, 3).forEach(item => {
        serpBasedOutline.push({
          id: uuid(), 
          title: item.query.charAt(0).toUpperCase() + item.query.slice(1)
        });
      });
    }
    
    // Add sections based on people also ask
    if (serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0) {
      serpBasedOutline.push({ 
        id: uuid(), 
        title: 'Frequently Asked Questions',
        subsections: serpData.peopleAlsoAsk.slice(0, 4).map(item => ({
          id: uuid(),
          title: item.question
        }))
      });
    }
    
    // Add conclusion
    serpBasedOutline.push({ id: uuid(), title: 'Conclusion' });
    
    dispatch({ type: 'SET_OUTLINE', payload: serpBasedOutline });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Content Outline</h3>
          <p className="text-sm text-muted-foreground">
            Create and organize your content structure.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateFromSerp}
            disabled={!serpData}
          >
            <FileUp className="h-4 w-4 mr-2" />
            Generate from SERP
          </Button>
          
          <Button
            onClick={handleAddSection}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Outline Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="outline-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {outline.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>
                        No outline sections yet. Add sections or generate from SERP analysis.
                      </p>
                    </div>
                  ) : (
                    outline.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center gap-2 border rounded-md p-3 bg-background/50"
                          >
                            <div {...provided.dragHandleProps} className="cursor-move">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            
                            <div className="flex-grow">
                              {editingSectionId === section.id ? (
                                <Input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveSection(section.id)}
                                  autoFocus
                                />
                              ) : (
                                <div className="font-medium">{section.title}</div>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              {editingSectionId === section.id ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSaveSection(section.id)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditSection(section.id, section.title)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteSection(section.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
};
