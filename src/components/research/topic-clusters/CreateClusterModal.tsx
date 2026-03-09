
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Sparkles, Target, Users } from 'lucide-react';
import { toast } from 'sonner';
import { CreateClusterData } from '@/types/topicCluster';

interface CreateClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateClusterData) => Promise<void>;
}

export function CreateClusterModal({ isOpen, onClose, onCreate }: CreateClusterModalProps) {
  const [formData, setFormData] = useState<CreateClusterData>({
    name: '',
    mainKeyword: '',
    description: '',
    targetAudience: '',
    keywords: [],
    contentPillars: []
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [pillarInput, setPillarInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== keyword) }));
  };

  const handleAddPillar = () => {
    if (pillarInput.trim() && !formData.contentPillars?.includes(pillarInput.trim())) {
      setFormData(prev => ({ ...prev, contentPillars: [...(prev.contentPillars || []), pillarInput.trim()] }));
      setPillarInput('');
    }
  };

  const handleRemovePillar = (pillar: string) => {
    setFormData(prev => ({ ...prev, contentPillars: prev.contentPillars?.filter(p => p !== pillar) || [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mainKeyword.trim()) {
      toast.error('Name and main keyword are required');
      return;
    }

    setIsCreating(true);
    try {
      await onCreate(formData);
      setFormData({ name: '', mainKeyword: '', description: '', targetAudience: '', keywords: [], contentPillars: [] });
    } catch (error) {
      toast.error('Failed to create topic cluster');
      console.error('Error creating cluster:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword(); }
  };

  const handlePillarKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddPillar(); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Create New Topic Cluster
          </DialogTitle>
          <DialogDescription>
            Build a strategic content cluster around your target keyword to dominate search results
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Cluster Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Content Marketing Strategy" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainKeyword">Main Keyword *</Label>
              <Input id="mainKeyword" value={formData.mainKeyword} onChange={(e) => setFormData(prev => ({ ...prev, mainKeyword: e.target.value }))} placeholder="e.g., content marketing" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe what this cluster will cover..." className="min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Target Audience
              </Label>
              <Input id="targetAudience" value={formData.targetAudience} onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))} placeholder="e.g., Marketing professionals, business owners" className="h-12" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-1 mb-2">
                <Target className="h-4 w-4" />
                Related Keywords
              </Label>
              <div className="flex gap-2">
                <Input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyPress={handleKeywordKeyPress} placeholder="Add related keywords..." className="flex-1" />
                <Button type="button" onClick={handleAddKeyword} variant="outline" size="sm"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="py-1">
                    {keyword}
                    <Button type="button" variant="ghost" size="sm" className="h-auto p-0 ml-2" onClick={() => handleRemoveKeyword(keyword)}><X className="h-3 w-3" /></Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-1 mb-2">
                <Sparkles className="h-4 w-4" />
                Content Pillars (Optional)
              </Label>
              <div className="flex gap-2">
                <Input value={pillarInput} onChange={(e) => setPillarInput(e.target.value)} onKeyPress={handlePillarKeyPress} placeholder="Add content themes..." className="flex-1" />
                <Button type="button" onClick={handleAddPillar} variant="outline" size="sm"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            {formData.contentPillars && formData.contentPillars.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.contentPillars.map((pillar) => (
                  <Badge key={pillar} variant="outline" className="py-1">
                    {pillar}
                    <Button type="button" variant="ghost" size="sm" className="h-auto p-0 ml-2" onClick={() => handleRemovePillar(pillar)}><X className="h-3 w-3" /></Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isCreating}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={isCreating}>
              {isCreating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mr-2">
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  Creating Cluster...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Cluster
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
