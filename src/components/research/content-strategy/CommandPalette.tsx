import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Lightbulb, 
  BarChart3, 
  Plus, 
  Settings, 
  Calendar, 
  FileText,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContentStrategyOptional } from '@/contexts/ContentStrategyContext';

interface Command {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  category: string;
  keywords: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const contentStrategy = useContentStrategyOptional();

  const commands: Command[] = [
    {
      id: 'create-strategy',
      label: 'Create New Strategy',
      description: 'Generate a new AI-powered content strategy',
      icon: Plus,
      action: () => {
        // Trigger strategy creation
        console.log('Create strategy');
        onOpenChange(false);
      },
      category: 'Actions',
      keywords: ['create', 'new', 'strategy', 'ai', 'generate']
    },
    {
      id: 'view-dashboard',
      label: 'Analytics Dashboard',
      description: 'View performance metrics and insights',
      icon: BarChart3,
      action: () => {
        navigate('/research/content-strategy#dashboard');
        onOpenChange(false);
      },
      category: 'Navigation',
      keywords: ['dashboard', 'analytics', 'metrics', 'performance']
    },
    {
      id: 'view-strategies',
      label: 'AI Strategy Engine',
      description: 'Access strategy suggestions and tools',
      icon: Lightbulb,
      action: () => {
        navigate('/research/content-strategy#strategies');
        onOpenChange(false);
      },
      category: 'Navigation',
      keywords: ['strategies', 'ai', 'engine', 'suggestions']
    },
    {
      id: 'calendar',
      label: 'Content Calendar',
      description: 'Manage your content schedule',
      icon: Calendar,
      action: () => {
        navigate('/research/calendar');
        onOpenChange(false);
      },
      category: 'Navigation',
      keywords: ['calendar', 'schedule', 'content', 'planning']
    },
    {
      id: 'pipeline',
      label: 'Content Pipeline',
      description: 'Track content production progress',
      icon: FileText,
      action: () => {
        navigate('/research/pipeline');
        onOpenChange(false);
      },
      category: 'Navigation',
      keywords: ['pipeline', 'content', 'production', 'progress']
    },
    {
      id: 'serp-analysis',
      label: 'SERP Analysis',
      description: 'Analyze keyword performance and opportunities',
      icon: TrendingUp,
      action: () => {
        console.log('SERP Analysis');
        onOpenChange(false);
      },
      category: 'Tools',
      keywords: ['serp', 'analysis', 'keywords', 'seo', 'performance']
    }
  ];

  const filteredCommands = commands.filter(command => {
    if (!query) return true;
    const searchText = query.toLowerCase();
    return (
      command.label.toLowerCase().includes(searchText) ||
      command.description.toLowerCase().includes(searchText) ||
      command.keywords.some(keyword => keyword.includes(searchText))
    );
  });

  const categories = Array.from(new Set(filteredCommands.map(cmd => cmd.category)));

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        onOpenChange(false);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 glass-card border border-white/20 shadow-2xl max-w-2xl">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-white/10">
            <Search className="h-5 w-5 text-white/60 mr-3" />
            <Input
              placeholder="Search commands... (Type to filter)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-white/60"
              autoFocus
            />
            <Badge variant="outline" className="ml-2 text-xs border-white/20 text-white/60">
              ⌘K
            </Badge>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {filteredCommands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Zap className="h-8 w-8 text-white/40 mb-3" />
                <p className="text-white/60">No commands found</p>
                <p className="text-white/40 text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="py-2">
                {categories.map((category) => (
                  <div key={category}>
                    <div className="px-4 py-2">
                      <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
                        {category}
                      </h3>
                    </div>
                    <AnimatePresence>
                      {filteredCommands
                        .filter(cmd => cmd.category === category)
                        .map((command, index) => {
                          const globalIndex = filteredCommands.indexOf(command);
                          return (
                            <motion.button
                              key={command.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={command.action}
                              className={`
                                w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                                ${selectedIndex === globalIndex 
                                  ? 'bg-white/10 border-r-2 border-primary' 
                                  : 'hover:bg-white/5'
                                }
                              `}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                            >
                              <div className="p-2 rounded-lg glass-panel border border-white/10">
                                <command.icon className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white text-sm">
                                  {command.label}
                                </div>
                                <div className="text-white/60 text-xs truncate">
                                  {command.description}
                                </div>
                              </div>
                              {selectedIndex === globalIndex && (
                                <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                                  ⏎
                                </Badge>
                              )}
                            </motion.button>
                          );
                        })}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/10 flex justify-between items-center text-xs text-white/40">
            <span>Navigate with ↑↓ arrows</span>
            <div className="flex gap-2">
              <span>⏎ to select</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};