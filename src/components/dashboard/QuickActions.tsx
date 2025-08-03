import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Eye, 
  Book, 
  Brain, 
  Swords, 
  BarChart3,
  Plus,
  Search,
  FileText,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'create-strategy',
    title: 'Create New Strategy',
    description: 'Start a new content strategy with AI guidance',
    icon: Target,
    route: '/research/content-strategy',
    color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
  },
  {
    id: 'view-opportunities',
    title: 'View Opportunities',
    description: 'Discover new content opportunities and gaps',
    icon: Eye,
    route: '/research/opportunity-hunter',
    color: 'text-green-600 bg-green-50 hover:bg-green-100'
  },
  {
    id: 'glossary-builder',
    title: 'Glossary Builder',
    description: 'Build comprehensive glossaries for your industry',
    icon: Book,
    route: '/glossary-builder',
    color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
  },
  {
    id: 'content-builder',
    title: 'Content Builder',
    description: 'Create and optimize content with AI assistance',
    icon: Brain,
    route: '/content-builder',
    color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
  },
  {
    id: 'competitor-insights',
    title: 'Competitor Insights',
    description: 'Track and analyze competitor content strategies',
    icon: Swords,
    route: '/research/competitor-analysis',
    color: 'text-red-600 bg-red-50 hover:bg-red-100'
  },
  {
    id: 'performance-review',
    title: 'Performance Review',
    description: 'Analyze content performance and ROI metrics',
    icon: BarChart3,
    route: '/analytics',
    color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
  }
];

export const QuickActions = () => {
  const navigate = useNavigate();

  const handleActionClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Customize
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
              onClick={() => handleActionClick(action.route)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-start space-y-4">
                  <div className={`p-3 rounded-lg ${action.color} transition-colors`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                  >
                    Get Started →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};