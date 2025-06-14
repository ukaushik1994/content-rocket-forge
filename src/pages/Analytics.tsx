
import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';

const Analytics = () => {
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background futuristic-grid"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Helmet>
        <title>Analytics | ContentRocketForge</title>
        <meta name="description" content="Content performance analytics and insights" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8 max-w-7xl">
        <motion.div variants={itemVariants} className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 text-gradient animate-pulse-glow">
              Analytics
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Track your content performance and gain insights
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-neon border-0 card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-neon-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">45,231</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card className="shadow-neon border-0 card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-neon-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">12.5%</div>
              <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            </CardContent>
          </Card>

          <Card className="shadow-neon border-0 card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-neon-pink" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">2,350</div>
              <p className="text-xs text-muted-foreground">+15.3% from last month</p>
            </CardContent>
          </Card>

          <Card className="shadow-neon border-0 card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-neon-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">8.2%</div>
              <p className="text-xs text-muted-foreground">+1.2% from last month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-neon border-0 card-glass">
            <CardHeader>
              <CardTitle className="text-gradient">Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed analytics features coming soon. This page will show comprehensive 
                content performance metrics, user engagement data, and conversion tracking.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default Analytics;
