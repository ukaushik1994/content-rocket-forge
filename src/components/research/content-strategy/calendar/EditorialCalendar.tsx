
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus, MoreHorizontal, Edit, Trash2, Send, BarChart3, Eye, EyeOff } from 'lucide-react';
import { ContentAnalyticsDashboard } from '../analytics/ContentAnalyticsDashboard';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { CalendarItemDialog } from './CalendarItemDialog';
import { ProposalStatusBadge } from '../components/ProposalStatusBadge';
import { CrossTabActions } from '../components/CrossTabActions';
import { useProposalIntegration } from '@/hooks/useProposalIntegration';
import { toast } from 'sonner';
import { proposalManagement } from '@/services/proposalManagement';
import { StrategyBuilderDialog } from '../StrategyBuilderDialog';
import { CalendarLoadingSkeleton } from '../components/CalendarLoadingSkeleton';
import { CalendarItemActions } from './CalendarItemActions';

interface EditorialCalendarProps {
  goals: any;
}

export const EditorialCalendar = ({ goals }: EditorialCalendarProps) => {
  const { calendarItems, pipelineItems, createCalendarItem, updateCalendarItem, deleteCalendarItem, loading, loadingCalendar, refreshData } = useContentStrategy();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [strategyDialogOpen, setStrategyDialogOpen] = useState(false);
  const [selectedCalendarItem, setSelectedCalendarItem] = useState<any>(null);
  const { syncProposalAcrossTabs, updateProposalStatus } = useProposalIntegration();

  // Check for overdue proposals on mount only (prevent infinite loop)
  useEffect(() => {
    let isMounted = true;
    
    const checkOverdue = async () => {
      if (!isMounted) return;
      
      try {
        await proposalManagement.checkAndRestoreOverdueProposals();
        if (isMounted) {
          await refreshData(); // Refresh calendar data after restoration
        }
      } catch (error) {
        console.error('Error checking overdue proposals:', error);
      }
    };

    checkOverdue();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once on mount

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      writing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      review: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      scheduled: 'bg-green-500/20 text-green-300 border-green-500/30',
      published: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      blog: '📝',
      social: '📱',
      video: '🎬',
      email: '✉️'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getContentForDate = (date: Date) => {
    return calendarItems.filter(item => {
      const itemDate = parseISO(item.scheduled_date);
      return isSameDay(itemDate, date);
    });
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleAddContent = (date?: Date) => {
    setEditingItem(null);
    setSelectedDate(date || null);
    setDialogOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  // Removed duplicate handleDeleteItem - all deletions now go through CalendarItemActions component

  const handleSaveItem = async (formData: any) => {
    try {
      if (editingItem) {
        await updateCalendarItem(editingItem.id, formData);
        
        // Update proposal status if it's linked to a proposal
        const proposalData = getProposalData(editingItem);
        if (proposalData?.source_proposal_id) {
          await updateProposalStatus({
            proposalId: proposalData.source_proposal_id,
            status: formData.status === 'published' ? 'completed' : 'scheduled',
            calendarStatus: formData.status,
            notes: `Calendar status updated to ${formData.status}`,
            updatedBy: 'user'
          });
        }
        
        toast.success('Calendar item updated');
      } else {
        await createCalendarItem(formData);
        toast.success('Calendar item created');
      }
      setDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Failed to save calendar item');
    }
  };

  const handleGenerateContent = (item: any) => {
    try {
      const notes = item.notes ? JSON.parse(item.notes) : {};
      const proposalData = notes.proposal_data;

      if (proposalData) {
        // Use StrategyBuilderDialog with proposal data
        setSelectedCalendarItem({
          ...proposalData,
          source_proposal_id: notes.source_proposal_id,
          fromCalendar: true
        });
      } else {
        // Create proposal-like data structure from calendar item for StrategyBuilderDialog
        setSelectedCalendarItem({
          title: item.title,
          primary_keyword: item.title.split(' ')[0], // Use first word as primary keyword
          description: item.notes || `Content piece about ${item.title}`,
          content_type: item.content_type || 'blog',
          fromCalendar: true,
          calendarItemId: item.id,
          tags: item.tags
        });
      }
      setStrategyDialogOpen(true);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    }
  };

  const getProposalData = (item: any) => {
    try {
      const notes = item.notes ? JSON.parse(item.notes) : {};
      return notes.proposal_data || null;
    } catch (e) {
      return null;
    }
  };

  if (loading || loadingCalendar) {
    return <CalendarLoadingSkeleton />;
  }

  return (
    <>
      {/* Analytics Dashboard */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <ContentAnalyticsDashboard
            pipelineItems={pipelineItems || []} 
            calendarItems={calendarItems || []}
          />
        </motion.div>
      )}

      <Card className="glass-panel border-white/10 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm border border-white/10">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Editorial Calendar
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium min-w-[200px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-primary/10 hover:bg-primary/20 border-primary/30"
              >
                {showAnalytics ? <EyeOff className="h-4 w-4 mr-1" /> : <BarChart3 className="h-4 w-4 mr-1" />}
                {showAnalytics ? 'Hide' : 'Show'} Analytics
              </Button>
              <Button size="sm" className="bg-primary/20 hover:bg-primary/30" onClick={() => handleAddContent()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Content
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map(day => {
              const dayContent = getContentForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <motion.div
                  key={day.toISOString()}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    min-h-[120px] p-2 rounded-lg border transition-all cursor-pointer
                    ${isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                    }
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-white">
                      {format(day, 'd')}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddContent(day);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    {dayContent.slice(0, 2).map(item => {
                      const proposalData = getProposalData(item);
                      
                      return (
                        <div 
                          key={item.id}
                          className="text-xs p-1 rounded bg-white/10 border border-white/20 truncate group"
                        >
                          <div className="flex items-center gap-1">
                            <span>{getTypeIcon(item.content_type)}</span>
                            <span className="text-white/80 truncate flex-1">{item.title}</span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateContent(item);
                                }}
                                className="hover:text-green-400"
                                title="Generate Content"
                              >
                                <Send className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditItem(item);
                                }}
                                className="hover:text-blue-400"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                               {/* Add CalendarItemActions for delete functionality */}
                               <div onClick={(e) => e.stopPropagation()}>
                                  <CalendarItemActions 
                                    calendarItem={item}
                                    onRefresh={refreshData}
                                    compact={true}
                                    onGenerateContent={handleGenerateContent}
                                  />
                                </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className={`${getStatusColor(item.status)} text-xs`}>
                              {item.status}
                            </Badge>
                            {proposalData?.source_proposal_id && (
                              <>
                                <ProposalStatusBadge proposalId={proposalData.source_proposal_id} />
                                <Badge variant="outline" className="text-xs text-purple-400 bg-purple-500/10 border-purple-400/30">
                                  From Proposal
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {dayContent.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{dayContent.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h4>
                <Button size="sm" onClick={() => handleAddContent(selectedDate)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule Content
                </Button>
              </div>
              <div className="space-y-2">
                {getContentForDate(selectedDate).map(item => {
                  const proposalData = getProposalData(item);
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getTypeIcon(item.content_type)}</span>
                        <div>
                          <div className="font-medium text-white">{item.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {item.assigned_to && `Assigned to: ${item.assigned_to}`}
                            {proposalData?.source_proposal_id && (
                              <>
                                <ProposalStatusBadge proposalId={proposalData.source_proposal_id} />
                                <Badge variant="outline" className="text-xs text-purple-400 bg-purple-500/10 border-purple-400/30">
                                  From Proposal
                                </Badge>
                                <span className="text-xs text-white/40">
                                  Keywords: {proposalData.primary_keyword}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateContent(item)}
                          className="gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
                        >
                          <Send className="h-4 w-4" />
                          Generate Content
                        </Button>
                        {proposalData?.source_proposal_id && (
                          <CrossTabActions 
                            proposalId={proposalData.source_proposal_id}
                            onAction={syncProposalAcrossTabs}
                            compact
                            size="sm"
                          />
                        )}
                        <CalendarItemActions 
                          calendarItem={item}
                          onRefresh={refreshData}
                          compact={true}
                          onGenerateContent={handleGenerateContent}
                        />
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {getContentForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No content scheduled for this date</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <CalendarItemDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
        selectedDate={selectedDate}
      />

      {/* Strategy Builder Dialog for unified content creation */}
      <StrategyBuilderDialog
        open={strategyDialogOpen}
        onOpenChange={setStrategyDialogOpen}
        proposal={selectedCalendarItem}
      />
    </>
  );
};
