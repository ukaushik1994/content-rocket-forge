
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ViewToggleProps {
  view: string;
  setView: (value: string) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, setView }) => {
  return (
    <Tabs value={view} onValueChange={setView} defaultValue="grid">
      <TabsList className="bg-secondary/30">
        <TabsTrigger value="grid">Grid View</TabsTrigger>
        <TabsTrigger value="list">List View</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
