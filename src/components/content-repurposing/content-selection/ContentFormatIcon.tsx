
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Book, 
  Images, 
  Image, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Mail, 
  FileText, 
  BarChart 
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface ContentFormatIconProps {
  formatId: string;
  isFormatUsed: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const ContentFormatIcon: React.FC<ContentFormatIconProps> = ({
  formatId,
  isFormatUsed,
  onClick
}) => {
  // Helper function to get the appropriate icon for a format
  const getFormatIcon = (formatId: string) => {
    switch (formatId) {
      case 'glossary':
        return <Book className="h-full w-full" />;
      case 'carousel':
        return <Images className="h-full w-full" />;
      case 'meme':
        return <Image className="h-full w-full" />;
      case 'social-twitter':
        return <Twitter className="h-full w-full" />;
      case 'social-linkedin':
        return <Linkedin className="h-full w-full" />;
      case 'social-facebook':
        return <Facebook className="h-full w-full" />;
      case 'email':
        return <Mail className="h-full w-full" />;
      case 'script':
        return <FileText className="h-full w-full" />;
      case 'infographic':
        return <BarChart className="h-full w-full" />;
      case 'blog':
        return <FileText className="h-full w-full" />;
      default:
        return <FileText className="h-full w-full" />;
    }
  };

  const formatName = (() => {
    switch (formatId) {
      case 'glossary': return 'Glossary';
      case 'carousel': return 'Carousel';
      case 'meme': return 'Meme';
      case 'social-twitter': return 'Twitter';
      case 'social-linkedin': return 'LinkedIn';
      case 'social-facebook': return 'Facebook';
      case 'email': return 'Email';
      case 'script': return 'Script';
      case 'infographic': return 'Infographic';
      case 'blog': return 'Blog';
      default: return formatId;
    }
  })();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className={`w-7 h-7 flex items-center justify-center rounded-full 
            ${isFormatUsed
              ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg cursor-pointer' 
              : 'bg-gray-800/40 text-gray-500'}`}
          initial={false}
          animate={isFormatUsed ? {
            scale: [1, 1.15, 1],
            boxShadow: ['0 0 0px rgba(155, 135, 245, 0.5)', '0 0 15px rgba(155, 135, 245, 0.8)', '0 0 5px rgba(155, 135, 245, 0.5)']
          } : {}}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            repeat: isFormatUsed ? Infinity : 0,
            repeatDelay: 4
          }}
          onClick={isFormatUsed ? onClick : undefined}
        >
          {getFormatIcon(formatId)}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{formatName} {isFormatUsed ? '(Click to view)' : ''}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ContentFormatIcon;
