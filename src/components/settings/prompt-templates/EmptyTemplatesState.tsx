
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface EmptyTemplatesStateProps {
  activeTab: string;
  formatTypeLabel: string;
  onCreateNew: () => void;
}

export const EmptyTemplatesState: React.FC<EmptyTemplatesStateProps> = ({ 
  activeTab, 
  formatTypeLabel, 
  onCreateNew 
}) => {
  return (
    <Card>
      <CardContent className="py-10">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {activeTab === 'all' 
              ? "You haven't created any prompt templates yet. Create your first template to get started."
              : `You haven't created any templates for ${formatTypeLabel} yet.`}
          </p>
          <Button onClick={onCreateNew} className="mt-2">
            Create Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
