import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal = ({ isOpen, onClose }: DemoModalProps) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);

  const demoFeatures = [
    {
      timestamp: '0:15',
      title: 'SERP Intelligence',
      description: 'See how we analyze real-time search data'
    },
    {
      timestamp: '1:30',
      title: 'AI Content Generation',
      description: 'Watch content creation in action'
    },
    {
      timestamp: '2:45',
      title: 'Multi-Platform Publishing',
      description: 'One-click publishing across platforms'
    },
    {
      timestamp: '3:30',
      title: 'Analytics Dashboard',
      description: 'Track performance and ROI'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl"
          >
            <GlassCard className="overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div>
                  <h2 className="text-2xl font-bold">Creaiter Platform Demo</h2>
                  <p className="text-muted-foreground">See how creators scale their content with AI</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-destructive/20 hover:text-destructive"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video bg-gradient-to-br from-background/50 to-background/20">
                {/* Placeholder Video Area */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-neon-blue/10">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-neon-blue flex items-center justify-center mb-4 mx-auto">
                      <Play className="h-10 w-10 text-white ml-1" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Interactive Demo Coming Soon</h3>
                    <p className="text-muted-foreground">Experience the full Creaiter platform</p>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    {/* Progress Bar */}
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-1/3 transition-all duration-300"></div>
                    </div>
                    
                    <span className="text-white text-sm">2:15 / 4:30</span>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Demo Timeline */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">What you'll see in this demo:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {demoFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded flex-shrink-0">
                        {feature.timestamp}
                      </div>
                      <div>
                        <h4 className="font-medium">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border/50 flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ready to get started? Join thousands of creators already using Creaiter.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose}>
                    Maybe Later
                  </Button>
                  <Button className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90">
                    Start Free Trial
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};