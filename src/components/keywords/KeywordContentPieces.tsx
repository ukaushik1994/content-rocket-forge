import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContentPiece {
  id: string;
  title: string;
  status: string;
  type: string;
}

interface KeywordContentPiecesProps {
  contentPieces: ContentPiece[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'bg-green-500/20 text-green-600 border-green-500/30';
    case 'draft': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    case 'archived': return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    default: return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
  }
};

export const KeywordContentPieces: React.FC<KeywordContentPiecesProps> = ({ contentPieces }) => {
  const navigate = useNavigate();

  const handleViewContent = (contentId: string) => {
    navigate(`/repository?id=${contentId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="border-t border-white/10"
    >
      <div className="p-4 pt-3 bg-background/20">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Content Pieces ({contentPieces.length})
        </h4>
        <div className="space-y-2">
          {contentPieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-gradient-to-br from-primary/10 to-neon-blue/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CustomBadge className={`flex-shrink-0 ${getStatusColor(piece.status)}`}>
                      {piece.status}
                    </CustomBadge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {piece.type?.replace('_', ' ') || 'Content'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{piece.title}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewContent(piece.id)}
                className="glass-button bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20 flex-shrink-0"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
