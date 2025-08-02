import React from 'react';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export const GlossarySaveStep = () => {
  const { state, saveGlossary, exportGlossary } = useGlossaryBuilder();
  const { currentGlossary, isSaving } = state;

  const handleSave = async () => {
    await saveGlossary();
  };

  const handleExport = async (format: 'markdown' | 'json' | 'csv') => {
    await exportGlossary(format);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Save & Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <p className="text-muted-foreground">
              Your glossary with {currentGlossary?.terms.length || 0} terms is ready to save and export.
            </p>
            
            <div className="flex justify-center gap-4">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Glossary'}
              </Button>
              
              <Button variant="outline" onClick={() => handleExport('markdown')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};