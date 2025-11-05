import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CompanyCompetitor } from '@/contexts/content-builder/types/company-types';
import { 
  Building2, Link as LinkIcon, TrendingUp, TrendingDown, Package, Bookmark, Edit2,
  Target, Globe, ExternalLink, Download, Lightbulb, Brain, CheckCircle2, Star, 
  AlertTriangle, Calendar, RefreshCw, Share2, FileText, Briefcase, Megaphone, Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompetitorSolutionsTab } from './CompetitorSolutionsTab';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface CompetitorProfileDialogProps {
  competitor: CompanyCompetitor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (competitor: CompanyCompetitor) => void;
}

export function CompetitorProfileDialog({ competitor, open, onOpenChange, onEdit }: CompetitorProfileDialogProps) {
  // Helper: Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'website': return <Globe className="w-4 h-4 text-blue-500" />;
      case 'social_media': return <Share2 className="w-4 h-4 text-purple-500" />;
      case 'documentation': return <FileText className="w-4 h-4 text-green-500" />;
      case 'case_studies': return <Briefcase className="w-4 h-4 text-orange-500" />;
      case 'marketing': return <Megaphone className="w-4 h-4 text-pink-500" />;
      default: return <LinkIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  // Helper: Calculate competitive strength score
  const calculateStrengthScore = (comp: CompanyCompetitor): number => {
    const maxScore = 10;
    const score = Math.min(comp.strengths.length, maxScore);
    return Math.round((score / maxScore) * 100);
  };

  // Helper: Calculate threat level
  const calculateThreatLevel = (comp: CompanyCompetitor): number => {
    const strengthWeight = comp.strengths.length * 10;
    const weaknessWeight = comp.weaknesses.length * 5;
    const resourceWeight = comp.resources.length * 3;
    
    const totalThreat = strengthWeight - weaknessWeight + resourceWeight;
    return Math.min(Math.max(Math.round(totalThreat / 2), 0), 100);
  };

  // Helper: Extract key insights from notes
  const extractKeyInsights = (notes: string): string[] => {
    return notes
      .split(/[.!?]/)
      .map(s => s.trim())
      .filter(s => s.length > 30 && s.length < 150)
      .slice(0, 5);
  };

  // Helper: Group resources by category
  const resourcesByCategory = competitor.resources.reduce((acc, resource) => {
    const category = resource.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(resource);
    return acc;
  }, {} as Record<string, typeof competitor.resources>);

  // Helper: Open all resources in category
  const openAllInCategory = (category: string) => {
    const resources = resourcesByCategory[category] || [];
    resources.forEach(resource => {
      window.open(resource.url, '_blank');
    });
  };

  // Handler: Export profile as JSON
  const handleExportProfile = () => {
    const exportData = {
      name: competitor.name,
      website: competitor.website,
      marketPosition: competitor.marketPosition,
      description: competitor.description,
      strengths: competitor.strengths,
      weaknesses: competitor.weaknesses,
      resources: competitor.resources,
      notes: competitor.notes,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${competitor.name.replace(/[^a-z0-9]/gi, '_')}_profile_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Profile Exported', {
      description: `${competitor.name} profile downloaded as JSON`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {competitor.logoUrl ? (
              <img src={competitor.logoUrl} alt={competitor.name} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl">{competitor.name}</DialogTitle>
                  {competitor.marketPosition && (
                    <p className="text-sm text-muted-foreground mt-1">{competitor.marketPosition}</p>
                  )}
                  {competitor.website && (
                    <a
                      href={competitor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                    >
                      <LinkIcon className="w-3 h-3" />
                      {competitor.website}
                    </a>
                  )}
                  {/* Discovery Metadata */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    {competitor.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Added {formatDistanceToNow(new Date(competitor.createdAt), { addSuffix: true })}
                      </div>
                    )}
                    {competitor.updatedAt && (
                      <div className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Updated {formatDistanceToNow(new Date(competitor.updatedAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(competitor);
                    onOpenChange(false);
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            {/* OVERVIEW TAB - ENHANCED */}
            <TabsContent value="overview" className="space-y-6 m-0 p-6">
              {/* Market Position - Prominent Display */}
              {competitor.marketPosition && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Market Position</p>
                      <p className="text-lg font-bold">{competitor.marketPosition}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Competitive Summary Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Competitive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-green-500">{competitor.strengths.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Strengths</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-red-500">{competitor.weaknesses.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Weaknesses</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-blue-500">{competitor.resources.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Resources</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {competitor.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{competitor.description}</p>
                </div>
              )}

              {/* Strengths */}
              {competitor.strengths.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {competitor.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-1">●</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {competitor.weaknesses.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {competitor.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 mt-1">●</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Top Resources Preview */}
              {competitor.resources.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-blue-500" />
                    Key Resources ({competitor.resources.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {competitor.resources.slice(0, 4).map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg border hover:border-primary transition-all hover:shadow-md group"
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {getCategoryIcon(resource.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                              {resource.title}
                            </h4>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {resource.category}
                            </Badge>
                          </div>
                          <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </a>
                    ))}
                  </div>
                  {competitor.resources.length > 4 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      +{competitor.resources.length - 4} more resources in Resources tab
                    </p>
                  )}
                </div>
              )}

              {/* Intelligence Notes Preview */}
              {competitor.notes && (
                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Competitive Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {competitor.notes}
                    </p>
                    <p className="text-xs text-primary mt-2">
                      View full analysis in Notes tab →
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="pt-4 border-t flex gap-2 flex-wrap">
                {competitor.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={competitor.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleExportProfile}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Profile
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(competitor)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
              </div>
            </TabsContent>

            {/* SOLUTIONS TAB */}
            <TabsContent value="solutions" className="m-0 p-6">
              <CompetitorSolutionsTab competitor={competitor} />
            </TabsContent>

            {/* COMPETITIVE ANALYSIS TAB - NEW */}
            <TabsContent value="analysis" className="m-0 p-6">
              <div className="space-y-6">
                {/* SWOT Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      SWOT Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                        <h4 className="font-semibold text-green-500 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {competitor.strengths.length > 0 ? (
                            competitor.strengths.map((s, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-green-500">+</span>
                                <span>{s}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-muted-foreground">No strengths identified</li>
                          )}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                        <h4 className="font-semibold text-red-500 mb-3 flex items-center gap-2">
                          <TrendingDown className="w-4 h-4" />
                          Weaknesses
                        </h4>
                        <ul className="space-y-2">
                          {competitor.weaknesses.length > 0 ? (
                            competitor.weaknesses.map((w, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-red-500">−</span>
                                <span>{w}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-muted-foreground">No weaknesses identified</li>
                          )}
                        </ul>
                      </div>

                      {/* Opportunities (derived) */}
                      <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <h4 className="font-semibold text-blue-500 mb-3">Opportunities for Us</h4>
                        <ul className="space-y-2">
                          {competitor.weaknesses.length > 0 ? (
                            competitor.weaknesses.slice(0, 3).map((w, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <Star className="w-3 h-3 text-blue-500 mt-0.5" />
                                <span>Capitalize on: {w}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-muted-foreground">No opportunities identified</li>
                          )}
                        </ul>
                      </div>

                      {/* Threats (derived) */}
                      <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                        <h4 className="font-semibold text-orange-500 mb-3">Threats to Monitor</h4>
                        <ul className="space-y-2">
                          {competitor.strengths.length > 0 ? (
                            competitor.strengths.slice(0, 3).map((s, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5" />
                                <span>Watch: {s}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-muted-foreground">No threats identified</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Competitive Positioning Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Competitive Positioning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Market Strength</span>
                          <Badge variant="outline">{calculateStrengthScore(competitor)}%</Badge>
                        </div>
                        <Progress value={calculateStrengthScore(competitor)} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Competitive Threat</span>
                          <Badge variant="outline">{calculateThreatLevel(competitor)}%</Badge>
                        </div>
                        <Progress value={calculateThreatLevel(competitor)} className="h-2 [&>div]:bg-red-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* RESOURCES TAB - ENHANCED */}
            <TabsContent value="resources" className="m-0 p-6">
              {competitor.resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No resources added yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Resource Statistics */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {Object.entries(resourcesByCategory).map(([category, resources]) => (
                      <div key={category} className="text-center p-3 rounded-lg border">
                        <div className="mb-2 flex justify-center">
                          {getCategoryIcon(category)}
                        </div>
                        <p className="text-2xl font-bold">{resources.length}</p>
                        <p className="text-xs text-muted-foreground capitalize">{category.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>

                  {/* Grouped Resources */}
                  {Object.entries(resourcesByCategory).map(([category, resources]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2 capitalize">
                          {getCategoryIcon(category)}
                          {category.replace('_', ' ')} ({resources.length})
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => openAllInCategory(category)}>
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open All
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 rounded-lg border hover:border-primary transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getCategoryIcon(resource.category)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{resource.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1 truncate">{resource.url}</p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* NOTES TAB - ENHANCED */}
            <TabsContent value="notes" className="m-0 p-6">
              {competitor.notes ? (
                <div className="space-y-6">
                  {/* Main Intelligence Summary */}
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        AI-Generated Competitive Intelligence
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Auto-extracted from {competitor.website}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{competitor.notes}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Insights */}
                  {extractKeyInsights(competitor.notes).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Key Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {extractKeyInsights(competitor.notes).map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                              <span className="text-sm">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Items */}
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Recommended Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-green-500">→</span>
                          <span>Analyze their {competitor.strengths.length} key strengths for potential partnerships</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-green-500">→</span>
                          <span>Exploit their {competitor.weaknesses.length} weaknesses in our messaging</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-green-500">→</span>
                          <span>Monitor their {competitor.resources.length} resources for market changes</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bookmark className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No notes added yet</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
