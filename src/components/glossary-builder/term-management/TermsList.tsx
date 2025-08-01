import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Search, Book, Edit, Trash2, Plus } from 'lucide-react';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { TermCard } from './TermCard';

export function TermsList() {
  const { state } = useGlossaryBuilder();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'draft' | 'completed' | 'needs_review'>('all');

  const filteredTerms = state.currentGlossary?.terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.shortDefinition?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || term.status === selectedFilter;
    return matchesSearch && matchesFilter;
  }) || [];

  const termsByStatus = {
    draft: filteredTerms.filter(t => t.status === 'draft').length,
    completed: filteredTerms.filter(t => t.status === 'completed').length,
    needs_review: filteredTerms.filter(t => t.status === 'needs_review').length,
  };

  // Group terms alphabetically
  const groupedTerms = filteredTerms.reduce((acc, term) => {
    const firstLetter = term.term.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {} as Record<string, typeof filteredTerms>);

  return (
    <Card className="h-[calc(100vh-200px)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Book className="h-5 w-5" />
          Terms Library
        </CardTitle>
        
        {state.currentGlossary && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedFilter('all')}
              >
                All ({filteredTerms.length})
              </Badge>
              <Badge
                variant={selectedFilter === 'completed' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedFilter('completed')}
              >
                Complete ({termsByStatus.completed})
              </Badge>
              <Badge
                variant={selectedFilter === 'draft' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedFilter('draft')}
              >
                Draft ({termsByStatus.draft})
              </Badge>
              <Badge
                variant={selectedFilter === 'needs_review' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedFilter('needs_review')}
              >
                Review ({termsByStatus.needs_review})
              </Badge>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {!state.currentGlossary ? (
          <div className="p-6 text-center text-muted-foreground">
            <Book className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No glossary selected</p>
            <p className="text-xs">Create a new glossary to get started</p>
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Book className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No terms match your search' : 'No terms yet'}
            </p>
            <p className="text-xs">
              {searchTerm ? 'Try a different search term' : 'Use the modes above to add terms'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="p-4 space-y-4">
              {Object.keys(groupedTerms)
                .sort()
                .map((letter) => (
                  <div key={letter} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-xs font-semibold">
                        {letter}
                      </div>
                      <Separator className="flex-1" />
                    </div>
                    <div className="space-y-2 ml-8">
                      {groupedTerms[letter]
                        .sort((a, b) => a.term.localeCompare(b.term))
                        .map((term) => (
                          <TermCard key={term.id} term={term} />
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}