import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  code: string;
  className?: string;
}

export const MermaidDiagram = ({ code, className = '' }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Mermaid with dark theme
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#8b5cf6',
        primaryTextColor: '#fff',
        primaryBorderColor: '#a78bfa',
        lineColor: '#6366f1',
        secondaryColor: '#3b82f6',
        tertiaryColor: '#10b981',
        background: '#1a1a1a',
        mainBkg: '#1a1a1a',
        secondaryBkg: '#262626',
        tertiaryBkg: '#171717',
        textColor: '#e5e7eb',
        fontSize: '14px',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      },
      flowchart: {
        curve: 'basis',
        padding: 20,
      },
      gantt: {
        fontSize: 12,
        barHeight: 30,
        barGap: 8,
      },
    });
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || !containerRef.current || !code) return;

    const renderDiagram = async () => {
      try {
        setError(null);
        const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Render the diagram
        const { svg } = await mermaid.render(uniqueId, code);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          
          // Make SVG responsive
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          }
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [code, isInitialized]);

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <p className="text-destructive text-sm mb-2">Failed to render diagram</p>
          <p className="text-muted-foreground text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`mermaid-container ${className}`}
      style={{ minHeight: '200px' }}
    />
  );
};
