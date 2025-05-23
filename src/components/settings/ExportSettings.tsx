
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Download, FileText, BarChart3 } from 'lucide-react';

export function ExportSettings() {
  const handleExport = (format: string, type: string) => {
    toast.success(`Exporting ${type} as ${format}`, {
      description: "Your export will begin shortly."
    });
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-panel bg-glass border border-white/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-neon-purple/20 p-2">
              <Download className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <CardTitle className="text-gradient">Data Export</CardTitle>
              <CardDescription className="text-muted-foreground">
                Export your content and analytics data.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={itemVariants} transition={{ delay: 0.1 }}>
                <Card className="bg-background/30 border border-white/10 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-full bg-neon-blue/20 p-2">
                        <FileText className="h-4 w-4 text-neon-blue" />
                      </div>
                      <h3 className="text-lg font-medium text-gradient">Content Export</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export all your content in various formats for backup or migration.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExport('JSON', 'content')}
                        className="bg-background/50 border-white/20 hover:bg-neon-purple/10"
                      >
                        Export as JSON
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExport('CSV', 'content')}
                        className="bg-background/50 border-white/20 hover:bg-neon-purple/10"
                      >
                        Export as CSV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExport('PDF', 'content')}
                        className="bg-background/50 border-white/20 hover:bg-neon-purple/10"
                      >
                        Export as PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants} transition={{ delay: 0.2 }}>
                <Card className="bg-background/30 border border-white/10 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-full bg-neon-orange/20 p-2">
                        <BarChart3 className="h-4 w-4 text-neon-orange" />
                      </div>
                      <h3 className="text-lg font-medium text-gradient">Analytics Export</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export your analytics data for further analysis.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExport('Excel', 'analytics')}
                        className="bg-background/50 border-white/20 hover:bg-neon-purple/10"
                      >
                        Export as Excel
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExport('CSV', 'analytics')}
                        className="bg-background/50 border-white/20 hover:bg-neon-purple/10"
                      >
                        Export as CSV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleExport('JSON', 'analytics')}
                        className="bg-background/50 border-white/20 hover:bg-neon-purple/10"
                      >
                        Export as JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <motion.div variants={itemVariants} transition={{ delay: 0.3 }}>
              <div className="rounded-lg border border-white/10 p-6 bg-background/20 backdrop-blur-sm">
                <h3 className="text-sm font-medium mb-2 text-gradient">Full Account Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export all your account data including content, analytics, settings, and history.
                </p>
                <Button 
                  variant="outline"
                  className="bg-background/50 border-white/20 hover:bg-neon-purple/10"
                  onClick={() => toast.info("Preparing full data export", {
                    description: "This may take a few minutes to prepare."
                  })}
                >
                  Request Full Data Export
                </Button>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
