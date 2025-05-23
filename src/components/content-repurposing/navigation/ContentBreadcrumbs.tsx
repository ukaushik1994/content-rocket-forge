
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

interface ContentBreadcrumbsProps {
  contentId?: string;
  contentTitle?: string;
  className?: string;
}

export const ContentBreadcrumbs: React.FC<ContentBreadcrumbsProps> = ({ 
  contentId, 
  contentTitle,
  className 
}) => {
  return (
    <Breadcrumb className={cn("mb-4 text-sm", className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">
              <Home className="h-3.5 w-3.5 mr-1" />
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator>
          <ChevronRight className="h-3.5 w-3.5" />
        </BreadcrumbSeparator>
        
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/content-repurposing">Content Repurposing</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {contentId && contentTitle && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            
            <BreadcrumbItem>
              <BreadcrumbPage>{contentTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default ContentBreadcrumbs;
