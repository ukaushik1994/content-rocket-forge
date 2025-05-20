
import React from 'react';
import { Pencil, Lightbulb, Search, Copy, Sparkles, BarChart } from 'lucide-react';

interface StepIntroductionProps {
  title: string;
  description: string;
  icon: 'keyword' | 'content' | 'serp' | 'outline' | 'writing' | 'review';
}

export const StepIntroduction: React.FC<StepIntroductionProps> = ({
  title,
  description,
  icon
}) => {
  // Get the appropriate icon based on the step
  const renderIcon = () => {
    switch (icon) {
      case 'keyword':
        return <Search className="h-12 w-12 text-indigo-500" />;
      case 'content':
        return <Copy className="h-12 w-12 text-emerald-500" />;
      case 'serp':
        return <BarChart className="h-12 w-12 text-blue-500" />;
      case 'outline':
        return <Lightbulb className="h-12 w-12 text-amber-500" />;
      case 'writing':
        return <Pencil className="h-12 w-12 text-rose-500" />;
      case 'review':
        return <Sparkles className="h-12 w-12 text-purple-500" />;
      default:
        return <Lightbulb className="h-12 w-12 text-primary" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center max-w-2xl mx-auto mb-12">
      <div className="bg-primary/10 p-4 rounded-full">
        {renderIcon()}
      </div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
