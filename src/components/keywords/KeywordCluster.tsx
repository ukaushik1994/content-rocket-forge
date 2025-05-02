
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface KeywordProps {
  primary: string;
  volume: string;
  difficulty: string;
  cpc: string;
  intent: string;
  secondaryKeywords: string[];
  semanticTerms: string[];
  longTailKeywords: string[];
}

export function KeywordCluster({ 
  primary, 
  volume, 
  difficulty, 
  cpc, 
  intent,
  secondaryKeywords,
  semanticTerms,
  longTailKeywords
}: KeywordProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // Map difficulty to color
  const difficultyColor = {
    'Low': 'bg-green-500/20 text-green-500 hover:bg-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30',
    'High': 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
  };

  // Map intent to appropriate badge
  const intentBadge = {
    'Informational': 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30',
    'Navigational': 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/30',
    'Commercial': 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30',
    'Transactional': 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
  };

  // Function to handle using a keyword
  const handleUseKeyword = () => {
    // Display a success toast
    toast.success(`Keyword "${primary}" added to your content`, {
      description: "You can now use this keyword in your content editor."
    });
    
    // Store the keyword for use in content creation
    const selectedKeywords = JSON.parse(localStorage.getItem('selectedKeywords') || '[]');
    if (!selectedKeywords.includes(primary)) {
      selectedKeywords.push(primary);
      localStorage.setItem('selectedKeywords', JSON.stringify(selectedKeywords));
    }
    
    // Navigate to content page after a brief delay
    setTimeout(() => {
      navigate('/content');
    }, 1000);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 neon-border hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gradient font-bold">
            {primary}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
        <CardDescription className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline" className="border-primary/30">
            {volume} searches/mo
          </Badge>
          <Badge variant="outline" className={difficultyColor[difficulty as keyof typeof difficultyColor] || "bg-gray-500/20 text-gray-500"}>
            {difficulty} difficulty
          </Badge>
          <Badge variant="outline" className="border-primary/30">
            {cpc} CPC
          </Badge>
          <Badge variant="outline" className={intentBadge[intent as keyof typeof intentBadge] || "bg-gray-500/20 text-gray-500"}>
            {intent} intent
          </Badge>
        </CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="pb-2 space-y-4 animate-fade-in">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Secondary Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {secondaryKeywords.map((keyword, i) => (
                <Badge key={i} className="bg-primary/10 text-primary hover:bg-primary/20">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Semantic Terms</h4>
            <div className="flex flex-wrap gap-2">
              {semanticTerms.map((term, i) => (
                <Badge key={i} variant="outline" className="border-neon-blue/30 text-neon-blue">
                  {term}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Long-tail Variations</h4>
            <div className="flex flex-wrap gap-2">
              {longTailKeywords.map((keyword, i) => (
                <Badge key={i} variant="outline" className="border-neon-purple/30 text-neon-purple">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      )}

      <CardFooter className="pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto gap-1 hover:text-primary hover:bg-primary/10 transition-colors"
          onClick={handleUseKeyword}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Use Keyword</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
