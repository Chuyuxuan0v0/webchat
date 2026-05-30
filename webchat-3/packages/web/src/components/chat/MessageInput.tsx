import { useState } from 'react';
import { useSocketStore } from '../../stores/socketStore';
import { useChatStore } from '../../stores/chatStore';
import FileUpload from './FileUpload';

export default function MessageInput() {
  const [message, setMessage] = useState('');
  const { sendMessage } = useSocketStore();
  const { activeChat } = useChatStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !activeChat) return;

    sendMessage({
      chatId: activeChat.id,
      content: message.trim(),
      type: 'text',
      chatType: activeChat.type,
    });

    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-2">
        <FileUpload type="image" />
        <FileUpload type="file" />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          发送
        </button>
      </div>
    </form>
  );
}
