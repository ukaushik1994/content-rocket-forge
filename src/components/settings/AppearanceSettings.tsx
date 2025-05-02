
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export function AppearanceSettings() {
  const handleSaveAppearance = () => {
    toast.success('Appearance settings saved!');
  };
  
  return (
    <Card className="glass-panel bg-glass">
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>
          Customize the look and feel of your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Theme</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2 ring-2 ring-primary ring-offset-2 ring-offset-background">
                <div className="w-full h-20 rounded bg-gradient-to-br from-neon-purple to-neon-blue"></div>
                <span className="text-xs">Neon</span>
              </div>
              <div className="border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2">
                <div className="w-full h-20 rounded bg-gradient-to-br from-orange-500 to-amber-500"></div>
                <span className="text-xs">Amber</span>
              </div>
              <div className="border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2">
                <div className="w-full h-20 rounded bg-gradient-to-br from-emerald-500 to-teal-500"></div>
                <span className="text-xs">Emerald</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Dashboard Layout</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2 ring-2 ring-primary ring-offset-2 ring-offset-background">
                <div className="w-full h-20 rounded bg-background/50 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-1 w-4/5 h-4/5">
                    <div className="bg-primary/30 rounded"></div>
                    <div className="bg-primary/30 rounded"></div>
                    <div className="bg-primary/30 rounded"></div>
                  </div>
                </div>
                <span className="text-xs">Grid</span>
              </div>
              <div className="border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2">
                <div className="w-full h-20 rounded bg-background/50 flex items-center justify-center">
                  <div className="flex flex-col gap-1 w-4/5 h-4/5">
                    <div className="bg-primary/30 rounded h-1/3"></div>
                    <div className="bg-primary/30 rounded h-1/3"></div>
                    <div className="bg-primary/30 rounded h-1/3"></div>
                  </div>
                </div>
                <span className="text-xs">List</span>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            onClick={handleSaveAppearance}
          >
            Save Appearance Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
