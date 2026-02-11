'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { Message } from '@/types/message';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import AuthGuard from '@/components/auth/auth-guard';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

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

  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: '1',
      user_id: user.id,
      role: 'user',
      content: newMessage,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await apiClient.sendChatMessage(user.id, newMessage);

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        conversation_id: response.conversation_id,
        user_id: user.id,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: '1',
        user_id: user.id,
        role: 'assistant',
        content:
          'Sorry, I encountered an error processing your request. Please try again.',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setNewMessage('');
    }
  };

  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setMessages([]);
      if (user) {
        localStorage.removeItem(`chat_history_${user.id}`);
      }
    }
  };

  return (
    <AuthGuard requireAuth={true} redirectTo="/sign-in">
      <div className="flex flex-col h-full max-w-5xl mx-auto px-4 md:px-8 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              AI Assistant
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base mt-2 max-w-lg">
              Chat with your intelligent task assistant to get help and guidance
            </p>
          </div>

          <button
            onClick={clearChatHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col flex-1 bg-white dark:bg-slate-900/80 rounded-2xl border border-gray-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden"
        >
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-base">
                    No messages yet. Start a conversation!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-sm md:max-w-md rounded-2xl px-5 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none shadow-md'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl px-5 py-3 rounded-bl-none border border-gray-200 dark:border-slate-700">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Responsive Input Area */}
          <div className="border-t border-gray-200 dark:border-slate-800 p-4 sm:p-6 bg-gray-50 dark:bg-slate-950/50">
            <form
              onSubmit={sendMessage}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                placeholder="Type your message..."
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isLoading
                    ? 'bg-indigo-400 dark:bg-indigo-600 text-white cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AuthGuard>
  );
};

export default ChatPage;
