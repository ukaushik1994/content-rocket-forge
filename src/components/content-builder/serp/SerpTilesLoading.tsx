import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Search } from 'lucide-react';

interface SerpTilesLoadingProps {
  mainKeyword: string;
}

export const SerpTilesLoading: React.FC<SerpTilesLoadingProps> = ({ mainKeyword }) => {
  const loadingTiles = [
    { id: 'metrics', title: 'SEO Metrics' },
    { id: 'keywords', title: 'Keywords' },
    { id: 'questions', title: 'Questions' },
    { id: 'snippets', title: 'Featured Snippets' },
    { id: 'entities', title: 'Entities' },
    { id: 'headings', title: 'Headings' },
    { id: 'gaps', title: 'Content Gaps' },
    { id: 'stories', title: 'Top Stories' }
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">SERP Analysis Overview</h3>
            <p className="text-sm text-muted-foreground">
              Analyzing: <span className="text-primary font-medium">"{mainKeyword}"</span>
            </p>
          </div>
        </div>
      </div>

      {/* Loading Tiles */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {loadingTiles.map((tile) => (
          <motion.div
            key={tile.id}
            variants={item}
          >
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <LoadingSkeleton className="w-8 h-8 rounded-lg" />
                  <div className="flex-1">
                    <LoadingSkeleton className="w-24 h-4" />
                  </div>
                </div>
                <LoadingSkeleton className="w-full h-3 mt-2" lines={2} />
              </CardHeader>

              <CardContent className="pt-0">
                <div className="mb-4">
                  <LoadingSkeleton className="w-full h-3" lines={4} />
                </div>

                <div className="flex gap-2">
                  <LoadingSkeleton className="flex-1 h-8 rounded-md" />
                  <LoadingSkeleton className="w-8 h-8 rounded-md" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Loading Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="bg-background/60 backdrop-blur-xl border-border/50">
            <CardContent className="pt-4 pb-4 text-center">
              <LoadingSkeleton className="w-8 h-8 mx-auto mb-2" />
              <LoadingSkeleton className="w-16 h-3 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
};