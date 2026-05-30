import { useChatStore } from '../../stores/chatStore';
import Avatar from '../Avatar';

export default function ChatHeader() {
  const { activeChat, onlineUsers } = useChatStore();

  if (!activeChat) return null;

  return (
    <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center">
      {activeChat.type === 'group' ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
            #
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{activeChat.name}</h2>
            <p className="text-xs text-gray-500">{onlineUsers.length} 人在线</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Avatar username={activeChat.name} size="md" />
          <div>
            <h2 className="font-semibold text-gray-800">{activeChat.name}</h2>
            <p className="text-xs text-gray-500">私聊</p>
          </div>
        </div>
      )}
    </div>
  );
}
