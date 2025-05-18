
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, PenSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface EmptyContentStateProps {
  message?: string;
  viewType?: 'new' | 'repurposed';
  searchQuery?: string;
}

const EmptyContentState: React.FC<EmptyContentStateProps> = ({ 
  message,
  viewType = 'new',
  searchQuery = ''
}) => {
  const navigate = useNavigate();
  
  // Show search-specific empty state if there's a search query
  if (searchQuery) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-8 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 flex items-center justify-center mb-4">
          <Search className="h-6 w-6 text-neon-purple" />
        </div>
        
        <h3 className="text-lg font-semibold text-white">
          No matches found
        </h3>
        
        <p className="text-muted-foreground mt-2 mb-4 max-w-xs">
          No content matches your search query. Try a different search term.
        </p>
      </motion.div>
    );
  }
  
  const getEmptyStateMessage = () => {
    if (message) return message;
    
    if (viewType === 'new') {
      return "No content items available to repurpose";
    }
    return "No repurposed content yet";
  };
  
  const getDescription = () => {
    if (viewType === 'new') {
      return "Create content in the content editor or repository first, then repurpose it for different formats and platforms.";
    }
    return "Select content from the 'New Content' tab to transform it into different formats.";
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 flex items-center justify-center mb-4">
        <FileText className="h-6 w-6 text-neon-purple" />
      </div>
      
      <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
        {getEmptyStateMessage()}
      </h3>
      
      <p className="text-muted-foreground mt-2 mb-4 max-w-xs">
        {getDescription()}
      </p>
      
      <Button 
        onClick={() => navigate('/content')}
        className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90"
      >
        <PenSquare className="mr-2 h-4 w-4" />
        Create New Content
      </Button>
    </motion.div>
  );
};

export default EmptyContentState;
