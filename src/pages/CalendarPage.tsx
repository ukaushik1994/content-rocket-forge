
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendar</h1>
      <Card>
        <CardHeader>
          <CardTitle>Content Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content calendar will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
