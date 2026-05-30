import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { useSocketStore } from '../stores/socketStore';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatPage() {
  const { token } = useAuthStore();
  const { setActiveChat, loadOnlineUsers, activeChat } = useChatStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    if (token) {
      connect(token);
      loadOnlineUsers();
      setActiveChat({ id: 'global', type: 'group', name: '聊天大厅' });
    }

    return () => {
      disconnect();
    };
  }, [token]);

  return (
    <div className="h-screen flex">
      <Sidebar
        onSelectChat={setActiveChat}
        activeChatId={activeChat?.id}
      />
      <ChatWindow />
    </div>
  );
}
