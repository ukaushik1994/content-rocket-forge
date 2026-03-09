import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { Loader2, Search, FileText, Calendar, Target, ChevronDown } from 'lucide-react';
import { RepositoryCard } from './RepositoryCard';
import { ContentItemType } from '@/contexts/content/types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface CampaignWithContent {
  id: string;
  name: string;
  status: string;
  created_at: string;
  content_items: ContentItemType[];
}

interface CampaignContentTabProps {
  onOpenDetailView: (content: ContentItemType) => void;
}

export const CampaignContentTab = ({ onOpenDetailView }: CampaignContentTabProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignIdFromUrl = searchParams.get('campaign');
  
  const [campaigns, setCampaigns] = useState<CampaignWithContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCampaigns, setExpandedCampaigns] = useState<string[]>(
    campaignIdFromUrl ? [campaignIdFromUrl] : []
  );

  useEffect(() => {
    if (user) {
      fetchCampaignContent();
    }
  }, [user]);

  const fetchCampaignContent = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch campaigns with their content
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      // Fetch content for each campaign
      const campaignsWithContent = await Promise.all(
        (campaignsData || []).map(async (campaign) => {
          const { data: contentData, error: contentError } = await supabase
            .from('content_items')
            .select('*')
            .eq('campaign_id', campaign.id)
            .order('created_at', { ascending: false });

          if (contentError) {
            console.error(`Error fetching content for campaign ${campaign.id}:`, contentError);
            return { ...campaign, content_items: [] };
          }

          return {
            ...campaign,
            content_items: (contentData || []) as ContentItemType[]
          };
        })
      );

      setCampaigns(campaignsWithContent);
    } catch (error: any) {
      console.error('Error fetching campaign content:', error);
      toast.error('Failed to load campaign content');
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.content_items.some(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    planned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    completed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="bg-background/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No campaign content yet</h3>
          <p className="text-muted-foreground mb-4">Generate content from your campaigns to see it here</p>
          <Button onClick={() => navigate('/campaigns')}>
            Go to Campaigns
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="bg-background/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Campaign Accordion */}
      <Accordion 
        type="multiple" 
        value={expandedCampaigns}
        onValueChange={setExpandedCampaigns}
        className="space-y-4"
      >
        {filteredCampaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AccordionItem 
              value={campaign.id}
              className="border-0"
            >
              <Card className="bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <Badge className={statusColors[campaign.status]} variant="outline">
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{campaign.content_items.length} pieces</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {campaign.content_items.map((item) => (
                      <RepositoryCard
                        key={item.id}
                        content={item}
                        onView={() => onOpenDetailView(item)}
                      />
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/campaigns?id=${campaign.id}`)}
                    >
                      View Campaign Details
                    </Button>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>

      {filteredCampaigns.length === 0 && (
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search query</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
