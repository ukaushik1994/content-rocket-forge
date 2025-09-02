
import React, { memo } from 'react';
import { getFormatByIdOrDefault } from '../formats';

interface ContentViewerProps {
  content: string;
  formatId: string;
  selectedPersonas?: string[];
  availablePersonas?: any[];
}

const ContentViewer: React.FC<ContentViewerProps> = memo(({ 
  content, 
  formatId, 
  selectedPersonas = [], 
  availablePersonas = [] 
}) => {
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
              <div className="bg-black/80 p-4 rounded-lg space-y-2">
                <p className="text-center text-white font-bold uppercase">{topTextMatch ? topTextMatch[1] : ''}</p>
                <div className="border border-dashed border-gray-500 h-32 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">[{imageMatch[1]}]</p>
                </div>
                <p className="text-center text-white font-bold uppercase">{bottomTextMatch ? bottomTextMatch[1] : ''}</p>
              </div>
              
              {altCaptionMatch && (
                <div className="mt-4">
                  <p className="text-sm font-semibold">Alternative Caption:</p>
                  <p className="text-sm">{altCaptionMatch[1]}</p>
                </div>
              )}
              
              {contextMatch && (
                <div className="mt-2">
                  <p className="text-sm font-semibold">Context:</p>
                  <p className="text-sm">{contextMatch[1]}</p>
                </div>
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
                  <div key={index} className="border rounded-lg p-4">
                    <p className="font-semibold">{slideTitle}:</p>
                    <p>{slideContent.join(':').trim()}</p>
                  </div>
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
      <pre className="whitespace-pre-wrap font-mono text-sm">
        {content}
      </pre>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-muted/10 rounded-md p-4 mb-4">
      {/* Show persona context if multiple personas are selected */}
      {selectedPersonas.length > 1 && (
        <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-medium">
            Content generated for {selectedPersonas.length} personas
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This content has been tailored for multiple target personas
          </p>
        </div>
      )}
      {formatContent(content, formatId)}
    </div>
  );
});

ContentViewer.displayName = 'ContentViewer';

export default ContentViewer;
