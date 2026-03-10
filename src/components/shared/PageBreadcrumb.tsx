import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface PageBreadcrumbProps {
  section: string;
  page: string;
  sectionPath?: string;
}

export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ section, page, sectionPath }) => {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          {sectionPath ? (
            <BreadcrumbLink asChild>
              <Link to={sectionPath}>{section}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="text-muted-foreground">{section}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
