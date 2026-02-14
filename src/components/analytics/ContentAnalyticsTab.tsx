import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ContentAnalyticsCard } from './ContentAnalyticsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Rocket, BookOpen, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';

interface ContentAnalyticsData {
  id: string;
  title: string;
  published_url?: string;
  keywords?: string[];
  created_at?: string;
  search_console_data?: {
    impressions: number;
    clicks: number;
    ctr: number;
    averagePosition: number;
  };
}

export const ContentAnalyticsTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openSettings } = useSettings();
  const [contentData, setContentData] = useState<ContentAnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApiKeys, setHasApiKeys] = useState(false);

  useEffect(() => {
    const fetchContentAnalytics = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Check if user has Search Console API key (use metadata view for security)
        const { data: apiKeys } = await supabase
          .from('api_keys_metadata')
          .select('service')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('service', 'google-search-console');

        setHasApiKeys(!!apiKeys && apiKeys.length > 0);

        if (!apiKeys || apiKeys.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch published content with analytics
        const { data: contentAnalytics, error } = await supabase
          .from('content_items')
          .select(`
            id,
            title,
            published_url,
            keywords,
            created_at,
            content_analytics!inner(search_console_data)
          `)
          .eq('user_id', user.id)
          .eq('status', 'published')
          .not('published_url', 'is', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching content analytics:', error);
          toast.error('Failed to load content analytics');
          return;
        }

        // Transform data
        const transformedData = (contentAnalytics || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          published_url: item.published_url,
          keywords: item.keywords,
          created_at: item.created_at,
          search_console_data: item.content_analytics?.[0]?.search_console_data || {
            impressions: 0,
            clicks: 0,
            ctr: 0,
            averagePosition: 0
          }
        }));

        setContentData(transformedData);
      } catch (error) {
        console.error('Error fetching content analytics:', error);
        toast.error('Failed to load content analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentAnalytics();
  }, [user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-panel">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-20 bg-white/10 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // No API keys configured
  if (!hasApiKeys) {
    return (
      <Card className="glass-panel bg-gradient-to-br from-amber-950/20 to-orange-950/20 border-amber-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-amber-400" />
            <div>
              <CardTitle className="text-amber-100">Search Console Setup Required</CardTitle>
              <CardDescription className="text-amber-200/70">
                Configure your Google Search Console API key to track content performance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-amber-200/60">
              Connect your Google Search Console to see impressions, clicks, CTR, and search positions for each piece of content.
            </p>
            <Button 
              variant="outline" 
              className="border-amber-500/30 hover:bg-amber-500/10"
              onClick={() => openSettings('api')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure API Keys
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No published content
  if (contentData.length === 0) {
    return (
      <Card className="glass-panel bg-gradient-to-br from-blue-950/20 to-purple-950/20 border-blue-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Rocket className="h-8 w-8 text-blue-400" />
            <div>
              <CardTitle className="text-blue-100">Ready to Track?</CardTitle>
              <CardDescription className="text-blue-200/70">
                Publish content and add published URLs to start seeing real analytics.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-blue-200/60">
              Once you publish content with URLs, we'll automatically fetch Search Console data including impressions, clicks, CTR, and search positions.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-blue-500/30 hover:bg-blue-500/10"
                onClick={() => navigate('/content-builder')}
              >
                <Rocket className="h-4 w-4 mr-2" />
                Create Content
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className="text-blue-200/70"
                onClick={() => window.open('https://creaiter.lovable.app/analytics', '_blank')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Content grid with analytics cards
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {contentData.map((content) => (
        <ContentAnalyticsCard
          key={content.id}
          contentId={content.id}
          title={content.title}
          publishedUrl={content.published_url}
          mainKeyword={content.keywords?.[0]}
          impressions={content.search_console_data?.impressions || 0}
          clicks={content.search_console_data?.clicks || 0}
          ctr={content.search_console_data?.ctr || 0}
          averagePosition={content.search_console_data?.averagePosition || 0}
          createdAt={content.created_at}
        />
      ))}
    </motion.div>
  );
};
