import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';

interface CalendarIntegrationProps {
  campaignId: string;
  contentItems: ContentItemType[];
  onScheduleComplete?: () => void;
}

export const CalendarIntegration = ({ campaignId, contentItems, onScheduleComplete }: CalendarIntegrationProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState(false);

  const unscheduledItems = contentItems.filter(item => 
    item.approval_status === 'approved'
  );

  const scheduleContent = async () => {
    if (!selectedDate || !selectedContent) {
      toast.error('Please select both date and content');
      return;
    }

    setIsScheduling(true);

    try {
      const item = contentItems.find(c => c.id === selectedContent);
      if (!item) throw new Error('Content not found');

      // Create calendar entry
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: calendarEntry, error: calendarError } = await supabase
        .from('content_calendar')
        .insert([{
          title: item.title,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          status: 'scheduled',
          content_type: item.content_type || 'article',
          assigned_to: user?.id,
          user_id: user?.id || '',
          notes: `Campaign: ${campaignId}`,
        }])
        .select()
        .single();

      if (calendarError) throw calendarError;

      // Update content item
      await supabase
        .from('content_items')
        .update({
          metadata: {
            ...item.metadata,
            scheduled_date: selectedDate.toISOString(),
            calendar_entry_id: calendarEntry.id,
          }
        })
        .eq('id', selectedContent);

      toast.success('Content scheduled successfully');
      setShowDialog(false);
      setSelectedContent('');
      setSelectedDate(undefined);
      onScheduleComplete?.();
    } catch (error) {
      console.error('Error scheduling content:', error);
      toast.error('Failed to schedule content');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Calendar Integration</h3>
            <p className="text-sm text-muted-foreground">
              Schedule approved content to your content calendar
            </p>
          </div>

          {unscheduledItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No content available for scheduling</p>
            </div>
          ) : (
            <Button onClick={() => setShowDialog(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Content to Calendar
            </Button>
          )}
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Content to Calendar</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Content</label>
              <Select value={selectedContent} onValueChange={setSelectedContent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose content to schedule" />
                </SelectTrigger>
                <SelectContent>
                  {unscheduledItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title} ({item.content_type || 'Article'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Select Date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={scheduleContent}
                disabled={!selectedDate || !selectedContent || isScheduling}
                className="flex-1"
              >
                {isScheduling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
