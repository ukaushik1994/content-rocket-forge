import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Search, Mail, CreditCard, Zap } from 'lucide-react';
import { ApiProvider } from './types';
import { motion } from 'framer-motion';

interface CategoryTabsProps {
  providers: ApiProvider[];
  selectedProviders: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  children: React.ReactNode;
}

export const CategoryTabs = ({ 
  providers, 
  selectedProviders, 
  activeCategory, 
  onCategoryChange,
  children 
}: CategoryTabsProps) => {
  const categories = [
    { id: 'all', name: 'All APIs', icon: Zap },
    { id: 'AI Services', name: 'AI Services', icon: Brain },
    { id: 'SEO & Analytics', name: 'SEO & Analytics', icon: Search },
    { id: 'Communication', name: 'Communication', icon: Mail },
    { id: 'Payments', name: 'Payments', icon: CreditCard },
  ];

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') {
      return providers.filter(p => p.required || selectedProviders.includes(p.id)).length;
    }
    return providers.filter(p => 
      p.category === categoryId && (p.required || selectedProviders.includes(p.id))
    ).length;
  };

  const getConfiguredCount = (categoryId: string) => {
    const categoryProviders = categoryId === 'all' 
      ? providers.filter(p => p.required || selectedProviders.includes(p.id))
      : providers.filter(p => p.category === categoryId && (p.required || selectedProviders.includes(p.id)));
    
    // For now, we'll show all as potentially configured
    // In a real implementation, you'd check the actual API key status
    return Math.floor(categoryProviders.length * 0.6); // Simulate some configured
  };

  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-background/50 backdrop-blur-sm border border-border/50">
        {categories.map((category) => {
          const totalCount = getCategoryCount(category.id);
          const configuredCount = getConfiguredCount(category.id);
          const Icon = category.icon;
          
          return (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex flex-col items-center gap-2 py-3 px-4 data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="font-medium text-sm">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-muted/50 text-muted-foreground"
                >
                  {configuredCount}/{totalCount}
                </Badge>
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <div className="mt-6">
        {children}
      </div>
    </Tabs>
  );
};