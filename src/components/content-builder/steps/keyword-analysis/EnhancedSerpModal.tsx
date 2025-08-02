import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  X, 
  HelpCircle, 
  FileText, 
  Users, 
  Target, 
  BookOpen,
  TrendingUp,
  Globe,
  Zap,
  Eye,
  Filter,
  Download,
  Share2,
  Settings,
  AlertCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NormalizedSerpData } from '@/services/serpDataTransformer';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';

interface EnhancedSerpModalProps {
  isOpen: boolean;
  onClose: () => void;
  serpData: any;
  selections: SerpSelection[];
  onToggleSelection: (type: string, content: string, metadata?: any) => void;
  keyword: string;
  normalizedData?: NormalizedSerpData;
}

export const EnhancedSerpModal: React.FC<EnhancedSerpModalProps> = ({
  isOpen,
  onClose,
  serpData,
  selections,
  onToggleSelection,
  keyword,
  normalizedData
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const { toast } = useToast();

  // Compute metrics and insights
  const metrics = useMemo(() => {
    if (!serpData) return null;
    
    return {
      totalQuestions: normalizedData?.sections.questions?.length || 0,
      totalKeywords: normalizedData?.sections.keywords?.length || 0,
      totalGaps: normalizedData?.sections.contentGaps?.length || 0,
      totalEntities: normalizedData?.sections.entities?.length || 0,
      dataQuality: serpData.dataQuality || 'medium',
      searchVolume: serpData.searchVolume || 0,
      difficulty: serpData.keywordDifficulty || 0,
      competition: serpData.competitionScore || 0,
      selectedCount: selections.filter(s => s.selected).length
    };
  }, [serpData, normalizedData, selections]);

  const filteredSections = useMemo(() => {
    if (!normalizedData) return {};
    
    const filtered: any = {};
    Object.entries(normalizedData.sections).forEach(([key, items]) => {
      filtered[key] = items.filter(item => 
        item.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (item.metadata?.description && item.metadata.description.toLowerCase().includes(searchFilter.toLowerCase()))
      );
    });
    return filtered;
  }, [normalizedData, searchFilter]);

  const handleBulkSelection = (sectionKey: string, selectAll: boolean) => {
    const items = filteredSections[sectionKey] || [];
    items.forEach(item => {
      const isSelected = selections.find(s => s.content === item.content && s.type === item.type)?.selected;
      if (selectAll && !isSelected) {
        onToggleSelection(item.type, item.content, item.metadata);
      } else if (!selectAll && isSelected) {
        onToggleSelection(item.type, item.content, item.metadata);
      }
    });
    
    toast({
      title: selectAll ? "Items Selected" : "Items Deselected",
      description: `${selectAll ? "Added" : "Removed"} ${items.length} items from ${sectionKey}`
    });
  };

  const exportData = () => {
    const exportObj = {
      keyword,
      timestamp: new Date().toISOString(),
      selections: selections.filter(s => s.selected),
      metrics,
      rawData: serpData
    };
    
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serp-analysis-${keyword.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "SERP analysis data has been downloaded as JSON"
    });
  };

  if (!serpData) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'questions', label: 'Questions', icon: HelpCircle, count: metrics?.totalQuestions },
    { id: 'keywords', label: 'Keywords', icon: Target, count: metrics?.totalKeywords },
    { id: 'gaps', label: 'Content Gaps', icon: AlertCircle, count: metrics?.totalGaps },
    { id: 'entities', label: 'Entities', icon: Users, count: metrics?.totalEntities },
    { id: 'insights', label: 'Insights', icon: TrendingUp }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border border-gray-800/50 text-white overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-gray-800/50 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SERP Analysis: {keyword}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={exportData}
                className="text-xs"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Metrics Bar */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-3">
                <div className="text-xs text-gray-400">Search Volume</div>
                <div className="text-lg font-bold text-blue-400">{metrics?.searchVolume?.toLocaleString() || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-3">
                <div className="text-xs text-gray-400">Difficulty</div>
                <div className="text-lg font-bold text-orange-400">{metrics?.difficulty || 'N/A'}/100</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-3">
                <div className="text-xs text-gray-400">Competition</div>
                <div className="text-lg font-bold text-red-400">{((metrics?.competition || 0) * 100).toFixed(1)}%</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-3">
                <div className="text-xs text-gray-400">Selected</div>
                <div className="text-lg font-bold text-green-400">{metrics?.selectedCount || 0}</div>
              </CardContent>
            </Card>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-700 mb-4">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="data-[state=active]:bg-blue-600/30 data-[state=active]:text-blue-300"
                >
                  <tab.icon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search across all data..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
              <Button size="sm" variant="outline" className="shrink-0">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab serpData={serpData} normalizedData={normalizedData} />
              </TabsContent>
              
              <TabsContent value="questions" className="mt-0">
                <SectionTab
                  title="People Also Ask Questions"
                  items={filteredSections.questions || []}
                  selections={selections}
                  onToggleSelection={onToggleSelection}
                  onBulkSelection={(selectAll) => handleBulkSelection('questions', selectAll)}
                  emptyMessage="No questions found in SERP data"
                />
              </TabsContent>
              
              <TabsContent value="keywords" className="mt-0">
                <SectionTab
                  title="Related Keywords"
                  items={filteredSections.keywords || []}
                  selections={selections}
                  onToggleSelection={onToggleSelection}
                  onBulkSelection={(selectAll) => handleBulkSelection('keywords', selectAll)}
                  emptyMessage="No keywords extracted"
                />
              </TabsContent>
              
              <TabsContent value="gaps" className="mt-0">
                <SectionTab
                  title="Content Opportunities"
                  items={filteredSections.contentGaps || []}
                  selections={selections}
                  onToggleSelection={onToggleSelection}
                  onBulkSelection={(selectAll) => handleBulkSelection('contentGaps', selectAll)}
                  emptyMessage="No content gaps identified"
                />
              </TabsContent>
              
              <TabsContent value="entities" className="mt-0">
                <SectionTab
                  title="Topic Entities"
                  items={filteredSections.entities || []}
                  selections={selections}
                  onToggleSelection={onToggleSelection}
                  onBulkSelection={(selectAll) => handleBulkSelection('entities', selectAll)}
                  emptyMessage="No entities extracted"
                />
              </TabsContent>
              
              <TabsContent value="insights" className="mt-0">
                <InsightsTab serpData={serpData} keyword={keyword} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Individual tab components
const OverviewTab: React.FC<{ serpData: any; normalizedData?: NormalizedSerpData }> = ({ serpData, normalizedData }) => (
  <div className="space-y-6">
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg text-blue-400">Data Quality Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Quality</span>
              <span className="text-green-400">{serpData.dataQuality || 'medium'}</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Data Sources:</span>
              <div className="mt-1">
                {serpData.data_sources?.serp_api && <Badge variant="outline" className="mr-1">SerpAPI</Badge>}
                {serpData.isMockData && <Badge variant="outline" className="mr-1">Mock Data</Badge>}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Cache Status:</span>
              <div className="mt-1">
                <Badge variant={serpData.data_sources?.is_cached ? "default" : "secondary"}>
                  {serpData.data_sources?.is_cached ? "Cached" : "Fresh"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Data Summary Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Questions', value: normalizedData?.sections.questions?.length || 0, color: 'text-blue-400' },
        { label: 'Keywords', value: normalizedData?.sections.keywords?.length || 0, color: 'text-green-400' },
        { label: 'Content Gaps', value: normalizedData?.sections.contentGaps?.length || 0, color: 'text-orange-400' },
        { label: 'Entities', value: normalizedData?.sections.entities?.length || 0, color: 'text-purple-400' }
      ].map((item, index) => (
        <Card key={index} className="bg-gray-800/30 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-sm text-gray-400">{item.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const SectionTab: React.FC<{
  title: string;
  items: SerpSelection[];
  selections: SerpSelection[];
  onToggleSelection: (type: string, content: string, metadata?: any) => void;
  onBulkSelection: (selectAll: boolean) => void;
  emptyMessage: string;
}> = ({ title, items, selections, onToggleSelection, onBulkSelection, emptyMessage }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onBulkSelection(true)}>
          Select All
        </Button>
        <Button size="sm" variant="outline" onClick={() => onBulkSelection(false)}>
          Deselect All
        </Button>
      </div>
    </div>
    
    {items.length === 0 ? (
      <Card className="bg-gray-800/30 border-gray-700">
        <CardContent className="p-8 text-center">
          <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">{emptyMessage}</p>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-2">
        {items.map((item, index) => {
          const isSelected = selections.find(s => s.content === item.content && s.type === item.type)?.selected;
          return (
            <Card
              key={index}
              className={`cursor-pointer transition-all hover:bg-gray-800/50 ${
                isSelected ? 'bg-blue-500/20 border-blue-500/50' : 'bg-gray-800/30 border-gray-700'
              }`}
              onClick={() => onToggleSelection(item.type, item.content, item.metadata)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded border-2 mt-1 flex items-center justify-center ${
                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                  }`}>
                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.content}</p>
                    {item.metadata?.description && (
                      <p className="text-sm text-gray-400 mt-1">{item.metadata.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.source}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    )}
  </div>
);

const InsightsTab: React.FC<{ serpData: any; keyword: string }> = ({ serpData, keyword }) => (
  <div className="space-y-6">
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg text-green-400">AI Insights</CardTitle>
        <CardDescription>Strategic recommendations based on SERP analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(serpData.insights || []).map((insight: string, index: number) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-gray-300">{insight}</p>
            </div>
          ))}
          {(!serpData.insights || serpData.insights.length === 0) && (
            <p className="text-gray-400 text-center py-4">No insights available</p>
          )}
        </div>
      </CardContent>
    </Card>
    
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg text-purple-400">Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(serpData.recommendations || []).map((rec: string, index: number) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
              <Target className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
              <p className="text-gray-300">{rec}</p>
            </div>
          ))}
          {(!serpData.recommendations || serpData.recommendations.length === 0) && (
            <p className="text-gray-400 text-center py-4">No recommendations available</p>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default EnhancedSerpModal;