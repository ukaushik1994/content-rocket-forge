import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Hash,
  TrendingUp,
  Target,
  Eye,
  Calendar
} from 'lucide-react';
import { UnifiedKeyword } from '@/services/keywordLibraryService';
import { KeywordTableRow } from './KeywordTableRow';
import { Button } from '@/components/ui/button';

interface KeywordTableProps {
  keywords: UnifiedKeyword[];
  selectedKeywords: Set<string>;
  loading: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdate: () => void;
  onAction: (action: string, keywordId: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const KeywordTable: React.FC<KeywordTableProps> = ({
  keywords,
  selectedKeywords,
  loading,
  onSelect,
  onSelectAll,
  onUpdate,
  onAction,
  sortField,
  sortDirection,
  onSort
}) => {
  const allSelected = keywords.length > 0 && selectedKeywords.size === keywords.length;
  const someSelected = selectedKeywords.size > 0 && selectedKeywords.size < keywords.length;

  const SortButton: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort?.(field)}
      className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </Button>
  );

  if (loading) {
    return (
      <div className="border border-border/50 rounded-lg bg-card/60 backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30">
              <TableHead className="w-12"></TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead>Metrics</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 12 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`} className="border-border/30">
                <td className="px-4 py-3">
                  <div className="w-4 h-4 bg-muted/50 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-16 h-5 bg-muted/50 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-32 h-4 bg-muted/50 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-12 h-4 bg-muted/50 rounded animate-pulse"></div>
                    <div className="w-12 h-4 bg-muted/50 rounded animate-pulse"></div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-16 h-2 bg-muted/50 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-8 h-4 bg-muted/50 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-20 h-4 bg-muted/50 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-8 h-4 bg-muted/50 rounded animate-pulse"></div>
                </td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (keywords.length === 0) {
    return (
      <div className="border border-border/50 rounded-lg bg-card/60 backdrop-blur-xl">
        <div className="p-12 text-center">
          <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">No keywords found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or add some keywords to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border/50 rounded-lg bg-card/60 backdrop-blur-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/30 bg-muted/20">
            <TableHead className="w-12 px-4 py-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                className={someSelected && !allSelected ? "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground" : ""}
              />
            </TableHead>
            <TableHead className="px-4 py-3">
              <SortButton field="source_type">Source</SortButton>
            </TableHead>
            <TableHead className="px-4 py-3">
              <SortButton field="keyword">
                <Hash className="h-3 w-3 mr-1" />
                Keyword
              </SortButton>
            </TableHead>
            <TableHead className="px-4 py-3">
              <SortButton field="search_volume">
                <TrendingUp className="h-3 w-3 mr-1" />
                Metrics
              </SortButton>
            </TableHead>
            <TableHead className="px-4 py-3">
              <SortButton field="performance_score">
                <Target className="h-3 w-3 mr-1" />
                Performance
              </SortButton>
            </TableHead>
            <TableHead className="px-4 py-3">
              <SortButton field="usage_count">
                <Eye className="h-3 w-3 mr-1" />
                Usage
              </SortButton>
            </TableHead>
            <TableHead className="px-4 py-3">
              <SortButton field="first_discovered_at">
                <Calendar className="h-3 w-3 mr-1" />
                Date
              </SortButton>
            </TableHead>
            <TableHead className="w-20 px-4 py-3 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {keywords.map((keyword) => (
              <KeywordTableRow
                key={keyword.id}
                keyword={keyword}
                selected={selectedKeywords.has(keyword.id)}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onAction={onAction}
              />
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
};