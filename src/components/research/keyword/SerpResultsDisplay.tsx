
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Tag, FileText, Globe, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SerpResultsDisplayProps {
  serpData: any;
  onSelectKeywords: (keywords: string[]) => void;
  selectedKeywords: string[];
}

export const SerpResultsDisplay: React.FC<SerpResultsDisplayProps> = ({
  serpData,
  onSelectKeywords,
  selectedKeywords
}) => {
  const [activeSection, setActiveSection] = useState('questions');

  const handleKeywordToggle = (keyword: string) => {
    const newSelection = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword];
    onSelectKeywords(newSelection);
  };

  const sections = [
    {
      id: 'questions',
      title: 'People Also Ask',
      icon: HelpCircle,
      data: serpData?.peopleAlsoAsk || [],
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'keywords',
      title: 'Related Keywords',
      icon: Tag,
      data: serpData?.keywords || [],
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'entities',
      title: 'Key Entities',
      icon: FileText,
      data: serpData?.entities || [],
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'competitors',
      title: 'Top Results',
      icon: Globe,
      data: serpData?.topResults || [],
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    }
  ];

  const activeData = sections.find(s => s.id === activeSection);

  return (
    <div className="space-y-6">
      {/* Section Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 ${
                activeSection === section.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:border-white/20'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 ${section.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <h3 className="font-semibold mb-1">{section.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {section.data.length} items
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <activeData.icon className={`h-5 w-5 ${activeData.color}`} />
                  {activeData.title}
                </span>
                <Badge variant="outline">
                  {selectedKeywords.length} selected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeSection === 'questions' && (
                  <div className="space-y-3">
                    {serpData?.peopleAlsoAsk?.map((question, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <Checkbox
                          checked={selectedKeywords.includes(question.question)}
                          onCheckedChange={() => handleKeywordToggle(question.question)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{question.question}</p>
                          {question.answer && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {question.answer}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeSection === 'keywords' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {serpData?.keywords?.map((keyword, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <Checkbox
                          checked={selectedKeywords.includes(keyword)}
                          onCheckedChange={() => handleKeywordToggle(keyword)}
                        />
                        <Badge variant="outline" className="flex-1">
                          {keyword}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeSection === 'entities' && (
                  <div className="space-y-3">
                    {serpData?.entities?.map((entity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <Checkbox
                          checked={selectedKeywords.includes(entity.name)}
                          onCheckedChange={() => handleKeywordToggle(entity.name)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{entity.name}</p>
                            {entity.type && (
                              <Badge variant="secondary" className="text-xs">
                                {entity.type}
                              </Badge>
                            )}
                          </div>
                          {entity.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {entity.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeSection === 'competitors' && (
                  <div className="space-y-3">
                    {serpData?.topResults?.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">#{result.position}</Badge>
                              <h3 className="font-medium">{result.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{result.snippet}</p>
                            <p className="text-xs text-primary">{new URL(result.link).hostname}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Analyze
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {activeData?.data.length === 0 && (
                <div className="text-center py-8">
                  <activeData.icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No {activeData.title.toLowerCase()} found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
