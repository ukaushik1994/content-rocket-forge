
import React from 'react';
import { Button } from '@/components/ui/button';
import { Book, Images, Image, Twitter, Linkedin, Facebook, Mail, BarChart, FileText } from 'lucide-react';

interface FormatButtonProps {
  formatId: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
}

export const FormatButton: React.FC<FormatButtonProps> = ({ formatId, name, isActive, onClick }) => {
  // Helper function to get the appropriate icon for a format
  const getFormatIcon = (formatId: string) => {
    switch (formatId) {
      case 'glossary':
        return <Book className="h-4 w-4" />;
      case 'carousel':
        return <Images className="h-4 w-4" />;
      case 'meme':
        return <Image className="h-4 w-4" />;
      case 'social-twitter':
        return <Twitter className="h-4 w-4" />;
      case 'social-linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'social-facebook': 
        return <Facebook className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'infographic':
        return <BarChart className="h-4 w-4" />;
      case 'blog':
      case 'script':
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const icon = getFormatIcon(formatId);

  return (
    <Button
      size="sm"
      variant={isActive ? "default" : "outline"}
      onClick={onClick}
      className={isActive 
        ? "bg-gradient-to-r from-neon-purple to-neon-blue border-none" 
        : "border-white/10"
      }
    >
      {icon && <span className="mr-1">{icon}</span>}
      {name}
    </Button>
  );
};

export default FormatButton;
