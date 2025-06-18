
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ExternalLink, 
  Building2, 
  Star, 
  Target, 
  AlertTriangle, 
  Users, 
  Link,
  Book,
  Video,
  GraduationCap,
  Code,
  Play,
  FileText,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { EnhancedSolution, ResourceCategory } from '@/contexts/content-builder/types/enhanced-solution-types';

interface PreviewTabProps {
  formData: Partial<EnhancedSolution>;
  logoPreview: string | null;
}

const getResourceIcon = (category: ResourceCategory) => {
  const iconMap = {
    documentation: Book,
    video: Video,
    tutorial: GraduationCap,
    api: Code,
    demo: Play,
    blog: FileText,
    'case-study': TrendingUp,
    whitepaper: FileCheck,
    other: Link
  };
  return iconMap[category] || Link;
};

export const PreviewTab: React.FC<PreviewTabProps> = ({
  formData,
  logoPreview
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const groupedResources = (formData.resources || []).reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<ResourceCategory, any[]>);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Solution Preview</h3>
        <p className="text-sm text-muted-foreground">
          This is how your solution will appear in the content builder and solution library
        </p>
      </div>

      {/* Main Solution Card Preview */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 rounded-xl border">
              {logoPreview ? (
                <AvatarImage 
                  src={logoPreview} 
                  alt="Solution logo"
                  className="object-cover rounded-xl"
                />
              ) : (
                <AvatarFallback className="rounded-xl bg-muted">
                  {formData.name ? getInitials(formData.name) : <Building2 className="h-8 w-8" />}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-lg truncate">
                    {formData.name || 'Solution Name'}
                  </h3>
                  <Badge variant="secondary" className="mt-1">
                    {formData.category || 'Business Solution'}
                  </Badge>
                </div>
                
                {formData.externalUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={formData.externalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              
              {formData.shortDescription && (
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {formData.shortDescription}
                </p>
              )}
              
              {formData.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {formData.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features and Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(formData.features && formData.features.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {formData.features.slice(0, 6).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {formData.features.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{formData.features.length - 6} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {(formData.benefits && formData.benefits.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {formData.benefits.slice(0, 6).map((benefit, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
                {formData.benefits.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{formData.benefits.length - 6} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Use Cases and Pain Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(formData.useCases && formData.useCases.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Use Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {formData.useCases.slice(0, 4).map((useCase, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{useCase}</span>
                  </li>
                ))}
                {formData.useCases.length > 4 && (
                  <li className="text-muted-foreground">
                    +{formData.useCases.length - 4} more use cases
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        {(formData.painPoints && formData.painPoints.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4" />
                Solves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {formData.painPoints.slice(0, 4).map((painPoint, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>{painPoint}</span>
                  </li>
                ))}
                {formData.painPoints.length > 4 && (
                  <li className="text-muted-foreground">
                    +{formData.painPoints.length - 4} more pain points
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Target Audience */}
      {(formData.targetAudience && formData.targetAudience.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Target Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.targetAudience.map((audience, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {audience}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {formData.resources && formData.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link className="h-4 w-4" />
              Resources ({formData.resources.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.resources.slice(0, 6).map((resource) => {
                const Icon = getResourceIcon(resource.category);
                return (
                  <div 
                    key={resource.id}
                    className="flex items-center gap-3 p-2 border border-border/50 rounded-lg"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{resource.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{resource.category.replace('-', ' ')}</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  </div>
                );
              })}
              {formData.resources.length > 6 && (
                <div className="flex items-center justify-center p-2 border border-dashed border-border/50 rounded-lg text-sm text-muted-foreground">
                  +{formData.resources.length - 6} more resources
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Empty State Message */}
      {(!formData.name && !formData.description && (!formData.features || formData.features.length === 0)) && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No content to preview yet</h3>
            <p className="text-sm text-muted-foreground">
              Fill in the basic information and features to see a preview of your solution
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
