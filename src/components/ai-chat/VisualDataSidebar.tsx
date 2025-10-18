import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VisualData, ActionableItem } from '@/types/enhancedChat';
import { VisualDataRenderer } from './VisualDataRenderer';
import { ModernActionButtons } from './ModernActionButtons';
import { Card } from '@/components/ui/card';

interface VisualDataSidebarProps {
  visualData: VisualData | null;
  isOpen: boolean;
  onClose: () => void;
  onDeepDive?: (prompt: string) => void;
  onActionClick?: (action: any) => void;
}

export const VisualDataSidebar: React.FC<VisualDataSidebarProps> = ({
  visualData,
  isOpen,
  onClose,
  onDeepDive,
  onActionClick
}) => {
  const sidebarVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", damping: 25, stiffness: 300 }
    },
    exit: { 
      x: '100%', 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  if (!visualData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-16 bottom-0 w-full lg:w-[30%] min-w-[400px] max-w-[600px] bg-background/95 backdrop-blur-xl border-l border-border/50 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">AI Insights</h2>
                  <p className="text-xs text-muted-foreground">
                    {visualData.title || 'Data Visualization'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {/* Top Section: Metrics */}
                {visualData.metrics && visualData.metrics.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="mb-3">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Key Metrics
                      </h3>
                    </div>
                    <VisualDataRenderer data={{ ...visualData, type: 'metrics' }} />
                  </motion.div>
                )}

                {/* Summary Insights Section */}
                {visualData.summaryInsights && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {visualData.summaryInsights.bulletPoints && (
                      <Card className="p-4 bg-primary/5 border-primary/20">
                        <h4 className="text-sm font-medium mb-2">Quick Insights</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {visualData.summaryInsights.bulletPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </motion.div>
                )}

                {/* Middle Section: Charts */}
                {visualData.chartConfig && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="mb-3">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Visualizations
                      </h3>
                    </div>
                    <VisualDataRenderer data={{ ...visualData, type: 'chart' }} />
                  </motion.div>
                )}

                {/* Multiple Charts */}
                {visualData.charts && visualData.charts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-4"
                  >
                    {visualData.charts.map((chartConfig, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="text-sm font-medium">{chartConfig.title}</h4>
                        <VisualDataRenderer 
                          data={{ 
                            type: 'chart', 
                            chartConfig,
                            title: chartConfig.title,
                            description: chartConfig.subtitle
                          }} 
                        />
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Table Data */}
                {visualData.tableData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <VisualDataRenderer data={{ ...visualData, type: 'table' }} />
                  </motion.div>
                )}

                {/* Workflow */}
                {visualData.workflowStep && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <VisualDataRenderer data={{ ...visualData, type: 'workflow' }} />
                  </motion.div>
                )}

                {/* Summary */}
                {visualData.summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <VisualDataRenderer data={{ ...visualData, type: 'summary' }} />
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Bottom Section: Actions */}
            {((visualData.actionableItems && visualData.actionableItems.length > 0) || 
              (visualData.deepDivePrompts && visualData.deepDivePrompts.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="border-t border-border/50 p-4 bg-background/80"
              >
                {/* Action Buttons */}
                {visualData.actionableItems && visualData.actionableItems.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Quick Actions
                    </h3>
                    <ModernActionButtons
                      actions={visualData.actionableItems.map(item => ({
                        id: item.id,
                        type: 'button',
                        label: item.title,
                        action: item.actionType || 'navigate',
                        data: item
                      }))}
                      onAction={onActionClick || (() => {})}
                    />
                  </div>
                )}

                {/* Deep Dive Prompts */}
                {visualData.deepDivePrompts && visualData.deepDivePrompts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Deep Dive Questions
                    </h3>
                    <div className="space-y-2">
                      {visualData.deepDivePrompts.slice(0, 3).map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2 px-3"
                          onClick={() => {
                            onDeepDive?.(prompt);
                            onClose();
                          }}
                        >
                          <span className="text-xs line-clamp-2">{prompt}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
