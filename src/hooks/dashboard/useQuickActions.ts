
import { useNavigate } from 'react-router-dom';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';

export const useQuickActions = () => {
  const navigate = useNavigate();
  const { addContent } = useContent();

  const handleNewContent = () => {
    navigate('/content-builder');
    toast.success('Starting new content creation');
  };

  const handleRepurposeContent = () => {
    navigate('/content-repurposing');
    toast.success('Opening content repurposing tool');
  };

  const handleAnalyzeKeywords = () => {
    navigate('/content-builder?step=keyword-selection');
    toast.success('Opening keyword analyzer');
  };

  const handleViewDrafts = () => {
    navigate('/drafts');
    toast.success('Opening your drafts');
  };

  const handleViewSolutions = () => {
    navigate('/solutions');
    toast.success('Opening solutions library');
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
    toast.success('Opening analytics dashboard');
  };

  const quickActions = [
    {
      id: 'new-content',
      title: 'Create Content',
      description: 'Start a new content piece',
      icon: 'FileText',
      action: handleNewContent,
      variant: 'primary' as const
    },
    {
      id: 'repurpose',
      title: 'Repurpose Content',
      description: 'Transform existing content',
      icon: 'RefreshCw',
      action: handleRepurposeContent,
      variant: 'secondary' as const
    },
    {
      id: 'keywords',
      title: 'Analyze Keywords',
      description: 'Research and optimize keywords',
      icon: 'Search',
      action: handleAnalyzeKeywords,
      variant: 'secondary' as const
    },
    {
      id: 'drafts',
      title: 'View Drafts',
      description: 'Continue working on drafts',
      icon: 'FileEdit',
      action: handleViewDrafts,
      variant: 'secondary' as const
    },
    {
      id: 'solutions',
      title: 'Solutions Library',
      description: 'Browse available solutions',
      icon: 'Package',
      action: handleViewSolutions,
      variant: 'secondary' as const
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: 'BarChart3',
      action: handleViewAnalytics,
      variant: 'secondary' as const
    }
  ];

  return {
    quickActions
  };
};
