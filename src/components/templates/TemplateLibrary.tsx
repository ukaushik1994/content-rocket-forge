
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, FileTemplate, Star, TrendingUp } from 'lucide-react';
import { useContentTemplates } from '@/contexts/ContentTemplatesContext';
import { templateService } from '@/services/templateService';
import { motion } from 'framer-motion';

export const TemplateLibrary = () => {
  const { state, dispatch } = useContentTemplates();

  useEffect(() => {
    // Initialize with default templates
    const templates = templateService.getDefaultTemplates();
    dispatch({ type: 'SET_TEMPLATES', payload: templates });
  }, [dispatch]);

  const categories = templateService.getTemplateCategories();

  const handleCategoryChange = (category: string) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
    const filtered = templateService.filterTemplates(
      state.templates, 
      category, 
      state.searchQuery
    );
    dispatch({ type: 'SET_FILTERED_TEMPLATES', payload: filtered });
  };

  const handleSearchChange = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    const filtered = templateService.filterTemplates(
      state.templates, 
      state.selectedCategory, 
      query
    );
    dispatch({ type: 'SET_FILTERED_TEMPLATES', payload: filtered });
  };

  const handleSelectTemplate = (template: any) => {
    dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: template });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'blog': return '📝';
      case 'landing-page': return '🚀';
      case 'social-media': return '📱';
      case 'email': return '📧';
      case 'ecommerce': return '🛒';
      case 'custom': return '🎨';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTemplate className="h-5 w-5" />
            Template Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={state.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={state.selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                  className="capitalize"
                >
                  {getCategoryIcon(category)} {category === 'all' ? 'All Templates' : category.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                state.selectedTemplate?.id === template.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {template.isCustom && (
                    <Badge variant="outline" className="text-xs">
                      Custom
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Used {template.usage} times</span>
                  </div>
                  {template.usage > 10 && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="h-3 w-3 fill-current" />
                      <span>Popular</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground">
                    <strong>Variables:</strong> {template.variables.length > 0 ? template.variables.join(', ') : 'None'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {state.filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileTemplate className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or create a custom template.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
