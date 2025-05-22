
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Edit, Plus } from 'lucide-react';
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
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Company Information</h2>
        </div>
        <Button 
          onClick={handleOpenDialog} 
          variant="outline"
          className="gap-1"
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
      </div>
      
      {companyInfo ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-background to-background/50 backdrop-blur-sm border-primary/10 overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                {companyInfo.logoUrl ? (
                  <img 
                    src={companyInfo.logoUrl} 
                    alt={companyInfo.name} 
                    className="h-16 w-16 rounded-md object-contain bg-white/10 p-2"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-md bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary/60" />
                  </div>
                )}
                
                <div>
                  <h3 className="text-2xl font-bold">{companyInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">{companyInfo.industry} • Founded {companyInfo.founded}</p>
                </div>
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{companyInfo.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Mission</h4>
                  <p className="text-sm text-muted-foreground">{companyInfo.mission}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {companyInfo.values.map((value, index) => (
                      <span key={index} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {companyInfo.website && (
                <div className="pt-2">
                  <a 
                    href={companyInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Visit website →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-lg bg-background/50"
        >
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Company Information</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Add information about your company to help the AI understand your brand better when creating content.
          </p>
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Company Details
          </Button>
        </motion.div>
      )}

      <CompanyFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyInfo={companyInfo}
        onSave={onSave}
      />
    </div>
  );
};
