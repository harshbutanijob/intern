// lib/types.ts
export interface User {
  id: number;                   // Primary key
  name: string;                 // User's full name
  email: string;                // Unique email
  password: string;             // Hashed password
  role: string;                 // "admin", "manager", etc.
  department_id?: number | null | undefined; // Optional department association
  created_at?: string | null ;   // ISO timestamp, optional
}
