import React, { useState, useEffect } from 'react';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MousePointer, Search, CheckSquare, Square, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TermSelectionStep = () => {
  const { state, dispatch } = useGlossaryBuilder();
  const { suggestedTerms, selectedTerms } = state;
  
  const [searchFilter, setSearchFilter] = useState('');
  const [localSelectedTerms, setLocalSelectedTerms] = useState<string[]>(selectedTerms);

  // Update local state when global state changes
  useEffect(() => {
    setLocalSelectedTerms(selectedTerms);
  }, [selectedTerms]);

  // Update selected terms when local selection changes
  useEffect(() => {
    if (localSelectedTerms.length > 0) {
      dispatch({ type: 'SELECT_TERMS', payload: localSelectedTerms });
    }
  }, [localSelectedTerms, dispatch]);

  const filteredTerms = suggestedTerms.filter(term =>
    term.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleTermToggle = (term: string) => {
    setLocalSelectedTerms(prev => 
      prev.includes(term) 
        ? prev.filter(t => t !== term)
        : [...prev, term]
    );
  };

  const handleSelectAll = () => {
    setLocalSelectedTerms(filteredTerms);
  };

  const handleClearSelection = () => {
    setLocalSelectedTerms([]);
  };

  const isTermSelected = (term: string) => localSelectedTerms.includes(term);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-purple-500/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Interactive Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-32 right-32 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 w-full px-6 pt-12 pb-12">
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
            <MousePointer className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium">Multi-Select Terms</span>
            <Badge variant="secondary">{suggestedTerms.length} available</Badge>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-purple-500 to-pink-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Select Your Terms
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Choose the terms you want to include in your glossary. Select multiple terms for efficient batch processing.
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
                  <MousePointer className="h-5 w-5 text-purple-500" />
                  Term Selection
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {localSelectedTerms.length} selected
                  </Badge>
                  <Badge variant="secondary">
                    {suggestedTerms.length} total
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search terms..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSelectAll}
                    className="bg-background/60"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClearSelection}
                    className="bg-background/60"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>

              {/* Terms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {filteredTerms.map((term, index) => (
                    <motion.div
                      key={term}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-102
                        ${isTermSelected(term)
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/40 shadow-lg shadow-purple-500/20'
                          : 'bg-background/60 border-border/40 hover:bg-background/80 hover:border-purple-500/20'
                        }
                      `}
                      onClick={() => handleTermToggle(term)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Checkbox
                        checked={isTermSelected(term)}
                        onChange={() => handleTermToggle(term)}
                        className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                      <span className={`
                        text-sm font-medium transition-colors duration-300 flex-1
                        ${isTermSelected(term) ? 'text-foreground' : 'text-foreground/80'}
                      `}>
                        {term}
                      </span>
                      {isTermSelected(term) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-purple-500 rounded-full"
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Selection Summary */}
              <AnimatePresence>
                {localSelectedTerms.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl border border-purple-500/20"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Selection Summary
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {localSelectedTerms.slice(0, 10).map((term) => (
                        <Badge 
                          key={term} 
                          variant="secondary" 
                          className="bg-purple-500/10 text-purple-700 dark:text-purple-300"
                        >
                          {term}
                        </Badge>
                      ))}
                      {localSelectedTerms.length > 10 && (
                        <Badge variant="outline">
                          +{localSelectedTerms.length - 10} more
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {localSelectedTerms.length} terms selected for definition generation. 
                      Click "Next" to choose a solution context.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty State */}
              {suggestedTerms.length === 0 && (
                <div className="text-center py-12">
                  <MousePointer className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No Terms Available</h3>
                  <p className="text-muted-foreground">
                    Please go back to the previous step to discover terms first.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};