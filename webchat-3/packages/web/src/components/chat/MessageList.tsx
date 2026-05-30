import { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import MessageBubble from './MessageBubble';

export default function MessageList() {
  const { messages, isLoading } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
