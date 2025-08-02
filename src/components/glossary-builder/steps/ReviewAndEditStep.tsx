import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { 
  FileText, 
  Edit3, 
  Save,
  Eye,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ReviewAndEditStep = () => {
  const { state, updateTerm } = useGlossaryBuilder();
  const { generatedTerms } = state;
  const [editingTerm, setEditingTerm] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    shortDefinition: '',
    expandedExplanation: ''
  });

  const handleStartEdit = (term: any) => {
    setEditingTerm(term.id);
    setEditForm({
      shortDefinition: term.shortDefinition || '',
      expandedExplanation: term.expandedExplanation || ''
    });
  };

  const handleSaveEdit = async (term: any) => {
    const updatedTerm = {
      ...term,
      shortDefinition: editForm.shortDefinition,
      expandedExplanation: editForm.expandedExplanation,
      status: 'completed' as const,
      lastUpdated: new Date().toISOString()
    };
    
    await updateTerm(updatedTerm);
    setEditingTerm(null);
  };

  const handleCancelEdit = () => {
    setEditingTerm(null);
    setEditForm({ shortDefinition: '', expandedExplanation: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'needs_review': return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const completedTerms = generatedTerms.filter(term => term.status === 'completed').length;
  const reviewProgress = generatedTerms.length > 0 ? (completedTerms / generatedTerms.length) * 100 : 0;

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Interactive Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 right-20 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -50, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Review & Refine</span>
            <Badge variant="secondary">
              {completedTerms}/{generatedTerms.length} reviewed
            </Badge>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent">
            Review & Perfect
            <br />
            <span className="text-primary">Definitions</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Review and refine the AI-generated definitions. Make any necessary edits 
            to ensure accuracy and alignment with your requirements.
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div 
          className="max-w-4xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 backdrop-blur-xl border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Review Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedTerms} of {generatedTerms.length} terms reviewed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(reviewProgress)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
              <div className="w-full bg-background/20 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${reviewProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Terms List */}
        <motion.div 
          className="max-w-6xl mx-auto space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence>
            {generatedTerms.map((term, index) => (
              <motion.div
                key={term.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {term.term.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {term.term}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(term.status)}>
                          {term.status === 'completed' ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {term.status.replace('_', ' ')}
                        </Badge>
                        {editingTerm === term.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(term)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEdit(term)}
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingTerm === term.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Short Definition</label>
                          <Input
                            value={editForm.shortDefinition}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              shortDefinition: e.target.value
                            }))}
                            placeholder="Brief, clear definition"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Expanded Explanation</label>
                          <Textarea
                            value={editForm.expandedExplanation}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              expandedExplanation: e.target.value
                            }))}
                            placeholder="Detailed explanation with context and examples"
                            className="min-h-[120px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Short Definition
                          </h4>
                          <p className="text-foreground">
                            {term.shortDefinition || 'No short definition provided'}
                          </p>
                        </div>
                        
                        {term.expandedExplanation && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Expanded Explanation
                            </h4>
                            <p className="text-foreground leading-relaxed">
                              {term.expandedExplanation}
                            </p>
                          </div>
                        )}

                        {term.relatedTerms.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">
                              Related Terms
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {term.relatedTerms.map((relatedTerm) => (
                                <Badge key={relatedTerm} variant="outline" className="text-xs">
                                  {relatedTerm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {generatedTerms.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Terms to Review</h3>
            <p className="text-muted-foreground">
              Generate some definitions first to review and edit them here.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};