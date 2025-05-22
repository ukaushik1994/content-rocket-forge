
import React from 'react';
import { motion } from 'framer-motion';
import { BrandGuidelines } from '@/contexts/content-builder/types/company-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, ExternalLink, FileText, Palette } from 'lucide-react';
import { BrandGuidelinesDialog } from './BrandGuidelinesDialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BrandGuidelinesForm } from './BrandGuidelinesForm';

interface BrandGuidelinesDisplayProps {
  guidelines: BrandGuidelines | null;
  companyId: string;
  onSave: (guidelines: BrandGuidelines) => void;
}

export const BrandGuidelinesDisplay: React.FC<BrandGuidelinesDisplayProps> = ({
  guidelines,
  companyId,
  onSave
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  const handleOpenDetailedForm = () => {
    setIsSheetOpen(true);
  };
  
  const handleSaveFromSheet = (formData: BrandGuidelines) => {
    onSave(formData);
    setIsSheetOpen(false);
  };
  
  if (!guidelines) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Brand Guidelines</h2>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleOpenDialog}
              variant="outline"
              className="gap-1"
              disabled={!companyId}
              title={!companyId ? "Add company information first" : ""}
            >
              <Palette className="h-4 w-4" />
              Quick Setup
            </Button>
            <Button 
              onClick={handleOpenDetailedForm}
              variant="default"
              className="gap-1"
              disabled={!companyId}
              title={!companyId ? "Add company information first" : ""}
            >
              <FileText className="h-4 w-4" />
              Detailed Setup
            </Button>
          </div>
        </div>
        
        {!companyId ? (
          <div className="p-6 border border-dashed rounded-lg text-center text-muted-foreground">
            <p>Add company information first</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-lg bg-background/50"
          >
            <Palette className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Brand Guidelines</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
              Define your brand guidelines to help the AI understand your brand's voice, tone, and visual identity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleOpenDialog} variant="outline">
                Quick Setup
              </Button>
              <Button onClick={handleOpenDetailedForm}>
                Detailed Setup
              </Button>
            </div>
          </motion.div>
        )}
        
        <BrandGuidelinesDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          guidelines={guidelines}
          companyId={companyId}
          onSave={onSave}
        />
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-[90vw] sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Detailed Brand Guidelines
              </SheetTitle>
              <SheetDescription>
                Fill in comprehensive details about your brand to help the AI generate more accurate content.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <BrandGuidelinesForm
                companyId={companyId}
                initialData={guidelines}
                onSave={handleSaveFromSheet}
                onCancel={() => setIsSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Brand Guidelines</h2>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleOpenDialog}
            variant="outline"
            className="gap-1"
          >
            <Edit className="h-4 w-4" />
            Quick Edit
          </Button>
          <Button 
            onClick={handleOpenDetailedForm}
            variant="default"
            className="gap-1"
          >
            <FileText className="h-4 w-4" />
            Detailed Edit
          </Button>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-background to-background/50 backdrop-blur-sm border-primary/10 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Visual Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Color Palette</h4>
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div 
                      className="h-12 w-12 rounded-md border"
                      style={{ backgroundColor: guidelines.primaryColor }}
                    />
                    <span className="text-xs mt-1">Primary</span>
                    <span className="text-xs text-muted-foreground">{guidelines.primaryColor}</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div 
                      className="h-12 w-12 rounded-md border"
                      style={{ backgroundColor: guidelines.secondaryColor }}
                    />
                    <span className="text-xs mt-1">Secondary</span>
                    <span className="text-xs text-muted-foreground">{guidelines.secondaryColor}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Typography</h4>
                <div className="text-sm" style={{ fontFamily: guidelines.fontFamily }}>
                  <p>Font: {guidelines.fontFamily}</p>
                  <p className="text-xl mt-1">Aa Bb Cc Dd Ee</p>
                </div>
              </div>
            </div>
            
            <div className="pt-2 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Brand Voice & Tone</h4>
                <div className="flex flex-wrap gap-2">
                  {guidelines.tone.map((tone, index) => (
                    <span key={index} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {tone}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Brand Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {guidelines.keywords.map((keyword, index) => (
                    <span key={index} className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Do Use</h4>
                  <ul className="text-xs space-y-1 list-disc pl-4">
                    {guidelines.doUse.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Don't Use</h4>
                  <ul className="text-xs space-y-1 list-disc pl-4">
                    {guidelines.dontUse.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Logo Usage</h4>
                <p className="text-sm">{guidelines.logoUsageNotes}</p>
              </div>
              
              {guidelines.brandAssetsUrl && (
                <div className="pt-2">
                  <a 
                    href={guidelines.brandAssetsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View Brand Assets <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <BrandGuidelinesDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        guidelines={guidelines}
        companyId={companyId}
        onSave={onSave}
      />
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[90vw] sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Detailed Brand Guidelines
            </SheetTitle>
            <SheetDescription>
              Edit your comprehensive brand guidelines to help the AI generate more accurate content.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <BrandGuidelinesForm
              companyId={companyId}
              initialData={guidelines}
              onSave={handleSaveFromSheet}
              onCancel={() => setIsSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
