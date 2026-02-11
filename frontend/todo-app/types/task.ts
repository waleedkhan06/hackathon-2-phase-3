// Define the task-related types here to avoid import errors

export interface BackendTask {
  id: number;
  user_id: string;
  title: string;
  description?: string | null;
  due_date?: string; // New field for due dates
  status: 'pending' | 'completed'; // Assuming string status
  completed: boolean;
  created_at: string;
  updated_at: string;
}