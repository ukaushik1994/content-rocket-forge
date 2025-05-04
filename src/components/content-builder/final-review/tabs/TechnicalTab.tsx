
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FileText, Code, List } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TechnicalTabProps {
  documentStructure: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
    hasSingleH1: boolean;
    hasLogicalHierarchy: boolean;
  } | null;
  metaTitle: string | null;
  metaDescription: string | null;
  serpData: any;
}

export const TechnicalTab = ({
  documentStructure,
  metaTitle,
  metaDescription,
  serpData
}: TechnicalTabProps) => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Document Structure Analysis */}
      <motion.div variants={item}>
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              Document Structure Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {documentStructure ? (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
                  <div className="font-medium text-sm">Document Structure</div>
                  <div className="flex flex-wrap gap-2">
                    <div className={`px-3 py-1 text-xs rounded-full ${documentStructure.hasSingleH1 ? 'bg-green-500/20 text-green-600 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30'}`}>
                      {documentStructure.hasSingleH1 ? 'Single H1 Tag ✓' : 'Missing Single H1 Tag ✕'}
                    </div>
                    <div className={`px-3 py-1 text-xs rounded-full ${documentStructure.hasLogicalHierarchy ? 'bg-green-500/20 text-green-600 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30'}`}>
                      {documentStructure.hasLogicalHierarchy ? 'Logical Hierarchy ✓' : 'Incorrect Heading Hierarchy ✕'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Headings Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documentStructure.h1.length > 0 && (
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-xs font-semibold mb-2 text-purple-500 flex items-center">
                          <FileText className="h-3 w-3 mr-1" /> H1 Headings ({documentStructure.h1.length})
                        </div>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          {documentStructure.h1.map((heading, i) => (
                            <li key={`h1-${i}`} className="truncate">{heading}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {documentStructure.h2.length > 0 && (
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-xs font-semibold mb-2 text-blue-500 flex items-center">
                          <FileText className="h-3 w-3 mr-1" /> H2 Headings ({documentStructure.h2.length})
                        </div>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          {documentStructure.h2.map((heading, i) => (
                            <li key={`h2-${i}`} className="truncate">{heading}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {documentStructure.h3.length > 0 && (
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-xs font-semibold mb-2 text-cyan-500 flex items-center">
                          <FileText className="h-3 w-3 mr-1" /> H3 Headings ({documentStructure.h3.length})
                        </div>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          {documentStructure.h3.map((heading, i) => (
                            <li key={`h3-${i}`} className="truncate">{heading}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                <Code className="h-10 w-10 mb-3 mx-auto opacity-30" />
                <p>No document structure available. Please run a technical analysis.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Meta Information Technical Review */}
      <motion.div variants={item}>
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              Meta Information Technical Review
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Meta Title</div>
                  <div className="bg-card border rounded-md p-3">
                    <div className={`text-sm ${metaTitle && metaTitle.length > 60 ? 'text-red-500' : 'text-primary'}`}>
                      {metaTitle || 'No meta title set'}
                    </div>
                    {metaTitle && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Length: {metaTitle.length}/60 characters
                        {metaTitle.length > 60 && ' (Too long)'}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Meta Description</div>
                  <div className="bg-card border rounded-md p-3">
                    <div className={`text-sm ${metaDescription && metaDescription.length > 160 ? 'text-red-500' : 'text-primary'}`}>
                      {metaDescription || 'No meta description set'}
                    </div>
                    {metaDescription && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Length: {metaDescription.length}/160 characters
                        {metaDescription.length > 160 && ' (Too long)'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* SERP Data */}
      {serpData && Object.keys(serpData).length > 0 && (
        <motion.div variants={item}>
          <Card className="overflow-hidden shadow-lg">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
                SERP Analysis Data
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {serpData.topResults && serpData.topResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <List className="h-4 w-4 text-blue-500" /> 
                        Top Ranking Pages
                      </h4>
                      <div className="space-y-2">
                        {serpData.topResults.slice(0, 3).map((result: any, idx: number) => (
                          <div key={`result-${idx}`} className="bg-card border rounded-md p-3">
                            <div className="text-xs font-medium text-blue-600">
                              Position {result.position}: {result.title || 'No title'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 truncate">
                              {result.url || 'No URL'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {serpData.relatedSearches && serpData.relatedSearches.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Related Searches</h4>
                      <div className="flex flex-wrap gap-2">
                        {serpData.relatedSearches.slice(0, 5).map((search: any, idx: number) => (
                          <div key={`search-${idx}`} className="bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 text-xs">
                            {search.query || 'No query'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
