import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Globe,
  FileText,
  Users,
  Target,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';
import { CompetitorResource } from '@/contexts/content-builder/types/company-types';

const categoryIcons = {
  website: Globe,
  social_media: Users,
  documentation: FileText,
  case_studies: Target,
  marketing: TrendingUp,
  other: ExternalLink
};

const categoryLabels = {
  website: 'Website',
  social_media: 'Social Media',
  documentation: 'Documentation',
  case_studies: 'Case Studies',
  marketing: 'Marketing',
  pricing: 'Pricing',
  features: 'Features',
  comparison: 'Comparison',
  other: 'Other'
};

interface ReviewCompetitorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    website: string;
    description: string;
    marketPosition: string;
    strengths: string[];
    weaknesses: string[];
    resources: CompetitorResource[];
    notes: string;
  }) => Promise<void>;
  onBack: () => void;
  initialData: CompetitorAutoFillPayload;
  name: string;
  website: string;
}

export const ReviewCompetitorDialog: React.FC<ReviewCompetitorDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onBack,
  initialData,
  name,
  website
}) => {
  const [formData, setFormData] = useState({
    name,
    website,
    description: initialData.description,
    marketPosition: initialData.market_position,
    strengths: initialData.strengths.length ? initialData.strengths : [''],
    weaknesses: initialData.weaknesses.length ? initialData.weaknesses : [''],
    resources: initialData.resources.length ? initialData.resources : [{ title: '', url: '', category: 'website' as const }],
    notes: initialData.notes
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const addArrayField = (fieldName: 'strengths' | 'weaknesses' | 'resources') => {
    if (fieldName === 'resources') {
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], { title: '', url: '', category: 'website' as const }]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], '']
      }));
    }
  };

  const removeArrayField = (fieldName: 'strengths' | 'weaknesses' | 'resources', index: number) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const updateArrayField = (fieldName: 'strengths' | 'weaknesses', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  const updateResourceField = (index: number, field: keyof CompetitorResource, value: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Review AI-Extracted Competitor Profile
          </DialogTitle>
          <Badge variant="secondary" className="w-fit mt-2">
            AI Analysis Complete • Review & Edit
          </Badge>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Competitor Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Company name"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
                disabled
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the competitor"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="marketPosition">Market Position</Label>
            <Input
              id="marketPosition"
              value={formData.marketPosition}
              onChange={(e) => setFormData(prev => ({ ...prev, marketPosition: e.target.value }))}
              placeholder="e.g., Market leader, Emerging player, Niche specialist"
            />
          </div>

          {/* Strengths */}
          <div>
            <Label>Strengths</Label>
            {formData.strengths.map((strength, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={strength}
                  onChange={(e) => updateArrayField('strengths', index, e.target.value)}
                  placeholder="Enter a strength"
                />
                {formData.strengths.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayField('strengths', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addArrayField('strengths')}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Strength
            </Button>
          </div>

          {/* Weaknesses */}
          <div>
            <Label>Weaknesses</Label>
            {formData.weaknesses.map((weakness, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={weakness}
                  onChange={(e) => updateArrayField('weaknesses', index, e.target.value)}
                  placeholder="Enter a weakness"
                />
                {formData.weaknesses.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayField('weaknesses', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addArrayField('weaknesses')}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Weakness
            </Button>
          </div>

          {/* Resources */}
          <div>
            <Label>Resources & Links</Label>
            {formData.resources.map((resource, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 mt-2">
                <Input
                  value={resource.title}
                  onChange={(e) => updateResourceField(index, 'title', e.target.value)}
                  placeholder="Resource title"
                />
                <Input
                  value={resource.url}
                  onChange={(e) => updateResourceField(index, 'url', e.target.value)}
                  placeholder="https://..."
                />
                <div className="flex gap-2">
                  <Select
                    value={resource.category}
                    onValueChange={(value) => updateResourceField(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.resources.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayField('resources', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addArrayField('resources')}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>

          <div>
            <Label htmlFor="notes">Analysis Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Internal notes and analysis"
              rows={4}
            />
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="ghost" onClick={onBack} disabled={isSaving}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to URL
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Add Competitor
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
