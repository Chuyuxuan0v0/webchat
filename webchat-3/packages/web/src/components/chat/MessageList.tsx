import { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import MessageBubble from './MessageBubble';

export default function MessageList() {
  const { messages, isLoading, hasMore, loadMoreMessages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesCount = messages.length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesCount]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {hasMore && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <button
            onClick={loadMoreMessages}
            disabled={isLoading}
            className="text-sm text-blue-500 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          暂无消息，发送第一条吧
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message._id} message={message} />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
