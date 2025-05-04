
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ContentPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ContentPagination: React.FC<ContentPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Generate page numbers to display (show max 5 pages at once)
  const getPageNumbers = () => {
    let pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If there are 5 or fewer pages, show all
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always include first and last page
      if (currentPage <= 3) {
        // Near the beginning
        pages = [1, 2, 3, 4, totalPages];
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages = [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        // In the middle
        pages = [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
      }
    }
    
    return pages;
  };
  
  if (totalPages <= 1) return null;
  
  const pageNumbers = getPageNumbers();
  
  return (
    <Pagination className="mt-6">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => onPageChange(currentPage - 1)}
            />
          </PaginationItem>
        )}
        
        {pageNumbers.map((page, index) => {
          // Add ellipsis if there's a gap
          const showEllipsisBefore = index > 0 && page > pageNumbers[index - 1] + 1;
          
          return (
            <React.Fragment key={page}>
              {showEllipsisBefore && (
                <PaginationItem>
                  <span className="px-3">...</span>
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationLink
                  isActive={page === currentPage}
                  className={`cursor-pointer ${page === currentPage ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-secondary/80'}`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </React.Fragment>
          );
        })}
        
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => onPageChange(currentPage + 1)}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
