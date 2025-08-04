
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const GlossaryBuilder = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Glossary Builder</h1>
          <p className="text-muted-foreground">Create and manage content glossaries</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Glossary Management</CardTitle>
            <CardDescription>Coming soon - Comprehensive glossary creation and management</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This feature is under development.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GlossaryBuilder;
