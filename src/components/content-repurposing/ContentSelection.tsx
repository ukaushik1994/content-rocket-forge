
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Filter, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentSelectionProps {
  contentItems: ContentItemType[];
  onSelectContent: (contentId: string) => void;
}

export const ContentSelection: React.FC<ContentSelectionProps> = ({
  contentItems,
  onSelectContent
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  
  // Filter content items based on search query
  const filteredItems = contentItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-md border border-white/10">
      <CardHeader className="border-b border-white/10 bg-black/30">
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-neon-purple animate-pulse" />
          Available Content
        </CardTitle>
        <CardDescription>Select content to transform into different formats</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {contentItems.length === 0 ? (
          <div className="text-center p-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-white/70" />
            </div>
            <p className="text-muted-foreground mb-6">No content available to repurpose</p>
            <Button onClick={() => navigate('/content-builder')} className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90">
              Create New Content
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{contentItems.length} items available</p>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search content..." 
                    className="pl-9 bg-black/30 border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="border-white/10">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4">
              {filteredItems.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  className="card-3d"
                >
                  <Card 
                    key={item.id} 
                    className="cursor-pointer hover:bg-accent/5 overflow-hidden backdrop-blur-sm bg-black/30 border border-white/10 transition-all duration-200"
                    onClick={() => onSelectContent(item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <h3 className="font-medium text-white">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {item.content?.substring(0, 120)}...
                        </p>
                        <div className="flex justify-end mt-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-neon-purple hover:text-neon-blue hover:bg-white/5"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectContent(item.id);
                            }}
                          >
                            Select for Repurposing →
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentSelection;
