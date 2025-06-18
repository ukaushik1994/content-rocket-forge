
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  X, 
  ExternalLink, 
  Book, 
  Video, 
  GraduationCap, 
  Code, 
  Play, 
  FileText, 
  TrendingUp, 
  FileCheck, 
  Link,
  GripVertical
} from 'lucide-react';
import { EnhancedSolution, EnhancedSolutionResource, RESOURCE_CATEGORIES, ResourceCategory } from '@/contexts/content-builder/types/enhanced-solution-types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ResourcesTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
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

export const ResourcesTab: React.FC<ResourcesTabProps> = ({
  formData,
  updateFormData
}) => {
  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    category: 'documentation' as ResourceCategory,
    description: ''
  });

  const resources = formData.resources || [];

  const addResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim()) {
      return;
    }

    const resource: EnhancedSolutionResource = {
      id: `resource-${Date.now()}`,
      title: newResource.title.trim(),
      url: newResource.url.trim(),
      category: newResource.category,
      description: newResource.description.trim() || undefined,
      order: resources.length,
      isValidated: false,
      validationStatus: 'pending'
    };

    updateFormData({
      resources: [...resources, resource]
    });

    setNewResource({
      title: '',
      url: '',
      category: 'documentation',
      description: ''
    });
  };

  const removeResource = (id: string) => {
    updateFormData({
      resources: resources.filter(r => r.id !== id)
    });
  };

  const updateResource = (id: string, updates: Partial<EnhancedSolutionResource>) => {
    updateFormData({
      resources: resources.map(r => 
        r.id === id ? { ...r, ...updates } : r
      )
    });
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const groupedResources = resources.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<ResourceCategory, EnhancedSolutionResource[]>);

  return (
    <div className="space-y-6">
      {/* Add New Resource */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Resource
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resource-title">Title *</Label>
              <Input
                id="resource-title"
                placeholder="e.g., Getting Started Guide"
                value={newResource.title}
                onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resource-category">Category</Label>
              <Select 
                value={newResource.category} 
                onValueChange={(value: ResourceCategory) => 
                  setNewResource(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_CATEGORIES.map((cat) => {
                    const Icon = getResourceIcon(cat.value);
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resource-url">URL *</Label>
            <Input
              id="resource-url"
              placeholder="https://example.com/documentation"
              value={newResource.url}
              onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resource-description">Description (Optional)</Label>
            <Input
              id="resource-description"
              placeholder="Brief description of this resource"
              value={newResource.description}
              onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          <Button 
            onClick={addResource}
            disabled={!newResource.title.trim() || !newResource.url.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </CardContent>
      </Card>

      {/* Resources List */}
      {Object.keys(groupedResources).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedResources).map(([category, categoryResources]) => {
            const categoryInfo = RESOURCE_CATEGORIES.find(c => c.value === category);
            const Icon = getResourceIcon(category as ResourceCategory);
            
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {categoryInfo?.label} ({categoryResources.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryResources.map((resource) => (
                      <div 
                        key={resource.id}
                        className="flex items-start gap-3 p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-muted">
                              <Icon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-medium truncate">{resource.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                                >
                                  {resource.url}
                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </a>
                              </div>
                              {resource.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {resource.description}
                                </p>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeResource(resource.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Link className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No resources added yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add helpful links to documentation, videos, and other resources
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
