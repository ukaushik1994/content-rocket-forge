
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function AppearanceSettings() {
  const [selectedTheme, setSelectedTheme] = useState('neon');
  const [selectedLayout, setSelectedLayout] = useState('grid');

  const handleSaveAppearance = () => {
    toast.success('Appearance settings saved!');
  };

  const themeOptions = [
    { id: 'neon', name: 'Neon', gradient: 'from-neon-purple to-neon-blue' },
    { id: 'amber', name: 'Amber', gradient: 'from-orange-500 to-amber-500' },
    { id: 'emerald', name: 'Emerald', gradient: 'from-emerald-500 to-teal-500' },
  ];

  const layoutOptions = [
    { id: 'grid', name: 'Grid' },
    { id: 'list', name: 'List' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-panel bg-glass">
        <CardHeader>
          <CardTitle>Appearance Settings</CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div className="space-y-4" variants={item}>
              <h3 className="text-sm font-medium">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {themeOptions.map((theme) => (
                  <motion.div
                    key={theme.id}
                    className={`border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2 ${
                      selectedTheme === theme.id
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTheme(theme.id)}
                  >
                    <div className={`w-full h-20 rounded bg-gradient-to-br ${theme.gradient}`}></div>
                    <span className="text-xs">{theme.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div className="space-y-4" variants={item}>
              <h3 className="text-sm font-medium">Dashboard Layout</h3>
              <div className="grid grid-cols-2 gap-4">
                {layoutOptions.map((layout) => (
                  <motion.div
                    key={layout.id}
                    className={`border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2 ${
                      selectedLayout === layout.id
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : ''
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLayout(layout.id)}
                  >
                    <div className="w-full h-20 rounded bg-background/50 flex items-center justify-center">
                      {layout.id === 'grid' ? (
                        <div className="grid grid-cols-3 gap-1 w-4/5 h-4/5">
                          <div className="bg-primary/30 rounded"></div>
                          <div className="bg-primary/30 rounded"></div>
                          <div className="bg-primary/30 rounded"></div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 w-4/5 h-4/5">
                          <div className="bg-primary/30 rounded h-1/3"></div>
                          <div className="bg-primary/30 rounded h-1/3"></div>
                          <div className="bg-primary/30 rounded h-1/3"></div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs">{layout.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={item}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple w-full"
                  onClick={handleSaveAppearance}
                >
                  Save Appearance Settings
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
