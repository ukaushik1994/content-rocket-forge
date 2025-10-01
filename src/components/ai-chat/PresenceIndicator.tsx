import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRealtimePresence, PresenceUser } from '@/hooks/useRealtimePresence';
import { Users, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PresenceIndicatorProps {
  conversationId?: string;
  showTyping?: boolean;
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  conversationId,
  showTyping = true,
  className = '',
}) => {
  const { users, activeCount, otherUsers, isTracking } = useRealtimePresence(conversationId);

  if (!isTracking || otherUsers.length === 0) {
    return null;
  }

  const typingUsers = otherUsers.filter(u => u.metadata?.isTyping);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Active users count */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              <span>{activeCount}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium mb-1">Active Users</p>
            <ul className="text-xs space-y-1">
              {users.map((user) => (
                <li key={user.userId} className="flex items-center gap-2">
                  <Circle className={`h-2 w-2 ${user.isActive ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                  {user.userName}
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* User avatars */}
      <div className="flex -space-x-2">
        <AnimatePresence>
          {otherUsers.slice(0, 3).map((user) => (
            <motion.div
              key={user.userId}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarFallback className="text-xs">
                        {user.userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{user.userName}</p>
                    {user.metadata?.currentView && (
                      <p className="text-xs text-muted-foreground">Viewing: {user.metadata.currentView}</p>
                    )}
                    {user.metadata?.isTyping && (
                      <p className="text-xs text-primary">Typing...</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {otherUsers.length > 3 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    +{otherUsers.length - 3}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">More users</p>
                <ul className="text-xs space-y-1 mt-1">
                  {otherUsers.slice(3).map((user) => (
                    <li key={user.userId}>{user.userName}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Typing indicator */}
      {showTyping && typingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="text-xs text-muted-foreground flex items-center gap-1"
        >
          <span className="flex gap-1">
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-1 h-1 rounded-full bg-current"
            />
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-1 h-1 rounded-full bg-current"
            />
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-1 h-1 rounded-full bg-current"
            />
          </span>
          {typingUsers.length === 1 ? (
            <span>{typingUsers[0].userName} is typing</span>
          ) : (
            <span>{typingUsers.length} people are typing</span>
          )}
        </motion.div>
      )}
    </div>
  );
};
