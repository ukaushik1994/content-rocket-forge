import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Book, Plus, Download, Settings, AlertCircle } from 'lucide-react';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';

export function GlossaryBuilderHeader() {
  const { state, createGlossary, exportGlossary } = useGlossaryBuilder();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGlossaryName, setNewGlossaryName] = useState('');
  const [newGlossaryDescription, setNewGlossaryDescription] = useState('');

  const handleCreateGlossary = async () => {
    if (newGlossaryName.trim()) {
      await createGlossary(newGlossaryName, newGlossaryDescription);
      setNewGlossaryName('');
      setNewGlossaryDescription('');
      setIsCreateOpen(false);
    }
  };

  const handleExport = async (format: 'markdown' | 'json' | 'csv') => {
    await exportGlossary(format);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center">
              <Book className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Glossary Builder</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create comprehensive glossaries for your content
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {state.lastError && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Error
              </Badge>
            )}
            
            {state.currentGlossary && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('markdown')}
                  disabled={!state.currentGlossary.terms.length}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            )}
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  New Glossary
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Glossary</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Glossary Name</Label>
                    <Input
                      id="name"
                      value={newGlossaryName}
                      onChange={(e) => setNewGlossaryName(e.target.value)}
                      placeholder="e.g., SEO Terms, Marketing Glossary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newGlossaryDescription}
                      onChange={(e) => setNewGlossaryDescription(e.target.value)}
                      placeholder="Brief description of the glossary purpose"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateGlossary} disabled={!newGlossaryName.trim()}>
                      Create Glossary
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      {state.currentGlossary && (
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-semibold">{state.currentGlossary.name}</h3>
              {state.currentGlossary.description && (
                <p className="text-sm text-muted-foreground">{state.currentGlossary.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{state.currentGlossary.terms.length} terms</span>
              <Badge variant="secondary">
                {state.currentGlossary.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}