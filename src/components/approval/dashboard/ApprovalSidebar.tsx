
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '../StatusBadge';
import { 
  ChevronLeft, ChevronRight, Filter, Search, 
  Clock, Calendar, User, FileText 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface ApprovalSidebarProps {
  contentItems: ContentItemType[];
  selectedContent: ContentItemType | null;
  onSelectContent: (content: ContentItemType) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    needsChanges: number;
  };
}

export const ApprovalSidebar: React.FC<ApprovalSidebarProps> = ({
  contentItems,
  selectedContent,
  onSelectContent,
  statusFilter,
  onStatusFilterChange,
  collapsed,
  onToggleCollapse,
  stats
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Filter content based on search term
  const filteredItems = contentItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <motion.div 
      className={`bg-gray-800/30 backdrop-blur-sm border-r border-white/10 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-80'
      }`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h3 className="text-lg font-semibold text-white/90">Content List</h3>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Filters */}
            <div className="p-4 space-y-3 border-b border-white/10">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="needs_changes">Needs Changes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Quick Stats */}
            <div className="p-4 border-b border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-blue-500/20 rounded border border-blue-500/30">
                  <div className="text-lg font-bold text-blue-400">{stats.total}</div>
                  <div className="text-xs text-blue-300">Total</div>
                </div>
                <div className="text-center p-2 bg-yellow-500/20 rounded border border-yellow-500/30">
                  <div className="text-lg font-bold text-yellow-400">{stats.pending}</div>
                  <div className="text-xs text-yellow-300">Pending</div>
                </div>
              </div>
            </div>
            
            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                    selectedContent?.id === item.id 
                      ? 'bg-neon-purple/20 border-neon-purple/50' 
                      : 'bg-white/5 border-white/10'
                  }`}
                  onClick={() => onSelectContent(item)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-white/90 text-sm leading-tight truncate">
                          {item.title}
                        </h4>
                        <StatusBadge status={item.approval_status} size="sm" />
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      
                      {item.author && (
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <User className="h-3 w-3" />
                          {item.author}
                        </div>
                      )}
                      
                      {item.keywords && item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.keywords.slice(0, 2).map((keyword, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-neon-purple/10 border-neon-purple/30 text-neon-purple">
                              {keyword}
                            </Badge>
                          ))}
                          {item.keywords.length > 2 && (
                            <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-white/60">
                              +{item.keywords.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-white/60">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No content found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
