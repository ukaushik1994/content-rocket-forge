
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface KeywordSearchInterfaceProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
  onCreateContent?: () => void;
  hasResults?: boolean;
}

export const KeywordSearchInterface: React.FC<KeywordSearchInterfaceProps> = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  loading,
  onCreateContent,
  hasResults
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-panel border-white/10 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <motion.div
              className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Search className="h-5 w-5 text-primary" />
            </motion.div>
            Advanced Keyword Research
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Enter your target keyword..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-10 h-12 bg-glass border-white/10 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && !loading && onSearch()}
              />
            </div>
            <Button 
              onClick={onSearch}
              disabled={loading || !searchTerm.trim()}
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-500 hover:from-blue-500 hover:to-primary px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Analyze SERP
                </>
              )}
            </Button>
          </div>

          {hasResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <Button 
                onClick={onCreateContent}
                variant="outline"
                size="lg"
                className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30 hover:border-green-500/50"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create Content from Research
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Real-time SERP</h3>
              <p className="text-sm text-muted-foreground">Live Google search results analysis</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-1">AI Insights</h3>
              <p className="text-sm text-muted-foreground">Content gaps and opportunities</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-1">Content Creation</h3>
              <p className="text-sm text-muted-foreground">Direct integration with builder</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
