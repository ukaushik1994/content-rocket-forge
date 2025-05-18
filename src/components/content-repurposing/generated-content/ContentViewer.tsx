
import React, { useEffect } from 'react';
import { getFormatByIdOrDefault } from '../formats';
import { motion } from 'framer-motion';

interface ContentViewerProps {
  content: string;
  formatId: string;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ content, formatId }) => {
  // Function to format special content types
  const formatContent = (content: string, formatId: string) => {
    if (formatId === 'meme') {
      try {
        // Extract meme components if in the expected format
        const imageMatch = content.match(/Image description: (.*?)(?:\n|$)/);
        const topTextMatch = content.match(/Top text: (.*?)(?:\n|$)/);
        const bottomTextMatch = content.match(/Bottom text: (.*?)(?:\n|$)/);
        const altCaptionMatch = content.match(/Alternative caption: (.*?)(?:\n|$)/);
        const contextMatch = content.match(/Context explanation: (.*?)(?:\n|$)/);
        
        if (imageMatch && (topTextMatch || bottomTextMatch)) {
          return (
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-black/80 p-4 rounded-lg space-y-2 shadow-lg"
              >
                <p className="text-center text-white font-bold uppercase">{topTextMatch ? topTextMatch[1] : ''}</p>
                <div className="border border-dashed border-gray-500 h-32 flex items-center justify-center bg-gray-800/50">
                  <p className="text-gray-400 text-sm">[{imageMatch[1]}]</p>
                </div>
                <p className="text-center text-white font-bold uppercase">{bottomTextMatch ? bottomTextMatch[1] : ''}</p>
              </motion.div>
              
              {altCaptionMatch && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-4"
                >
                  <p className="text-sm font-semibold text-white/80">Alternative Caption:</p>
                  <p className="text-sm text-white/70">{altCaptionMatch[1]}</p>
                </motion.div>
              )}
              
              {contextMatch && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-2"
                >
                  <p className="text-sm font-semibold text-white/80">Context:</p>
                  <p className="text-sm text-white/70">{contextMatch[1]}</p>
                </motion.div>
              )}
            </div>
          );
        }
      } catch (e) {
        console.error("Error parsing meme content:", e);
      }
    }
    
    if (formatId === 'carousel') {
      try {
        // Extract carousel slides if they follow the pattern "Slide X: content"
        const slides = content.split('\n\n').filter(line => line.trim().startsWith('Slide'));
        
        if (slides.length >= 3) {
          return (
            <div className="space-y-4">
              {slides.map((slide, index) => {
                const [slideTitle, ...slideContent] = slide.split(':');
                return (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="border border-white/10 rounded-lg p-4 bg-black/30 backdrop-blur-sm"
                  >
                    <p className="font-semibold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">{slideTitle}:</p>
                    <p className="text-white/80">{slideContent.join(':').trim()}</p>
                  </motion.div>
                );
              })}
            </div>
          );
        }
      } catch (e) {
        console.error("Error parsing carousel content:", e);
      }
    }
    
    // Default rendering for other content types or if parsing fails
    return (
      <pre className="whitespace-pre-wrap font-mono text-sm text-white/80 overflow-auto p-2">
        {content}
      </pre>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 overflow-auto bg-gradient-to-br from-black/30 to-black/10 rounded-md p-4 mb-4 border border-white/10 shadow-inner"
    >
      {formatContent(content, formatId)}
    </motion.div>
  );
};

export default ContentViewer;
