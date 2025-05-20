
import React, { memo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { getFormatByIdOrDefault } from '../formats';

interface ContentPreviewProps {
  content: string;
  formatId?: string;
}

const ContentPreview: React.FC<ContentPreviewProps> = memo(({ content, formatId }) => {
  const isMobile = useIsMobile();
  
  // Add safe content rendering - ensure content is never undefined
  const safeContent = content || '';
  const format = formatId ? getFormatByIdOrDefault(formatId) : null;
  
  // Format-specific styling
  const getFormatSpecificStyle = () => {
    if (!formatId) return {};
    
    switch (formatId) {
      case 'social-twitter':
        return 'bg-black/40 font-sans text-white border-t-4 border-blue-400';
      case 'social-linkedin':
        return 'bg-[#0077b5]/20 font-sans text-white/95 border-t-4 border-[#0077b5]';
      case 'social-facebook':
        return 'bg-[#1877f2]/20 font-sans text-white/95 border-t-4 border-[#1877f2]';
      case 'email':
        return 'bg-white/10 font-serif text-white/95 border-t-4 border-amber-400';
      case 'infographic':
        return 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30 font-sans text-white/95';
      case 'script':
        return 'bg-black/40 font-mono text-white/90 border-t-4 border-gray-400';
      case 'blog':
        return 'bg-slate-800/40 font-serif text-white/95 border-t-4 border-emerald-400';
      case 'glossary':
        return 'bg-emerald-900/20 font-sans text-white/90 border-t-4 border-emerald-500';
      case 'carousel':
        return 'bg-indigo-900/30 font-sans text-white/95 border-t-4 border-indigo-400';
      case 'meme':
        return 'bg-black/50 font-sans text-white border-t-4 border-pink-500';
      default:
        return 'bg-black/30 font-sans text-white/90';
    }
  };
  
  // Render content based on format type
  const renderFormattedContent = () => {
    if (!safeContent) {
      return <p className="text-white/50 italic">No content available</p>;
    }
    
    // Format-specific rendering
    if (formatId === 'meme') {
      try {
        const imageMatch = safeContent.match(/Image description: (.*?)(?:\n|$)/);
        const topTextMatch = safeContent.match(/Top text: (.*?)(?:\n|$)/);
        const bottomTextMatch = safeContent.match(/Bottom text: (.*?)(?:\n|$)/);
        
        if (imageMatch && (topTextMatch || bottomTextMatch)) {
          return (
            <div className="flex flex-col space-y-4 p-2">
              <div className="bg-black/80 p-4 rounded-lg overflow-hidden shadow-lg">
                {topTextMatch && (
                  <p className="text-center text-white font-bold uppercase text-lg mb-2">
                    {topTextMatch[1].trim()}
                  </p>
                )}
                <div className="border border-dashed border-gray-500 h-40 flex items-center justify-center 
                                transition-all duration-300 hover:border-primary/50 hover:bg-black/50">
                  <p className="text-gray-400 text-sm px-4 text-center">[{imageMatch[1].trim()}]</p>
                </div>
                {bottomTextMatch && (
                  <p className="text-center text-white font-bold uppercase text-lg mt-2">
                    {bottomTextMatch[1].trim()}
                  </p>
                )}
              </div>
              <pre className="text-xs text-white/70 bg-black/30 p-3 rounded-md custom-scrollbar">
                {safeContent}
              </pre>
            </div>
          );
        }
      } catch (e) {
        console.error("Error parsing meme format:", e);
      }
    } else if (formatId === 'carousel') {
      try {
        const slides = safeContent.split('\n\n')
          .filter(line => line.trim().startsWith('Slide'))
          .map(slide => {
            const [title, ...content] = slide.split(':');
            return { title, content: content.join(':').trim() };
          });
          
        if (slides.length >= 2) {
          return (
            <div className="flex flex-col space-y-3">
              {slides.map((slide, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="bg-white/5 rounded-md p-3 border border-white/10 hover:border-primary/30 transition-colors duration-200"
                >
                  <h4 className="text-purple-300 font-medium mb-1">{slide.title}:</h4>
                  <p className="text-white/80 text-sm">{slide.content}</p>
                </motion.div>
              ))}
            </div>
          );
        }
      } catch (e) {
        console.error("Error parsing carousel format:", e);
      }
    } else if (formatId === 'social-twitter' || formatId === 'social-linkedin' || formatId === 'social-facebook') {
      const platform = formatId.split('-')[1];
      const platformColors = {
        twitter: 'border-blue-400 bg-gradient-to-b from-gray-900 to-black',
        linkedin: 'border-[#0077b5] bg-gradient-to-b from-[#001e2d] to-[#001620]',
        facebook: 'border-[#1877f2] bg-gradient-to-b from-[#1d2839] to-[#111827]'
      };
      
      const platformColor = platformColors[platform as keyof typeof platformColors] || '';
      
      return (
        <div className={`rounded-xl p-4 ${platformColor} border shadow-lg`}>
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center">
              <span className="text-white font-bold">U</span>
            </div>
            <div className="ml-3">
              <p className="font-bold text-white">User Name</p>
              <p className="text-xs text-white/60">@username • Just now</p>
            </div>
          </div>
          <div className="text-sm whitespace-pre-wrap bg-white/5 p-3 rounded-md">
            {safeContent}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-white/50 px-2">
            <span>0 Comments</span>
            <span>0 Shares</span>
            <span>0 Likes</span>
          </div>
        </div>
      );
    } else if (formatId === 'email') {
      const subjectMatch = safeContent.match(/Subject: (.*?)(?:\n|$)/);
      const subject = subjectMatch ? subjectMatch[1] : 'No Subject';
      const bodyContent = safeContent.replace(/Subject: .*?\n/, '');
      
      return (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 shadow-lg">
          <div className="border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/30 mr-2"></div>
              <div>
                <p className="text-xs text-white/60">From: sender@example.com</p>
                <p className="text-xs text-white/60">To: recipient@example.com</p>
              </div>
            </div>
            <p className="text-sm text-white/60 mb-1">Subject:</p>
            <p className="font-medium text-white">{subject}</p>
          </div>
          <div className="whitespace-pre-wrap text-sm text-white/90 bg-white/5 p-3 rounded-md">
            {bodyContent}
          </div>
        </div>
      );
    } else if (formatId === 'glossary') {
      try {
        const terms = safeContent.split('\n\n')
          .filter(line => line.includes(':'))
          .map(term => {
            const [name, ...definition] = term.split(':');
            return { term: name.trim(), definition: definition.join(':').trim() };
          });
          
        if (terms.length > 0) {
          return (
            <div className="flex flex-col space-y-4">
              {terms.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="bg-white/5 rounded-md p-3 border-l-2 border-green-500 hover:bg-white/10 transition-colors duration-200"
                >
                  <h4 className="text-green-300 font-medium">{item.term}:</h4>
                  <p className="text-white/80 text-sm mt-1">{item.definition}</p>
                </motion.div>
              ))}
            </div>
          );
        }
      } catch (e) {
        console.error("Error parsing glossary format:", e);
      }
    }
    
    // Default rendering for other formats
    return (
      <pre className={`whitespace-pre-wrap text-xs sm:text-sm p-3 sm:p-4 rounded-lg border border-white/10 
                    overflow-x-auto ${getFormatSpecificStyle()} shadow-lg transition-all duration-300 hover:border-primary/30`}>
        {safeContent}
      </pre>
    );
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.05 }}
      className="flex-1 px-3 sm:px-5 py-4 sm:py-6 overflow-hidden"
    >
      <ScrollArea className={`${isMobile ? 'h-[200px]' : 'h-[calc(min(50vh,400px))]'} w-full pr-2 custom-scrollbar`}>
        <div className="rounded-md text-white/90">
          {renderFormattedContent()}
        </div>
      </ScrollArea>
    </motion.div>
  );
});

ContentPreview.displayName = 'ContentPreview';

export default ContentPreview;
