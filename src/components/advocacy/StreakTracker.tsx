
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export const StreakTracker = () => {
  const currentStreak = 5;
  const longestStreak = 12;
  const weeklyGoal = 3;
  const weeklyProgress = 2;
  
  const streakDays = [
    { day: 'Mon', active: true, date: '12/9' },
    { day: 'Tue', active: true, date: '12/10' },
    { day: 'Wed', active: true, date: '12/11' },
    { day: 'Thu', active: true, date: '12/12' },
    { day: 'Fri', active: true, date: '12/13' },
    { day: 'Sat', active: false, date: '12/14' },
    { day: 'Sun', active: false, date: '12/15' }
  ];

  return (
    <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Flame className="h-5 w-5 text-orange-400" />
          Streak Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-400">{currentStreak}</div>
            <div className="text-xs text-white/70">Current Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{longestStreak}</div>
            <div className="text-xs text-white/70">Best Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{weeklyProgress}/{weeklyGoal}</div>
            <div className="text-xs text-white/70">This Week</div>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Calendar className="h-4 w-4" />
            This Week
          </div>
          <div className="grid grid-cols-7 gap-1">
            {streakDays.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-2 rounded-lg text-center transition-all ${
                  day.active 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                    : 'bg-white/10 text-white/60'
                }`}
              >
                <div className="text-xs font-medium">{day.day}</div>
                <div className="text-xs">{day.date}</div>
                {day.active && (
                  <Flame className="h-3 w-3 mx-auto mt-1" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Streak Milestones */}
        <div className="space-y-2">
          <div className="text-sm text-white/70">Streak Milestones</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">7 days</span>
              <Badge className="bg-green-500/20 text-green-400 text-xs">Unlocked</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">14 days</span>
              <Badge variant="outline" className="border-orange-400 text-orange-300 text-xs">
                {14 - currentStreak} to go
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">30 days</span>
              <Badge variant="outline" className="border-white/20 text-white/40 text-xs">
                Locked
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
