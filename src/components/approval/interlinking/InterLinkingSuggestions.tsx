
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApproval } from '../context/ApprovalContext';
import { InterLinkingItem } from './InterLinkingItem';
import { FileText, Link as LinkIcon, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

interface InterLinkingSuggestionsProps {
  content: ContentItemType;
}

export const InterLinkingSuggestions: React.FC<InterLinkingSuggestionsProps> = ({ content }) => {
  const { interLinkingSuggestions } = useApproval();
  
  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-neon-blue/20 flex items-center justify-center">
            <LinkIcon className="h-5 w-5 text-neon-blue" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white/90">Interlinking Opportunities</h2>
            <p className="text-white/60 mt-1">
              Connect your content with other published articles to improve SEO and user navigation.
            </p>
          </div>
        </div>
      </motion.div>
      
      {interLinkingSuggestions.length > 0 ? (
        <motion.div 
          className="grid gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {interLinkingSuggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
            >
              <InterLinkingItem 
                suggestion={suggestion}
                sourceContent={content}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white/80">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                No Interlinking Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-blue-600/30 bg-blue-600/10">
                <FileText className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-200">
                  No interlinking opportunities found. This could be because there are no published articles with matching keywords or topics.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="font-medium text-white/80 mb-2">Tips to improve interlinking</h4>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-start gap-2">
                    <span className="bg-neon-blue/20 text-neon-blue h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <span>Create more content with related keywords</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-neon-blue/20 text-neon-blue h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <span>Add more specific keywords to this content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-neon-blue/20 text-neon-blue h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <span>Publish other draft articles to create linking opportunities</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
