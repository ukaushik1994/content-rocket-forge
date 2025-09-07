
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Undo } from 'lucide-react';

interface RepurposeButtonProps {
  contentId: string;
  disabled?: boolean;
  className?: string;
}

export const RepurposeButton: React.FC<RepurposeButtonProps> = ({ 
  contentId, 
  disabled = false,
  className = ""
}) => {
  const navigate = useNavigate();
  
  const handleRepurpose = () => {
    if (disabled) return;
    navigate('/repository');
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleRepurpose}
      disabled={disabled}
      className={`text-primary hover:bg-primary/10 ${className}`}
      aria-label={`Repurpose content with ID ${contentId}`}
      title="Transform this content into different formats"
    >
      <Undo className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
      Repurpose
    </Button>
  );
};
