import React, { useMemo, useRef, useState, useEffect } from 'react';
import { MessageStatus } from './MessageStatus';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  message_status?: string;
  read_by?: any[];
}

interface VirtualizedMessageListProps {
  messages: Message[];
  height: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const ITEM_HEIGHT = 120; // Estimated height per message
const OVERSCAN_COUNT = 5; // Number of items to render outside visible area

const MessageItem: React.FC<{
  index: number;
  style: any;
  data: {
    messages: Message[];
    onLoadMore?: () => void;
    hasMore?: boolean;
  };
}> = ({ index, style, data }) => {
  const { messages, onLoadMore, hasMore } = data;
  const message = messages[index];

  // Trigger load more when approaching end
  useEffect(() => {
    if (index === messages.length - 10 && hasMore && onLoadMore) {
      onLoadMore();
    }
  }, [index, messages.length, hasMore, onLoadMore]);

  if (!message) {
    return (
      <div style={style} className="flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-lg h-16 w-full mx-4" />
      </div>
    );
  }

  return (
    <div style={style} className="px-4 py-2">
      <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[80%] rounded-lg p-3 ${
          message.type === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-card border'
        }`}>
          <div className="whitespace-pre-wrap break-words text-sm">
            {message.content}
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
            <span>
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
            
            {message.type === 'user' && (
              <MessageStatus 
                status={(message.message_status as 'sent' | 'delivered' | 'read' | 'failed') || 'sent'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
  messages,
  height,
  onLoadMore,
  hasMore = false,
  loading = false
}) => {
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No messages yet</div>
          <div className="text-sm">Start a conversation to see messages here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-auto" style={{ height }}>
      {messages.map((message, index) => (
        <div key={message.id} className="px-4">
          <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              message.type === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border'
            }`}>
              <div className="whitespace-pre-wrap break-words text-sm">
                {message.content}
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                <span>
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
                
                {message.type === 'user' && (
                  <MessageStatus 
                    status={(message.message_status as 'sent' | 'delivered' | 'read' | 'failed') || 'sent'}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          Loading more messages...
        </div>
      )}
    </div>
  );
};