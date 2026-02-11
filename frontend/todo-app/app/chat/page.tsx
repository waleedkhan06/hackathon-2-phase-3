'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { Message } from '@/types/message';
import AuthGuard from '@/components/auth/auth-guard';
import { motion } from 'framer-motion';
import { Send, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const messagesContainerRef = useRef<null | HTMLDivElement>(null);

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
      conversation_id: '1',
      user_id: user.id,
      role: 'user',
      content: newMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');

    try {
      // Use the API client to send the message to the backend
      const response = await apiClient.sendChatMessage(user.id, newMessage);

      // Add assistant message to the chat
      const assistantMessage: Message = {
        id: response.conversation_id,
        conversation_id: response.conversation_id,
        user_id: user.id,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
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
    }
  };

  // Function to clear chat history
  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      setMessages([]);
      if (user) {
        localStorage.removeItem(`chat_history_${user.id}`);
      }
      toast({
        title: 'Chat cleared',
        description: 'Your chat history has been cleared.',
        variant: 'default',
      });
    }
  };

  return (
    <AuthGuard requireAuth={true} redirectTo="/sign-in">
      <div className="min-h-full flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-4 md:px-8 py-8 border-b border-gray-200/50 dark:border-slate-800/50"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                AI Assistant
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base max-w-2xl">
              Ask questions, get suggestions, and get help with your tasks
            </p>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 md:px-8 py-6"
          >
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-center items-center h-96"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                      Start a conversation
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                      Ask me anything about your tasks
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-md ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-slate-700'
                        }`}
                      >
                        <p className="text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        {msg.title && (
                          <p className="font-bold mt-2 text-sm md:text-base">{msg.title}</p>
                        )}
                        {msg.description && (
                          <p className="mt-2 text-sm opacity-90">{msg.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200 dark:border-slate-700 shadow-md">
                        <div className="flex space-x-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, delay: 0.4, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 md:px-8 py-6">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={sendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !newMessage.trim()}
                  className="px-4 md:px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-indigo-400 disabled:to-blue-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 disabled:shadow-md whitespace-nowrap"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </form>

              {/* Clear History Button */}
              {messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 flex justify-end"
                >
                  <button
                    onClick={clearChatHistory}
                    className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear History
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AuthGuard>
  );
};

export default ChatPage;
