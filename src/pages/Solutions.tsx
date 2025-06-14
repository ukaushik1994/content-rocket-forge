
import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Puzzle, Zap, Target, Rocket } from 'lucide-react';

const Solutions = () => {
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

  const solutions = [
    {
      icon: Zap,
      title: "Content Automation",
      description: "Automate your content creation workflow with AI-powered tools",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Target,
      title: "SEO Optimization",
      description: "Optimize your content for search engines with advanced analytics",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Rocket,
      title: "Performance Tracking",
      description: "Track and analyze your content performance in real-time",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Puzzle,
      title: "Content Strategy",
      description: "Develop winning content strategies with data-driven insights",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background futuristic-grid"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Helmet>
        <title>Solutions | ContentRocketForge</title>
        <meta name="description" content="Powerful solutions for content creation and optimization" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8 max-w-7xl">
        <motion.div variants={itemVariants} className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 text-gradient animate-pulse-glow">
              Solutions
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Powerful tools and solutions to supercharge your content creation workflow
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {solutions.map((solution, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="cursor-pointer hover:shadow-neon transition-all duration-300 border-0 card-glass overflow-hidden group card-3d h-full">
                <CardContent className="p-6 relative h-full flex flex-col">
                  <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <div className={`w-16 h-16 mb-6 rounded-full bg-gradient-to-br ${solution.gradient} flex items-center justify-center shadow-neon group-hover:shadow-neon-strong transition-all animate-float`}>
                    <solution.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gradient">{solution.title}</h3>
                  <p className="text-muted-foreground mb-6 flex-1">{solution.description}</p>
                  <Button 
                    className={`w-full bg-gradient-to-r ${solution.gradient} hover:opacity-90 shadow-neon`}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-neon border-0 card-glass">
            <CardHeader>
              <CardTitle className="text-gradient text-center">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-lg">
                We're working on exciting new solutions to revolutionize your content workflow. 
                Stay tuned for updates!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default Solutions;
