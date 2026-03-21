import React, { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  BookOpen, 
  Mail, 
  Globe, 
  MessageSquare, 
  Edit, 
  Eye,
  Pencil,
  Trash2,
  Check,
  Link as LinkIcon
} from 'lucide-react';
import { useContent } from '@/contexts/content';
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
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { extractTitleFromContent } from '@/utils/content/extractTitle';
import { useNavigate } from 'react-router-dom';
import { getPlatformConfig } from '@/utils/platformIcons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const AI_PREAMBLE_PATTERNS = [
  /^here\s+are/i, /^sure[,!]/i, /^i['']ll/i, /^let\s+me/i,
  /^certainly/i, /^of\s+course/i, /^great[,!]/i, /^absolutely/i,
  /^\d+\s+(unique|creative|compelling)/i,
];

function getDisplayTitle(content: ContentItemType): string {
  const sanitize = (text: string) => DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }).trim();
  const extracted = extractTitleFromContent(content.content);
  if (extracted && extracted.length <= 120) return sanitize(extracted);
  const metaTitle = content.metadata?.metaTitle;
  if (metaTitle && typeof metaTitle === 'string' && metaTitle.length <= 120) return sanitize(metaTitle);
  const title = content.title;
  if (title && !AI_PREAMBLE_PATTERNS.some(p => p.test(title)) && title.length <= 120) return sanitize(title);
  if (title) return sanitize(title).substring(0, 100) + '...';
  return 'Untitled Content';
}

function getContentPreview(content: string | undefined): string {
  if (!content) return '';
  const clean = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] }).trim();
  const words = clean.split(/\s+/).slice(0, 30).join(' ');
  return words + (clean.split(/\s+/).length > 30 ? '...' : '');
}

const CONTENT_TYPE_MAP: Record<string, { icon: any; label: string }> = {
  article: { icon: FileText, label: 'Article' },
  blog: { icon: Edit, label: 'Blog Post' },
  glossary: { icon: BookOpen, label: 'Glossary' },
  email: { icon: Mail, label: 'Email' },
  landing_page: { icon: Globe, label: 'Landing Page' },
  social_post: { icon: MessageSquare, label: 'Social Post' },
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  published: 'bg-green-500/15 text-green-400 border-green-500/20',
  archived: 'bg-muted/30 text-muted-foreground border-muted/40',
};

interface SimplifiedRepositoryCardProps {
  content: ContentItemType;
  onView: () => void;
  repurposedFormats?: string[];
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const SimplifiedRepositoryCard: React.FC<SimplifiedRepositoryCardProps> = ({ 
  content, 
  onView,
  repurposedFormats,
  selectable = false,
  selected = false,
  onToggleSelect,
}) => {
  const navigate = useNavigate();
  const { deleteContentItem } = useContent();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const typeConfig = CONTENT_TYPE_MAP[content.content_type] || { icon: FileText, label: content.content_type };
  const IconComponent = typeConfig.icon;
  const solution = (content as any).metadata?.solution || (content as any).metadata?.selectedSolution;
  const sourceUrl = (content as any).metadata?.sourceUrl;
  const preview = useMemo(() => getContentPreview(content.content), [content.content]);

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  return (
    <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="h-full">
      <Card 
        className={`glass-card overflow-hidden group h-full transition-all duration-300 hover:border-foreground/15 cursor-pointer
          ${selected ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
        onClick={onView}
      >
        {/* Selection checkbox */}
        {selectable && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect?.(content.id); }}
            className={`absolute top-3 left-3 z-20 h-5 w-5 rounded border-2 flex items-center justify-center transition-all
              ${selected
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground/40 bg-background/60 backdrop-blur-sm hover:border-primary/60'
              }`}
          >
            {selected && <Check className="h-3 w-3" />}
          </button>
        )}

        <CardContent className="p-5 h-full flex flex-col">
          {/* Header: Icon + Type label + Status badge */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <IconComponent className="h-4.5 w-4.5 text-primary" />
            </div>
            
            <span className="text-xs font-medium text-muted-foreground">{typeConfig.label}</span>

            <Badge 
              variant="outline"
              className={`ml-auto text-[11px] px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[content.status] || 'bg-primary/15 text-primary border-primary/20'}`}
            >
              {content.status}
            </Badge>

            {/* Solution logo — small, right-aligned */}
            {solution?.logoUrl && (
              <img
                src={solution.logoUrl}
                alt={solution.name || ''}
                className="h-6 w-6 rounded-md object-contain flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground line-clamp-2 leading-snug mb-1.5">
            {getDisplayTitle(content)}
          </h3>

          {/* Preview text */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1 mb-3">
            {preview || content.metadata?.description || 'No preview available'}
          </p>

          {/* Source link pill */}
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary bg-white/[0.04] border border-white/[0.08] rounded-full px-2.5 py-1 w-fit mb-3 transition-colors"
            >
              <LinkIcon className="h-3 w-3" />
              <span className="truncate max-w-[180px]">{new URL(sourceUrl).hostname}</span>
            </a>
          )}

          {/* Repurposed format icons */}
          {repurposedFormats && repurposedFormats.length > 0 && (
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-1 mb-3">
                {repurposedFormats.slice(0, 5).map((formatCode) => {
                  const platform = getPlatformConfig(formatCode);
                  const PlatformIcon = platform.icon;
                  return (
                    <Tooltip key={formatCode}>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08] p-1">
                          <PlatformIcon className="h-3 w-3" style={{ color: platform.color }} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">{platform.name}</TooltipContent>
                    </Tooltip>
                  );
                })}
                {repurposedFormats.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">+{repurposedFormats.length - 5}</span>
                )}
              </div>
            </TooltipProvider>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/20 mt-auto">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}
            </span>

            <div className="flex items-center gap-1">
              {/* Edit — hover-revealed */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  sessionStorage.setItem('contentBuilderPayload', JSON.stringify({
                    content: content.content,
                    mainKeyword: (content.metadata as any)?.mainKeyword || '',
                    selectedKeywords: (content.metadata as any)?.secondaryKeywords || [],
                    outline: (content.metadata as any)?.outline || [],
                    serpSelections: (content.metadata as any)?.serpSelections || [],
                    contentTitle: content.title,
                    metaTitle: content.metadata?.metaTitle || '',
                    metaDescription: content.metadata?.metaDescription || '',
                    contentType: (content.metadata as any)?.contentType || 'blog',
                  }));
                  navigate('/ai-chat');
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              {/* Delete — hover-revealed */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>

              {/* View — always visible */}
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onView(); }}
                className="h-7 px-3 text-xs rounded-full bg-muted/50 hover:bg-muted/80 text-foreground"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this content?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this content item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async (e) => {
                e.preventDefault();
                setIsDeleting(true);
                try {
                  await deleteContentItem(content.id);
                  toast.success('Content deleted successfully');
                  setShowDeleteDialog(false);
                } catch (error: any) {
                  toast.error(error.message || 'Failed to delete content');
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
