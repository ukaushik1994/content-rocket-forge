import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Share2, Mail, PenTool, BarChart3, Zap } from 'lucide-react';

const contentTypes = [
  { icon: FileText, label: 'Blog Posts', color: 'from-blue-500/20 to-blue-600/30', position: { x: 15, y: 25 } },
  { icon: Share2, label: 'Social Media', color: 'from-purple-500/20 to-purple-600/30', position: { x: 85, y: 35 } },
  { icon: Mail, label: 'Email Campaigns', color: 'from-green-500/20 to-green-600/30', position: { x: 20, y: 70 } },
  { icon: PenTool, label: 'Ad Copy', color: 'from-orange-500/20 to-orange-600/30', position: { x: 80, y: 75 } },
  { icon: BarChart3, label: 'Analytics', color: 'from-pink-500/20 to-pink-600/30', position: { x: 10, y: 50 } },
  { icon: Zap, label: 'AI Insights', color: 'from-yellow-500/20 to-yellow-600/30', position: { x: 90, y: 60 } },
];

export const ContentBubbles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {contentTypes.map((item, index) => (
        <motion.div
          key={item.label}
          className={`absolute bg-gradient-to-br ${item.color} backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-lg`}
          style={{
            left: `${item.position.x}%`,
            top: `${item.position.y}%`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            rotate: 0,
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 0.8, 
            delay: index * 0.2,
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5
            }
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white/90 whitespace-nowrap">{item.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};