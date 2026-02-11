import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react'; // Import an icon for completed tasks
import { BackendTask } from '@/types/task';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tasks?: BackendTask[]; // Optional list of tasks for assistant messages
}

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleSendClick = () => {
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex-grow p-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p>{msg.content}</p> {/* Display the main message content */}
              {msg.tasks && msg.tasks.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                  <p className="font-semibold mb-1">Tasks:</p>
                  <ul className="list-disc list-inside text-sm">
                    {msg.tasks.map((task) => (
                      <li key={task.id} className="flex items-center">
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                        ) : (
                          <span className="w-4 h-4 mr-1 inline-block" /> // Placeholder for alignment
                        )}
                        {task.title} {task.completed && '(Completed)'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-2">
            <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800 animate-pulse">
              AI is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex p-4 border-t border-gray-200">
        <input
          type="text"
          className="flex-grow border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button
          className={`ml-2 px-4 py-2 rounded-lg text-white ${
            isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          onClick={handleSendClick}
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
