
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ContentCalendar = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Content Calendar</h1>
          <p className="text-muted-foreground">Plan and schedule your content</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Editorial Calendar</CardTitle>
            <CardDescription>Coming soon - Visual content scheduling and planning</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This feature is under development.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentCalendar;
