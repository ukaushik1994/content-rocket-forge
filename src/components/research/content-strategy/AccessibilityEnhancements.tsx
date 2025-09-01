import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accessibility, Volume2, Eye, Keyboard, MousePointer } from 'lucide-react';

interface AccessibilityEnhancementsProps {
  children: React.ReactNode;
  enableVoiceCommands?: boolean;
  enableHighContrast?: boolean;
  enableKeyboardNav?: boolean;
}

export const AccessibilityEnhancements: React.FC<AccessibilityEnhancementsProps> = ({
  children,
  enableVoiceCommands = false,
  enableHighContrast = false,
  enableKeyboardNav = true
}) => {
  const [isHighContrast, setIsHighContrast] = React.useState(enableHighContrast);
  const [isVoiceEnabled, setIsVoiceEnabled] = React.useState(enableVoiceCommands);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = React.useState(false);

  React.useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  // Keyboard navigation enhancement
  React.useEffect(() => {
    if (!enableKeyboardNav) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Trigger command palette (would integrate with existing command system)
        console.log('Command palette triggered');
      }

      // Alt + A for accessibility panel
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setShowAccessibilityPanel(!showAccessibilityPanel);
      }

      // Escape to close modals/panels
      if (e.key === 'Escape') {
        setShowAccessibilityPanel(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNav, showAccessibilityPanel]);

  return (
    <div className="relative">
      {/* Accessibility Panel */}
      {showAccessibilityPanel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed top-4 right-4 z-[100] w-80"
        >
          <Card className="glass-card border border-white/20 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Accessibility className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-white">Accessibility Options</h3>
              </div>
              
              <div className="space-y-4">
                {/* High Contrast Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-white/70" />
                    <span className="text-sm text-white">High Contrast</span>
                  </div>
                  <Button
                    variant={isHighContrast ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsHighContrast(!isHighContrast)}
                    className="h-8"
                  >
                    {isHighContrast ? 'On' : 'Off'}
                  </Button>
                </div>

                {/* Voice Commands Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-white/70" />
                    <span className="text-sm text-white">Voice Commands</span>
                  </div>
                  <Button
                    variant={isVoiceEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    className="h-8"
                  >
                    {isVoiceEnabled ? 'On' : 'Off'}
                  </Button>
                </div>

                {/* Keyboard Shortcuts Info */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Keyboard className="h-4 w-4 text-white/70" />
                    <span className="text-sm font-medium text-white">Shortcuts</span>
                  </div>
                  <div className="space-y-2 text-xs text-white/60">
                    <div className="flex justify-between">
                      <span>Command Palette</span>
                      <Badge variant="outline" className="text-xs px-2 py-0">⌘K</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Accessibility Panel</span>
                      <Badge variant="outline" className="text-xs px-2 py-0">Alt+A</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Close Panel</span>
                      <Badge variant="outline" className="text-xs px-2 py-0">Esc</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Accessibility Trigger Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
        className="fixed bottom-4 right-4 z-50 p-3 glass-panel border border-white/20 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="Open accessibility options (Alt+A)"
        title="Accessibility Options (Alt+A)"
      >
        <Accessibility className="h-5 w-5 text-primary" />
      </motion.button>

      {/* Main Content */}
      <div 
        className={isHighContrast ? 'high-contrast-mode' : ''}
        role="main"
        aria-label="Content Strategy Interface"
      >
        {children}
      </div>

      {/* Screen Reader Only Content */}
      <div className="sr-only">
        <h1>Content Strategy Management Interface</h1>
        <p>Navigate using tab key or keyboard shortcuts. Press Alt+A for accessibility options.</p>
      </div>
    </div>
  );
};