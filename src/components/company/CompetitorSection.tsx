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
  Building2,
  Globe,
  FileText,
  Users,
  Target,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanyCompetitor, CompetitorResource } from '@/contexts/content-builder/types/company-types';
import { CompetitorCard } from './CompetitorCard';
import { AddCompetitorDialog } from './AddCompetitorDialog';
import { ReviewCompetitorDialog } from './ReviewCompetitorDialog';
import { CompetitorProfileDialog } from './CompetitorProfileDialog';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

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
  
  // Dialog state management
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompanyCompetitor | null>(null);
  
  const [editingCompetitor, setEditingCompetitor] = useState<CompanyCompetitor | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CompetitorAutoFillPayload | null>(null);
  const [pendingCompetitor, setPendingCompetitor] = useState<{name: string, website: string} | null>(null);
  
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

  const handleAnalysisComplete = (data: CompetitorAutoFillPayload, name: string, website: string) => {
    setAnalysisResult(data);
    setPendingCompetitor({ name, website });
    setAddDialogOpen(false);
    setReviewDialogOpen(true);
  };

  const handleReviewSave = async (reviewData: {
    name: string;
    website: string;
    description: string;
    marketPosition: string;
    strengths: string[];
    weaknesses: string[];
    resources: CompetitorResource[];
    notes: string;
  }) => {
    if (!reviewData.name.trim()) {
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
        name: reviewData.name.trim(),
        website: reviewData.website.trim() || null,
        description: reviewData.description.trim() || null,
        market_position: reviewData.marketPosition.trim() || null,
        strengths: JSON.stringify(reviewData.strengths.filter(s => s.trim())),
        weaknesses: JSON.stringify(reviewData.weaknesses.filter(w => w.trim())),
        resources: JSON.stringify(reviewData.resources.filter(r => r.title.trim() && r.url.trim())),
        notes: reviewData.notes.trim() || null,
        priority_order: competitors.length
      };

      const { error } = await supabase
        .from('company_competitors')
        .insert([competitorData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Competitor added successfully with AI-extracted intelligence"
      });

      setReviewDialogOpen(false);
      setAnalysisResult(null);
      setPendingCompetitor(null);
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

  const handleReviewBack = () => {
    setReviewDialogOpen(false);
    setAddDialogOpen(true);
  };

  // Edit existing competitor (old flow)
  const handleEditSave = async () => {
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

      const { error } = await supabase
        .from('company_competitors')
        .update(competitorData)
        .eq('id', editingCompetitor!.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Competitor updated successfully"
      });

      setEditDialogOpen(false);
      resetForm();
      loadCompetitors();
    } catch (error) {
      console.error('Error updating competitor:', error);
      toast({
        title: "Error",
        description: "Failed to update competitor",
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
    setEditDialogOpen(true);
  };

  const handleViewProfile = (competitor: CompanyCompetitor) => {
    setSelectedCompetitor(competitor);
    setProfileDialogOpen(true);
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
      <Card className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Competitor Intelligence</h3>
              <p className="text-muted-foreground">Track and analyze your main competitors</p>
            </div>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </Button>

          {/* Edit Competitor Dialog (Traditional Form) */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="glass-panel max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Competitor</DialogTitle>
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
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditSave}>
                    Update Competitor
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* New URL-First Add Dialog */}
          <AddCompetitorDialog
            isOpen={addDialogOpen}
            onClose={() => setAddDialogOpen(false)}
            onAnalysisComplete={handleAnalysisComplete}
            userId={userId}
          />

          {/* Review Dialog */}
          {analysisResult && pendingCompetitor && (
            <ReviewCompetitorDialog
              isOpen={reviewDialogOpen}
              onClose={() => {
                setReviewDialogOpen(false);
                setAnalysisResult(null);
                setPendingCompetitor(null);
              }}
              onSave={handleReviewSave}
              onBack={handleReviewBack}
              initialData={analysisResult}
              name={pendingCompetitor.name}
              website={pendingCompetitor.website}
            />
          )}

          {/* Profile Dialog */}
          {selectedCompetitor && (
            <CompetitorProfileDialog
              competitor={selectedCompetitor}
              open={profileDialogOpen}
              onOpenChange={setProfileDialogOpen}
            />
          )}
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
            <Button onClick={() => setAddDialogOpen(true)} className="shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Competitor
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitors.map((competitor, index) => (
              <motion.div
                key={competitor.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                whileHover={{ y: -4 }}
              >
                <CompetitorCard
                  competitor={competitor}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewProfile={handleViewProfile}
                  isAutoFilling={false}
                />
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};