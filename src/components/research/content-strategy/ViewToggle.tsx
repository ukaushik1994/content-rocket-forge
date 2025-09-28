import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';

export type ViewMode = 'tiles' | 'rows';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <motion.div 
      className="flex items-center border border-border rounded-lg p-1"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant={view === 'tiles' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('tiles')}
        className={`h-8 px-3 ${
          view === 'tiles' 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'rows' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('rows')}
        className={`h-8 px-3 ${
          view === 'rows' 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <List className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};