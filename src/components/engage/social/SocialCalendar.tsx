import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SocialPost {
  id: string;
  content: string;
  scheduled_at: string | null;
  status: string;
  social_post_targets?: any[];
}

interface SocialCalendarProps {
  posts: SocialPost[];
}

const statusDot: Record<string, string> = {
  draft: 'bg-muted-foreground',
  scheduled: 'bg-info',
  posted: 'bg-success',
  failed: 'bg-destructive',
};

export const SocialCalendar: React.FC<SocialCalendarProps> = ({ posts }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startPadding = getDay(startOfMonth(currentMonth));

  const postsByDay = useMemo(() => {
    const map: Record<string, SocialPost[]> = {};
    posts.forEach(p => {
      if (p.scheduled_at) {
        const key = format(new Date(p.scheduled_at), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(p);
      }
    });
    return map;
  }, [posts]);

  return (
    <div className="space-y-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium text-foreground">{format(currentMonth, 'MMMM yyyy')}</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-px">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-xs font-medium text-muted-foreground text-center py-1.5">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {/* Padding for start of month */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="bg-card/30 min-h-[80px] p-1.5" />
        ))}

        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const dayPosts = postsByDay[key] || [];
          const isToday = isSameDay(day, new Date());

          return (
            <div key={key} className={`bg-card min-h-[80px] p-1.5 ${isToday ? 'ring-1 ring-inset ring-primary/40' : ''}`}>
              <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayPosts.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center gap-1">
                    <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusDot[p.status] || statusDot.draft}`} />
                    <span className="text-[10px] text-foreground truncate">{p.content.substring(0, 20)}</span>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
