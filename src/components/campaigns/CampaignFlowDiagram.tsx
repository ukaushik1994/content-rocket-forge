import { CampaignStrategy } from '@/types/campaign-types';

type TileId = 'summary' | 'content-mix' | 'effort' | 'audience' | 'seo' | 'distribution' | 'assets' | 'addons';
type TabType = 'workflow' | 'timeline' | 'dependencies';

interface CampaignFlowDiagramProps {
  tileId: TileId;
  tileData: CampaignStrategy;
  activeTab: TabType;
}

export const CampaignFlowDiagram = ({ tileId, tileData, activeTab }: CampaignFlowDiagramProps) => {
  const generateMermaidCode = (): string => {
    // Content Mix Tile
    if (tileId === 'content-mix') {
      if (activeTab === 'workflow') {
        const contentItems = tileData.contentMix.map((item, idx) => 
          `    A --> ${String.fromCharCode(66 + idx)}[${item.formatId}: ${item.count} pieces]`
        ).join('\n');
        
        return `graph TD
    A[Campaign Start]
${contentItems}
    style A fill:#8b5cf6,stroke:#a78bfa,color:#fff
`;
      }
      
      if (activeTab === 'timeline') {
        const items = tileData.contentMix.map((item, idx) => {
          const start = `2024-01-${String(idx * 5 + 1).padStart(2, '0')}`;
          return `    ${item.formatId} :${start}, 7d`;
        }).join('\n');
        
        return `gantt
    title Content Creation Timeline
    dateFormat YYYY-MM-DD
    section Content Production
${items}
`;
      }
      
      const deps = tileData.contentMix.map((item, idx) => 
        idx === 0 ? `    ${item.formatId}` : `      ${item.formatId}`
      ).join('\n');
      
      return `graph LR
    A[Strategy] --> B[Content Creation]
    B --> C{Distribution}
${deps}
`;
    }

    // Distribution Strategy Tile
    if (tileId === 'distribution') {
      if (activeTab === 'timeline' && tileData.distributionStrategy) {
        const channels = tileData.distributionStrategy.channels.map((channel, idx) => {
          const start = `2024-01-${String(idx * 3 + 1).padStart(2, '0')}`;
          return `    ${channel} :${start}, 14d`;
        }).join('\n');
        
        return `gantt
    title Distribution Timeline
    dateFormat YYYY-MM-DD
    section Channels
${channels}
`;
      }
      
      if (activeTab === 'dependencies' && tileData.distributionStrategy) {
        const channelNodes = tileData.distributionStrategy.channels.map((ch, idx) => 
          `    B --> ${String.fromCharCode(67 + idx)}[${ch}]`
        ).join('\n');
        
        return `graph TD
    A[Content Ready] --> B[Distribution Start]
${channelNodes}
    style A fill:#8b5cf6,stroke:#a78bfa,color:#fff
    style B fill:#3b82f6,stroke:#60a5fa,color:#fff
`;
      }
      
      return `graph LR
    A[Content] --> B[Scheduling]
    B --> C[Publishing]
    C --> D[Analytics]
    style A fill:#8b5cf6,stroke:#a78bfa,color:#fff
`;
    }

    // Audience Intelligence Tile
    if (tileId === 'audience') {
      if (activeTab === 'workflow' && tileData.audienceIntelligence) {
        const personas = tileData.audienceIntelligence.personas.slice(0, 3).join('\n      ');
        const painPoints = tileData.audienceIntelligence.painPoints.slice(0, 3).join('\n      ');
        
        return `mindmap
  root((Target Audience))
    Personas
      ${personas}
    Pain Points
      ${painPoints}
    Industry
      ${tileData.audienceIntelligence.industrySegments.join('\n      ')}
`;
      }
      
      return `graph TD
    A[Audience Research] --> B[Persona Development]
    B --> C[Messaging Strategy]
    C --> D[Content Creation]
    style A fill:#8b5cf6,stroke:#a78bfa,color:#fff
`;
    }

    // Content Effort Tile
    if (tileId === 'effort') {
      if (activeTab === 'timeline' && tileData.totalEffort) {
        const order = tileData.totalEffort.workflowOrder.map((format, idx) => {
          const start = `2024-01-${String(idx * 4 + 1).padStart(2, '0')}`;
          return `    Phase ${idx + 1} - ${format} :${start}, 5d`;
        }).join('\n');
        
        return `gantt
    title Content Creation Workflow
    dateFormat YYYY-MM-DD
    section Production
${order}
`;
      }
      
      return `graph LR
    A[Planning] --> B[Creation]
    B --> C[Review]
    C --> D[Publishing]
    style A fill:#8b5cf6,stroke:#a78bfa,color:#fff
`;
    }

    // Campaign Summary Tile
    if (tileId === 'summary') {
      return `graph LR
    A[Research & Planning] --> B[Strategy Development]
    B --> C[Content Creation]
    C --> D[Distribution]
    D --> E[Analytics & Optimization]
    style A fill:#8b5cf6,stroke:#a78bfa,color:#fff
    style E fill:#10b981,stroke:#34d399,color:#fff
`;
    }

    // SEO Intelligence Tile
    if (tileId === 'seo') {
      return `graph TD
    A[Keyword Research] --> B[Content Brief]
    B --> C[SEO Optimization]
    C --> D[Publishing]
    D --> E[Ranking Monitor]
    style A fill:#8b5cf6,stroke:#a78bfa,color:#fff
`;
    }

    // Asset Requirements Tile
    if (tileId === 'assets') {
      return `graph LR
    A[Asset Planning] --> B[Copy Creation]
    A --> C[Visual Design]
    B --> D[Final Assembly]
    C --> D
    style A fill:#8b5cf6,stroke:#a78bfa,color:#fff
`;
    }

    // Fallback
    return `graph TD
    A[Campaign Start] --> B[Execution]
    B --> C[Analysis]
    style A fill:#8b5cf6,stroke:#a78bfa,color:#fff
`;
  };

  const mermaidCode = generateMermaidCode();

  return (
    <div className="w-full h-full overflow-auto p-6">
      <div className="mermaid-diagram bg-card border border-border rounded-lg p-4">
        <pre className="text-sm">
          <code>{mermaidCode}</code>
        </pre>
      </div>
    </div>
  );
};
