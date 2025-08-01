import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Edit, Trash2, ChevronDown, Link, MessageSquare, Clock } from 'lucide-react';
import { GlossaryTerm } from '@/contexts/glossary-builder/types';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { formatDistanceToNow } from 'date-fns';

interface TermCardProps {
  term: GlossaryTerm;
}

export function TermCard({ term }: TermCardProps) {
  const { deleteTerm } = useGlossaryBuilder();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${term.term}"?`)) {
      await deleteTerm(term.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'needs_review':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 text-left">
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{term.term}</h4>
                  {term.shortDefinition && (
                    <p className="text-xs text-muted-foreground truncate">
                      {term.shortDefinition}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(term.status)} className="text-xs">
                  {term.status.replace('_', ' ')}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 px-3">
            <div className="space-y-4 ml-7">
              {term.expandedExplanation && (
                <div>
                  <h5 className="text-xs font-medium mb-1">Explanation</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {term.expandedExplanation}
                  </p>
                </div>
              )}
              
              {term.relatedTerms.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium mb-1">Related Terms</h5>
                  <div className="flex flex-wrap gap-1">
                    {term.relatedTerms.map((relatedTerm, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {relatedTerm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {term.paaQuestions.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium mb-1 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Questions & Answers
                  </h5>
                  <div className="space-y-2">
                    {term.paaQuestions.slice(0, 2).map((qa, index) => (
                      <div key={index} className="p-2 bg-muted/50 rounded text-xs">
                        <p className="font-medium">{qa.question}</p>
                        <p className="text-muted-foreground mt-1">{qa.answer}</p>
                      </div>
                    ))}
                    {term.paaQuestions.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{term.paaQuestions.length - 2} more questions
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {term.internalLinks.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium mb-1 flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    Internal Links
                  </h5>
                  <div className="space-y-1">
                    {term.internalLinks.slice(0, 3).map((link, index) => (
                      <a 
                        key={index}
                        href={link.url}
                        className="block text-xs text-primary hover:underline truncate"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.title}
                      </a>
                    ))}
                    {term.internalLinks.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{term.internalLinks.length - 3} more links
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Updated {formatDistanceToNow(new Date(term.lastUpdated), { addSuffix: true })}
                  </span>
                </div>
                {(term.searchVolume || term.keywordDifficulty) && (
                  <div className="flex gap-2">
                    {term.searchVolume && (
                      <span>Vol: {term.searchVolume.toLocaleString()}</span>
                    )}
                    {term.keywordDifficulty && (
                      <span>KD: {term.keywordDifficulty}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}