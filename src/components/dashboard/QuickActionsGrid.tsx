
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  FileUp, 
  ArrowRight, 
  FileBarChart, 
  Settings, 
  Repeat, 
  CheckCircle,
  Users,
  Brain,
  Target,
  Zap,
  Globe,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';

interface QuickActionsGridProps {
  navigate: NavigateFunction;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ navigate }) => {
  const { openSettings } = useSettings();
  const actions = [
    {
      title: "AI Content Creation",
      description: "Generate high-quality, SEO-optimized content with advanced AI assistance.",
      icon: <Brain className="h-5 w-5 text-neon-purple" />,
      action: () => navigate('/ai-chat'),
      buttonText: "Create Content",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-neon-purple/30 to-neon-pink/20",
      delay: 0.1,
      iconAnimation: {
        hover: { scale: 1.2, rotate: 5, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } }
      },
      iconBg: "bg-gradient-to-br from-neon-purple/40 to-neon-blue/30",
      glowColor: "shadow-[0_0_20px_rgb(155,135,245,0.3)]"
    },
    {
      title: "Content Drafts",
      description: "Access and manage your saved content drafts and works in progress.",
      icon: <FileText className="h-5 w-5 text-blue-400" />,
      action: () => navigate('/drafts'),
      buttonText: "View Drafts",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-blue-400/30 to-cyan-500/20",
      delay: 0.15,
      iconAnimation: {
        hover: { scale: 1.2, rotate: -5, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.05 } }
      },
      iconBg: "bg-gradient-to-br from-blue-400/40 to-cyan-500/30",
      glowColor: "shadow-[0_0_20px_rgb(59,130,246,0.3)]"
    },
    {
      title: "Content Repurposing",
      description: "Transform existing content into various formats for different platforms.",
      icon: <Repeat className="h-5 w-5 text-indigo-400" />,
      action: () => navigate('/repository'),
      buttonText: "Repurpose Content",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-indigo-400/30 to-violet-500/20",
      delay: 0.2,
      iconAnimation: {
        hover: { scale: 1.2, rotate: 180, transition: { duration: 0.5 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.1 } }
      },
      iconBg: "bg-gradient-to-br from-indigo-400/40 to-violet-500/30",
      glowColor: "shadow-[0_0_20px_rgb(99,102,241,0.3)]"
    },
    {
      title: "Content Approval",
      description: "Review and approve content before publishing to ensure quality standards.",
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      action: () => navigate('/content-approval'),
      buttonText: "Review Content",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-green-400/30 to-emerald-500/20",
      delay: 0.25,
      iconAnimation: {
        hover: { scale: 1.2, y: -5, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.15 } }
      },
      iconBg: "bg-gradient-to-br from-green-400/40 to-emerald-500/30",
      glowColor: "shadow-[0_0_20px_rgb(34,197,94,0.3)]"
    },
    {
      title: "Offering Management",
      description: "Upload and manage your products and services for content integration.",
      icon: <FileUp className="h-5 w-5 text-neon-pink" />,
      action: () => navigate('/offerings'),
      buttonText: "Manage Offerings",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-neon-pink/30 to-neon-blue/20",
      delay: 0.3,
      iconAnimation: {
        hover: { scale: 1.2, y: -5, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.2 } }
      },
      iconBg: "bg-gradient-to-br from-neon-pink/40 to-neon-blue/30",
      glowColor: "shadow-[0_0_20px_rgb(217,70,239,0.3)]"
    },
    {
      title: "Analytics Dashboard",
      description: "Track performance metrics and optimize your content strategy with insights.",
      icon: <FileBarChart className="h-5 w-5 text-amber-400" />,
      action: () => navigate('/analytics'),
      buttonText: "View Analytics",
      buttonIcon: <TrendingUp className="h-4 w-4" />,
      gradient: "from-amber-400/30 to-orange-500/20",
      delay: 0.35,
      iconAnimation: {
        hover: { scale: 1.2, rotate: -5, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.25 } }
      },
      iconBg: "bg-gradient-to-br from-amber-400/40 to-orange-500/30",
      glowColor: "shadow-[0_0_20px_rgb(245,158,11,0.3)]"
    },
    {
      title: "Team Collaboration",
      description: "Collaborate with team members and manage content workflows efficiently.",
      icon: <Users className="h-5 w-5 text-cyan-400" />,
      action: () => navigate('/team'),
      buttonText: "Manage Team",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-cyan-400/30 to-teal-500/20",
      delay: 0.4,
      iconAnimation: {
        hover: { scale: 1.2, y: -3, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.3 } }
      },
      iconBg: "bg-gradient-to-br from-cyan-400/40 to-teal-500/30",
      glowColor: "shadow-[0_0_20px_rgb(6,182,212,0.3)]"
    },
    {
      title: "SEO Optimization",
      description: "Advanced SEO tools and recommendations to boost your content rankings.",
      icon: <Target className="h-5 w-5 text-rose-400" />,
      action: () => navigate('/seo-tools'),
      buttonText: "SEO Tools",
      buttonIcon: <Zap className="h-4 w-4" />,
      gradient: "from-rose-400/30 to-pink-500/20",
      delay: 0.45,
      iconAnimation: {
        hover: { scale: 1.2, rotate: 10, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.35 } }
      },
      iconBg: "bg-gradient-to-br from-rose-400/40 to-pink-500/30",
      glowColor: "shadow-[0_0_20px_rgb(244,63,94,0.3)]"
    },
    {
      title: "Brand Guidelines",
      description: "Define and maintain your brand voice, style, and visual identity.",
      icon: <Shield className="h-5 w-5 text-purple-400" />,
      action: () => navigate('/brand-guidelines'),
      buttonText: "Brand Guide",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-purple-400/30 to-fuchsia-500/20",
      delay: 0.5,
      iconAnimation: {
        hover: { scale: 1.2, y: -3, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.4 } }
      },
      iconBg: "bg-gradient-to-br from-purple-400/40 to-fuchsia-500/30",
      glowColor: "shadow-[0_0_20px_rgb(168,85,247,0.3)]"
    },
    {
      title: "Content Templates",
      description: "Access pre-built templates and frameworks for faster content creation.",
      icon: <BookOpen className="h-5 w-5 text-emerald-400" />,
      action: () => navigate('/templates'),
      buttonText: "Browse Templates",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-emerald-400/30 to-green-500/20",
      delay: 0.55,
      iconAnimation: {
        hover: { scale: 1.2, rotate: -3, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.45 } }
      },
      iconBg: "bg-gradient-to-br from-emerald-400/40 to-green-500/30",
      glowColor: "shadow-[0_0_20px_rgb(16,185,129,0.3)]"
    },
    {
      title: "AI Chat Assistant",
      description: "Get instant help and guidance from our intelligent content assistant.",
      icon: <MessageSquare className="h-5 w-5 text-blue-300" />,
      action: () => navigate('/ai-chat'),
      buttonText: "Chat Now",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-blue-300/30 to-sky-500/20",
      delay: 0.6,
      iconAnimation: {
        hover: { scale: 1.2, y: -2, transition: { duration: 0.3 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.5 } }
      },
      iconBg: "bg-gradient-to-br from-blue-300/40 to-sky-500/30",
      glowColor: "shadow-[0_0_20px_rgb(147,197,253,0.3)]"
    },
    {
      title: "System Settings",
      description: "Configure your workflow, API integrations, and platform preferences.",
      icon: <Settings className="h-5 w-5 text-slate-400" />,
      action: () => openSettings(),
      buttonText: "Open Settings",
      buttonIcon: <ArrowRight className="h-4 w-4" />,
      gradient: "from-slate-400/30 to-zinc-500/20",
      delay: 0.65,
      iconAnimation: {
        hover: { rotate: 90, scale: 1.2, transition: { duration: 0.5 } },
        tap: { scale: 0.9, transition: { duration: 0.1 } },
        initial: { opacity: 0, y: -15 },
        animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, delay: 0.55 } }
      },
      iconBg: "bg-gradient-to-br from-slate-400/40 to-zinc-500/30",
      glowColor: "shadow-[0_0_20px_rgb(148,163,184,0.3)]"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {actions.map((action, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: action.delay, 
            duration: 0.6,
            type: "spring",
            stiffness: 100,
            damping: 20
          }}
          whileHover={{ 
            y: -8, 
            scale: 1.02,
            transition: { duration: 0.2 } 
          }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <Card className={`
            glass-panel 
            bg-gradient-to-br from-black/40 via-black/20 to-transparent
            overflow-hidden 
            group 
            relative 
            h-full 
            border-white/10 
            hover:border-white/20 
            backdrop-blur-xl
            transition-all 
            duration-500
            hover:${action.glowColor}
            hover:bg-gradient-to-br hover:from-black/60 hover:via-black/30 hover:to-transparent
          `}>
            {/* Animated background gradient */}
            <div className={`
              absolute inset-0 
              bg-gradient-to-br ${action.gradient} 
              opacity-20 
              group-hover:opacity-40 
              transition-all 
              duration-500
              animate-gradient-shift
            `}></div>
            
            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 futuristic-grid opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
            
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="pb-3 relative z-10">
              <motion.div 
                className="mb-3 flex justify-between items-start"
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
              >
                <motion.div 
                  className={`
                    p-3 
                    rounded-xl 
                    ${action.iconBg} 
                    backdrop-blur-md 
                    border 
                    border-white/20 
                    shadow-lg
                    group-hover:shadow-xl
                    group-hover:border-white/30
                    transition-all
                    duration-300
                  `}
                  variants={action.iconAnimation}
                >
                  {action.icon}
                  
                  {/* Pulsing glow effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100"
                    animate={{ 
                      opacity: [0, 0.3, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "loop", 
                      duration: 2,
                      ease: "easeInOut",
                      repeatDelay: 1
                    }}
                  />
                </motion.div>
              </motion.div>
              
              <CardTitle className="text-base text-gradient font-semibold leading-tight">
                {action.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 relative z-10 pb-6">
              <p className="text-xs text-muted-foreground/90 leading-relaxed">
                {action.description}
              </p>
              
              <Button 
                variant="outline" 
                className={`
                  w-full 
                  justify-between 
                  group/btn 
                  border-white/20 
                  hover:border-white/40 
                  bg-background/30 
                  backdrop-blur-sm 
                  hover:bg-background/50 
                  mt-auto 
                  text-sm
                  font-medium
                  transition-all
                  duration-300
                  hover:shadow-lg
                  hover:shadow-white/10
                `}
                onClick={action.action}
              >
                <span className="text-foreground/90 group-hover/btn:text-foreground">
                  {action.buttonText}
                </span>
                
                <motion.span 
                  className="transform transition-transform group-hover/btn:translate-x-1 text-muted-foreground group-hover/btn:text-foreground"
                  animate={{ x: [0, 2, 0] }}
                  transition={{ 
                    repeatType: "loop", 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut",
                    repeatDelay: 2
                  }}
                >
                  {action.buttonIcon}
                </motion.span>
              </Button>
            </CardContent>
            
            {/* Floating particles effect */}
            <div className="absolute top-4 right-4 w-1 h-1 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 floating-particles transition-opacity duration-500"></div>
            <div className="absolute bottom-6 left-6 w-0.5 h-0.5 bg-neon-blue/50 rounded-full opacity-0 group-hover:opacity-100 floating-particles transition-opacity duration-500"></div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
