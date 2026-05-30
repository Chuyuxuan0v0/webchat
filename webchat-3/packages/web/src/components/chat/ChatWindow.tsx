import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatWindow() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
}
