
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, MousePointer } from 'lucide-react';

const SelectFormatDisplay: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full p-8 text-center"
    >
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <MousePointer className="h-10 w-10 text-primary/80" />
      </div>
      <h3 className="text-xl font-medium mb-2 text-white">Select a Format</h3>
      <p className="text-white/60 max-w-md">
        Choose one of the generated content formats from the format selector above to view the content.
      </p>
    </motion.div>
  );
};

export default SelectFormatDisplay;
