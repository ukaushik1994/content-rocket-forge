
import React from 'react';
import { motion } from 'framer-motion';
import { BrandGuidelines } from '@/contexts/content-builder/types/company-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, ExternalLink, FileText, Palette, Plus, Sparkles } from 'lucide-react';
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
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  if (!guidelines) {
    return (
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Header */}
        <motion.div 
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neon-blue/20 via-background to-neon-orange/10 p-6 border border-white/10"
          variants={itemVariants}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 futuristic-grid opacity-10 z-0" />
          
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-neon-orange/5 z-0"
            animate={{
              background: [
                "linear-gradient(to bottom right, rgba(51, 195, 240, 0.1), rgba(249, 115, 22, 0.05))",
                "linear-gradient(to bottom right, rgba(51, 195, 240, 0.15), rgba(249, 115, 22, 0.07))",
                "linear-gradient(to bottom right, rgba(51, 195, 240, 0.1), rgba(249, 115, 22, 0.05))"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />

          {/* Floating particles */}
          <motion.div className="absolute inset-0 z-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-neon-orange/20 blur-md"
                style={{
                  width: Math.random() * 60 + 30,
                  height: Math.random() * 60 + 30,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  x: [0, Math.random() * 30 - 15],
                  y: [0, Math.random() * 30 - 15],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: Math.random() * 8 + 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex items-center space-x-2 bg-neon-blue/20 rounded-full px-3 py-1 text-sm font-medium text-neon-blue"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Brand Identity</span>
              </motion.div>
            </div>
            
            <div className="flex gap-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
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
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleOpenDetailedForm}
                  className="bg-gradient-to-r from-neon-blue to-neon-orange hover:from-neon-orange hover:to-neon-blue gap-1"
                  disabled={!companyId}
                  title={!companyId ? "Add company information first" : ""}
                >
                  <FileText className="h-4 w-4" />
                  Detailed Setup
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="relative z-10 mt-4">
            <h2 className="text-3xl font-bold text-gradient mb-2">Brand Guidelines</h2>
            <p className="text-muted-foreground">
              Define your brand's visual identity, voice, and tone to enhance AI content generation
            </p>
          </div>
        </motion.div>
        
        {!companyId ? (
          <motion.div
            variants={itemVariants}
          >
            <Card className="card-3d overflow-hidden border border-white/10 bg-gradient-to-br from-neon-blue/10 via-background/50 to-neon-orange/5 backdrop-blur-sm">
              <div className="absolute inset-0 bg-glass backdrop-blur-sm" />
              
              <CardContent className="relative z-10 p-8 text-center">
                <motion.div
                  animate={{ 
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                  className="mb-6"
                >
                  <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-orange/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Palette className="h-10 w-10 text-neon-blue" />
                  </div>
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gradient mb-3">Company Information Required</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                  Please add company information first before setting up your brand guidelines.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="card-3d overflow-hidden border-2 border-dashed border-neon-blue/30 bg-gradient-to-br from-background/50 to-neon-blue/5 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                  className="mb-6"
                >
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-orange/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Palette className="h-10 w-10 text-neon-blue" />
                  </div>
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gradient mb-3">No Brand Guidelines</h3>
                <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
                  Define your brand guidelines to help the AI understand your brand's voice, tone, and visual identity.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={handleOpenDialog} 
                      variant="outline"
                      className="border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10"
                    >
                      <Palette className="mr-2 h-5 w-5" />
                      Quick Setup
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={handleOpenDetailedForm}
                      className="bg-gradient-to-r from-neon-blue to-neon-orange hover:from-neon-orange hover:to-neon-blue"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Detailed Setup
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
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
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Header */}
      <motion.div 
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neon-blue/20 via-background to-neon-orange/10 p-6 border border-white/10"
        variants={itemVariants}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 futuristic-grid opacity-10 z-0" />
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-neon-orange/5 z-0"
          animate={{
            background: [
              "linear-gradient(to bottom right, rgba(51, 195, 240, 0.1), rgba(249, 115, 22, 0.05))",
              "linear-gradient(to bottom right, rgba(51, 195, 240, 0.15), rgba(249, 115, 22, 0.07))",
              "linear-gradient(to bottom right, rgba(51, 195, 240, 0.1), rgba(249, 115, 22, 0.05))"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        {/* Floating particles */}
        <motion.div className="absolute inset-0 z-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-neon-orange/20 blur-md"
              style={{
                width: Math.random() * 60 + 30,
                height: Math.random() * 60 + 30,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                x: [0, Math.random() * 30 - 15],
                y: [0, Math.random() * 30 - 15],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: Math.random() * 8 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="flex items-center space-x-2 bg-neon-blue/20 rounded-full px-3 py-1 text-sm font-medium text-neon-blue"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Brand Identity</span>
            </motion.div>
          </div>
          
          <div className="flex gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={handleOpenDialog}
                variant="outline"
                className="gap-1"
              >
                <Edit className="h-4 w-4" />
                Quick Edit
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={handleOpenDetailedForm}
                className="bg-gradient-to-r from-neon-blue to-neon-orange hover:from-neon-orange hover:to-neon-blue gap-1"
              >
                <FileText className="h-4 w-4" />
                Detailed Edit
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 mt-4">
          <h2 className="text-3xl font-bold text-gradient mb-2">Brand Guidelines</h2>
          <p className="text-muted-foreground">
            Define your brand's visual identity, voice, and tone to enhance AI content generation
          </p>
        </div>
      </motion.div>
      
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Card className="card-3d overflow-hidden border border-white/10 bg-gradient-to-br from-neon-blue/10 via-background/50 to-neon-orange/5 backdrop-blur-sm">
          <div className="absolute inset-0 bg-glass backdrop-blur-sm" />
          
          <CardContent className="relative z-10 p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="shrink-0"
              >
                <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-background/80 to-background/50 backdrop-blur-md border border-white/10">
                  <div className="grid grid-cols-2 gap-2 p-3 w-full h-full">
                    <div 
                      className="rounded-lg h-full"
                      style={{ backgroundColor: guidelines.primaryColor }}
                    />
                    <div 
                      className="rounded-lg h-full"
                      style={{ backgroundColor: guidelines.secondaryColor }}
                    />
                    <div className="rounded-lg h-full bg-white/10 flex items-center justify-center">
                      <span 
                        className="font-bold text-lg"
                        style={{ fontFamily: guidelines.fontFamily }}
                      >
                        Aa
                      </span>
                    </div>
                    <div className="rounded-lg h-full bg-white/10 flex items-center justify-center">
                      <Palette className="h-6 w-6 text-white/60" />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gradient mb-3">Visual Identity</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Color Palette</h4>
                      <div className="flex gap-3">
                        <motion.div 
                          className="flex flex-col items-center"
                          whileHover={{ scale: 1.1, y: -5 }}
                        >
                          <div 
                            className="h-12 w-12 rounded-md border shadow-lg"
                            style={{ 
                              backgroundColor: guidelines.primaryColor,
                              boxShadow: `0 4px 12px ${guidelines.primaryColor}50`
                            }}
                          />
                          <span className="text-xs mt-1">Primary</span>
                          <span className="text-xs text-muted-foreground">{guidelines.primaryColor}</span>
                        </motion.div>
                        
                        <motion.div 
                          className="flex flex-col items-center"
                          whileHover={{ scale: 1.1, y: -5 }}
                        >
                          <div 
                            className="h-12 w-12 rounded-md border shadow-lg"
                            style={{ 
                              backgroundColor: guidelines.secondaryColor,
                              boxShadow: `0 4px 12px ${guidelines.secondaryColor}50`
                            }}
                          />
                          <span className="text-xs mt-1">Secondary</span>
                          <span className="text-xs text-muted-foreground">{guidelines.secondaryColor}</span>
                        </motion.div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Typography</h4>
                      <div className="text-sm" style={{ fontFamily: guidelines.fontFamily }}>
                        <p>Font: {guidelines.fontFamily}</p>
                        <p className="text-xl mt-1 font-medium">Aa Bb Cc Dd Ee</p>
                        <p className="text-xs mt-1 text-muted-foreground">A quick brown fox jumps over the lazy dog</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="text-lg font-semibold mb-3 text-gradient">Brand Voice & Tone</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {guidelines.tone.map((tone, index) => (
                    <motion.span 
                      key={index} 
                      className="text-sm bg-gradient-to-r from-neon-blue/20 to-transparent text-foreground px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.05, y: -2 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      {tone}
                    </motion.span>
                  ))}
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Keywords</h5>
                  <div className="flex flex-wrap gap-2">
                    {guidelines.keywords.map((keyword, index) => (
                      <motion.span 
                        key={index} 
                        className="text-xs bg-gradient-to-r from-neon-orange/20 to-transparent text-foreground px-3 py-1 rounded-full border border-white/20"
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                      >
                        {keyword}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-green-400">Do Use</h5>
                    <ul className="text-xs space-y-2 list-none">
                      {guidelines.doUse.map((item, index) => (
                        <motion.li 
                          key={index} 
                          className="flex items-start gap-2 bg-green-500/10 p-2 rounded-md"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-red-400">Don't Use</h5>
                    <ul className="text-xs space-y-2 list-none">
                      {guidelines.dontUse.map((item, index) => (
                        <motion.li 
                          key={index}
                          className="flex items-start gap-2 bg-red-500/10 p-2 rounded-md"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <span className="text-red-400 mt-0.5">✗</span>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Logo Usage</h5>
                  <p className="text-sm bg-white/5 p-3 rounded-md border border-white/10">
                    {guidelines.logoUsageNotes}
                  </p>
                </div>
              </motion.div>
            </div>
            
            {guidelines.brandAssetsUrl && (
              <motion.div 
                className="pt-4 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.a 
                  href={guidelines.brandAssetsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-neon-blue hover:text-neon-orange transition-colors"
                  whileHover={{ x: 5 }}
                >
                  View Brand Assets <ExternalLink className="h-3 w-3" />
                </motion.a>
              </motion.div>
            )}
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
    </motion.div>
  );
};
