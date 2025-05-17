
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { RecentProjectsSection } from '@/components/dashboard/RecentProjectsSection';
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog';

const Dashboard = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const navigate = useNavigate();

  // Mock data for dashboard stats
  const stats = [
    {
      title: "Content Items",
      value: "128",
      description: "items",
      trend: {
        value: 12,
        positive: true
      }
    },
    {
      title: "Keywords Tracked",
      value: "347",
      description: "keywords",
      trend: {
        value: 24,
        positive: true
      }
    },
    {
      title: "Average Position",
      value: "4.3",
      description: "positions",
      trend: {
        value: 0.8,
        positive: true
      }
    },
    {
      title: "Organic Traffic",
      value: "14.2k",
      description: "visits",
      trend: {
        value: 18,
        positive: true
      }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-950">
      <Helmet>
        <title>Dashboard | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8 space-y-6">
        <WelcomeSection 
          setFeedbackOpen={setFeedbackOpen} 
          navigate={navigate} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              trend={stat.trend}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Performance Overview</h2>
            <PerformanceChart />
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
            <QuickActionsGrid navigate={navigate} />
          </div>
        </div>
        
        <RecentProjectsSection navigate={navigate} />
      </main>
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-neon-pink/5 rounded-full blur-3xl"></div>
      </div>
      
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
};

export default Dashboard;
