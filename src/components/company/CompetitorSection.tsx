import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Building2,
  GripVertical,
  Globe,
  FileText,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanyCompetitor, CompetitorResource } from '@/contexts/content-builder/types/company-types';

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
  other: 'Other'
};

interface CompetitorSectionProps {
  userId: string;
}

export const CompetitorSection: React.FC<CompetitorSectionProps> = ({ userId }) => {
  const [competitors, setCompetitors] = useState<CompanyCompetitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<CompanyCompetitor | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    website: string;
    description: string;
    marketPosition: string;
    strengths: string[];
    weaknesses: string[];
    resources: CompetitorResource[];
    notes: string;
  }>({
    name: '',
    website: '',
    description: '',
    marketPosition: '',
    strengths: [''],
    weaknesses: [''],
    resources: [{ title: '', url: '', category: 'website' }],
    notes: ''
  });

  useEffect(() => {
    loadCompetitors();
  }, [userId]);

  const loadCompetitors = async () => {
    try {
      const { data, error } = await supabase
        .from('company_competitors')
        .select('*')
        .eq('user_id', userId)
        .order('priority_order', { ascending: true });

      if (error) throw error;

      const formattedData: CompanyCompetitor[] = data?.map(item => {
        // Parse JSON strings back to arrays/objects
        let resources: CompetitorResource[] = [];
        let strengths: string[] = [];
        let weaknesses: string[] = [];
        
        try {
          resources = typeof item.resources === 'string' ? JSON.parse(item.resources) : (Array.isArray(item.resources) ? item.resources as any : []);
          strengths = typeof item.strengths === 'string' ? JSON.parse(item.strengths) : (Array.isArray(item.strengths) ? item.strengths as any : []);
          weaknesses = typeof item.weaknesses === 'string' ? JSON.parse(item.weaknesses) : (Array.isArray(item.weaknesses) ? item.weaknesses as any : []);
        } catch (e) {
          console.warn('Error parsing competitor data:', e);
        }

        return {
          id: item.id,
          userId: item.user_id,
          name: item.name,
          website: item.website,
          description: item.description,
          logoUrl: item.logo_url,
          resources,
          marketPosition: item.market_position,
          strengths,
          weaknesses,
          notes: item.notes,
          priorityOrder: item.priority_order,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        };
      }) || [];

      setCompetitors(formattedData);
    } catch (error) {
      console.error('Error loading competitors:', error);
      toast({
        title: "Error",
        description: "Failed to load competitors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      website: '',
      description: '',
      marketPosition: '',
      strengths: [''],
      weaknesses: [''],
      resources: [{ title: '', url: '', category: 'website' }],
      notes: ''
    });
    setEditingCompetitor(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Competitor name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const competitorData = {
        user_id: userId,
        name: formData.name.trim(),
        website: formData.website.trim() || null,
        description: formData.description.trim() || null,
        market_position: formData.marketPosition.trim() || null,
        strengths: JSON.stringify(formData.strengths.filter(s => s.trim())),
        weaknesses: JSON.stringify(formData.weaknesses.filter(w => w.trim())),
        resources: JSON.stringify(formData.resources.filter(r => r.title.trim() && r.url.trim())),
        notes: formData.notes.trim() || null,
        priority_order: editingCompetitor?.priorityOrder || competitors.length
      };

      if (editingCompetitor) {
        const { error } = await supabase
          .from('company_competitors')
          .update(competitorData)
          .eq('id', editingCompetitor.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Competitor updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('company_competitors')
          .insert([competitorData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Competitor added successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadCompetitors();
    } catch (error) {
      console.error('Error saving competitor:', error);
      toast({
        title: "Error",
        description: "Failed to save competitor",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (competitor: CompanyCompetitor) => {
    setEditingCompetitor(competitor);
    setFormData({
      name: competitor.name,
      website: competitor.website || '',
      description: competitor.description || '',
      marketPosition: competitor.marketPosition || '',
      strengths: competitor.strengths.length ? competitor.strengths : [''],
      weaknesses: competitor.weaknesses.length ? competitor.weaknesses : [''],
      resources: competitor.resources.length ? competitor.resources : [{ title: '', url: '', category: 'website' }],
      notes: competitor.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (competitorId: string) => {
    try {
      const { error } = await supabase
        .from('company_competitors')
        .delete()
        .eq('id', competitorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Competitor deleted successfully"
      });
      loadCompetitors();
    } catch (error) {
      console.error('Error deleting competitor:', error);
      toast({
        title: "Error",
        description: "Failed to delete competitor",
        variant: "destructive"
      });
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

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Competitor Intelligence</h3>
              <p className="text-muted-foreground">Track and analyze your main competitors</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Competitor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCompetitor ? 'Edit Competitor' : 'Add New Competitor'}
                </DialogTitle>
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

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {editingCompetitor ? 'Update' : 'Add'} Competitor
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {competitors.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-background to-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">No competitors added yet</h4>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start tracking your competition to gain valuable market insights and stay ahead of industry trends
            </p>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Competitor
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competitors.map((competitor) => (
              <motion.div
                key={competitor.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{competitor.name}</h4>
                        {competitor.marketPosition && (
                          <Badge variant="secondary" className="text-xs">
                            {competitor.marketPosition}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(competitor)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(competitor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {competitor.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {competitor.description}
                    </p>
                  )}

                  {competitor.resources.length > 0 && (
                    <div className="mb-3">
                      <Label className="text-xs">Resources</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {competitor.resources.slice(0, 3).map((resource, index) => {
                          const Icon = categoryIcons[resource.category];
                          return (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Icon className="h-3 w-3 mr-1" />
                              {resource.title}
                            </Badge>
                          );
                        })}
                        {competitor.resources.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{competitor.resources.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {competitor.strengths.length > 0 && (
                      <div>
                        <Label className="text-xs text-green-600">Strengths</Label>
                        <p className="text-muted-foreground">
                          {competitor.strengths.slice(0, 2).join(', ')}
                          {competitor.strengths.length > 2 && '...'}
                        </p>
                      </div>
                    )}
                    {competitor.weaknesses.length > 0 && (
                      <div>
                        <Label className="text-xs text-red-600">Weaknesses</Label>
                        <p className="text-muted-foreground">
                          {competitor.weaknesses.slice(0, 2).join(', ')}
                          {competitor.weaknesses.length > 2 && '...'}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};