
import React from 'react';
import { SerpAnalysisContainer, SerpAnalysisContainerProps } from './serp-analysis/SerpAnalysisContainer';

export interface SerpAnalysisPanelProps extends SerpAnalysisContainerProps {}

export function SerpAnalysisPanel(props: SerpAnalysisPanelProps) {
  return <SerpAnalysisContainer {...props} />;
}
