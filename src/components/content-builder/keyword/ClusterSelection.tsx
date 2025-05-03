import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ContentCluster } from '@/contexts/content-builder/types';
interface ClusterSelectionProps {
  clusters: ContentCluster[];
  selectedCluster: ContentCluster | null;
  onSelectCluster: (cluster: ContentCluster) => void;
  onClearCluster: () => void;
}
export const ClusterSelection: React.FC<ClusterSelectionProps> = ({
  clusters,
  selectedCluster,
  onSelectCluster,
  onClearCluster
}) => {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {clusters.map(cluster => <Card key={cluster.id} className={`cursor-pointer transition-all hover:border-primary ${selectedCluster?.id === cluster.id ? 'border-primary bg-primary/5' : ''}`} onClick={() => onSelectCluster(cluster)}>
          
          
        </Card>)}
    </div>;
};