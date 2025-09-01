import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, Lightbulb, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileOptimizedTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const tabs = [
  {
    id: 'strategies',
    label: 'AI Strategy Engine',
    icon: Lightbulb,
    description: 'Generate and manage strategies'
  },
  {
    id: 'dashboard',
    label: 'Analytics Dashboard', 
    icon: LayoutDashboard,
    description: 'Track performance metrics'
  }
];

export const MobileOptimizedTabs: React.FC<MobileOptimizedTabsProps> = ({
  activeTab,
  onTabChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeTabInfo = tabs.find(tab => tab.id === activeTab) || tabs[0];

  return (
    <div className={cn('relative', className)}>
      {/* Mobile Dropdown (shown on small screens) */}
      <div className="sm:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full glass-panel border-white/20 text-white hover:bg-white/10 justify-between h-12"
        >
          <div className="flex items-center gap-2">
            <activeTabInfo.icon className="h-4 w-4" />
            <span className="font-medium">{activeTabInfo.label}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-50 mt-2 glass-card border border-white/20 rounded-xl shadow-2xl overflow-hidden"
            >
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-3 text-left flex items-center gap-3 transition-colors',
                    'hover:bg-white/10',
                    activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/80'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium text-sm">{tab.label}</div>
                    <div className="text-xs text-white/60">{tab.description}</div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Tabs (shown on larger screens) */}
      <div className="hidden sm:flex glass-panel border border-white/20 rounded-xl p-1.5 shadow-lg">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2',
              'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50',
              activeTab === tab.id
                ? 'glass-card text-foreground shadow-lg border border-white/20'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon className="h-4 w-4" />
            <span className="font-medium text-sm">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};