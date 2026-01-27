import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGrandTour } from '@/contexts/GrandTourContext';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  Compass, 
  PlayCircle, 
  Trophy, 
  BookOpen, 
  Keyboard, 
  HelpCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export const HelpAndTourSettings = () => {
  const navigate = useNavigate();
  const { startTour, hasCompletedTour, achievements } = useGrandTour();
  const { closeSettings } = useSettings();

  const handleStartTour = () => {
    closeSettings();
    // Small delay to let settings close, then start tour
    setTimeout(() => {
      startTour();
    }, 300);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const quickLinks = [
    {
      icon: <BookOpen className="h-4 w-4" />,
      label: 'Documentation',
      description: 'Learn about all features',
      onClick: () => window.open('https://docs.creaiter.com', '_blank')
    },
    {
      icon: <Keyboard className="h-4 w-4" />,
      label: 'Keyboard Shortcuts',
      description: 'Speed up your workflow',
      onClick: () => {} // Could open a shortcuts modal
    },
    {
      icon: <HelpCircle className="h-4 w-4" />,
      label: 'Contact Support',
      description: 'Get help from our team',
      onClick: () => window.open('mailto:support@creaiter.com', '_blank')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          Help & Tour
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Get help and explore all features of CreAiter
        </p>
      </div>

      {/* App Tour Section */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Interactive App Tour</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Experience a complete walkthrough of all 14 modules and features. 
              Perfect for learning what CreAiter can do for you.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Button onClick={handleStartTour} className="gap-2">
                <PlayCircle className="h-4 w-4" />
                {hasCompletedTour ? 'Restart Tour' : 'Start Tour'}
              </Button>
              {hasCompletedTour && (
                <span className="text-sm text-green-500 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Tour Achievements
          </h3>
          <span className="text-sm text-muted-foreground">
            {unlockedCount} / {achievements.length} unlocked
          </span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg text-center transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/30'
                  : 'bg-muted/50 border border-border opacity-50'
              }`}
            >
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <div className="text-xs font-medium truncate">
                {achievement.name}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Complete the tour to unlock achievements and track your progress
        </p>
      </div>

      {/* Quick Links Section */}
      <div className="space-y-4">
        <h3 className="font-semibold">Quick Links</h3>
        <div className="space-y-2">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={link.onClick}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border">
                {link.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium">{link.label}</div>
                <div className="text-sm text-muted-foreground">
                  {link.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
