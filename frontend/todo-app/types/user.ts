export interface User {
  id: string;
  email: string;
  name?: string | null;
  created_at?: string;
  updated_at?: string;
  theme_preference?: string;
}
