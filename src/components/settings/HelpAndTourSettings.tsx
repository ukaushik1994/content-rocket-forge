import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  Compass, 
  PlayCircle, 
  BookOpen, 
  Keyboard, 
  HelpCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export const HelpAndTourSettings = () => {
  const navigate = useNavigate();
  const { closeSettings } = useSettings();

  // Check if tour has been completed
  const hasCompletedTour = localStorage.getItem('creAiter-onboarding-completed') === 'true';

  const handleStartTour = () => {
    closeSettings();
    // Navigate to dashboard and trigger the tour
    setTimeout(() => {
      navigate('/dashboard?welcome=true');
    }, 300);
  };

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
          <Compass className="h-5 w-5 text-muted-foreground" />
          Help & Tour
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Get help and explore all features of CreAiter
        </p>
      </div>

      {/* App Tour Section */}
      <div className="p-6 rounded-xl bg-transparent border border-border/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Interactive App Tour</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Experience a visual walkthrough of all 8 major sections with animated demonstrations. 
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

      {/* Quick Links Section */}
      <div className="space-y-4">
        <h3 className="font-semibold">Quick Links</h3>
        <div className="space-y-2">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={link.onClick}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-transparent border border-border/20 hover:bg-muted/20 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center border border-border/20">
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
