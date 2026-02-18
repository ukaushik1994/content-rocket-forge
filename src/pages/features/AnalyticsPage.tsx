import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FeaturePageHero } from '@/components/landing/shared/FeaturePageHero';
import { FeatureSection } from '@/components/landing/shared/FeatureSection';
import { AIChatCTA } from '@/components/landing/shared/AIChatCTA';
import {
  BarChart3, TrendingUp, DollarSign, Brain, Eye, Target,
  ArrowUpRight, ArrowDownRight, Sparkles, PieChart, Activity
} from 'lucide-react';

/* ── Mock UIs ── */
const DashboardMockUI = () => (
  <div className="space-y-4">
    {/* Stat cards */}
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Total Views', value: '124.8K', change: '+23%', up: true, color: 'text-neon-blue' },
        { label: 'Conversions', value: '3,847', change: '+18%', up: true, color: 'text-green-400' },
        { label: 'Revenue', value: '$48.2K', change: '+31%', up: true, color: 'text-neon-orange' },
      ].map((stat) => (
        <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-muted-foreground">{stat.label}</span>
          <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
          <div className="flex items-center gap-1">
            {stat.up ? <ArrowUpRight className="h-3 w-3 text-green-400" /> : <ArrowDownRight className="h-3 w-3 text-red-400" />}
            <span className="text-[10px] text-green-400">{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
    {/* Chart mockup */}
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-foreground">Performance Trend</span>
        <span className="text-[10px] text-muted-foreground">Last 30 days</span>
      </div>
      <div className="flex items-end gap-1.5 h-24">
        {[35, 42, 28, 55, 48, 62, 45, 70, 58, 75, 68, 82, 72, 88, 78, 92, 85, 95, 88, 98].map((h, i) => (
          <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `linear-gradient(to top, #F97316${Math.round(h * 0.8).toString(16).padStart(2, '0')}, #D946EF${Math.round(h * 0.6).toString(16).padStart(2, '0')})` }} />
        ))}
      </div>
    </div>
  </div>
);

const InsightsMockUI = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-2">
      <Brain className="h-4 w-4 text-neon-orange" />
      <span className="text-sm font-semibold text-foreground">AI Content Insights</span>
    </div>
    {[
      { title: 'Sustainable Fashion Guide', score: 94, views: '12.4K', trend: '+45%', recommendation: 'Create a follow-up piece on eco materials' },
      { title: 'Brand Comparison 2025', score: 87, views: '8.1K', trend: '+22%', recommendation: 'Add more comparison tables to boost time-on-page' },
      { title: 'Interview: Green Designer', score: 72, views: '3.2K', trend: '-8%', recommendation: 'Update intro section — bounce rate is 68%' },
    ].map((item, i) => (
      <div key={i} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">{item.title}</span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold ${item.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{item.trend}</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#F97316 ${item.score}%, transparent ${item.score}%)` }}>
              <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center">
                <span className="text-[8px] font-bold text-neon-orange">{item.score}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neon-orange/5 border border-neon-orange/10">
          <Sparkles className="h-3 w-3 text-neon-orange shrink-0" />
          <span className="text-[10px] text-neon-orange">{item.recommendation}</span>
        </div>
      </div>
    ))}
  </div>
);

const ROIMockUI = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <DollarSign className="h-4 w-4 text-green-400" />
      <span className="text-sm font-semibold text-foreground">Content → Revenue Attribution</span>
    </div>
    {/* Funnel */}
    <div className="space-y-2">
      {[
        { stage: 'Blog Visitors', count: '45,200', width: '100%', color: 'from-neon-blue/30 to-neon-blue/10' },
        { stage: 'Email Subscribers', count: '8,340', width: '65%', color: 'from-primary/30 to-primary/10' },
        { stage: 'Engaged Leads', count: '3,120', width: '42%', color: 'from-neon-pink/30 to-neon-pink/10' },
        { stage: 'Customers', count: '847', width: '25%', color: 'from-green-400/30 to-green-400/10' },
      ].map((stage, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{stage.stage}</span>
            <span className="text-xs font-semibold text-foreground">{stage.count}</span>
          </div>
          <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${stage.color}`} style={{ width: stage.width }} />
          </div>
        </div>
      ))}
    </div>
    {/* ROI metric */}
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-500/5 border border-green-500/15">
      <span className="text-sm text-foreground font-medium">Content ROI</span>
      <span className="text-2xl font-bold text-green-400">412%</span>
    </div>
  </div>
);

const AnalyticsPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>Analytics — Creaiter</title>
        <meta name="description" content="AI-powered analytics: performance dashboards, content insights, and ROI tracking that connect content to business outcomes." />
        <link rel="canonical" href="https://creaiter.lovable.app/features/analytics" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <LandingNavbar />

        <main className="relative z-10">
          <FeaturePageHero
            badge="Analytics Suite"
            badgeIcon={<BarChart3 className="h-4 w-4" />}
            headline="Data-driven decisions."
            highlightedText="Not guesswork."
            subtitle="Performance dashboards, AI-powered insights, and ROI tracking that connect content to revenue."
            gradientFrom="#F97316"
            gradientTo="#D946EF"
            orbColorA="#F97316"
            orbColorB="#D946EF"
            secondaryCTA="Explore analytics tools"
            secondaryRoute="/auth?mode=signup"
          />

          <FeatureSection
            headline="Performance at a glance. Always real-time."
            description="Live dashboards with views, conversions, and revenue — updated in real time with trend analysis and historical comparisons."
            features={['Real-time Data', 'Trend Analysis', 'Custom Dashboards', 'Export Reports', 'Multi-channel']}
            mockUI={<DashboardMockUI />}
            direction="left"
            accentColor="#F97316"
          />

          <FeatureSection
            headline="AI tells you what's working and what to fix."
            description="Content performance scoring, actionable recommendations, and predictive insights — AI identifies opportunities you'd miss."
            features={['Content Scoring', 'AI Recommendations', 'Predictive Insights', 'Bounce Analysis', 'Engagement Metrics']}
            mockUI={<InsightsMockUI />}
            direction="right"
            accentColor="#D946EF"
          />

          <FeatureSection
            headline="Connect content to business outcomes."
            description="Full-funnel attribution from first blog visit to closed deal. See exactly which content drives revenue."
            features={['Attribution Funnel', 'Revenue Tracking', 'ROI Calculation', 'Channel Analysis', 'Goal Tracking']}
            mockUI={<ROIMockUI />}
            direction="left"
            accentColor="#22c55e"
          />

          <AIChatCTA
            chatPrompt="Show me which blog posts drove the most conversions last month and suggest what to write next based on the data..."
            secondaryLabel="Explore analytics tools"
            accentColor="#F97316"
          />
        </main>

        <LandingFooter />
      </div>
    </>
  );
};

export default AnalyticsPage;
