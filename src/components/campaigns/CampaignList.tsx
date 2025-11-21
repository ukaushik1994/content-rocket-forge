import React, { useState } from 'react';
import { SavedCampaign } from '@/services/campaignService';
import { GlassCard } from '@/components/ui/GlassCard';
import { EnhancedCampaignCard } from './EnhancedCampaignCard';
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
import { Sparkles } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-w-0">
        <AnimatePresence mode="popLayout">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <EnhancedCampaignCard
                campaign={campaign}
                onView={() => onViewCampaign(campaign)}
                onStartEdit={() => handleStartEdit(campaign)}
                onDelete={() => setDeletingId(campaign.id)}
                onArchive={() => onArchiveCampaign(campaign.id)}
                isEditing={editingId === campaign.id}
                editingName={editingName}
                onEditingNameChange={setEditingName}
                onSaveEdit={() => handleSaveEdit(campaign.id)}
                onCancelEdit={handleCancelEdit}
              />
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
