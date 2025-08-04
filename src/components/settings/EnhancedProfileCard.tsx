import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Camera, Crown, Zap } from 'lucide-react';

interface EnhancedProfileCardProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    plan?: string;
    joinDate?: string;
  };
}

export function EnhancedProfileCard({ user }: EnhancedProfileCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  const avatarVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        delay: 0.2,
        type: "spring", 
        stiffness: 200, 
        damping: 20 
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 to-neon-blue/10 rounded-2xl blur-xl"></div>
      
      <Card className="relative glass-card border-white/20 backdrop-blur-xl overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="futuristic-grid h-full w-full"></div>
        </div>

        <CardHeader className="relative z-10 pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gradient">Quick Profile</CardTitle>
            <Badge variant="secondary" className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
              <Crown className="h-3 w-3 mr-1" />
              {user?.plan || 'Pro'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          <div className="flex items-center space-x-4">
            <motion.div
              variants={avatarVariants}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-purple/30 to-neon-blue/20 blur-md group-hover:blur-lg transition-all duration-300"></div>
              <Avatar className="relative h-16 w-16 border-2 border-white/20">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-neon-purple/20 to-neon-blue/10 text-white font-bold">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <motion.div 
                className="absolute -bottom-1 -right-1 bg-neon-purple rounded-full p-1.5 border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="h-3 w-3 text-white" />
              </motion.div>
            </motion.div>

            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-lg text-white">
                {user?.name || 'Content Creator'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {user?.email || 'user@example.com'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-neon-purple" />
                <span>Member since {user?.joinDate || 'Jan 2024'}</span>
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
            {[
              { label: 'API Status', status: 'Connected', color: 'text-green-400' },
              { label: 'Storage', status: '2.1GB', color: 'text-neon-blue' },
              { label: 'Projects', status: '12', color: 'text-neon-purple' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <p className={`font-semibold ${item.color}`}>{item.status}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}