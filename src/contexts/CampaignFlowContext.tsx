import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CampaignStrategy } from '@/types/campaign-types';

type TileId = 'summary' | 'content-mix' | 'effort' | 'audience' | 'seo' | 'distribution' | 'assets' | 'addons';

interface CampaignFlowContextType {
  selectedTile: TileId | null;
  selectedTileData: CampaignStrategy | null;
  isFlowPanelOpen: boolean;
  openFlowPanel: (tileId: TileId, data: CampaignStrategy) => void;
  closeFlowPanel: () => void;
}

const CampaignFlowContext = createContext<CampaignFlowContextType | undefined>(undefined);

export function CampaignFlowProvider({ children }: { children: ReactNode }) {
  const [selectedTile, setSelectedTile] = useState<TileId | null>(null);
  const [selectedTileData, setSelectedTileData] = useState<CampaignStrategy | null>(null);
  const [isFlowPanelOpen, setIsFlowPanelOpen] = useState(false);

  const openFlowPanel = (tileId: TileId, data: CampaignStrategy) => {
    setSelectedTile(tileId);
    setSelectedTileData(data);
    setIsFlowPanelOpen(true);
  };

  const closeFlowPanel = () => {
    setIsFlowPanelOpen(false);
    setTimeout(() => {
      setSelectedTile(null);
      setSelectedTileData(null);
    }, 300);
  };

  return (
    <CampaignFlowContext.Provider
      value={{
        selectedTile,
        selectedTileData,
        isFlowPanelOpen,
        openFlowPanel,
        closeFlowPanel,
      }}
    >
      {children}
    </CampaignFlowContext.Provider>
  );
}

export function useCampaignFlow() {
  const context = useContext(CampaignFlowContext);
  if (context === undefined) {
    throw new Error('useCampaignFlow must be used within a CampaignFlowProvider');
  }
  return context;
}
