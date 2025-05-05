
import React from 'react';
import { Card } from "@/components/ui/card";

export const ApiKeyLoading = () => {
  return (
    <Card className="p-6 space-y-4 bg-glass border-white/10 animate-pulse">
      <div className="h-5 w-1/3 bg-gray-700 rounded"></div>
      <div className="h-10 w-full bg-gray-700 rounded"></div>
      <div className="h-10 w-1/4 bg-gray-700 rounded"></div>
    </Card>
  );
};
