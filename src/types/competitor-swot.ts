export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  competitiveScore: number;
  positioning: 'Leader' | 'Challenger' | 'Niche Player' | 'Emerging' | 'Disruptor';
  positioningRationale: string;
  recommendations: string[];
  marketContext: string;
}

export interface SWOTDiagnostics {
  processing_time_ms: number;
  ai_calls: number;
  strengths_count: number;
  weaknesses_count: number;
  opportunities_count: number;
  threats_count: number;
  recommendations_count: number;
  competitive_score: number;
  positioning: string;
}

export interface SWOTResponse {
  success: boolean;
  analysis?: SWOTAnalysis;
  diagnostics?: SWOTDiagnostics;
  error?: string;
}
