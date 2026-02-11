import { API_BASE_URL } from '../config/constants';
import { User as AuthUser } from '@/types/api-types'; // Rename to avoid conflict with local User interface
import { Message } from '@/types/message';
import { BackendTask } from '@/types/task';

// Interface for the chat API response
interface ChatResponse {
  conversation_id: string;
  response: string;
  action_taken?: string;
  tasks?: BackendTask[]; // Array of BackendTask if returned
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not defined. Please set NEXT_PUBLIC_API_BASE_URL in your environment variables.');
    }
    this.baseUrl = API_BASE_URL;
  }

  setToken(token: string) {
    this.token = token;
    // Store token in localStorage for persistence
    localStorage.setItem('auth_token', token);
    // Also store in 'token' for compatibility with useAuth hook
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      // Try to get token from localStorage
      // Check both 'auth_token' and 'token' for compatibility
      this.token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token'); // Also remove the 'token' key for consistency
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(this.getToken() ? { Authorization: `Bearer ${this.getToken()}` } : {}),
      ...options.headers,
    };

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;

        // Provide more user-friendly error messages
        if (errorMessage.toLowerCase().includes("already exists")) {
          throw new Error("A user with this email already exists. Please try logging in or use a different email.");
        } else if (errorMessage.toLowerCase().includes("incorrect email") || errorMessage.toLowerCase().includes("incorrect password")) {
          throw new Error("Incorrect email or password. Please try again.");
        } else if (response.status === 401) {
          throw new Error("Authentication failed. Please check your credentials.");
        } else if (response.status === 403) {
          throw new Error("Access forbidden. Please try again or contact support.");
        } else if (response.status === 500) {
          throw new Error("Something went wrong on our end. Please try again later.");
        } else {
          throw new Error(errorMessage);
        }
      }

      if (response.status === 204) {
        // No content response
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication methods - Using our new backend API
  async signIn(email: string, password: string) {
    // Our backend now requires both email and password for authentication
    // This method will throw errors that are caught and handled by the useAuth hook
    const response = await this.request<{
      access_token: string;
      token_type: string;
      user_id: string;
      email: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Extract token from response
    const token = response.access_token;

    // Return user data from response
    return {
      success: true,
      token: token,
      user: {
        id: response.user_id,
        email: response.email,
        name: null, // Backend doesn't return name on login
        created_at: new Date().toISOString(), // Will be updated when fetching profile
        theme_preference: 'system' // Default theme
      }
    };
  }

  async signUp(email: string, password: string, name?: string) {
    // Register a new user with email, password, and optional name
    // This method will throw errors that are caught and handled by the useAuth hook
    const response = await this.request<{
      access_token: string;
      token_type: string;
      user_id: string;
      email: string;
      name?: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    // Extract token from response
    const token = response.access_token;

    // Return user data from response
    return {
      success: true,
      token: token,
      user: {
        id: response.user_id,
        email: response.email,
        name: response.name || null, // Use name from response if available
        created_at: new Date().toISOString(), // Will be updated when fetching profile
        theme_preference: 'system' // Default theme
      }
    };
  }

  // Chat methods
  async sendChatMessage(userId: string, message: string, threadId: string | null = null) {
    const payload = {
      message: message,
      ...(threadId && { thread_id: threadId }),
    };
    return this.request<{
      conversation_id: string;
      response: string;
      action_taken?: string;
      tasks?: any[]; // BackendTask[] | undefined
    }>(`/api/${userId}/chat`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getConversationMessages(userId: string, conversationId: string): Promise<Message[]> {
    return this.request<Message[]>(`/api/${userId}/conversations/${conversationId}/messages`);
  }

  // Task methods - Updated to match our new backend API

  // Task methods - Updated to match our new backend API
  async getTasks(userId: string) {
    return this.request<Array<{
      id: number; // Backend returns integer IDs
      user_id: string;
      title: string;
      description?: string;
      completed: boolean;
      created_at: string;
      updated_at: string;
    }>>(`/api/${userId}/tasks`);
  }

  async createTask(userId: string, taskData: { title: string; description?: string; completed?: boolean }) {
    // Ensure we only send defined values to prevent backend issues
    const createPayload: { title: string; description?: string; completed?: boolean } = {
      title: taskData.title,
    };

    if (taskData.description !== undefined) createPayload.description = taskData.description;
    if (taskData.completed !== undefined) createPayload.completed = taskData.completed;

    return this.request<{
      id: number; // Backend returns integer IDs
      user_id: string;
      title: string;
      description?: string;
      completed: boolean;
      created_at: string;
      updated_at: string;
    }>(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(createPayload),
    });
  }

  async updateTask(userId: string, taskId: number, taskData: Partial<{ title: string; description?: string; completed?: boolean }>) {
    // Only include fields that are defined to avoid sending null/undefined values to backend
    const updatePayload: Partial<{ title: string; description?: string; completed?: boolean }> = {};

    if (taskData.title !== undefined) updatePayload.title = taskData.title;
    if (taskData.description !== undefined) updatePayload.description = taskData.description;
    if (taskData.completed !== undefined) updatePayload.completed = taskData.completed;

    return this.request<{
      id: number; // Backend returns integer IDs
      user_id: string;
      title: string;
      description?: string;
      completed: boolean;
      created_at: string;
      updated_at: string;
    }>(`/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    });
  }

  async toggleTaskCompletion(userId: string, taskId: number) {
    return this.request<{
      id: number; // Backend returns integer IDs
      user_id: string;
      title: string;
      description?: string;
      completed: boolean;
      created_at: string;
      updated_at: string;
    }>(`/api/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
    });
  }

  async deleteTask(userId: string, taskId: number) {
    return this.request<Record<string, never>>(`/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // User profile methods
  async getUserProfile() {
    try {
      const userData = await this.request<{
        id: string;
        email: string;
        name?: string;
        created_at: string;
        updated_at?: string;
        theme_preference?: string;
      }>('/auth/me');
      // Ensure the returned user data matches our User interface
      const user = {
        id: userData.id,
        email: userData.email,
        name: userData.name || null,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        theme_preference: userData.theme_preference || 'system'
      };
      return {
        success: true,
        data: { user }
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user profile'
      };
    }
  }

  async updateUserProfile(userData: Partial<AuthUser>) {
    try {
      // Check if there are any fields that require backend update
      const hasBackendFields = Object.keys(userData).some(key => key !== 'theme_preference');

      if (hasBackendFields) {
        // Call the update user profile endpoint for fields that need backend processing
        const response = await this.request<{
          id: string;
          email: string;
          name?: string;
          created_at: string;
          updated_at?: string;
          theme_preference?: string;
        }>('/auth/update', {
          method: 'PATCH',
          body: JSON.stringify(userData),
        });

        // Assuming the response contains updated user data
        return {
          success: true,
          data: { user: response }
        };
      } else {
        // Only theme preference is being updated, handle it locally
        return {
          success: true,
          data: { user: { theme_preference: userData.theme_preference } }
        };
      }
    } catch (error) {
      console.error('Update user profile error:', error);
      // Handle the case where backend endpoint doesn't exist
      if (error instanceof Error && error.message.includes('404')) {
        // If it's a 404 error, we can still handle theme preference changes locally
        if (userData.theme_preference) {
          return {
            success: true,
            data: { user: { theme_preference: userData.theme_preference } }
          };
        }
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user profile'
      };
    }
  }
}

export const apiClient = new ApiClient();

export default ApiClient;