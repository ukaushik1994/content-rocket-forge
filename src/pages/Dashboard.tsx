
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { RecentProjectsSection } from '@/components/dashboard/RecentProjectsSection';

const DashboardPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Dashboard | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8 space-y-8">
        <WelcomeSection />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Content Pieces" value="24" change="+3" />
          <StatCard title="Average Ranking" value="12.4" change="-2.1" isPositive={true} />
          <StatCard title="Keywords Tracked" value="142" change="+18" />
          <StatCard title="SEO Score" value="85" suffix="%" change="+5" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div>
            <QuickActionsGrid />
          </div>
        </div>
        
        <RecentProjectsSection />
      </main>
    </div>
  );
};

export default DashboardPage;
