import React, { useState } from 'react';
import { SavedCampaign } from '@/services/campaignService';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { CampaignStatus } from '@/types/campaign-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  Archive,
  Eye,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

interface CampaignListProps {
  campaigns: SavedCampaign[];
  isLoading: boolean;
  onViewCampaign: (campaign: SavedCampaign) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onRenameCampaign: (campaignId: string, newName: string) => void;
  onArchiveCampaign: (campaignId: string) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  isLoading,
  onViewCampaign,
  onDeleteCampaign,
  onRenameCampaign,
  onArchiveCampaign,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStartEdit = (campaign: SavedCampaign) => {
    setEditingId(campaign.id);
    setEditingName(campaign.name);
  };

  const handleSaveEdit = (campaignId: string) => {
    if (editingName.trim()) {
      onRenameCampaign(campaignId, editingName.trim());
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-muted rounded mb-4" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first campaign to get started
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-6 hover:border-primary/40 transition-all group">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {editingId === campaign.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(campaign.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(campaign.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                          {campaign.name}
                        </h3>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewCampaign(campaign)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartEdit(campaign)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        {campaign.status !== 'archived' && (
                          <DropdownMenuItem onClick={() => onArchiveCampaign(campaign.id)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingId(campaign.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status & Date */}
                  <div className="flex items-center justify-between">
                    <CampaignStatusBadge status={campaign.status as CampaignStatus || 'draft'} />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>

                  {/* Original Idea */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {campaign.original_idea}
                  </p>

                  {/* Strategy Preview */}
                  {campaign.selected_strategy && (
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-xs font-medium text-primary mb-1">Selected Strategy:</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {campaign.selected_strategy.title}
                      </p>
                    </div>
                  )}

                  {/* View Button */}
                  <Button
                    onClick={() => onViewCampaign(campaign)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    View Campaign
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  onDeleteCampaign(deletingId);
                  setDeletingId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
