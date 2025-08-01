import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { TermCard } from '../term-management/TermCard';
import { Search, Filter, Check, Edit, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewAndEditStepProps {
  onStepComplete: () => void;
}

export function ReviewAndEditStep({ onStepComplete }: ReviewAndEditStepProps) {
  const { state } = useGlossaryBuilder();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'completed' | 'needs_review'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');

  const terms = state.currentGlossary?.terms || [];

  // Filter terms based on search and status
  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || term.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status counts
  const statusCounts = {
    all: terms.length,
    draft: terms.filter(t => t.status === 'draft').length,
    completed: terms.filter(t => t.status === 'completed').length,
    needs_review: terms.filter(t => t.status === 'needs_review').length
  };

  // Check if ready to proceed (all terms should be completed or needs_review)
  const readyToProceed = terms.length > 0 && terms.every(t => t.status === 'completed' || t.status === 'needs_review');

  const handleProceed = () => {
    onStepComplete();
  };

  if (terms.length === 0) {
    return (
      <Card className="glass-card border-amber-500/20">
        <CardContent className="p-8 text-center">
          <div className="text-amber-400 mb-4">
            <Edit className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Definitions Generated</h3>
          <p className="text-muted-foreground mb-4">
            Please go back and generate definitions first.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-holographic flex items-center gap-3">
            <Edit className="h-8 w-8" />
            Review & Edit Definitions
          </CardTitle>
          <p className="text-muted-foreground">
            Review the generated definitions and make any necessary edits. Ensure all terms are accurate and complete.
          </p>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-white/20"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status as any)}
                  className={cn(
                    "capitalize",
                    statusFilter === status 
                      ? "bg-primary/20 text-primary border-primary/30" 
                      : "glass-card border-white/20"
                  )}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')} ({count})
                </Button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex gap-1 p-1 glass-panel rounded-lg">
              <Button
                variant={viewMode === 'cards' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'compact' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('compact')}
                className="text-xs"
              >
                <Filter className="h-3 w-3 mr-1" />
                List
              </Button>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 glass-panel rounded-lg text-center">
              <div className="text-lg font-bold text-primary">{statusCounts.completed}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="p-3 glass-panel rounded-lg text-center">
              <div className="text-lg font-bold text-amber-400">{statusCounts.needs_review}</div>
              <p className="text-xs text-muted-foreground">Needs Review</p>
            </div>
            <div className="p-3 glass-panel rounded-lg text-center">
              <div className="text-lg font-bold text-muted-foreground">{statusCounts.draft}</div>
              <p className="text-xs text-muted-foreground">Draft</p>
            </div>
            <div className="p-3 glass-panel rounded-lg text-center">
              <div className="text-lg font-bold text-holographic">{statusCounts.all}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Ready to Proceed Indicator */}
          {readyToProceed && (
            <div className="flex items-center justify-between p-4 glass-card border-primary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-primary">Ready to Proceed</p>
                  <p className="text-xs text-muted-foreground">All definitions have been reviewed</p>
                </div>
              </div>
              <Button
                onClick={handleProceed}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              >
                Continue to Save & Export
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms List */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {filteredTerms.length} of {terms.length} Terms
            </h3>
            <Badge variant="outline" className="border-white/20">
              {Math.round((statusCounts.completed / statusCounts.all) * 100)}% Complete
            </Badge>
          </div>

          <ScrollArea className="h-[600px] custom-scrollbar">
            {viewMode === 'cards' ? (
              <div className="space-y-4">
                {filteredTerms.map((term) => (
                  <TermCard key={term.id} term={term} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTerms.map((term) => (
                  <div key={term.id} className="p-3 glass-panel rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{term.term}</h4>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          term.status === 'completed' && "border-primary/30 text-primary",
                          term.status === 'needs_review' && "border-amber-400/30 text-amber-400",
                          term.status === 'draft' && "border-white/20"
                        )}
                      >
                        {term.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {term.shortDefinition}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {filteredTerms.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No terms match your search criteria</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}