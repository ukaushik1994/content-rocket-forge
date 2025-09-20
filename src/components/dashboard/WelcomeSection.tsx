import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RocketIcon, MessageCircle, Sparkles, BarChart3 } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
interface WelcomeSectionProps {
  setFeedbackOpen: (open: boolean) => void;
  navigate: NavigateFunction;
}
export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  setFeedbackOpen,
  navigate
}) => {
  return <div className="relative overflow-hidden rounded-xl p-6 md:p-8 glass-panel shadow-lg border border-white/10 backdrop-blur-xl">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 futuristic-grid opacity-10 z-0" />
      
      <motion.div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 z-0" initial={{
      opacity: 0
    }} animate={{
      opacity: 1,
      background: ["linear-gradient(to bottom right, rgba(155, 135, 245, 0.1), rgba(51, 195, 240, 0.05))", "linear-gradient(to bottom right, rgba(155, 135, 245, 0.15), rgba(51, 195, 240, 0.07))", "linear-gradient(to bottom right, rgba(155, 135, 245, 0.1), rgba(51, 195, 240, 0.05))"]
    }} transition={{
      duration: 8,
      repeat: Infinity,
      repeatType: "reverse"
    }} />
      
      {/* Animated particles */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 0.6
    }} transition={{
      delay: 0.5,
      duration: 1
    }} className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        {[...Array(5)].map((_, i) => <motion.div key={i} className="absolute rounded-full bg-neon-blue/20 blur-md" style={{
        width: Math.random() * 100 + 50,
        height: Math.random() * 100 + 50,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }} animate={{
        x: [0, Math.random() * 50 - 25],
        y: [0, Math.random() * 50 - 25],
        opacity: [0.3, 0.7, 0.3]
      }} transition={{
        duration: Math.random() * 10 + 15,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }} />)}
      </motion.div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <motion.div className="space-y-4 max-w-lg" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.7,
        delay: 0.2
      }}>
          <motion.div className="flex items-center gap-2 mb-1" initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.4,
          duration: 0.5
        }}>
            <motion.div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20" whileHover={{
            scale: 1.1,
            backgroundColor: "rgba(155, 135, 245, 0.3)"
          }} transition={{
            type: "spring",
            stiffness: 400,
            damping: 10
          }}>
              <Sparkles className="h-3 w-3 text-primary" />
            </motion.div>
            <span className="text-sm text-muted-foreground">AI-Powered Content Platform</span>
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold">
            <motion.div className="overflow-hidden" initial={{
            height: 0
          }} animate={{
            height: "auto"
          }} transition={{
            duration: 0.7,
            delay: 0.3
          }}>
              <motion.span className="text-gradient inline-block" initial={{
              y: 40
            }} animate={{
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.4
            }}>CreAiter</motion.span>
            </motion.div>
          </h1>
          
          <motion.p className="text-muted-foreground" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.7,
          duration: 0.6
        }}>
            Generate high-ranking, conversion-driven content by integrating real-time SERP data, 
            keyword clusters, and business solutions.
          </motion.p>
          
          <motion.div className="flex flex-wrap gap-3" variants={{
          hidden: {
            opacity: 0
          },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
              delayChildren: 0.8
            }
          }
        }} initial="hidden" animate="show">
            <motion.div variants={{
            hidden: {
              opacity: 0,
              y: 20
            },
            show: {
              opacity: 1,
              y: 0
            }
          }}>
              <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 hover:shadow-neon group relative overflow-hidden" onClick={() => navigate('/content-builder')}>
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity" />
                <span className="relative z-10 flex items-center">
                  New Content Project
                  <RocketIcon className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </motion.div>
            
            <motion.div variants={{
            hidden: {
              opacity: 0,
              y: 20
            },
            show: {
              opacity: 1,
              y: 0
            }
          }}>
              <Button variant="outline" className="border-white/10 hover:border-white/20 hover:bg-neon-purple/10 transition-all duration-300 group" onClick={() => navigate('/analytics')}>
                <span className="relative z-10 flex items-center">
                  View Analytics
                  <BarChart3 className="ml-2 h-4 w-4 group-hover:text-primary transition-colors" />
                </span>
              </Button>
            </motion.div>
            
            <motion.div variants={{
            hidden: {
              opacity: 0,
              y: 20
            },
            show: {
              opacity: 1,
              y: 0
            }
          }}>
              <Button variant="ghost" className="hover:bg-white/5 transition-all duration-300" onClick={() => setFeedbackOpen(true)}>
                <span className="relative z-10 flex items-center">
                  Feedback
                  <MessageCircle className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div className="w-full max-w-[220px] flex items-center justify-center" initial={{
        opacity: 0,
        scale: 0.8
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: 1.1,
        duration: 0.6
      }}>
          <div className="relative">
            <motion.div className="w-40 h-40 rounded-full bg-gradient-to-br from-neon-purple via-neon-blue to-neon-pink opacity-20 blur-xl absolute" animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0],
            background: ["radial-gradient(circle, rgba(155,135,245,0.2), rgba(51,195,240,0.2), rgba(217,70,239,0.2))", "radial-gradient(circle, rgba(51,195,240,0.2), rgba(217,70,239,0.2), rgba(155,135,245,0.2))", "radial-gradient(circle, rgba(217,70,239,0.2), rgba(155,135,245,0.2), rgba(51,195,240,0.2))"]
          }} transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }} />
            <motion.div className="w-36 h-36 rounded-full bg-glass flex items-center justify-center relative z-10 border border-white/10 backdrop-blur-xl" animate={{
            y: [0, -8, 0],
            boxShadow: ["0 0 20px rgba(155, 135, 245, 0.3)", "0 0 30px rgba(155, 135, 245, 0.5)", "0 0 20px rgba(155, 135, 245, 0.3)"]
          }} transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse"
          }}>
              <div className="relative">
                <motion.div className="absolute -inset-4 rounded-full bg-primary/20 opacity-70" animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.7, 0.5]
              }} transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }} />
                <motion.div animate={{
                rotate: [0, 360]
              }} transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}>
                  <Sparkles className="h-12 w-12 text-primary" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>;
};