
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Edit, Plus, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CompanyFormDialog } from './CompanyFormDialog';
import { CompanyInfo } from '@/contexts/content-builder/types/company-types';

interface CompanySectionProps {
  companyInfo: CompanyInfo | null;
  onSave: (info: CompanyInfo) => void;
}

export const CompanySection: React.FC<CompanySectionProps> = ({ 
  companyInfo, 
  onSave 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
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
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Header */}
      <motion.div 
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neon-purple/20 via-background to-neon-blue/10 p-6 border border-white/10"
        variants={itemVariants}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 futuristic-grid opacity-10 z-0" />
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 z-0"
          animate={{
            background: [
              "linear-gradient(to bottom right, rgba(155, 135, 245, 0.1), rgba(51, 195, 240, 0.05))",
              "linear-gradient(to bottom right, rgba(155, 135, 245, 0.15), rgba(51, 195, 240, 0.07))",
              "linear-gradient(to bottom right, rgba(155, 135, 245, 0.1), rgba(51, 195, 240, 0.05))"
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
              className="absolute rounded-full bg-neon-blue/20 blur-md"
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
              className="flex items-center space-x-2 bg-neon-purple/20 rounded-full px-3 py-1 text-sm font-medium text-neon-purple"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Company Hub</span>
            </motion.div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleOpenDialog} 
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple gap-2"
            >
              {companyInfo ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Company Details
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Company Details
                </>
              )}
            </Button>
          </motion.div>
        </div>

        <div className="relative z-10 mt-4">
          <h2 className="text-3xl font-bold text-gradient mb-2">Company Information</h2>
          <p className="text-muted-foreground">
            Define your brand identity and company details to enhance AI content generation
          </p>
        </div>
      </motion.div>
      
      {companyInfo ? (
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card className="card-3d overflow-hidden border border-white/10 bg-gradient-to-br from-neon-purple/10 via-background/50 to-neon-blue/5 backdrop-blur-sm">
            <div className="absolute inset-0 bg-glass backdrop-blur-sm" />
            
            <CardContent className="relative z-10 p-8 space-y-6">
              <div className="flex items-start gap-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {companyInfo.logoUrl ? (
                    <div className="h-20 w-20 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <img 
                        src={companyInfo.logoUrl} 
                        alt={companyInfo.name} 
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <Building2 className="h-10 w-10 text-neon-purple" />
                    </div>
                  )}
                </motion.div>
                
                <div className="flex-1">
                  <motion.h3 
                    className="text-3xl font-bold text-gradient mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {companyInfo.name}
                  </motion.h3>
                  <motion.div 
                    className="flex items-center gap-3 text-sm text-muted-foreground mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="bg-neon-blue/10 text-neon-blue px-3 py-1 rounded-full border border-neon-blue/30">
                      {companyInfo.industry}
                    </span>
                    <span className="bg-neon-purple/10 text-neon-purple px-3 py-1 rounded-full border border-neon-purple/30">
                      Founded {companyInfo.founded}
                    </span>
                    <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                      {companyInfo.size}
                    </span>
                  </motion.div>
                </div>
              </div>
              
              <motion.div 
                className="prose prose-sm dark:prose-invert max-w-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-foreground leading-relaxed">{companyInfo.description}</p>
              </motion.div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-white/10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h4 className="text-lg font-semibold mb-3 text-gradient">Mission Statement</h4>
                  <p className="text-muted-foreground leading-relaxed">{companyInfo.mission}</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h4 className="text-lg font-semibold mb-3 text-gradient">Core Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {companyInfo.values.map((value, index) => (
                      <motion.span 
                        key={index} 
                        className="text-sm bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-foreground px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm"
                        whileHover={{ scale: 1.05, y: -2 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        {value}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </div>
              
              {companyInfo.website && (
                <motion.div 
                  className="pt-6 border-t border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.a 
                    href={companyInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-neon-blue hover:text-neon-purple transition-colors duration-300 font-medium"
                    whileHover={{ x: 5 }}
                  >
                    Visit Company Website →
                  </motion.a>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden"
        >
          <Card className="border-2 border-dashed border-neon-purple/30 bg-gradient-to-br from-background/50 to-neon-purple/5 backdrop-blur-sm">
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
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Building2 className="h-10 w-10 text-neon-purple" />
                </div>
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gradient mb-3">No Company Information</h3>
              <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
                Add comprehensive information about your company to help the AI understand your brand better and create more targeted content.
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleOpenDialog}
                  size="lg"
                  className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add Company Details
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <CompanyFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyInfo={companyInfo}
        onSave={onSave}
      />
    </motion.div>
  );
};
