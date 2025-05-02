
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordCluster } from '@/components/keywords/KeywordCluster';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, DownloadCloud, RefreshCcw, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClustersTabContentProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  isLoading: boolean;
  isExporting: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onUseKeyword: (keyword: string) => void;
}

const ClustersTabContent = ({
  searchQuery,
  onSearchChange,
  filterValue,
  onFilterChange,
  isLoading,
  isExporting,
  onRefresh,
  onExport,
  onUseKeyword
}: ClustersTabContentProps) => {
  return (
    <Card className="glass-panel">
      <CardHeader className="pb-2 flex justify-between items-center">
        <CardTitle>Keyword Clusters</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clusters..."
              className="pl-9 bg-glass border-white/10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select value={filterValue} onValueChange={onFilterChange}>
            <SelectTrigger className="bg-glass border-white/10 w-[160px] hover:border-white/20 transition-colors">
              <SelectValue placeholder="All Clusters" />
            </SelectTrigger>
            <SelectContent className="bg-glass border-white/10">
              <SelectItem value="all">All Clusters</SelectItem>
              <SelectItem value="recent">Recently Updated</SelectItem>
              <SelectItem value="high-volume">High Volume</SelectItem>
              <SelectItem value="low-diff">Low Difficulty</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => toast.info("Advanced filters")} 
            className="hover:bg-accent/50 transition-colors"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onExport}
            disabled={isExporting}
            className="hover:bg-accent/50 transition-colors"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DownloadCloud className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-accent/30 transition-colors" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KeywordCluster 
            primary="best project management software"
            volume="12,000"
            difficulty="Medium"
            cpc="$1.50"
            intent="Commercial"
            secondaryKeywords={[
              "project management tools",
              "task management software",
              "team collaboration tools"
            ]}
            semanticTerms={[
              "Gantt charts",
              "collaboration features",
              "time tracking"
            ]}
            longTailKeywords={[
              "best project management software for remote teams",
              "affordable project management tools for startups",
              "enterprise project management software comparison"
            ]}
            onUse={onUseKeyword}
          />
          
          <KeywordCluster 
            primary="email marketing platforms"
            volume="8,500"
            difficulty="Medium"
            cpc="$2.10"
            intent="Commercial"
            secondaryKeywords={[
              "email marketing services",
              "email automation tools",
              "newsletter software"
            ]}
            semanticTerms={[
              "drip campaigns",
              "A/B testing",
              "audience segmentation"
            ]}
            longTailKeywords={[
              "best email marketing platforms for small business",
              "affordable email marketing software",
              "email marketing platforms with automation"
            ]}
            onUse={onUseKeyword}
          />
          
          <KeywordCluster 
            primary="CRM software"
            volume="18,000"
            difficulty="High"
            cpc="$3.25"
            intent="Transactional"
            secondaryKeywords={[
              "customer relationship management",
              "sales CRM",
              "contact management software"
            ]}
            semanticTerms={[
              "lead scoring",
              "pipeline management",
              "sales analytics"
            ]}
            longTailKeywords={[
              "best CRM software for small business",
              "free CRM tools for startups",
              "enterprise CRM comparison"
            ]}
            onUse={onUseKeyword}
          />
          
          <KeywordCluster 
            primary="digital marketing strategies"
            volume="9,200"
            difficulty="Low"
            cpc="$1.85"
            intent="Informational"
            secondaryKeywords={[
              "online marketing tactics",
              "digital marketing tips",
              "marketing strategy guide"
            ]}
            semanticTerms={[
              "SEO",
              "content marketing",
              "social media"
            ]}
            longTailKeywords={[
              "digital marketing strategies for small business",
              "B2B digital marketing strategies",
              "effective digital marketing strategies 2025"
            ]}
            onUse={onUseKeyword}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClustersTabContent;
