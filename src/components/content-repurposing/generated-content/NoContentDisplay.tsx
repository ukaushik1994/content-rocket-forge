
import React from 'react';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const NoContentDisplay: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full text-center p-12"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-gradient-to-br from-neon-purple/10 to-neon-blue/10 p-8 rounded-full mb-4"
      >
        <FileText className="h-12 w-12 text-neon-purple/60" />
      </motion.div>
      <motion.h3 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-xl font-medium bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent mb-2"
      >
        No Content Generated Yet
      </motion.h3>
      <motion.p 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-muted-foreground max-w-sm"
      >
        Select content formats and generate your repurposed content to see the results here
      </motion.p>
    </motion.div>
  );
};

export default NoContentDisplay;
