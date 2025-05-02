
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';

interface SerpTabContentProps {
  onUseKeyword: (keyword: string) => void;
  navigate: NavigateFunction;
}

const SerpTabContent = ({ onUseKeyword, navigate }: SerpTabContentProps) => {
  return (
    <Card className="glass-panel">
      <CardHeader className="pb-2 flex justify-between items-center">
        <CardTitle>SERP Analysis</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 hover:bg-accent/50 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter Results
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Top Competitor Content Structure</h3>
            <div className="space-y-4">
              {[
                { title: "Common H1 Pattern", content: "[Number] Best [Keyword] for [Target] in [Year]" },
                { title: "Average Word Count", content: "2,500 words" },
                { title: "Common Sections", content: "Introduction, Top Products, Comparison Table, Features, Pricing, FAQ" }
              ].map((item, i) => (
                <div key={i} className="space-y-1 hover:translate-x-1 transition-transform duration-200">
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground bg-glass p-2 rounded-md border border-white/10 hover:border-white/20 transition-colors">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              className="mt-4 hover:text-primary transition-colors"
              onClick={() => {
                navigate('/content');
                toast.success("Content template applied!");
              }}
            >
              <span>Use Content Structure</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">People Also Ask Questions</h3>
            <div className="space-y-2">
              {[
                "What is the easiest project management tool for beginners?",
                "Which project management software is best for remote teams?",
                "Is there a free project management tool?",
                "How much does project management software cost?",
                "What's better than Asana for project management?"
              ].map((question, i) => (
                <div 
                  key={i} 
                  className="p-3 bg-glass rounded-md border border-white/10 hover:border-white/20 transition-all duration-200 hover:translate-x-1 cursor-pointer"
                  onClick={() => {
                    onUseKeyword(question);
                  }}
                >
                  <p className="text-sm">
                    <span className="text-primary font-medium">Q:</span> {question}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SerpTabContent;
