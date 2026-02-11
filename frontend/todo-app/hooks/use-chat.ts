import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth'; // Assuming useAuth provides current user and token
import { apiClient } from '../lib/api'; // Our API client
import { v4 as uuidv4 } from 'uuid'; // For generating message IDs

// BackendTask and ChatResponse interfaces from api.ts
interface BackendTask {
  id: number;
  user_id: string;
  title: string;
  description?: string | null;
  due_date?: string;
  status: 'pending' | 'completed';
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface ChatApiResponse {
  conversation_id: string;
  response: string;
  action_taken?: string;
  tasks?: BackendTask[];
}

// Message interface for both frontend and backend communication
interface Message {
  id: string; // From backend Message model
  role: 'user' | 'assistant';
  content: string;
  tasks?: BackendTask[]; // Optional list of tasks for assistant messages
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
}

export const useChat = () => {
  const { user } = useAuth(); // Get current user from auth hook
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    conversationId: null,
  });

  // Load conversation ID from localStorage on mount and fetch history
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user?.id) {
        const storedConversationId = localStorage.getItem(`conversationId_${user.id}`);
        setChatState((prevState) => ({
          ...prevState,
          conversationId: storedConversationId,
        }));

        if (storedConversationId) {
          try {
            setChatState((prevState) => ({ ...prevState, isLoading: true }));
            const historyMessages = await apiClient.getConversationMessages(user.id, storedConversationId);
            // Convert backend Message type to frontend Message type (if necessary, assuming direct compatibility here)
            setChatState((prevState) => ({
              ...prevState,
              messages: historyMessages.map(msg => ({ ...msg, id: msg.id || uuidv4() })), // Ensure ID for React key
              isLoading: false,
            }));
          } catch (error: any) {
            console.error('Failed to load chat history:', error);
            setChatState((prevState) => ({
              ...prevState,
              isLoading: false,
              error: error.message || 'Failed to load chat history',
            }));
          }
        }
      }
    };
    loadChatHistory();
  }, [user?.id]);

  // Function to send a message
  const sendMessage = useCallback(async (text: string) => {
    if (!user?.id || chatState.isLoading) return;

    const newUserMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
    };

    setChatState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, newUserMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response: ChatApiResponse = await apiClient.sendChatMessage(
        user.id,
        text,
        chatState.conversationId
      );

      // Update conversation ID if a new one is returned
      if (response.conversation_id && response.conversation_id !== chatState.conversationId) {
        localStorage.setItem(`conversationId_${user.id}`, response.conversation_id);
        setChatState((prevState) => ({
          ...prevState,
          conversationId: response.conversation_id,
        }));
      }

      const newAssistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.response,
        tasks: response.tasks, // Pass tasks to the message
      };

      setChatState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, newAssistantMessage],
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setChatState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: error.message || 'Failed to send message',
      }));
    }
  }, [user?.id, chatState.isLoading, chatState.conversationId, chatState.messages]);

  return {
    messages: chatState.messages,
    sendMessage,
    isLoading: chatState.isLoading,
    error: chatState.error,
    conversationId: chatState.conversationId,
  };
};