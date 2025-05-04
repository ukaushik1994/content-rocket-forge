
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface RecentProjectsSectionProps {
  navigate: NavigateFunction;
}

export const RecentProjectsSection: React.FC<RecentProjectsSectionProps> = ({ navigate }) => {
  const projects = [
    {
      title: "Best Project Management Software",
      status: "Published",
      score: 92,
      date: "Apr 28, 2025",
      clicks: 487,
      impressions: 5240
    },
    {
      title: "Email Marketing Platforms Comparison",
      status: "Draft",
      score: 78,
      date: "Apr 25, 2025",
      clicks: 0,
      impressions: 0
    },
    {
      title: "Top CRM Solutions for SMBs",
      status: "In Progress",
      score: 65,
      date: "Apr 22, 2025",
      clicks: 0,
      impressions: 0
    }
  ];

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Published':
        return 'bg-green-500/20 text-green-500';
      case 'Draft':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-blue-500/20 text-blue-500';
    }
  };

  return (
    <div className="space-y-4">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Recent Projects
          </span>
          <Badge variant="outline" className="ml-2 bg-neon-purple/10 text-xs font-normal">
            {projects.length}
          </Badge>
        </h2>
        <Button variant="link" className="text-primary flex items-center gap-1" onClick={() => navigate('/content')}>
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="glass-panel hover:shadow-neon transition-all duration-300 group transform hover:scale-[1.01]">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gradient">{project.title}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs ${getStatusClass(project.status)}`}>
                    {project.status}
                  </div>
                </div>
                
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">SEO Score</span>
                    <div className="flex items-center">
                      <div className="w-24 h-1.5 bg-gray-700 rounded-full mr-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            project.score >= 80 ? 'bg-green-500' : 
                            project.score >= 60 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${project.score}%` }}
                        />
                      </div>
                      <span className="font-medium">{project.score}/100</span>
                    </div>
                  </div>
                  
                  {project.status === 'Published' && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1 bg-background/20 rounded-md p-2">
                        <span className="block text-muted-foreground text-xs">Clicks</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{project.clicks}</span>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        </div>
                      </div>
                      <div className="space-y-1 bg-background/20 rounded-md p-2">
                        <span className="block text-muted-foreground text-xs">Impressions</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{project.impressions.toLocaleString()}</span>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Last updated: {project.date}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 bg-background/20 border-white/10 hover:bg-background/40 hover:border-white/20" 
                  onClick={() => navigate('/content')}
                >
                  {project.status === 'Published' ? 'View Stats' : 'Continue Editing'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
