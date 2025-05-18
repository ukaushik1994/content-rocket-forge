
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyContentState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-12">
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 flex items-center justify-center mx-auto mb-4">
        <FileText className="h-8 w-8 text-white/70" />
      </div>
      <p className="text-muted-foreground mb-6">No content available to repurpose</p>
      <Button 
        onClick={() => navigate('/content-builder')} 
        className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90"
      >
        Create New Content
      </Button>
    </div>
  );
};

export default EmptyContentState;
