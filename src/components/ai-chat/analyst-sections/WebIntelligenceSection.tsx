import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystWebSearchData } from '@/types/enhancedChat';
import { Globe, ExternalLink, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

interface Props {
  webSearchResults: AnalystWebSearchData[];
  onSendMessage: (message: string) => void;
}

export const WebIntelligenceSection: React.FC<Props> = ({ webSearchResults, onSendMessage }) => {
  if (webSearchResults.length === 0) return null;

  return (
    <AnalystSectionWrapper
      number="11"
      label="Web Intelligence"
      headline={<>Live signals from the <span className="text-blue-400">web</span></>}
      delay={0.3}
    >
      <div className="space-y-2">
        {webSearchResults.map((ws, wsIdx) => (
          <Collapsible key={`ws-${wsIdx}`}>
            <CollapsibleTrigger className="w-full">
              <div className="glass-card glass-card-hover p-2.5 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Search className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-foreground/80 truncate">"{ws.query}"</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[9px] text-muted-foreground/50">{ws.results.length}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-1.5 ml-4 space-y-1.5">
                {ws.results.slice(0, 3).map((result, rIdx) => (
                  <a
                    key={rIdx}
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 glass-card glass-card-hover group"
                  >
                    <div className="flex items-start gap-1.5">
                      <ExternalLink className="w-3 h-3 text-blue-400/50 group-hover:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-foreground/80 line-clamp-1 group-hover:text-blue-400 transition-colors">{result.title}</p>
                        <p className="text-[9px] text-muted-foreground/60 line-clamp-2 mt-0.5">{result.snippet}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
      <button
        onClick={() => onSendMessage('[web-search] Search for more relevant information')}
        className="w-full text-[10px] text-blue-400/60 hover:text-blue-400 transition-colors py-1.5 glass-card rounded-lg text-center"
      >
        Search more →
      </button>
    </AnalystSectionWrapper>
  );
};
