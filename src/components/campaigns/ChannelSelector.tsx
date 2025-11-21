import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2, Mail, Video, FileText, DollarSign, Calendar, Search, MessageCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CHANNELS: Channel[] = [
  { id: 'social', name: 'Social Media', icon: Share2, description: 'LinkedIn, Twitter, Facebook' },
  { id: 'email', name: 'Email Marketing', icon: Mail, description: 'Newsletters & campaigns' },
  { id: 'webinar', name: 'Webinars', icon: Video, description: 'Live & recorded sessions' },
  { id: 'blog', name: 'Blog/Content', icon: FileText, description: 'Articles & content' },
  { id: 'paid', name: 'Paid Ads', icon: DollarSign, description: 'Sponsored campaigns' },
  { id: 'events', name: 'Events', icon: Calendar, description: 'Conferences & meetups' },
  { id: 'seo', name: 'SEO/Organic', icon: Search, description: 'Search optimization' },
  { id: 'outreach', name: 'Direct Outreach', icon: MessageCircle, description: 'Personal contact' }
];

interface ChannelSelectorProps {
  onSelect: (channels: string[]) => void;
}

export function ChannelSelector({ onSelect }: ChannelSelectorProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const toggleChannel = (channelName: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelName)
        ? prev.filter(c => c !== channelName)
        : [...prev, channelName]
    );
  };

  const handleContinue = () => {
    if (selectedChannels.length > 0) {
      onSelect(selectedChannels);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm"
    >
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Select Distribution Channels</h3>
        <p className="text-sm text-muted-foreground">Choose one or more channels where you want to promote your campaign</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CHANNELS.map((channel) => {
          const Icon = channel.icon;
          const isSelected = selectedChannels.includes(channel.name);
          
          return (
            <motion.button
              key={channel.id}
              onClick={() => toggleChannel(channel.name)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all text-left",
                "hover:border-primary/40 hover:bg-accent/50",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-card"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Icon className={cn(
                  "h-6 w-6",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <div>
                  <div className={cn(
                    "font-medium text-sm",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {channel.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {channel.description}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {selectedChannels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button 
            onClick={handleContinue}
            size="lg"
            className="gap-2"
          >
            Continue with {selectedChannels.length} channel{selectedChannels.length > 1 ? 's' : ''}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
