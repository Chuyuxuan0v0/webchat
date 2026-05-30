import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import Avatar from '../Avatar';

interface SidebarProps {
  onSelectChat: (chat: { id: string; type: 'group' | 'private'; name: string }) => void;
  activeChatId?: string;
}

export default function Sidebar({ onSelectChat, activeChatId }: SidebarProps) {
  const { onlineUsers } = useChatStore();
  const { user } = useAuthStore();

  const handlePrivateChat = (targetUser: { _id: string; username: string }) => {
    if (!user) return;
    const chatId = [user._id, targetUser._id].sort().join('_');
    onSelectChat({
      id: chatId,
      type: 'private',
      name: targetUser.username,
    });
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar
            username={user?.username || ''}
            avatar={user?.avatar}
            avatarBgColor={user?.avatarBgColor}
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">{user?.username}</p>
            <p className="text-xs text-green-500">在线</p>
          </div>
        </div>
      </div>

      <div className="p-3">
        <button
          onClick={() => onSelectChat({ id: 'global', type: 'group', name: '聊天大厅' })}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            activeChatId === 'global'
              ? 'bg-blue-50 text-blue-600'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
              #
            </div>
            <div>
              <p className="font-medium">聊天大厅</p>
              <p className="text-xs text-gray-500">群聊</p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">
            在线用户 ({onlineUsers.length})
          </h3>
        </div>
        <div className="space-y-1 px-2">
          {onlineUsers
            .filter((u) => u._id !== user?._id)
            .map((u) => (
              <button
                key={u._id}
                onClick={() => handlePrivateChat(u)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    username={u.username}
                    avatar={u.avatar}
                    avatarBgColor={u.avatarBgColor}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm text-gray-700">{u.username}</p>
                    <p className="text-xs text-green-500">在线</p>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
