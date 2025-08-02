import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

export const SolutionManager: React.FC = () => {
  const { state, dispatch } = useContentBuilder();
  const { selectedSolution } = state;

  const handleSolutionSelect = (solution: any) => {
    dispatch({ type: 'SET_SELECTED_SOLUTION', payload: solution });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solution Manager</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedSolution ? (
          <div>
            <p>Selected Solution: {selectedSolution.name}</p>
            <Button onClick={() => handleSolutionSelect(null)}>Clear Solution</Button>
          </div>
        ) : (
          <p>No solution selected.</p>
        )}
      </CardContent>
    </Card>
  );
};

