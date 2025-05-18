
import React from 'react';
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
import FormatBadge from './FormatBadge';

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

  const tooltipText = `${formatName} ${isFormatUsed ? '(Click to view)' : ''}`;

  return (
    <FormatBadge 
      isActive={isFormatUsed}
      tooltipText={tooltipText}
      onClick={onClick}
    >
      {getFormatIcon(formatId)}
    </FormatBadge>
  );
};

export default ContentFormatIcon;
