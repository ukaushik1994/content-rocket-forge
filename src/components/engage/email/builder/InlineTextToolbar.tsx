import React, { useCallback } from 'react';
import { Bold, Italic, Underline, Link, List, ListOrdered, Strikethrough } from 'lucide-react';
import { motion } from 'framer-motion';

interface InlineTextToolbarProps {
  visible: boolean;
}

const TOOLS = [
  { icon: Bold, command: 'bold', label: 'Bold' },
  { icon: Italic, command: 'italic', label: 'Italic' },
  { icon: Underline, command: 'underline', label: 'Underline' },
  { icon: Strikethrough, command: 'strikeThrough', label: 'Strikethrough' },
  { icon: List, command: 'insertUnorderedList', label: 'Bullet List' },
  { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered List' },
  { icon: Link, command: 'createLink', label: 'Insert Link' },
];

export const InlineTextToolbar: React.FC<InlineTextToolbarProps> = ({ visible }) => {
  const exec = useCallback((command: string) => {
    if (command === 'createLink') {
      const url = prompt('Enter URL:', 'https://');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(command, false);
    }
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex items-center gap-0.5 bg-popover border border-border rounded-lg shadow-lg px-1 py-0.5 mb-1"
      onMouseDown={(e) => e.preventDefault()}
    >
      {TOOLS.map((tool) => (
        <button
          key={tool.command}
          onClick={() => exec(tool.command)}
          className="p-1.5 hover:bg-muted/60 rounded transition-colors"
          title={tool.label}
        >
          <tool.icon className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      ))}
    </motion.div>
  );
};
