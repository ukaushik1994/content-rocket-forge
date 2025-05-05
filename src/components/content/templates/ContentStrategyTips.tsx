
import React from 'react';
import { Lightbulb, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export const ContentStrategyTips: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="pt-6 mt-4 border-t border-white/10"
    >
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <h4 className="text-sm font-medium">Content Strategy Tips</h4>
        </div>
        
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <CheckSquare className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Use keywords from SERP analysis in headings (H2, H3) for better ranking</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckSquare className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Include related keywords throughout your content for semantic relevance</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckSquare className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Add a FAQ section using "People Also Ask" questions to target featured snippets</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckSquare className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Use tables, lists, and structured data to increase chances of rich snippets</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
};
