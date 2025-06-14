
import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Eye, Bot, Sparkles, MessageSquare, Zap } from 'lucide-react';

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

        <motion.div variants={itemVariants} className="mb-8">
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

        {/* New AI Assistant Section */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-neon border-0 card-glass overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-neon animate-pulse-glow">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gradient text-xl">AI Analytics Assistant</CardTitle>
                  <p className="text-sm text-muted-foreground">Get intelligent insights and recommendations</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-5 w-5 text-neon-blue" />
                    <span className="font-semibold text-gradient">Smart Insights</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Discover hidden patterns in your analytics data with AI-powered analysis
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-neon-purple" />
                    <span className="font-semibold text-gradient">Trend Predictions</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get forecasts on content performance and user engagement trends
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="h-5 w-5 text-neon-green" />
                    <span className="font-semibold text-gradient">Auto Recommendations</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive personalized suggestions to improve your content strategy
                  </p>
                </motion.div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-purple-600 hover:to-blue-600 shadow-neon hover:shadow-neon-strong transition-all"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat with AI Assistant
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 glass-panel border-white/20 hover:bg-white/10"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default Analytics;
