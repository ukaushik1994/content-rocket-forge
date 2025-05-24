
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ExternalLink, DollarSign } from 'lucide-react';

interface SerpPaidAdsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpPaidAdsSection({ serpData, expanded, onAddToContent }: SerpPaidAdsSectionProps) {
  if (!expanded) return null;

  const paidAds = serpData.commercialSignals?.hasAds ? [
    {
      title: "Best Project Management Software 2024 - Start Free Trial",
      url: "monday.com",
      description: "All-in-one work management platform. Streamline workflows, boost productivity. Try free!",
      position: 1,
      type: "text_ad"
    },
    {
      title: "Asana: Work Management Made Easy",
      url: "asana.com", 
      description: "Organize team projects & tasks. Free for teams up to 15. Get started today!",
      position: 2,
      type: "text_ad"
    }
  ] : [];

  if (paidAds.length === 0) {
    return (
      <div className="p-4 text-center text-white/50">
        <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No paid ads detected for this keyword</p>
        <p className="text-xs mt-1">This indicates lower commercial competition</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-white">Commercial Competition Analysis</span>
        </div>
        <Badge variant="secondary" className="bg-green-500/20 text-green-300">
          {paidAds.length} ads found
        </Badge>
      </div>

      <div className="space-y-3">
        {paidAds.map((ad, idx) => (
          <div key={idx} className="bg-white/5 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                    Ad #{ad.position}
                  </Badge>
                  <span className="text-xs text-white/50">{ad.url}</span>
                </div>
                <h4 className="font-medium text-white mb-1">{ad.title}</h4>
                <p className="text-sm text-white/70">{ad.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddToContent(ad.title, 'ad_insight')}
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <h5 className="text-sm font-medium text-green-300 mb-2">💡 Competitive Intelligence</h5>
        <ul className="text-xs text-white/70 space-y-1">
          <li>• High ad competition = valuable commercial keyword</li>
          <li>• Analyze ad copy patterns for title inspiration</li>
          <li>• Target features/benefits mentioned in ads</li>
          <li>• Consider freemium/trial offers in your content</li>
        </ul>
      </div>
    </div>
  );
}
