import React, { useState, useEffect } from 'react';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Search, ExternalLink, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock solutions data - in a real app this would come from your solutions database
const mockSolutions = [
  {
    id: '1',
    name: 'ContentCraft Pro',
    description: 'AI-powered content creation and optimization platform',
    category: 'Content Marketing',
    features: ['AI Writing', 'SEO Optimization', 'Content Calendar', 'Analytics'],
    useCases: ['Blog Posts', 'Social Media', 'Email Campaigns', 'Landing Pages'],
    logoUrl: null,
  },
  {
    id: '2',
    name: 'SEO Master Suite',
    description: 'Comprehensive SEO analysis and ranking tool',
    category: 'SEO Tools',
    features: ['Keyword Research', 'Rank Tracking', 'Site Audit', 'Competitor Analysis'],
    useCases: ['Website Optimization', 'Keyword Strategy', 'Technical SEO', 'Content Planning'],
    logoUrl: null,
  },
  {
    id: '3',
    name: 'Marketing Automation Hub',
    description: 'All-in-one marketing automation and CRM platform',
    category: 'Marketing Automation',
    features: ['Email Marketing', 'Lead Scoring', 'Campaign Management', 'Analytics'],
    useCases: ['Lead Nurturing', 'Customer Onboarding', 'Sales Funnel', 'Retention'],
    logoUrl: null,
  },
  {
    id: '4',
    name: 'Analytics Pro',
    description: 'Advanced web analytics and conversion tracking',
    category: 'Analytics',
    features: ['Traffic Analysis', 'Conversion Tracking', 'User Behavior', 'Reports'],
    useCases: ['Performance Monitoring', 'Conversion Optimization', 'User Experience', 'ROI Tracking'],
    logoUrl: null,
  }
];

export const SolutionContextStep = () => {
  const { state, dispatch } = useGlossaryBuilder();
  const { selectedSolution } = state;
  
  const [localSelectedSolution, setLocalSelectedSolution] = useState(selectedSolution);
  const [searchFilter, setSearchFilter] = useState('');

  // Mark step as completed when solution is selected
  useEffect(() => {
    if (localSelectedSolution) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
      dispatch({ type: 'SET_SELECTED_SOLUTION', payload: localSelectedSolution });
    }
  }, [localSelectedSolution, dispatch]);

  const filteredSolutions = mockSolutions.filter(solution =>
    solution.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    solution.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    solution.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSolutionSelect = (solution: any) => {
    setLocalSelectedSolution(solution);
  };

  const handleSkip = () => {
    setLocalSelectedSolution(null);
    dispatch({ type: 'SET_SELECTED_SOLUTION', payload: null });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-blue-500/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Interactive Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-40 left-32 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 40, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Building className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Solution Context</span>
            <Badge variant="secondary">Optional</Badge>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-blue-500 to-cyan-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Choose Solution Context
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Select a solution to contextualize your glossary definitions. This will help AI generate 
            definitions that reference your specific product or service, making them more relevant to your audience.
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-background/60 backdrop-blur-xl border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  Available Solutions
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSkip}>
                    Skip This Step
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search solutions..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background/60 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              {/* Solutions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredSolutions.map((solution, index) => (
                    <motion.div
                      key={solution.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        relative group cursor-pointer transition-all duration-300 hover:scale-102
                        ${localSelectedSolution?.id === solution.id
                          ? 'ring-2 ring-blue-500/40'
                          : ''
                        }
                      `}
                      onClick={() => handleSolutionSelect(solution)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className={`
                        h-full transition-all duration-300
                        ${localSelectedSolution?.id === solution.id
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/40 shadow-lg shadow-blue-500/20'
                          : 'bg-background/60 border-border/40 hover:bg-background/80 hover:border-blue-500/20'
                        }
                      `}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-1">{solution.name}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {solution.category}
                              </Badge>
                            </div>
                            {localSelectedSolution?.id === solution.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-blue-500"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </motion.div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {solution.description}
                          </p>
                          
                          <div>
                            <h4 className="text-xs font-medium text-foreground/80 mb-2">Key Features</h4>
                            <div className="flex flex-wrap gap-1">
                              {solution.features.slice(0, 3).map((feature) => (
                                <Badge 
                                  key={feature} 
                                  variant="secondary" 
                                  className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                >
                                  {feature}
                                </Badge>
                              ))}
                              {solution.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{solution.features.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-medium text-foreground/80 mb-2">Use Cases</h4>
                            <div className="flex flex-wrap gap-1">
                              {solution.useCases.slice(0, 2).map((useCase) => (
                                <Badge 
                                  key={useCase} 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {useCase}
                                </Badge>
                              ))}
                              {solution.useCases.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{solution.useCases.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Selection Summary */}
              <AnimatePresence>
                {localSelectedSolution && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl border border-blue-500/20"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Selected Solution
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{localSelectedSolution.name}</h4>
                        <p className="text-sm text-muted-foreground">{localSelectedSolution.description}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setLocalSelectedSolution(null)}
                      >
                        Change
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Great! Your glossary definitions will be contextualized around{' '}
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {localSelectedSolution.name}
                      </span>
                      . Click "Next" to generate definitions.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};