import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
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
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
};

export const SocialCalendar: React.FC<SocialCalendarProps> = ({ posts, onDayClick }) => {
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
    <GlassCard className="p-4 space-y-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-foreground">{format(currentMonth, 'MMMM yyyy')}</h3>
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
      <AnimatePresence mode="wait">
        <motion.div
          key={format(currentMonth, 'yyyy-MM')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden"
        >
          {/* Padding */}
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="bg-background/20 min-h-[80px] p-1.5" />
          ))}

          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const dayPosts = postsByDay[key] || [];
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={key}
                onClick={() => onDayClick?.(day)}
                className={`bg-card/60 min-h-[80px] p-1.5 cursor-pointer transition-all duration-200 hover:bg-card/90 ${
                  isToday ? 'ring-1 ring-inset ring-primary/50 bg-primary/5' : ''
                }`}
              >
                <span className={`text-xs font-medium ${isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {format(day, 'd')}
                </span>
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
          })}
        </motion.div>
      </AnimatePresence>
    </GlassCard>
  );
};
