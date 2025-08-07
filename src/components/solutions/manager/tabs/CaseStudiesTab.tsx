import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Building, Quote, TrendingUp, Trash2 } from 'lucide-react';
import { EnhancedSolution, CaseStudy } from '@/contexts/content-builder/types/enhanced-solution-types';
import { DropdownWithOther } from '../shared/DropdownWithOther';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CaseStudiesTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
}

export const CaseStudiesTab: React.FC<CaseStudiesTabProps> = ({
  formData,
  updateFormData
}) => {
  const [newCaseStudy, setNewCaseStudy] = useState({
    title: '',
    company: '',
    industry: '',
    challenge: '',
    solution: '',
    results: '',
    testimonialQuote: '',
    testimonialAuthor: '',
    testimonialPosition: ''
  });
  const [customIndustry, setCustomIndustry] = useState('');

  const caseStudies = formData.caseStudies || [];

  // Industry options
  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'financial-services', label: 'Financial Services' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'education', label: 'Education' },
    { value: 'government', label: 'Government' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'consulting', label: 'Professional Services' }
  ];

  const addCaseStudy = () => {
    if (!newCaseStudy.title.trim() || !newCaseStudy.company.trim()) return;

    // Use custom industry if "Other" is selected
    const finalIndustry = newCaseStudy.industry === 'Other' ? customIndustry.trim() : newCaseStudy.industry.trim();

    const caseStudy: CaseStudy = {
      id: `case-study-${Date.now()}`,
      title: newCaseStudy.title.trim(),
      company: newCaseStudy.company.trim(),
      industry: finalIndustry,
      challenge: newCaseStudy.challenge.trim(),
      solution: newCaseStudy.solution.trim(),
      results: newCaseStudy.results.split(',').map(r => r.trim()).filter(r => r),
      testimonial: newCaseStudy.testimonialQuote.trim() ? {
        quote: newCaseStudy.testimonialQuote.trim(),
        author: newCaseStudy.testimonialAuthor.trim(),
        position: newCaseStudy.testimonialPosition.trim()
      } : undefined
    };

    updateFormData({
      caseStudies: [...caseStudies, caseStudy]
    });

    setNewCaseStudy({
      title: '',
      company: '',
      industry: '',
      challenge: '',
      solution: '',
      results: '',
      testimonialQuote: '',
      testimonialAuthor: '',
      testimonialPosition: ''
    });
    setCustomIndustry('');
  };

  const removeCaseStudy = (id: string) => {
    updateFormData({
      caseStudies: caseStudies.filter(cs => cs.id !== id)
    });
  };

  const updateCaseStudy = (id: string, updates: Partial<CaseStudy>) => {
    updateFormData({
      caseStudies: caseStudies.map(cs => 
        cs.id === id ? { ...cs, ...updates } : cs
      )
    });
  };

  return (
    <ScrollArea className="h-[70vh]">
      <div className="space-y-6 pr-4">
      {/* Add New Case Study */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Case Study
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="case-title">Case Study Title *</Label>
              <Input
                id="case-title"
                placeholder="e.g., 50% Increase in Sales Efficiency"
                value={newCaseStudy.title}
                onChange={(e) => setNewCaseStudy(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="case-company">Company Name *</Label>
              <Input
                id="case-company"
                placeholder="e.g., TechCorp Inc."
                value={newCaseStudy.company}
                onChange={(e) => setNewCaseStudy(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
          </div>

            <DropdownWithOther
              id="case-industry"
              label="Industry"
              placeholder="Select industry"
              options={industryOptions}
              value={newCaseStudy.industry}
              onValueChange={(value) => setNewCaseStudy(prev => ({ ...prev, industry: value }))}
              customValue={customIndustry}
              onCustomValueChange={setCustomIndustry}
              customInputLabel="Specify industry"
              customInputPlaceholder="Enter custom industry"
            />
          
          <div className="space-y-2">
            <Label htmlFor="case-challenge">Challenge</Label>
            <Textarea
              id="case-challenge"
              placeholder="Describe the problem or challenge the customer faced..."
              value={newCaseStudy.challenge}
              onChange={(e) => setNewCaseStudy(prev => ({ ...prev, challenge: e.target.value }))}
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="case-solution">Solution Implemented</Label>
            <Textarea
              id="case-solution"
              placeholder="Describe how your solution addressed the challenge..."
              value={newCaseStudy.solution}
              onChange={(e) => setNewCaseStudy(prev => ({ ...prev, solution: e.target.value }))}
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="case-results">Results (comma-separated)</Label>
            <Textarea
              id="case-results"
              placeholder="e.g., 50% faster processing, $2M cost savings, 99.9% uptime achieved"
              value={newCaseStudy.results}
              onChange={(e) => setNewCaseStudy(prev => ({ ...prev, results: e.target.value }))}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Testimonial Section */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Quote className="h-4 w-4" />
              Customer Testimonial (Optional)
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="testimonial-quote">Quote</Label>
              <Textarea
                id="testimonial-quote"
                placeholder="What did the customer say about your solution?"
                value={newCaseStudy.testimonialQuote}
                onChange={(e) => setNewCaseStudy(prev => ({ ...prev, testimonialQuote: e.target.value }))}
                className="resize-none"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testimonial-author">Author Name</Label>
                <Input
                  id="testimonial-author"
                  placeholder="e.g., John Smith"
                  value={newCaseStudy.testimonialAuthor}
                  onChange={(e) => setNewCaseStudy(prev => ({ ...prev, testimonialAuthor: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testimonial-position">Position</Label>
                <Input
                  id="testimonial-position"
                  placeholder="e.g., CTO, TechCorp Inc."
                  value={newCaseStudy.testimonialPosition}
                  onChange={(e) => setNewCaseStudy(prev => ({ ...prev, testimonialPosition: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={addCaseStudy}
            disabled={!newCaseStudy.title.trim() || !newCaseStudy.company.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Case Study
          </Button>
        </CardContent>
      </Card>

      {/* Case Studies List */}
      {caseStudies.length > 0 ? (
        <div className="space-y-4">
          {caseStudies.map((caseStudy) => (
            <Card key={caseStudy.id} className="border-l-4 border-l-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      {caseStudy.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      {caseStudy.company}
                      {caseStudy.industry && (
                        <>
                          <span>•</span>
                          <span>{caseStudy.industry}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCaseStudy(caseStudy.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseStudy.challenge && (
                  <div>
                    <Label className="text-sm font-medium">Challenge</Label>
                    <p className="text-sm text-muted-foreground mt-1">{caseStudy.challenge}</p>
                  </div>
                )}

                {caseStudy.solution && (
                  <div>
                    <Label className="text-sm font-medium">Solution</Label>
                    <p className="text-sm text-muted-foreground mt-1">{caseStudy.solution}</p>
                  </div>
                )}

                {caseStudy.results.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Results</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {caseStudy.results.map((result, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          {result}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {caseStudy.testimonial && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Quote className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-sm italic">"{caseStudy.testimonial.quote}"</p>
                        <div className="text-xs text-muted-foreground">
                          — {caseStudy.testimonial.author}
                          {caseStudy.testimonial.position && `, ${caseStudy.testimonial.position}`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No case studies added yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add customer success stories to build credibility
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </ScrollArea>
  );
};