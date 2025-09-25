import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AccessibilityOptions {
  announcements?: boolean;
  focusManagement?: boolean;
  keyboardNavigation?: boolean;
}

/**
 * Hook for comprehensive accessibility features
 */
export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const { announcements = true, focusManagement = true, keyboardNavigation = true } = options;
  const { toast } = useToast();
  const announcerRef = useRef<HTMLDivElement | null>(null);

  // Create live region for announcements
  useEffect(() => {
    if (!announcements) return;

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.id = 'accessibility-announcer';
    document.body.appendChild(announcer);
    announcerRef.current = announcer;

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, [announcements]);

  // Announce messages to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcements || !announcerRef.current) return;

    announcerRef.current.setAttribute('aria-live', priority);
    announcerRef.current.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = '';
      }
    }, 1000);
  }, [announcements]);

  // Focus management utilities
  const trapFocus = useCallback((container: HTMLElement) => {
    if (!focusManagement) return () => {};

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [focusManagement]);

  // Keyboard navigation handler
  const handleKeyboardNavigation = useCallback((
    e: KeyboardEvent,
    actions: {
      onEnter?: () => void;
      onSpace?: () => void;
      onEscape?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
    }
  ) => {
    if (!keyboardNavigation) return;

    switch (e.key) {
      case 'Enter':
        actions.onEnter?.();
        break;
      case ' ':
        e.preventDefault();
        actions.onSpace?.();
        break;
      case 'Escape':
        actions.onEscape?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        actions.onArrowUp?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        actions.onArrowDown?.();
        break;
      case 'ArrowLeft':
        actions.onArrowLeft?.();
        break;
      case 'ArrowRight':
        actions.onArrowRight?.();
        break;
    }
  }, [keyboardNavigation]);

  // Skip link utility
  const createSkipLink = useCallback((target: string, label: string) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${target}`;
    skipLink.textContent = label;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50';
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const targetElement = document.getElementById(target);
      if (targetElement) {
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    return skipLink;
  }, []);

  // Color contrast checker
  const checkColorContrast = useCallback((foreground: string, background: string): boolean => {
    // Simplified contrast ratio calculation (WCAG 2.1 AA requires 4.5:1)
    // This is a basic implementation - for production, use a proper contrast library
    const getLuminance = (color: string) => {
      // Convert hex to RGB and calculate relative luminance
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const gamma = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      
      return 0.2126 * gamma(r) + 0.7152 * gamma(g) + 0.0722 * gamma(b);
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return ratio >= 4.5; // WCAG AA standard
  }, []);

  return {
    announce,
    trapFocus,
    handleKeyboardNavigation,
    createSkipLink,
    checkColorContrast
  };
};

export default useAccessibility;