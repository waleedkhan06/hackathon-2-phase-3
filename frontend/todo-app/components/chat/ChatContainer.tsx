import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import ChatWindow from './ChatWindow'; // Assuming ChatWindow.tsx is in the same directory

interface ChatContainerProps {
  // Any props passed to the container, e'g', for styling or layout
}

const ChatContainer: React.FC<ChatContainerProps> = () => {
  const { user, isAuthenticated } = useAuth();
  const { messages, sendMessage, isLoading, error, conversationId } = useChat();

  // Optionally, load previous messages if conversationId exists on component mount
  // This logic is currently handled implicitly by the backend on first message if thread_id is passed,
  // or explicitly in useChat for initial conversationId load from localStorage.
  // For a full history load, an API call to get_messages_for_conversation would be needed here.

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Please sign in to use the chat.
      </div>
    );
  }

  // Debugging logs
  useEffect(() => {
    console.log("ChatContainer - current user:", user?.id);
    console.log("ChatContainer - conversationId:", conversationId);
    console.log("ChatContainer - messages:", messages);
    console.log("ChatContainer - isLoading:", isLoading);
    console.log("ChatContainer - error:", error);
  }, [user, conversationId, messages, isLoading, error]);


  return (
    <div className="h-full w-full max-w-lg mx-auto p-4">
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      <ChatWindow messages={messages} onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatContainer;
