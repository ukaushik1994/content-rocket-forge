
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus, MoreHorizontal, Edit, Trash2, Send, BarChart3, Eye, EyeOff } from 'lucide-react';
import { ContentAnalyticsDashboard } from '../analytics/ContentAnalyticsDashboard';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

type CalendarView = 'month' | 'week' | 'day';

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
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
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

  // Week view helpers
  const referenceDate = selectedDate || new Date();
  const weekStart = startOfWeek(referenceDate);
  const weekEnd = endOfWeek(referenceDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

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

  const navigateForward = () => {
    if (calendarView === 'month') setCurrentMonth(addMonths(currentMonth, 1));
    else if (calendarView === 'week') setSelectedDate(addWeeks(referenceDate, 1));
    else setSelectedDate(addDays(referenceDate, 1));
  };

  const navigateBack = () => {
    if (calendarView === 'month') setCurrentMonth(subMonths(currentMonth, 1));
    else if (calendarView === 'week') setSelectedDate(subWeeks(referenceDate, 1));
    else setSelectedDate(subDays(referenceDate, 1));
  };

  const getNavigationLabel = () => {
    if (calendarView === 'month') return format(currentMonth, 'MMMM yyyy');
    if (calendarView === 'week') return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
    return format(referenceDate, 'EEEE, MMMM d, yyyy');
  };

  const handleAddContent = (date?: Date) => {
    setEditingItem(null);
    setSelectedDate(date || null);
    setDialogOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  // Listen for global openContentBuilder events from notifications
  useEffect(() => {
    const handleGlobalOpenBuilder = (event: CustomEvent) => {
      console.log('🌍 Global openContentBuilder event received:', event.detail);
      const calendarItem = event.detail;
      if (calendarItem) {
        handleGenerateContent(calendarItem);
      }
    };
    
    window.addEventListener('openContentBuilder', handleGlobalOpenBuilder as EventListener);
    return () => {
      window.removeEventListener('openContentBuilder', handleGlobalOpenBuilder as EventListener);
    };
  }, []);

  const handleSaveItem = async (formData: any) => {
    try {
      if (editingItem) {
        await updateCalendarItem(editingItem.id, formData);
        
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
    console.log('🚀 handleGenerateContent called with item:', {
      id: item?.id,
      title: item?.title,
      notes: item?.notes,
      content_type: item?.content_type
    });
    
    try {
      let proposalData = null;
      let notes: any = {};
      
      if (item.notes) {
        try {
          notes = JSON.parse(item.notes);
          proposalData = notes.proposal_data;
        } catch (parseError) {
          console.log('📝 Notes are plain text, not JSON.');
        }
      }

      if (proposalData) {
        setSelectedCalendarItem({
          ...proposalData,
          source_proposal_id: notes.source_proposal_id,
          fromCalendar: true,
          calendarItemId: item.id
        });
      } else {
        setSelectedCalendarItem({
          title: item.title,
          primary_keyword: item.primary_keyword || item.title.split(' ').slice(0, 2).join(' '),
          description: item.notes || `Content piece about ${item.title}`,
          content_type: item.content_type || 'blog',
          fromCalendar: true,
          calendarItemId: item.id,
          tags: item.tags,
          scheduled_date: item.scheduled_date
        });
      }
      
      setStrategyDialogOpen(true);
      toast.success('Opening content builder...');
    } catch (error) {
      console.error('❌ Error opening content builder:', error);
      toast.error(`Failed to open content builder: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Shared item renderer for day cells (month/week)
  const renderDayCell = (day: Date, tall = false) => {
    const dayContent = getContentForDate(day);
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    const isToday = isSameDay(day, new Date());
    const maxItems = tall ? 5 : 2;
    
    return (
      <motion.div
        key={day.toISOString()}
        whileHover={{ scale: 1.02 }}
        className={cn(
          "p-2 rounded-lg border transition-all cursor-pointer",
          tall ? "min-h-[180px]" : "min-h-[120px]",
          isSelected
            ? 'border-primary bg-primary/10'
            : isToday
              ? 'border-primary/50 bg-primary/5 ring-1 ring-inset ring-primary/30'
              : 'border-border/30 hover:border-border/60 bg-card/30 hover:bg-card/50'
        )}
        onClick={() => setSelectedDate(day)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-foreground">
            {format(day, tall ? 'EEE d' : 'd')}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 opacity-0 hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); handleAddContent(day); }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-1">
          {dayContent.slice(0, maxItems).map(item => {
            const proposalData = getProposalData(item);
            return (
              <div key={item.id} className="text-xs p-1 rounded bg-card/60 border border-border/40 truncate group">
                <div className="flex items-center gap-1">
                  <span>{getTypeIcon(item.content_type)}</span>
                  <span className="text-foreground/80 truncate flex-1">{item.title}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleGenerateContent(item); }} className="hover:text-primary" title="Generate Content">
                      <Send className="h-3 w-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEditItem(item); }} className="hover:text-primary">
                      <Edit className="h-3 w-3" />
                    </button>
                    <div onClick={(e) => e.stopPropagation()}>
                      <CalendarItemActions calendarItem={item} onRefresh={refreshData} compact={true} onGenerateContent={handleGenerateContent} />
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
          {dayContent.length > maxItems && (
            <div className="text-xs text-muted-foreground text-center py-1">
              +{dayContent.length - maxItems} more
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Render full detail item card (for day view + selected date detail)
  const renderDetailItem = (item: any) => {
    const proposalData = getProposalData(item);
    return (
      <div key={item.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
        <div className="flex items-center gap-3">
          <span className="text-lg">{getTypeIcon(item.content_type)}</span>
          <div>
            <div className="font-medium text-foreground">{item.title}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {item.assigned_to && `Assigned to: ${item.assigned_to}`}
              {proposalData?.source_proposal_id && (
                <>
                  <ProposalStatusBadge proposalId={proposalData.source_proposal_id} />
                  <Badge variant="outline" className="text-xs text-purple-400 bg-purple-500/10 border-purple-400/30">
                    From Proposal
                  </Badge>
                  <span className="text-xs text-muted-foreground">
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
            className="gap-2 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-all duration-200"
          >
            <Send className="h-4 w-4" />
            Generate Content
          </Button>
          {proposalData?.source_proposal_id && (
            <CrossTabActions proposalId={proposalData.source_proposal_id} onAction={syncProposalAcrossTabs} compact size="sm" />
          )}
          <CalendarItemActions calendarItem={item} onRefresh={refreshData} compact={true} onGenerateContent={handleGenerateContent} />
          <Badge variant="outline" className={getStatusColor(item.status)}>
            {item.status}
          </Badge>
        </div>
      </div>
    );
  };

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

      <Card className="glass-panel border-border/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl backdrop-blur-sm border border-border/30">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Editorial Calendar
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <ToggleGroup type="single" value={calendarView} onValueChange={(v) => v && setCalendarView(v as CalendarView)} className="bg-muted/30 rounded-lg p-0.5 border border-border/30">
                <ToggleGroupItem value="month" className="text-xs px-3 py-1 h-7 data-[state=on]:bg-primary/20 data-[state=on]:text-primary">Month</ToggleGroupItem>
                <ToggleGroupItem value="week" className="text-xs px-3 py-1 h-7 data-[state=on]:bg-primary/20 data-[state=on]:text-primary">Week</ToggleGroupItem>
                <ToggleGroupItem value="day" className="text-xs px-3 py-1 h-7 data-[state=on]:bg-primary/20 data-[state=on]:text-primary">Day</ToggleGroupItem>
              </ToggleGroup>

              <Button variant="ghost" size="sm" onClick={navigateBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium min-w-[200px] text-center">
                {getNavigationLabel()}
              </span>
              <Button variant="ghost" size="sm" onClick={navigateForward}>
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
          {/* MONTH VIEW */}
          {calendarView === 'month' && (
            <>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map(day => renderDayCell(day))}
              </div>
            </>
          )}

          {/* WEEK VIEW */}
          {calendarView === 'week' && (
            <>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {format(day, 'EEE')}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => renderDayCell(day, true))}
              </div>
            </>
          )}

          {/* DAY VIEW */}
          {calendarView === 'day' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-foreground">
                  {format(referenceDate, 'EEEE, MMMM d, yyyy')}
                </h4>
                <Button size="sm" onClick={() => handleAddContent(referenceDate)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule Content
                </Button>
              </div>
              {getContentForDate(referenceDate).length > 0 ? (
                <div className="space-y-2">
                  {getContentForDate(referenceDate).map(item => renderDetailItem(item))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No content scheduled for this date</p>
                </div>
              )}
            </div>
          )}

          {/* Selected Date Details (month/week views) */}
          {calendarView !== 'day' && selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-primary/5 rounded-xl border border-border/30"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-foreground">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h4>
                <Button size="sm" onClick={() => handleAddContent(selectedDate)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule Content
                </Button>
              </div>
              <div className="space-y-2">
                {getContentForDate(selectedDate).map(item => renderDetailItem(item))}
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
