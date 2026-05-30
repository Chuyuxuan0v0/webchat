import { Message, User } from '@webchat/shared';
import Avatar from '../Avatar';
import { useAuthStore } from '../../stores/authStore';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const sender = message.sender as User;
  const isOwn = sender._id === user?._id;

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar
        username={sender.username}
        avatar={sender.avatar}
        avatarBgColor={sender.avatarBgColor}
        size="sm"
      />
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <p className={`text-xs text-gray-500 mb-1 ${isOwn ? 'text-right' : ''}`}>
          {sender.username}
        </p>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-blue-600 text-white rounded-tr-md'
              : 'bg-gray-100 text-gray-800 rounded-tl-md'
          }`}
        >
          {message.type === 'text' && <p className="break-words">{message.content}</p>}
          {message.type === 'image' && (
            <img
              src={message.fileUrl}
              alt="shared"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
            />
          )}
          {message.type === 'file' && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-100 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {message.fileName || '文件'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
