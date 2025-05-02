
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface KeywordsHeaderProps {
  onCreateCluster: () => void;
}

const KeywordsHeader = ({ onCreateCluster }: KeywordsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gradient">Keyword Research</h1>
      <Button 
        className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple hover-scale transition-all duration-300"
        onClick={onCreateCluster}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Keyword Cluster
      </Button>
    </div>
  );
};

export default KeywordsHeader;
