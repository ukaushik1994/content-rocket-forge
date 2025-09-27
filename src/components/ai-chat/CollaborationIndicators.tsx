import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Eye, 
  Edit3, 
  Share, 
  Monitor,
  MousePointer2,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollaborationUser {
  userId: string;
  userName: string;
  isActive: boolean;
  isTyping?: boolean;
  cursorPosition?: { x: number; y: number };
  color?: string;
}

interface CollaborationIndicatorsProps {
  users: CollaborationUser[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  isScreenSharing?: boolean;
  onStartScreenShare?: () => void;
  onStopScreenShare?: () => void;
  className?: string;
}

export const CollaborationIndicators: React.FC<CollaborationIndicatorsProps> = ({
  users,
  connectionStatus,
  isScreenSharing = false,
  onStartScreenShare,
  onStopScreenShare,
  className
}) => {
  const activeUsers = users.filter(u => u.isActive);
  const typingUsers = users.filter(u => u.isTyping);
  
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'disconnected': return 'text-gray-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return Circle;
      case 'connecting': return Circle;
      case 'disconnected': return Circle;
      case 'error': return Circle;
      default: return Circle;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-3", className)}>
        {/* Connection Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <StatusIcon 
                className={cn("h-3 w-3 fill-current", getStatusColor())}
              />
              <span className={cn("text-xs font-medium", getStatusColor())}>
                {connectionStatus === 'connected' ? 'Live' : 
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 connectionStatus === 'disconnected' ? 'Offline' : 'Error'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connection status: {connectionStatus}</p>
          </TooltipContent>
        </Tooltip>

        {/* Active Users Count */}
        {activeUsers.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                {activeUsers.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">Active Users</p>
                {activeUsers.map(user => (
                  <p key={user.userId} className="text-sm">
                    {user.userName}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Typing Indicators */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <Edit3 className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">
                {typingUsers.length === 1 
                  ? `${typingUsers[0].userName} is typing...`
                  : `${typingUsers.length} people are typing...`
                }
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Avatars */}
        {activeUsers.length > 0 && (
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((user, index) => (
              <Tooltip key={user.userId}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarFallback 
                        className="text-xs"
                        style={{ backgroundColor: user.color || '#3B82F6' }}
                      >
                        {user.userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.userName}</p>
                  {user.isTyping && <p className="text-xs text-muted-foreground">Typing...</p>}
                </TooltipContent>
              </Tooltip>
            ))}
            {activeUsers.length > 3 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="h-6 w-6 rounded-full p-0 text-xs border-2 border-background"
                  >
                    +{activeUsers.length - 3}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">Additional Users</p>
                    {activeUsers.slice(3).map(user => (
                      <p key={user.userId} className="text-sm">
                        {user.userName}
                      </p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Screen Sharing Controls */}
        {onStartScreenShare && onStopScreenShare && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={isScreenSharing ? "default" : "outline"}
                onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
                className="h-7 px-2"
              >
                <Monitor className="h-3 w-3" />
                {isScreenSharing && (
                  <motion.div
                    className="ml-1 w-2 h-2 bg-red-500 rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isScreenSharing ? 'Stop sharing' : 'Share screen'}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Cursor Indicators (for users with active cursor positions) */}
        {users.filter(u => u.cursorPosition).map(user => (
          <motion.div
            key={`cursor-${user.userId}`}
            className="fixed pointer-events-none z-50"
            style={{
              left: user.cursorPosition!.x,
              top: user.cursorPosition!.y,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <div className="flex items-center gap-1">
              <MousePointer2 
                className="h-4 w-4 text-white drop-shadow-lg" 
                style={{ color: user.color || '#3B82F6' }}
              />
              <Badge 
                variant="default" 
                className="text-xs px-1 py-0 h-5"
                style={{ backgroundColor: user.color || '#3B82F6' }}
              >
                {user.userName}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </TooltipProvider>
  );
};