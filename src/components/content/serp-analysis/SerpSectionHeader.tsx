
import React from 'react';
import { ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { toast } from 'sonner';

interface SerpSectionHeaderProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  variant?: 'blue' | 'green' | 'amber' | 'rose' | 'indigo' | 'teal';
  description?: string;
  count?: number;
  onLoadMore?: () => Promise<void>;
}

const variantClasses = {
  blue: 'text-blue-600',
  green: 'text-emerald-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
  indigo: 'text-indigo-600',
  teal: 'text-teal-600',
};

const variantBgClasses = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-emerald-50 border-emerald-200',
  amber: 'bg-amber-50 border-amber-200',
  rose: 'bg-rose-50 border-rose-200',
  indigo: 'bg-indigo-50 border-indigo-200',
  teal: 'bg-teal-50 border-teal-200',
};

const variantHoverClasses = {
  blue: 'hover:bg-blue-100',
  green: 'hover:bg-emerald-100',
  amber: 'hover:bg-amber-100',
  rose: 'hover:bg-rose-100',
  indigo: 'hover:bg-indigo-100',
  teal: 'hover:bg-teal-100',
};

const variantSelectedClasses = {
  blue: 'bg-blue-100',
  green: 'bg-emerald-100',
  amber: 'bg-amber-100',
  rose: 'bg-rose-100',
  indigo: 'bg-indigo-100',
  teal: 'bg-teal-100',
};

export function SerpSectionHeader({
  title,
  expanded,
  onToggle,
  variant = 'blue',
  description,
  count = 0,
  onLoadMore
}: SerpSectionHeaderProps) {
  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleLoadMore = async () => {
    if (!onLoadMore) {
      toast.error("Load more functionality not available for this section");
      return;
    }

    setIsLoading(true);
    try {
      await onLoadMore();
      toast.success(`More ${title} items loaded successfully`);
    } catch (error) {
      console.error("Failed to load more items:", error);
      toast.error("Failed to load more items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemSelection = (index: number) => {
    setSelectedItems(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
  };
  
  const dummyItems = count > 0 ? Array.from({ length: Math.min(count, 5) }) : [1, 2, 3];

  return (
    <div className="w-full">
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg cursor-pointer mb-2 transition-colors",
          variantBgClasses[variant],
          "border"
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-white/80">
            {expanded ? (
              <ChevronDown className={cn("h-4 w-4", variantClasses[variant])} />
            ) : (
              <ChevronRight className={cn("h-4 w-4", variantClasses[variant])} />
            )}
          </div>
          <div>
            <h4 className={cn("text-sm font-medium", variantClasses[variant])}>{title}</h4>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {count > 0 && (
          <div className="bg-white/80 text-xs font-medium py-1 px-2 rounded-full">
            {count}
          </div>
        )}
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Table>
            <TableHeader>
              <TableRow className={cn(variantBgClasses[variant], "border")}>
                <TableHead className="w-8 text-center">#</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyItems.map((_, index) => (
                <TableRow 
                  key={index}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedItems.includes(index) ? variantSelectedClasses[variant] : "",
                    variantHoverClasses[variant]
                  )}
                  onClick={() => toggleItemSelection(index)}
                >
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell>Sample {title} Item {index + 1}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info(`Action for ${title} item ${index + 1}`);
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {count > 5 && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                size="sm"
                className={cn(variantClasses[variant])}
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : `Load More ${title}`}
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
