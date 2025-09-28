import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Search, 
  ArrowUpDown, 
  Edit3, 
  Save, 
  X,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataTableProps {
  data: any[];
  title?: string;
  description?: string;
  allowEdit?: boolean;
  allowFilter?: boolean;
  allowSort?: boolean;
  onDataChange?: (data: any[]) => void;
  onExport?: (format: 'csv' | 'excel') => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data: initialData,
  title,
  description,
  allowEdit = false,
  allowFilter = true,
  allowSort = true,
  onDataChange,
  onExport
}) => {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  console.log('📊 DataTable: Rendering with data:', { 
    dataLength: data?.length, 
    firstRow: data?.[0],
    columns: data?.[0] ? Object.keys(data[0]) : []
  });

  // Extract columns from data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter(key => 
      !['id', '_id', 'created_at', 'updated_at'].includes(key)
    );
  }, [data]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data || [];

    // Apply search filter
    if (searchTerm && allowFilter) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig && allowSort) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, allowFilter, allowSort]);

  const handleSort = useCallback((columnKey: string) => {
    if (!allowSort) return;
    
    setSortConfig(current => {
      if (current?.key === columnKey) {
        return current.direction === 'asc' 
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  }, [allowSort]);

  const handleCellEdit = useCallback((rowIndex: number, columnKey: string, value: any) => {
    if (!allowEdit) return;
    
    setEditingCell({ row: rowIndex, column: columnKey });
    setEditValue(String(value || ''));
  }, [allowEdit]);

  const handleSaveCellEdit = useCallback(() => {
    if (!editingCell || !allowEdit) return;
    
    const newData = [...data];
    const actualRowIndex = data.findIndex(row => 
      JSON.stringify(row) === JSON.stringify(processedData[editingCell.row])
    );
    
    if (actualRowIndex !== -1) {
      newData[actualRowIndex] = {
        ...newData[actualRowIndex],
        [editingCell.column]: editValue
      };
      
      setData(newData);
      onDataChange?.(newData);
    }
    
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, data, processedData, allowEdit, onDataChange]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const handleExportCSV = useCallback(() => {
    const csv = [
      columns.join(','),
      ...processedData.map(row => 
        columns.map(col => `"${String(row[col] || '')}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data-export-${Date.now()}.csv`);
    link.click();
    
    onExport?.('csv');
  }, [columns, processedData, onExport]);

  const handleExportExcel = useCallback(() => {
    // For now, export as CSV with .xlsx extension
    // In a real app, you'd use a library like xlsx
    const csv = [
      columns.join('\t'),
      ...processedData.map(row => 
        columns.map(col => String(row[col] || '')).join('\t')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data-export-${Date.now()}.xlsx`);
    link.click();
    
    onExport?.('excel');
  }, [columns, processedData, onExport]);

  const formatCellValue = (value: any, columnKey: string) => {
    if (value == null) return '-';
    
    // Format numbers nicely
    if (typeof value === 'number') {
      if (columnKey.toLowerCase().includes('percent') || columnKey.toLowerCase().includes('%')) {
        return `${value}%`;
      }
      if (columnKey.toLowerCase().includes('currency') || columnKey.toLowerCase().includes('price')) {
        return `$${value.toLocaleString()}`;
      }
      return value.toLocaleString();
    }
    
    return String(value);
  };

  const getSortIcon = (columnKey: string) => {
    if (!allowSort) return null;
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return (
      <ArrowUpDown 
        className={cn(
          "w-4 h-4",
          sortConfig.direction === 'asc' ? 'text-primary' : 'text-primary rotate-180'
        )} 
      />
    );
  };

  if (!data || data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Data Available</h3>
        <p className="text-muted-foreground">There's no data to display in the table.</p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <Card className="glass-panel bg-glass border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/10 bg-background/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportCSV}
                className="text-xs"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportExcel}
                className="text-xs"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Excel
              </Button>
            </div>
          </div>

          {/* Search and Stats */}
          {allowFilter && (
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {processedData.length} rows
                </Badge>
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                  {columns.length} columns
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm">
              <TableRow>
                {columns.map((column) => (
                  <TableHead 
                    key={column}
                    className={cn(
                      "font-medium text-foreground border-r border-border/50 last:border-r-0",
                      allowSort && "cursor-pointer hover:bg-accent/50 transition-colors"
                    )}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="capitalize">
                        {column.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {getSortIcon(column)}
                    </div>
                  </TableHead>
                ))}
                {allowEdit && (
                  <TableHead className="w-16 text-center">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  className="hover:bg-accent/30 transition-colors"
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column}
                      className="border-r border-border/30 last:border-r-0"
                    >
                      {editingCell?.row === rowIndex && editingCell?.column === column ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-7 text-xs"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveCellEdit();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <Button size="sm" variant="ghost" onClick={handleSaveCellEdit}>
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className={cn(
                            "min-h-[20px] flex items-center",
                            allowEdit && "cursor-pointer hover:bg-accent/20 rounded px-1"
                          )}
                          onClick={() => allowEdit && handleCellEdit(rowIndex, column, row[column])}
                        >
                          {formatCellValue(row[column], column)}
                        </div>
                      )}
                    </TableCell>
                  ))}
                  {allowEdit && (
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCellEdit(rowIndex, columns[0], row[columns[0]])}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer stats */}
        <div className="border-t border-white/10 bg-background/30 backdrop-blur-sm p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {processedData.length} of {data.length} records
              {searchTerm && ` • Filtered by "${searchTerm}"`}
              {sortConfig && ` • Sorted by ${sortConfig.key} (${sortConfig.direction})`}
            </span>
            <div className="flex items-center gap-2">
              {allowEdit && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Editable
                </Badge>
              )}
              {allowFilter && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Searchable
                </Badge>
              )}
              {allowSort && (
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  Sortable
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};