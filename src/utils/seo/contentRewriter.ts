
/**
 * Content rewriting utilities based on SEO recommendations
 */

/**
 * Generate rewritten content preview based on recommendation type
 */
export const generateRewrittenContent = (
  content: string,
  recommendation: string,
  improvementType: string,
  mainKeyword: string
): string => {
  if (!content) return '';
  
  try {
    let newContent = content;
    const lowerRec = recommendation.toLowerCase();
    
    if (improvementType === 'keyword' || lowerRec.includes('keyword')) {
      // Add or reduce keywords based on recommendation
      if (lowerRec.includes('increase usage')) {
        // Add the keyword more throughout the text
        const paragraphs = content.split('\n\n');
        newContent = paragraphs.map((para, i) => {
          // Add keyword to paragraphs that don't have it
          if (!para.toLowerCase().includes(mainKeyword.toLowerCase()) && i % 2 === 0 && para.length > 100) {
            const sentences = para.split('. ');
            if (sentences.length > 1) {
              sentences[1] = sentences[1].replace(/^/, `When considering ${mainKeyword}, `);
              return sentences.join('. ');
            }
          }
          return para;
        }).join('\n\n');
        
        // Add to heading if possible
        if (!newContent.toLowerCase().includes(`# ${mainKeyword.toLowerCase()}`)) {
          const lines = newContent.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('# ')) {
              lines[i] = lines[i].replace('# ', `# ${mainKeyword}: `);
              break;
            }
          }
          newContent = lines.join('\n');
        }
      } else if (lowerRec.includes('reduce usage')) {
        // Replace some instances of the keyword with synonyms or pronouns
        const regex = new RegExp(`\\b${mainKeyword}\\b`, 'gi');
        let count = 0;
        newContent = content.replace(regex, (match) => {
          count++;
          // Replace every other occurrence
          return count % 2 === 0 ? 'this topic' : match;
        });
      }
    } else if (improvementType === 'readability' || lowerRec.includes('sentence') || lowerRec.includes('paragraph')) {
      if (lowerRec.includes('sentences are too long')) {
        // Break long sentences into shorter ones
        newContent = content.replace(/([.!?])\s+/g, '$1\n');
        
        // Further break very long sentences by adding periods
        newContent = newContent.split('\n').map(line => {
          if (line.split(' ').length > 25) {
            // Find a good spot to break the sentence
            const words = line.split(' ');
            let result = '';
            let chunk = '';
            
            for (let i = 0; i < words.length; i++) {
              chunk += (i > 0 ? ' ' : '') + words[i];
              if (i > 0 && i % 15 === 0 && 
                  !chunk.endsWith('.') && !chunk.endsWith('!') && !chunk.endsWith('?')) {
                result += chunk + '. ';
                chunk = '';
              }
            }
            return result + chunk;
          }
          return line;
        }).join('\n');
        
      } else if (lowerRec.includes('paragraphs are too long')) {
        // Break long paragraphs into shorter ones
        const paragraphs = content.split('\n\n');
        newContent = paragraphs.map(para => {
          // If paragraph has more than 100 words, break it
          if (para.split(' ').length > 100) {
            const sentences = para.split(/(?<=[.!?])\s+/);
            let result = '';
            let chunk = '';
            
            for (let i = 0; i < sentences.length; i++) {
              chunk += (i > 0 ? ' ' : '') + sentences[i];
              if (i > 0 && i % 3 === 0) {  // Break every 3 sentences
                result += chunk + '\n\n';
                chunk = '';
              }
            }
            return result + chunk;
          }
          return para;
        }).join('\n\n');
      }
    } else if (improvementType === 'structure' || lowerRec.includes('heading') || lowerRec.includes('h2')) {
      if (lowerRec.includes('use headings')) {
        // Add headings to structure content
        const paragraphs = content.split('\n\n');
        if (paragraphs.length > 3) {
          // Add a heading before the third paragraph if none exists
          if (!paragraphs[2].startsWith('#')) {
            const heading = `## Key Points About ${mainKeyword}`;
            paragraphs.splice(2, 0, heading);
          }
          
          // Add another heading later in the content
          if (paragraphs.length > 6 && !paragraphs[5].startsWith('#')) {
            const heading = `## Considerations for ${mainKeyword}`;
            paragraphs.splice(5, 0, heading);
          }
          
          newContent = paragraphs.join('\n\n');
        }
      }
    }
    
    return newContent;
  } catch (error) {
    console.error('Error generating content rewrite:', error);
    return content;
  }
};

/**
 * Determine the type of improvement based on recommendation text
 */
export const getImprovementType = (recommendation: string): 'keyword' | 'readability' | 'structure' | 'general' => {
  const lowerRec = recommendation.toLowerCase();
  
  if (lowerRec.includes('keyword') || lowerRec.includes('density')) {
    return 'keyword';
  } else if (lowerRec.includes('sentence') || lowerRec.includes('paragraph') || 
             lowerRec.includes('readability')) {
    return 'readability';
  } else if (lowerRec.includes('heading') || lowerRec.includes('structure') || 
             lowerRec.includes('h2') || lowerRec.includes('h3')) {
    return 'structure';
  } else {
    return 'general';
  }
};
