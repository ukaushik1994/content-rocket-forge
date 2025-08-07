import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Users, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import { EnhancedSolution, CompetitorInfo } from '@/contexts/content-builder/types/enhanced-solution-types';

interface CompetitiveAnalysisTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
}

export const CompetitiveAnalysisTab: React.FC<CompetitiveAnalysisTabProps> = ({
  formData,
  updateFormData
}) => {
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    marketShare: '',
    pricing: ''
  });
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  const [editingCompetitor, setEditingCompetitor] = useState<string | null>(null);

  const competitors = formData.competitors || [];

  const addCompetitor = useCallback(() => {
    if (!newCompetitor.name.trim()) return;

    const competitor: CompetitorInfo = {
      name: newCompetitor.name.trim(),
      strengths: [],
      weaknesses: [],
      marketShare: newCompetitor.marketShare.trim() || undefined,
      pricing: newCompetitor.pricing.trim() || undefined
    };

    updateFormData({
      competitors: [...competitors, competitor]
    });

    setNewCompetitor({ name: '', marketShare: '', pricing: '' });
  }, [newCompetitor, competitors, updateFormData]);

  const removeCompetitor = useCallback((index: number) => {
    updateFormData({
      competitors: competitors.filter((_, i) => i !== index)
    });
  }, [competitors, updateFormData]);

  const updateCompetitor = useCallback((index: number, updates: Partial<CompetitorInfo>) => {
    updateFormData({
      competitors: competitors.map((comp, i) => 
        i === index ? { ...comp, ...updates } : comp
      )
    });
  }, [competitors, updateFormData]);

  const addCompetitorAttribute = useCallback((
    competitorIndex: number,
    attribute: 'strengths' | 'weaknesses',
    value: string,
    setter: (value: string) => void
  ) => {
    if (!value.trim()) return;

    const competitor = competitors[competitorIndex];
    const currentItems = competitor[attribute] || [];
    
    if (!currentItems.includes(value.trim())) {
      updateCompetitor(competitorIndex, {
        [attribute]: [...currentItems, value.trim()]
      });
    }
    setter('');
  }, [competitors, updateCompetitor]);

  const removeCompetitorAttribute = useCallback((
    competitorIndex: number,
    attribute: 'strengths' | 'weaknesses',
    itemIndex: number
  ) => {
    const competitor = competitors[competitorIndex];
    const currentItems = competitor[attribute] || [];
    
    updateCompetitor(competitorIndex, {
      [attribute]: currentItems.filter((_, i) => i !== itemIndex)
    });
  }, [competitors, updateCompetitor]);

  return (
    <div className="space-y-6">
      {/* Add New Competitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Competitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="competitor-name">Competitor Name *</Label>
              <Input
                id="competitor-name"
                placeholder="e.g., CompetitorCorp"
                value={newCompetitor.name}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="market-share">Market Share (Optional)</Label>
              <Input
                id="market-share"
                placeholder="e.g., 15%"
                value={newCompetitor.marketShare}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, marketShare: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pricing">Pricing (Optional)</Label>
              <Input
                id="pricing"
                placeholder="e.g., $99/month"
                value={newCompetitor.pricing}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, pricing: e.target.value }))}
              />
            </div>
          </div>
          
          <Button 
            onClick={addCompetitor}
            disabled={!newCompetitor.name.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </Button>
        </CardContent>
      </Card>

      {/* Competitors List */}
      {competitors.length > 0 ? (
        <div className="space-y-4">
          {competitors.map((competitor, index) => (
            <Card key={index} className="border-l-4 border-l-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {competitor.name}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCompetitor(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {(competitor.marketShare || competitor.pricing) && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {competitor.marketShare && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Market Share: {competitor.marketShare}
                      </span>
                    )}
                    {competitor.pricing && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Pricing: {competitor.pricing}
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Strengths
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add strength"
                        value={newStrength}
                        onChange={(e) => setNewStrength(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCompetitorAttribute(index, 'strengths', newStrength, setNewStrength);
                          }
                        }}
                      />
                      <Button 
                        size="sm"
                        onClick={() => addCompetitorAttribute(index, 'strengths', newStrength, setNewStrength)}
                        disabled={!newStrength.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {competitor.strengths && competitor.strengths.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {competitor.strengths.map((strength, strengthIndex) => (
                          <Badge key={strengthIndex} variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1 pr-1">
                            {strength}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeCompetitorAttribute(index, 'strengths', strengthIndex)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Weaknesses
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add weakness"
                        value={newWeakness}
                        onChange={(e) => setNewWeakness(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCompetitorAttribute(index, 'weaknesses', newWeakness, setNewWeakness);
                          }
                        }}
                      />
                      <Button 
                        size="sm"
                        onClick={() => addCompetitorAttribute(index, 'weaknesses', newWeakness, setNewWeakness)}
                        disabled={!newWeakness.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {competitor.weaknesses.map((weakness, weaknessIndex) => (
                          <Badge key={weaknessIndex} variant="secondary" className="bg-red-100 text-red-800 flex items-center gap-1 pr-1">
                            {weakness}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeCompetitorAttribute(index, 'weaknesses', weaknessIndex)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Basic Info */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Market Share</Label>
                      <Input
                        placeholder="e.g., 15%"
                        value={competitor.marketShare || ''}
                        onChange={(e) => updateCompetitor(index, { marketShare: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Pricing</Label>
                      <Input
                        placeholder="e.g., $99/month"
                        value={competitor.pricing || ''}
                        onChange={(e) => updateCompetitor(index, { pricing: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No competitors added yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add competitor information to understand your market position
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};