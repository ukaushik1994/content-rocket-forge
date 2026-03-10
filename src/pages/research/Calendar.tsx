import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Sparkles, CalendarDays, Plus, BarChart3, Zap } from 'lucide-react';
import { PageBreadcrumb } from '@/components/shared/PageBreadcrumb';
import { ContentStrategyProvider, useContentStrategy } from '@/contexts/ContentStrategyContext';
import { EditorialCalendar } from '@/components/research/content-strategy/calendar/EditorialCalendar';
import { useProposalRestoration } from '@/hooks/useProposalRestoration';
import { PageContainer } from '@/components/ui/PageContainer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

const CalendarInner: React.FC = () => {
  const { currentStrategy } = useContentStrategy();
  
  // Enable automatic proposal restoration
  useProposalRestoration();

  const goals = React.useMemo(() => ({
    monthlyTraffic: currentStrategy?.monthly_traffic_goal?.toString() || '',
    contentPieces: currentStrategy?.content_pieces_per_month?.toString() || '',
    timeline: currentStrategy?.timeline || '3 months',
    mainKeyword: currentStrategy?.main_keyword || ''
  }), [currentStrategy]);

  return (
    <section aria-labelledby="calendar-heading">
      <h2 id="calendar-heading" className="sr-only">Editorial Calendar Module</h2>
      <EditorialCalendar goals={goals} />
    </section>
  );
};

const CalendarPage: React.FC = () => {
  const canonicalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/research/calendar`
    : '/research/calendar';

  return (
    <ContentStrategyProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Helmet>
          <title>Calendar | Creaiter</title>
          <meta name="description" content="Plan, schedule, and track your content production with a beautiful editorial calendar." />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>


        {/* Background orbs */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-30 will-change-transform transform-gpu animate-float" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl opacity-20 will-change-transform transform-gpu animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <main className="flex-1 container py-10 z-10 relative max-w-7xl mx-auto">
          <PageBreadcrumb section="Calendar" page="Editorial Calendar" />
          {/* Hero */}
          <motion.section
            className="text-center mb-10 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="relative">
              <motion.div
                className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-6"
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Smart Scheduling</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent"
              >
                Editorial Calendar
              </motion.h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Organize, schedule, and track your content with clarity.
              </p>

              {/* Quick stats */}
              <div className="flex justify-center gap-6">
                {[{Icon: CalendarDays, label: 'Schedule'}, {Icon: Plus, label: 'Add'}, {Icon: Zap, label: 'Real-time'}].map(({Icon, label}) => (
                  <motion.div key={label} className="text-center" whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          <CalendarInner />
        </main>
      </div>
    </ContentStrategyProvider>
  );
};

export default CalendarPage;