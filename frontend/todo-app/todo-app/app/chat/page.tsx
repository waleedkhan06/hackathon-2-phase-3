'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { Message } from '@/types/message';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    if (user) {
      const storedMessages = localStorage.getItem(`chat_history_${user.id}`);
      if (storedMessages) {
        try {
          setMessages(JSON.parse(storedMessages));
        } catch (error) {
          console.error('Error parsing stored chat history:', error);
          setMessages([]);
        }
      }
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsLoading(true);

    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: '1', // This should be managed dynamically
      user_id: user.id,
      role: 'user',
      content: newMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Use the API client to send the message to the backend
      const response = await apiClient.sendChatMessage(user.id, newMessage);

      // Add assistant message to the chat
      const assistantMessage: Message = {
        id: response.conversation_id, // Using conversation_id as message id temporarily
        conversation_id: response.conversation_id,
        user_id: user.id,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add an error message to the chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: '1',
        user_id: user.id,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setNewMessage('');
    }
  };

  // Function to clear chat history
  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setMessages([]);
      if (user) {
        localStorage.removeItem(`chat_history_${user.id}`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header with clear chat button */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold">AI Assistant</h1>
        <button
          onClick={clearChatHistory}
          className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                } mb-4`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.title && <p className="font-bold mt-1">{msg.title}</p>}
                  {msg.description && <p className="mt-1">{msg.description}</p>}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-6 py-3 rounded-r-lg text-white ${
              isLoading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
