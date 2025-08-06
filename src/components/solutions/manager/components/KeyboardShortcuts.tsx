import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface KeyboardShortcutsProps {
  onSave?: () => void;
  onClose?: () => void;
  onNextTab?: () => void;
  onPrevTab?: () => void;
  isEnabled?: boolean;
}

const TAB_ORDER = ['basic', 'features', 'market', 'technical', 'pricing', 'competitors', 'cases', 'resources', 'analytics', 'preview'];

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onSave,
  onClose,
  onNextTab,
  onPrevTab,
  isEnabled = true
}) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Save shortcut: Ctrl+S or Cmd+S
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        onSave?.();
        toast.success('Shortcut: Save triggered');
        return;
      }

      // Close shortcut: Escape
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      // Tab navigation: Ctrl+Tab (next) and Ctrl+Shift+Tab (previous)
      if (event.ctrlKey && event.key === 'Tab') {
        event.preventDefault();
        if (event.shiftKey) {
          onPrevTab?.();
        } else {
          onNextTab?.();
        }
        return;
      }

      // Arrow key navigation: Ctrl+Arrow
      if (event.ctrlKey) {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          onNextTab?.();
          return;
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          onPrevTab?.();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onClose, onNextTab, onPrevTab, isEnabled]);

  return null; // This component doesn't render anything
};

export const useKeyboardNavigation = (currentTab: string, setActiveTab: (tab: string) => void) => {
  const currentIndex = TAB_ORDER.indexOf(currentTab);

  const nextTab = () => {
    const nextIndex = (currentIndex + 1) % TAB_ORDER.length;
    setActiveTab(TAB_ORDER[nextIndex]);
  };

  const prevTab = () => {
    const prevIndex = currentIndex === 0 ? TAB_ORDER.length - 1 : currentIndex - 1;
    setActiveTab(TAB_ORDER[prevIndex]);
  };

  return { nextTab, prevTab };
};