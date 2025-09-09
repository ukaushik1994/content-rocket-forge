import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Code, Star, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface SchemaType {
  type: string;
  status: 'implemented' | 'recommended' | 'optional';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface SchemaStructuredDataCardProps {
  score: number;
  currentSchemas?: string[];
  recommendedSchemas?: SchemaType[];
}

export const SchemaStructuredDataCard: React.FC<SchemaStructuredDataCardProps> = ({
  score,
  currentSchemas = [],
  recommendedSchemas = []
}) => {
  // Mock schema recommendations
  const defaultSchemas: SchemaType[] = [
    {
      type: 'Article',
      status: 'implemented',
      description: 'Basic article structure with headline, author, and publish date',
      impact: 'high'
    },
    {
      type: 'Organization',
      status: 'recommended',
      description: 'Company information for brand recognition in search results',
      impact: 'high'
    },
    {
      type: 'BreadcrumbList',
      status: 'recommended',
      description: 'Navigation breadcrumbs for better site structure understanding',
      impact: 'medium'
    },
    {
      type: 'FAQ',
      status: 'optional',
      description: 'Frequently asked questions for rich snippet opportunities',
      impact: 'medium'
    },
    {
      type: 'Review',
      status: 'optional',
      description: 'Customer reviews and ratings for enhanced SERP display',
      impact: 'low'
    }
  ];

  const allSchemas = recommendedSchemas.length > 0 ? recommendedSchemas : defaultSchemas;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'text-green-500';
      case 'recommended': return 'text-yellow-500';
      case 'optional': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'recommended': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'optional': return <Code className="h-4 w-4 text-blue-500" />;
      default: return <Code className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const implementedCount = allSchemas.filter(s => s.status === 'implemented').length;
  const recommendedCount = allSchemas.filter(s => s.status === 'recommended').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Schema & Structured Data
            <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"} className="ml-auto">
              {score}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Schema Summary */}
          <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-center space-y-1">
              <div className="text-lg font-bold text-green-500">{implementedCount}</div>
              <div className="text-xs text-muted-foreground">Implemented</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-lg font-bold text-yellow-500">{recommendedCount}</div>
              <div className="text-xs text-muted-foreground">Recommended</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-lg font-bold text-blue-500">{allSchemas.length - implementedCount - recommendedCount}</div>
              <div className="text-xs text-muted-foreground">Optional</div>
            </div>
          </div>

          {/* Rich Snippet Opportunities */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Star className="h-4 w-4" />
              Rich Snippet Opportunities
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 border rounded">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-xs">Event Dates</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="text-xs">Local Business</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-xs">Product Reviews</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded">
                <Code className="h-4 w-4 text-purple-500" />
                <span className="text-xs">How-to Guides</span>
              </div>
            </div>
          </div>

          {/* Schema Types */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Schema Implementation Status</h4>
            <div className="space-y-2">
              {allSchemas.slice(0, 4).map((schema, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(schema.status)}
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{schema.type}</div>
                      <div className="text-xs text-muted-foreground">{schema.description}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Badge variant={getImpactBadge(schema.impact)} className="text-xs">
                      {schema.impact} impact
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                Generate Schema
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                Test Markup
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                View JSON-LD
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};