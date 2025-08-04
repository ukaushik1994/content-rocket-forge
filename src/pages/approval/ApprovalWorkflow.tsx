
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ApprovalWorkflow = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Approval Workflow</h1>
          <p className="text-muted-foreground">Manage content approval processes</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Workflow Management</CardTitle>
            <CardDescription>Coming soon - Content approval and workflow automation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This feature is under development.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;
