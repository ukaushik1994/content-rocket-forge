import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { ChevronLeft, ChevronRight, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';

interface SocialPost {
  id: string;
  content: string;
  scheduled_at: string | null;
  status: string;
  social_post_targets?: any[];
}

interface SocialCalendarProps {
  posts: SocialPost[];
  onDayClick?: (date: Date) => void;
}

const statusDot: Record<string, string> = {
  draft: 'bg-muted-foreground',
  scheduled: 'bg-blue-400',
  posted: 'bg-green-400',
  failed: 'bg-destructive',
};

const channelIcons: Record<string, React.ElementType> = {
  twitter: Twitter, linkedin: Linkedin, instagram: Instagram, facebook: Facebook,
};

const timeSlots = ['Morning', 'Afternoon', 'Evening'] as const;

const getTimeSlot = (date: Date): typeof timeSlots[number] => {
  const h = date.getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

export const SocialCalendar: React.FC<SocialCalendarProps> = ({ posts, onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const startPadding = viewMode === 'month' ? getDay(startOfMonth(currentDate)) : 0;

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

  const navigate = (dir: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(d => dir === 'prev' ? subMonths(d, 1) : addMonths(d, 1));
    } else {
      setCurrentDate(d => dir === 'prev' ? subWeeks(d, 1) : addWeeks(d, 1));
    }
  };

  const days = viewMode === 'month' ? monthDays : weekDays;

  const renderDayCell = (day: Date, minHeight: string) => {
    const key = format(day, 'yyyy-MM-dd');
    const dayPosts = postsByDay[key] || [];
    const isToday = isSameDay(day, new Date());
    const postCount = dayPosts.length;

    return (
      <div
        key={key}
        onClick={() => onDayClick?.(day)}
        className={`bg-card/60 ${minHeight} p-1.5 cursor-pointer transition-all duration-200 hover:bg-card/90 ${
          isToday ? 'ring-1 ring-inset ring-primary/50 bg-primary/5' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
            {viewMode === 'week' ? format(day, 'EEE d') : format(day, 'd')}
          </span>
          {postCount >= 2 && (
            <span className="text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full leading-none">
              {postCount}
            </span>
          )}
        </div>
        <div className="mt-1 space-y-0.5">
          {dayPosts.slice(0, 3).map(p => {
            const targets = p.social_post_targets || [];
            return (
              <div key={p.id} className="flex items-center gap-1">
                <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusDot[p.status] || statusDot.draft}`} />
                {targets.slice(0, 2).map((t: any) => {
                  const Icon = channelIcons[t.provider];
                  return Icon ? <Icon key={t.id} className="h-2.5 w-2.5 text-muted-foreground/70 flex-shrink-0" /> : null;
                })}
                <span className="text-[10px] text-foreground/80 truncate">{p.content.substring(0, 15)}</span>
              </div>
            );
          })}
          {dayPosts.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} more</span>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden">
        {weekDays.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const dayPosts = postsByDay[key] || [];
          const isToday = isSameDay(day, new Date());

          const slotted: Record<string, SocialPost[]> = { Morning: [], Afternoon: [], Evening: [] };
          dayPosts.forEach(p => {
            if (p.scheduled_at) {
              const slot = getTimeSlot(new Date(p.scheduled_at));
              slotted[slot].push(p);
            }
          });

          return (
            <div key={key} className={`bg-card/60 min-h-[200px] ${isToday ? 'ring-1 ring-inset ring-primary/50 bg-primary/5' : ''}`}>
              <div className="p-2 border-b border-border/30 text-center">
                <span className={`text-xs font-medium ${isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {format(day, 'EEE')}
                </span>
                <p className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>{format(day, 'd')}</p>
              </div>
              {timeSlots.map(slot => (
                <div
                  key={slot}
                  onClick={() => onDayClick?.(day)}
                  className="p-1.5 border-b border-border/20 min-h-[50px] cursor-pointer hover:bg-card/90 transition-colors"
                >
                  <span className="text-[9px] text-muted-foreground/50 uppercase">{slot}</span>
                  {slotted[slot].map(p => (
                    <div key={p.id} className="flex items-center gap-1 mt-0.5">
                      <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusDot[p.status] || statusDot.draft}`} />
                      <span className="text-[9px] text-foreground/80 truncate">{p.content.substring(0, 12)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <GlassCard className="p-4 space-y-3">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">
            {viewMode === 'month'
              ? format(currentDate, 'MMMM yyyy')
              : `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
            }
          </h3>
          <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
            <Button variant={viewMode === 'month' ? 'secondary' : 'ghost'} size="sm" className="rounded-none h-7 text-xs" onClick={() => setViewMode('month')}>
              Month
            </Button>
            <Button variant={viewMode === 'week' ? 'secondary' : 'ghost'} size="sm" className="rounded-none h-7 text-xs" onClick={() => setViewMode('week')}>
              Week
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-px">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-xs font-medium text-muted-foreground text-center py-1.5">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${format(currentDate, 'yyyy-MM-dd')}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'week' ? renderWeekView() : (
            <div className="grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden">
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} className="bg-background/20 min-h-[80px] p-1.5" />
              ))}
              {days.map(day => renderDayCell(day, 'min-h-[80px]'))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </GlassCard>
  );
};
