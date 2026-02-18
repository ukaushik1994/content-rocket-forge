import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ContextualAction } from '@/services/aiService';
import { 
  PenTool, 
  Search, 
  TrendingUp, 
  Target, 
  FileText, 
  BarChart3,
  ExternalLink,
  AlertTriangle,
  Navigation,
  MessageSquare,
  Trash2,
  Send,
  Power,
  Plus,
  Settings,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModernActionButtonsProps {
  actions: ContextualAction[];
  onAction: (action: ContextualAction) => void;
}

const getActionIcon = (action: string) => {
  if (!action) return FileText;
  
  // Destructive/confirmation actions
  if (action.includes('confirm_action') || action.includes('delete')) return AlertTriangle;
  if (action.includes('send_email') || action.includes('send-email')) return Send;
  if (action.includes('toggle_automation') || action.includes('toggle-automation')) return Power;
  
  // Navigation actions
  if (action.startsWith('navigate:') || action === 'navigate') return Navigation;
  
  // Send message / chat continuation
  if (action === 'send-message' || action === 'send_message') return MessageSquare;
  
  // Content creation
  if (action.includes('create-blog') || action.includes('create-article') || action.includes('create_content')) return FileText;
  if (action.includes('create-landing') || action.includes('create-sales') || action.includes('start_content')) return PenTool;
  if (action.includes('create_contact') || action.includes('create_segment')) return Users;
  if (action.includes('create_')) return Plus;
  
  // Research
  if (action.includes('keyword-research') || action.includes('analyze-keywords') || action.includes('research')) return Search;
  if (action.includes('seo') || action.includes('optimize')) return Target;
  
  // Strategy/analytics
  if (action.includes('strategy') || action.includes('content-strategy')) return BarChart3;
  if (action.includes('competitor') || action.includes('trending')) return TrendingUp;
  
  // Settings
  if (action.includes('settings') || action.includes('open-settings')) return Settings;
  
  return FileText;
};

const isDestructiveAction = (action: string): boolean => {
  if (!action) return false;
  return action.includes('confirm_action') || 
         action.includes('delete') || 
         action.includes('send_email_campaign') ||
         action.includes('toggle_automation');
};

export const ModernActionButtons: React.FC<ModernActionButtonsProps> = ({ 
  actions, 
  onAction
}) => {
  const navigate = useNavigate();

  // Show all actions (up to 4) - no restrictive filtering
  const displayActions = actions.slice(0, 4);

  if (displayActions.length === 0) {
    return null;
  }

  const handleActionClick = (action: ContextualAction) => {
    console.log('🎯 Action clicked:', action);
    
    const actionStr = action.action || '';
    
    // Handle confirm_action - send confirmed message back to AI
    if (actionStr === 'confirm_action' || actionStr.includes('confirm_action')) {
      onAction({
        ...action,
        action: 'confirm_action',
        data: action.data
      });
      return;
    }
    
    // Handle send-message - continue conversation in chat
    if (actionStr === 'send-message' || actionStr === 'send_message') {
      onAction(action);
      return;
    }
    
    // Handle navigate actions (both "navigate" and "navigate:/path" formats)
    if (actionStr === 'navigate' || actionStr.startsWith('navigate:')) {
      const url = actionStr.startsWith('navigate:') 
        ? actionStr.substring('navigate:'.length) 
        : action.data?.url;
      
      if (url) {
        // Store payload in sessionStorage if present
        if (action.data?.payload) {
          try {
            sessionStorage.setItem('contentBuilderPayload', JSON.stringify(action.data.payload));
          } catch (e) {
            console.warn('Failed to store navigation payload:', e);
          }
        }
        navigate(url);
      }
      return;
    }
    
    // Handle workflow actions - continue in chat
    if (actionStr.includes('workflow:')) {
      const followUpPrompt = `Help me with: ${action.label}. ${action.description || 'Provide detailed analysis and actionable recommendations.'}`;
      onAction({ ...action, action: 'send-message', data: { message: followUpPrompt } });
      return;
    }
    
    // Handle create/content/research actions via navigation
    if (actionStr.includes('create-') || actionStr.includes('content-')) {
      const preloadData = {
        mainKeyword: action.data?.keyword || action.data?.mainKeyword || action.label,
        selectedKeywords: action.data?.keywords || [],
        contentType: action.data?.contentType || 'blog-post',
        contentTitle: action.data?.title || action.label,
        location: action.data?.location,
        step: action.data?.step || 1,
        description: action.description,
        ...action.data
      };
      navigate('/content-builder', { state: { prefilledData: preloadData } });
    } else if (actionStr.includes('keyword-research') || actionStr.includes('research')) {
      navigate('/research/content-strategy', { 
        state: { prefilledKeyword: action.data?.keyword || action.data?.mainKeyword || action.label }
      });
    } else if (actionStr.includes('strategy')) {
      navigate('/research/content-strategy');
    } else {
      // Default: pass through to parent handler
      onAction(action);
    }
  };

  return (
    <motion.div 
      className="mt-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex gap-2 flex-wrap">
        {displayActions.map((action, index) => {
          const Icon = getActionIcon(action.action || '');
          const destructive = isDestructiveAction(action.action || '');
          
          return (
            <motion.div
              key={action.id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant={destructive ? "destructive" : "outline"}
                size="sm"
                className={
                  destructive
                    ? "h-8 px-3 gap-1.5 text-xs"
                    : "h-8 px-3 gap-1.5 bg-background/50 hover:bg-primary/10 border-border/50 hover:border-primary/30 text-xs"
                }
                onClick={() => handleActionClick(action)}
              >
                <Icon className="h-3 w-3" />
                <span className="max-w-28 truncate">{action.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
