
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Users } from 'lucide-react';
import { ContentFormat } from '../formats';

interface FormatInfoCardProps {
  format: ContentFormat;
  isRecommended?: boolean;
  estimatedTime?: string;
  targetAudience?: string;
}

export const FormatInfoCard: React.FC<FormatInfoCardProps> = ({
  format,
  isRecommended = false,
  estimatedTime = '1-2 min',
  targetAudience = 'General audience'
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{format.name}</CardTitle>
          {isRecommended && (
            <Badge variant="default" className="text-xs">
              Recommended
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          {format.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{estimatedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{targetAudience}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>High engagement format</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormatInfoCard;
