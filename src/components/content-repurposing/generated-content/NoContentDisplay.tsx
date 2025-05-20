
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, MoveRight } from 'lucide-react';

const NoContentDisplay: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full p-8 text-center"
    >
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <FileText className="h-12 w-12 text-primary/80" />
      </div>
      <h3 className="text-xl font-medium mb-2 text-white">No Content Generated Yet</h3>
      <p className="text-white/60 max-w-md mb-6">
        Select content formats from the left panel and click 'Generate' to create content in multiple formats.
      </p>
      <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full">
        <span>Select formats</span>
        <MoveRight className="h-4 w-4" />
        <span>Generate</span>
        <MoveRight className="h-4 w-4" />
        <span>Review</span>
      </div>
    </motion.div>
  );
};

export default NoContentDisplay;
