/**
 * Convert Markdown to Wix Ricos (Rich Content) format
 */
export function markdownToRicos(markdown: string): any {
  const lines = markdown.split('\n');
  const nodes: any[] = [];

  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      nodes.push({
        type: 'PARAGRAPH',
        nodes: [{
          type: 'TEXT',
          textData: {
            text: currentParagraph.join('\n'),
            decorations: []
          }
        }]
      });
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    // Heading 1
    if (line.startsWith('# ')) {
      flushParagraph();
      nodes.push({
        type: 'HEADING',
        headingData: { level: 1 },
        nodes: [{
          type: 'TEXT',
          textData: {
            text: line.substring(2).trim(),
            decorations: []
          }
        }]
      });
    }
    // Heading 2
    else if (line.startsWith('## ')) {
      flushParagraph();
      nodes.push({
        type: 'HEADING',
        headingData: { level: 2 },
        nodes: [{
          type: 'TEXT',
          textData: {
            text: line.substring(3).trim(),
            decorations: []
          }
        }]
      });
    }
    // Heading 3
    else if (line.startsWith('### ')) {
      flushParagraph();
      nodes.push({
        type: 'HEADING',
        headingData: { level: 3 },
        nodes: [{
          type: 'TEXT',
          textData: {
            text: line.substring(4).trim(),
            decorations: []
          }
        }]
      });
    }
    // Empty line - flush paragraph
    else if (line.trim() === '') {
      flushParagraph();
    }
    // Regular text
    else {
      currentParagraph.push(line);
    }
  }

  // Flush any remaining paragraph
  flushParagraph();

  return {
    nodes,
    documentStyle: {}
  };
}
