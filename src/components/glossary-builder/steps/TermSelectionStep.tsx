import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Search, CheckSquare, Square, ArrowRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TermSelectionStepProps {
  onStepComplete: () => void;
}

export function TermSelectionStep({ onStepComplete }: TermSelectionStepProps) {
  const { state, dispatch } = useGlossaryBuilder();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'selected' | 'unselected'>('all');

  // Filter terms based on search and filter type
  const filteredTerms = state.suggestedTerms.filter(term => {
    const matchesSearch = term.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'selected' && selectedTerms.includes(term)) ||
      (filterType === 'unselected' && !selectedTerms.includes(term));
    
    return matchesSearch && matchesFilter;
  });

  // Handle term selection
  const toggleTermSelection = (term: string) => {
    setSelectedTerms(prev => 
      prev.includes(term) 
        ? prev.filter(t => t !== term)
        : [...prev, term]
    );
  };

  // Select all filtered terms
  const selectAllFiltered = () => {
    const newSelected = [...new Set([...selectedTerms, ...filteredTerms])];
    setSelectedTerms(newSelected);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedTerms([]);
  };

  // Select all terms
  const selectAllTerms = () => {
    setSelectedTerms([...state.suggestedTerms]);
  };

  // Handle proceeding to next step
  const handleProceed = () => {
    if (selectedTerms.length > 0) {
      dispatch({ type: 'SELECT_TERMS', payload: selectedTerms });
      onStepComplete();
    }
  };

  useEffect(() => {
    // Auto-complete step if terms are selected
    if (selectedTerms.length > 0) {
      dispatch({ type: 'SELECT_TERMS', payload: selectedTerms });
    }
  }, [selectedTerms, dispatch]);

  if (state.suggestedTerms.length === 0) {
    return (
      <Card className="glass-card border-amber-500/20">
        <CardContent className="p-8 text-center">
          <div className="text-amber-400 mb-4">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Terms Available</h3>
          <p className="text-muted-foreground mb-4">
            Please go back to the previous step and add some terms first.
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
          <CardTitle className="text-2xl font-bold text-holographic">
            Select Terms for Definition Generation
          </CardTitle>
          <p className="text-muted-foreground">
            Choose which terms you'd like to generate definitions for. You can select individual terms or use bulk operations.
          </p>
        </CardHeader>
      </Card>

      {/* Search and Filter Controls */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-white/20"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'selected', 'unselected'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={filterType === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filter)}
                  className={cn(
                    "capitalize",
                    filterType === filter 
                      ? "bg-primary/20 text-primary border-primary/30" 
                      : "glass-card border-white/20"
                  )}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllTerms}
              className="glass-card border-white/20 hover:border-primary/30"
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Select All ({state.suggestedTerms.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllFiltered}
              disabled={filteredTerms.length === 0}
              className="glass-card border-white/20 hover:border-primary/30"
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Select Filtered ({filteredTerms.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllSelections}
              disabled={selectedTerms.length === 0}
              className="glass-card border-white/20 hover:border-destructive/30 hover:text-destructive"
            >
              <Square className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>

          {/* Selection Summary */}
          <div className="flex items-center gap-4 p-3 glass-panel rounded-lg">
            <Badge variant="default" className="bg-primary/20 text-primary">
              {selectedTerms.length} selected
            </Badge>
            <Badge variant="outline" className="border-white/20">
              {state.suggestedTerms.length} total
            </Badge>
            {selectedTerms.length > 0 && (
              <Button
                onClick={handleProceed}
                size="sm"
                className="ml-auto bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              >
                Generate Definitions <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Terms Grid */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Available Terms</h3>
          <ScrollArea className="h-[400px] custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTerms.map((term, index) => {
                const isSelected = selectedTerms.includes(term);
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-105",
                      isSelected 
                        ? "glass-card border-primary/30 bg-primary/10" 
                        : "glass-card border-white/20 hover:border-white/40"
                    )}
                    onClick={() => toggleTermSelection(term)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleTermSelection(term)}
                        className="flex-shrink-0"
                      />
                      <span className={cn(
                        "font-medium text-sm",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {term}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
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