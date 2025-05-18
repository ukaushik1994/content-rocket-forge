
import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ContentItemType } from '@/contexts/content/types';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbNavProps {
  content: ContentItemType;
  hasGeneratedContent: boolean;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ content, hasGeneratedContent }) => {
  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/content-repurposing" className="text-muted-foreground">
            Content Selection
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        
        <BreadcrumbItem>
          <BreadcrumbLink className="text-white font-medium">
            {content.title.length > 30 ? content.title.substring(0, 30) + '...' : content.title}
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {hasGeneratedContent && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            
            <BreadcrumbItem>
              <BreadcrumbLink className="text-neon-purple">
                Generated Content
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNav;
