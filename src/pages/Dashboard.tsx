
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { RecentProjectsSection } from '@/components/dashboard/RecentProjectsSection';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  
  // Create props objects that match the expected interfaces
  const welcomeSectionProps = {
    setFeedbackOpen,
    navigate
  };
  
  const statCardProps = [
    { title: "Content Pieces", value: "24", changeValue: "+3" },
    { title: "Average Ranking", value: "12.4", changeValue: "-2.1", isPositive: true },
    { title: "Keywords Tracked", value: "142", changeValue: "+18" },
    { title: "SEO Score", value: "85", suffixText: "%", changeValue: "+5" }
  ];
  
  const quickActionsProps = {
    navigate
  };

  const recentProjectsProps = {
    navigate
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Dashboard | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8 space-y-8">
        <WelcomeSection {...welcomeSectionProps} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCardProps.map((props, index) => (
            <StatCard 
              key={index}
              title={props.title}
              value={props.value}
              changeValue={props.changeValue}
              isPositive={props.isPositive}
              suffixText={props.suffixText}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div>
            <QuickActionsGrid {...quickActionsProps} />
          </div>
        </div>
        
        <RecentProjectsSection {...recentProjectsProps} />
      </main>
    </div>
  );
};

export default DashboardPage;
