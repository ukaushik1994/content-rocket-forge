
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Lightbulb,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { ContentOutlineSection } from '@/contexts/content-builder/types';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIOutlineGenerator } from '../outline/AIOutlineGenerator';

export const OutlineStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    outline, 
    serpData, 
    mainKeyword, 
    serpSelections, 
    additionalInstructions,
    contentTitle
  } = state;
  
  const [activeTab, setActiveTab] = useState('ai-generator');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [instructions, setInstructions] = useState(additionalInstructions);
  const [isAddingInstructions, setIsAddingInstructions] = useState(false);
  const [documentTitle, setDocumentTitle] = useState(contentTitle || '');
  
  useEffect(() => {
    // Mark as complete if we have an outline with at least 3 sections
    if (outline.length >= 3) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
    }
  }, [outline]);

  useEffect(() => {
    if (contentTitle && contentTitle !== documentTitle) {
      setDocumentTitle(contentTitle);
    }
  }, [contentTitle]);
  
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
  
  const handleSaveInstructions = () => {
    dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: instructions });
    setIsAddingInstructions(false);
    toast.success('Additional instructions saved');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentTitle(e.target.value);
    dispatch({ type: 'SET_CONTENT_TITLE', payload: e.target.value });
  };
  
  // Filter selected items from SERP analysis
  const selectedItems = serpSelections.filter(item => item.selected);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Content Outline</h3>
          <p className="text-sm text-muted-foreground">
            Create and organize your content structure.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dialog open={isAddingInstructions} onOpenChange={setIsAddingInstructions}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Lightbulb className="h-4 w-4 mr-2" />
                Add Instructions
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Additional Instructions</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Add any additional instructions or notes for the content creation process.
                </p>
                <Textarea 
                  value={instructions} 
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="E.g., Include case studies, use a conversational tone, target beginners..."
                  className="min-h-[150px]"
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSaveInstructions}
                  className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
                >
                  Save Instructions
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button
            onClick={handleAddSection}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="documentTitle" className="block text-sm font-medium mb-1">
            Document Title
          </label>
          <Input
            id="documentTitle"
            value={documentTitle}
            onChange={handleTitleChange}
            placeholder="Enter your content title..."
            className="w-full"
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="ai-generator" className="gap-1.5">
            <Sparkles className="h-4 w-4" /> AI Generator
          </TabsTrigger>
          <TabsTrigger value="manual-editor" className="gap-1.5">
            <Pencil className="h-4 w-4" /> Manual Editor
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-generator" className="space-y-4 mt-2">
          <AIOutlineGenerator />
        </TabsContent>
        
        <TabsContent value="manual-editor" className="space-y-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
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
                                No outline sections yet. Add sections or use selections from SERP analysis.
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
              
              {additionalInstructions && (
                <Card className="mt-4 border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex justify-between">
                      <span>Additional Instructions</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsAddingInstructions(true)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{additionalInstructions}</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Selected from SERP</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedItems.length > 0 ? (
                    <div className="space-y-4">
                      {selectedItems.filter(item => item.type === 'keyword').length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2">Keywords</h4>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {selectedItems
                              .filter(item => item.type === 'keyword')
                              .map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {item.content}
                                </Badge>
                              ))
                            }
                          </div>
                        </div>
                      )}
                      
                      {selectedItems.filter(item => item.type === 'question').length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2">Questions</h4>
                          <ul className="text-xs space-y-1">
                            {selectedItems
                              .filter(item => item.type === 'question')
                              .map((item, i) => (
                                <li key={i} className="text-xs">
                                  {item.content}
                                </li>
                              ))
                            }
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        No items selected from SERP analysis.
                      </p>
                      <Button 
                        variant="link" 
                        className="mt-2" 
                        onClick={() => dispatch({ type: 'SET_ACTIVE_STEP', payload: 2 })}
                      >
                        Go back to select items
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Main Keyword</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Badge className="bg-primary/10 text-primary border-primary/30 text-lg">
                      {mainKeyword || "No keyword selected"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
