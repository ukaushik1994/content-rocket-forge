import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { EnhancedSolutionCard } from './EnhancedSolutionCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, PlusCircle, Shuffle, Wand2 } from 'lucide-react';

interface EnhancedSolutionGridProps {
  solutions: EnhancedSolution[];
  onEdit: (solution: EnhancedSolution) => void;
  onDelete: (solution: EnhancedSolution) => void;
  onUseInContent: (solution: EnhancedSolution) => void;
  onAddNew: () => void;
  onAutofillFromDoc: () => void;
  isRefreshing?: boolean;
}

export const EnhancedSolutionGrid: React.FC<EnhancedSolutionGridProps> = ({
  solutions,
  onEdit,
  onDelete,
  onUseInContent,
  onAddNew,
  onAutofillFromDoc,
  isRefreshing = false
}) => {
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [detailSolution, setDetailSolution] = useState<EnhancedSolution | null>(null);

  const filteredSolutions = solutions;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="space-y-6">
      {/* Filters and view options */}
      <div className="glass-panel border border-border/60 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
          <TabsList className="bg-background/20 backdrop-blur-sm border border-border/20 w-full md:w-auto">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary/20">
              All Offerings
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-3">
          {isRefreshing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Syncing…</span>
            </div>
          )}
          <Button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} variant="outline" size="sm">
            {view === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button onClick={onAddNew} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Offering
          </Button>
        </div>
      </div>
      
      {/* Solutions grid */}
      {solutions.length > 0 ? (
        <motion.div
          className={`grid grid-cols-1 ${view === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'} gap-6`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredSolutions.map(solution => (
            <EnhancedSolutionCard
              key={solution.id}
              solution={solution}
              onEdit={() => onEdit(solution)}
              onDelete={() => onDelete(solution)}
              onUseInContent={() => onUseInContent(solution)}
              onViewDetail={() => setDetailSolution(solution)}
            />
          ))}
        </motion.div>
      ) : (
        <EmptySolutionsState onAddNew={onAddNew} />
      )}

      {/* Detail Dialog */}
      <SolutionDetailDialog
        solution={detailSolution}
        open={!!detailSolution}
        onOpenChange={(open) => { if (!open) setDetailSolution(null); }}
        onEdit={() => {
          if (detailSolution) {
            onEdit(detailSolution);
            setDetailSolution(null);
          }
        }}
        onUseInContent={() => {
          if (detailSolution) {
            onUseInContent(detailSolution);
            setDetailSolution(null);
          }
        }}
      />
    </div>
  );
};

// Empty state component
const EmptySolutionsState: React.FC<{ onAddNew: () => void }> = ({ onAddNew }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col items-center justify-center py-16 text-center space-y-6"
    >
      <motion.div
        className="rounded-full bg-primary/20 p-6 mb-2"
        whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.05 }}
        transition={{ duration: 0.5 }}
      >
        <Shuffle className="w-12 h-12 text-primary" />
      </motion.div>
      <h3 className="text-2xl font-bold text-foreground">Start Creating Offerings</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Add your first business offering to start generating content that highlights your products and services.
      </p>
      <Button onClick={onAddNew} size="lg">
        <PlusCircle className="mr-2 h-5 w-5" />
        Add Your First Offering
      </Button>
    </motion.div>
  );
};