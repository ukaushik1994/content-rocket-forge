import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  TrendingUp,
  Calendar,
  Hash
} from 'lucide-react';
import { UnifiedKeyword } from '@/services/keywordLibraryService';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';

interface KeywordCardProps {
  keyword: UnifiedKeyword;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onUpdate: () => void;
}

export const KeywordCard: React.FC<KeywordCardProps> = ({
  keyword,
  selected,
  onSelect,
  onUpdate
}) => {
  const [researching, setResearching] = useState(false);

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getSourceBadgeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'manual': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'serp': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'glossary': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'strategy': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'manual': return <Hash className="h-3 w-3" />;
      case 'serp': return <Search className="h-3 w-3" />;
      case 'glossary': return <TrendingUp className="h-3 w-3" />;
      case 'strategy': return <Calendar className="h-3 w-3" />;
      default: return <Hash className="h-3 w-3" />;
    }
  };

  const getDifficultyColor = (difficulty?: number | null) => {
    if (!difficulty) return 'text-muted-foreground';
    if (difficulty <= 30) return 'text-green-400';
    if (difficulty <= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleResearch = async () => {
    try {
      setResearching(true);
      const serpData = await analyzeKeywordSerp(keyword.keyword);
      
      if (serpData) {
        // Update keyword with SERP data would require updating service
        toast.success('Keyword research completed');
        onUpdate();
      }
    } catch (error) {
      console.error('Research error:', error);
      toast.error('Failed to research keyword');
    } finally {
      setResearching(false);
    }
  };

  return (
    <motion.div variants={item} layout>
      <Card className={`
        border-white/10 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md 
        transition-all duration-300 hover:shadow-xl hover:scale-105 group
        ${selected ? 'ring-2 ring-primary/50 bg-primary/5' : ''}
      `}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onSelect(keyword.id, !!checked)}
                className="mt-1"
              />
              <div className="flex items-center gap-2">
                {getSourceIcon(keyword.source_type)}
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getSourceBadgeColor(keyword.source_type)}`}
                >
                  {keyword.source_type}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleResearch} disabled={researching}>
                  <Search className="h-4 w-4 mr-2" />
                  {researching ? 'Researching...' : 'Research via SERP'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  View Usage
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-400">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
              {keyword.keyword}
            </h3>
            
            <div className="flex items-center gap-4 text-sm">
              {keyword.search_volume !== null && keyword.search_volume !== undefined && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-muted-foreground">
                    {keyword.search_volume.toLocaleString()}
                  </span>
                </div>
              )}
              
              {keyword.difficulty !== null && keyword.difficulty !== undefined && (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getDifficultyColor(keyword.difficulty).replace('text-', 'bg-')}`} />
                  <span className={getDifficultyColor(keyword.difficulty)}>
                    {keyword.difficulty}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Usage:</span>
              <Badge variant="secondary" className="text-xs">
                {keyword.usage_count}
              </Badge>
            </div>
            
            <span className="text-xs text-muted-foreground">
              {new Date(keyword.first_discovered_at).toLocaleDateString()}
            </span>
          </div>

          {keyword.notes && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {keyword.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};