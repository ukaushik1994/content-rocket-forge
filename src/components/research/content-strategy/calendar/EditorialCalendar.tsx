
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'social' | 'video' | 'email';
  status: 'planning' | 'writing' | 'review' | 'scheduled' | 'published';
  scheduledDate: Date;
  assignee?: string;
}

interface EditorialCalendarProps {
  goals: any;
}

export const EditorialCalendar = ({ goals }: EditorialCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: `${goals.mainKeyword} Complete Guide`,
      type: 'blog',
      status: 'writing',
      scheduledDate: new Date(2025, 0, 15),
      assignee: 'Sarah'
    },
    {
      id: '2',
      title: `${goals.mainKeyword} Tips`,
      type: 'social',
      status: 'scheduled',
      scheduledDate: new Date(2025, 0, 20),
      assignee: 'Mike'
    },
    {
      id: '3',
      title: `Advanced ${goals.mainKeyword}`,
      type: 'video',
      status: 'planning',
      scheduledDate: new Date(2025, 0, 25),
      assignee: 'Alex'
    }
  ]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      writing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      review: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      scheduled: 'bg-green-500/20 text-green-300 border-green-500/30',
      published: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      blog: '📝',
      social: '📱',
      video: '🎬',
      email: '✉️'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getContentForDate = (date: Date) => {
    return contentItems.filter(item => isSameDay(item.scheduledDate, date));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <Card className="glass-panel border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm border border-white/10">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Editorial Calendar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[200px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" className="bg-primary/20 hover:bg-primary/30">
              <Plus className="h-4 w-4 mr-1" />
              Add Content
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map(day => {
            const dayContent = getContentForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <motion.div
                key={day.toISOString()}
                whileHover={{ scale: 1.02 }}
                className={`
                  min-h-[120px] p-2 rounded-lg border transition-all cursor-pointer
                  ${isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                  }
                `}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-sm font-medium text-white mb-2">
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayContent.slice(0, 2).map(item => (
                    <div 
                      key={item.id}
                      className="text-xs p-1 rounded bg-white/10 border border-white/20 truncate"
                    >
                      <div className="flex items-center gap-1">
                        <span>{getTypeIcon(item.type)}</span>
                        <span className="text-white/80 truncate">{item.title}</span>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(item.status)} text-xs mt-1`}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                  {dayContent.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{dayContent.length - 2} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-white/10"
          >
            <h4 className="text-lg font-semibold text-white mb-3">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            <div className="space-y-2">
              {getContentForDate(selectedDate).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                    <div>
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.assignee && `Assigned to: ${item.assignee}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {getContentForDate(selectedDate).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No content scheduled for this date</p>
                  <Button size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Schedule Content
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
