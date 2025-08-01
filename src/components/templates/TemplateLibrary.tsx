
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, FileText, Layout, List, HelpCircle, GitCompare, BookOpen, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContentTemplates } from '@/contexts/ContentTemplatesContext';

const templateTypes = [
  { id: 'blog', name: 'Blog Posts', icon: FileText, color: 'from-blue-500 to-purple-600' },
  { id: 'landing', name: 'Landing Pages', icon: Layout, color: 'from-green-500 to-teal-600' },
  { id: 'social', name: 'Social Media', icon: List, color: 'from-pink-500 to-rose-600' },
  { id: 'faq', name: 'FAQ', icon: HelpCircle, color: 'from-orange-500 to-red-600' },
  { id: 'comparison', name: 'Comparison', icon: GitCompare, color: 'from-purple-500 to-indigo-600' },
  { id: 'guide', name: 'How-to Guides', icon: BookOpen, color: 'from-teal-500 to-cyan-600' },
  { id: 'analysis', name: 'Analysis', icon: BarChart3, color: 'from-amber-500 to-orange-600' }
];

export const TemplateLibrary = () => {
  const { state, actions } = useContentTemplates();

  const filteredTemplates = state.selectedCategory === 'all' 
    ? state.templates 
    : state.templates.filter(template => template.category === state.selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={state.selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => actions.setSelectedCategory('all')}
        >
          All Templates
        </Button>
        {templateTypes.map(type => {
          const Icon = type.icon;
          return (
            <Button
              key={type.id}
              variant={state.selectedCategory === type.id ? 'default' : 'outline'}
              onClick={() => actions.setSelectedCategory(type.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {type.name}
            </Button>
          );
        })}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => {
          const typeInfo = templateTypes.find(t => t.id === template.category);
          const Icon = typeInfo?.icon || FileText;
          
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map(variable => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => actions.previewTemplate(template.id)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => actions.useTemplate(template.id)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No templates found in this category</p>
        </div>
      )}
    </div>
  );
};
