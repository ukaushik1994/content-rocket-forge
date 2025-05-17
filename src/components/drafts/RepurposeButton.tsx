
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { Undo, FileText, Newspaper, MessageSquare, Video } from 'lucide-react';
import { toast } from 'sonner';

interface RepurposeButtonProps {
  contentId: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export const RepurposeButton: React.FC<RepurposeButtonProps> = ({ 
  contentId, 
  size = 'sm',
  variant = 'ghost'
}) => {
  const navigate = useNavigate();
  
  const handleRepurpose = (format?: string) => {
    const url = format 
      ? `/content-repurposing?id=${contentId}&format=${format}`
      : `/content-repurposing?id=${contentId}`;
      
    navigate(url);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className="text-primary hover:bg-primary/10"
        >
          <Undo className="h-4 w-4 mr-1" />
          Repurpose
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Repurpose as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleRepurpose('blog')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Blog Post</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRepurpose('article')}>
            <Newspaper className="mr-2 h-4 w-4" />
            <span>Article</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRepurpose('social')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Social Media</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRepurpose('video')}>
            <Video className="mr-2 h-4 w-4" />
            <span>Video Script</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleRepurpose()}>
          <Undo className="mr-2 h-4 w-4" />
          <span>Custom Format</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
