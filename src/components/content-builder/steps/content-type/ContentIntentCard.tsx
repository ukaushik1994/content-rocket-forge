
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface ContentIntentCardProps {
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

export const ContentIntentCard: React.FC<ContentIntentCardProps> = ({
  title,
  description,
  icon,
  selected,
  onClick
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        selected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'hover:border-primary/50 hover:bg-accent/5'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{icon}</div>
            <h3 className="font-medium">{title}</h3>
          </div>
          {selected && (
            <CheckCircle className="text-primary h-5 w-5" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
