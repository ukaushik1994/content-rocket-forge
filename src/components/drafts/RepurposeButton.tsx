
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Undo } from 'lucide-react';
import { toast } from 'sonner';

interface RepurposeButtonProps {
  contentId: string;
}

export const RepurposeButton: React.FC<RepurposeButtonProps> = ({ contentId }) => {
  const navigate = useNavigate();
  
  const handleRepurpose = () => {
    navigate(`/content-repurposing?id=${contentId}`);
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleRepurpose}
      className="text-primary hover:bg-primary/10"
    >
      <Undo className="h-4 w-4 mr-1" />
      Repurpose
    </Button>
  );
};
