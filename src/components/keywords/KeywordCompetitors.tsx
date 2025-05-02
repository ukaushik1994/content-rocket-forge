
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface KeywordCompetitorsProps {
  onUseKeyword?: (keyword: string) => void;
}

export function KeywordCompetitors({ onUseKeyword }: KeywordCompetitorsProps) {
  const [competitors] = useState([
    { name: "Competitor A", url: "competitora.com", keywords: ["marketing automation", "email marketing", "CRM software"] },
    { name: "Competitor B", url: "competitorb.com", keywords: ["content marketing", "SEO tools", "analytics platform"] },
    { name: "Competitor C", url: "competitorc.com", keywords: ["digital marketing", "lead generation", "marketing campaign"] }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter competitor website..."
            className="pl-9 bg-glass border-white/10 focus:border-white/30 transition-colors"
          />
        </div>
        <Button 
          variant="outline"
          className="gap-1 hover:bg-accent/50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {competitors.map((competitor, index) => (
          <Card key={index} className="bg-background/50 border border-white/10 hover:shadow-neon transition-all duration-300">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-1">{competitor.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{competitor.url}</p>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Top Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {competitor.keywords.map((keyword, i) => (
                  <Badge 
                    key={i} 
                    className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer hover:scale-105"
                    onClick={() => onUseKeyword && onUseKeyword(keyword)}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
