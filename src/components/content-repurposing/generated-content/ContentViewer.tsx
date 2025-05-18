
import React from 'react';
import { getFormatByIdOrDefault } from '../formats';
import { motion } from 'framer-motion';

interface ContentViewerProps {
  content: string;
  formatId: string;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ content, formatId }) => {
  // Function to format special content types
  const formatContent = (content: string, formatId: string) => {
    const format = getFormatByIdOrDefault(formatId);
    
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-black/80 p-4 rounded-lg space-y-2"
              >
                <p className="text-center text-white font-bold uppercase">{topTextMatch ? topTextMatch[1] : ''}</p>
                <div className="border border-dashed border-gray-500 h-32 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">[{imageMatch[1]}]</p>
                </div>
                <p className="text-center text-white font-bold uppercase">{bottomTextMatch ? bottomTextMatch[1] : ''}</p>
              </motion.div>
              
              {altCaptionMatch && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="mt-4"
                >
                  <p className="text-sm font-semibold">Alternative Caption:</p>
                  <p className="text-sm">{altCaptionMatch[1]}</p>
                </motion.div>
              )}
              
              {contextMatch && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="mt-2"
                >
                  <p className="text-sm font-semibold">Context:</p>
                  <p className="text-sm">{contextMatch[1]}</p>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="border border-white/10 rounded-lg p-4 bg-black/30"
                  >
                    <p className="font-semibold text-white/80">{slideTitle}:</p>
                    <p className="mt-1 text-white/70">{slideContent.join(':').trim()}</p>
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
    
    // Format social media posts with special styling
    if (formatId.startsWith('social-')) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-black/40 rounded-lg border border-white/10 p-4"
        >
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-xs font-bold">@</span>
            </div>
            <div className="ml-2">
              <p className="text-sm font-semibold">User</p>
              <p className="text-xs text-gray-400">{format.name}</p>
            </div>
          </div>
          <div className="space-y-2">
            {content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-sm">{paragraph}</p>
            ))}
          </div>
        </motion.div>
      );
    }
    
    // Format email with special styling
    if (formatId === 'email') {
      const subjectMatch = content.match(/Subject: (.*?)(?:\n|$)/);
      const bodyContent = content.replace(/Subject: (.*?)(?:\n|$)/, '').trim();
      
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/5 rounded-lg border border-white/10"
        >
          <div className="border-b border-white/10 p-4">
            <p className="text-sm font-semibold">Subject: <span className="font-normal text-white/90">{subjectMatch ? subjectMatch[1] : 'No Subject'}</span></p>
            <div className="flex text-xs text-gray-400 mt-2">
              <span className="mr-2">From: content@example.com</span>
              <span>To: recipient@example.com</span>
            </div>
          </div>
          <div className="p-4">
            <div className="prose prose-sm prose-invert max-w-none">
              {bodyContent.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-2 text-sm">{paragraph}</p>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }
    
    // Default rendering for other content types or if parsing fails
    return (
      <pre className="whitespace-pre-wrap font-mono text-sm p-4 bg-black/30 rounded-md border border-white/10 overflow-auto">
        {content}
      </pre>
    );
  };

  return (
    <motion.div
      key={formatId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-auto bg-muted/10 rounded-md p-4 mb-4"
    >
      {formatContent(content, formatId)}
    </motion.div>
  );
};

export default ContentViewer;
