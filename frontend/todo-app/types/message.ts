export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  title?: string;
  description?: string;
  created_at: string;
}
