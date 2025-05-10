
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LightbulbIcon } from 'lucide-react';

export function ContentStrategyTips() {
  const tips = [
    {
      title: "Mix templates for comprehensive coverage",
      description: "Combine different content types to fully address your topic from multiple angles."
    },
    {
      title: "Include entities for better topical relevance",
      description: "Google recognizes entities related to your topic. Including them helps establish authority."
    },
    {
      title: "Address user intent with different formats",
      description: "Some users prefer step-by-step guides, while others want quick lists or in-depth analysis."
    },
    {
      title: "Refresh for better insights",
      description: "Use the refresh buttons to get new variations and insights for each content section."
    }
  ];

  return (
    <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 rounded-full">
            <LightbulbIcon className="h-4 w-4 text-amber-400" />
          </div>
          <CardTitle className="text-base text-white/90">Content Strategy Tips</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <div key={index} className="space-y-1">
              <h4 className="text-sm font-medium text-amber-300">{tip.title}</h4>
              <p className="text-xs text-white/70">{tip.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
