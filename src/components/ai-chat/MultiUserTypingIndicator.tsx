import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TypingUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  startedTyping: Date;
}

interface MultiUserTypingIndicatorProps {
  typingUsers: TypingUser[];
  className?: string;
}

export const MultiUserTypingIndicator: React.FC<MultiUserTypingIndicatorProps> = ({
  typingUsers,
  className = ""
}) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    const names = typingUsers.map(user => user.userName);
    
    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    } else if (names.length === 3) {
      return `${names[0]}, ${names[1]}, and ${names[2]} are typing...`;
    } else {
      return `${names[0]}, ${names[1]}, and ${names.length - 2} others are typing...`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 p-3 bg-card border rounded-lg ${className}`}
      >
        {/* Typing dots animation */}
        <div className="flex items-center gap-1">
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.2,
            }}
          />
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.4,
            }}
          />
        </div>

        {/* User avatars */}
        <div className="flex -space-x-1">
          {typingUsers.slice(0, 3).map((user) => (
            <Avatar key={user.userId} className="w-6 h-6 border-2 border-background">
              <AvatarImage src={user.userAvatar} />
              <AvatarFallback className="text-xs">
                {user.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {typingUsers.length > 3 && (
            <Badge variant="secondary" className="w-6 h-6 p-0 text-xs">
              +{typingUsers.length - 3}
            </Badge>
          )}
        </div>

        {/* Typing text */}
        <span className="text-sm font-medium text-muted-foreground">{getTypingText()}</span>
      </motion.div>
    </AnimatePresence>
  );
};