// lib/types.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string|null; // Optional, only for managers
}

export interface Intern {
  id: number;
  name: string;
  email: string;
  college: string;
  department: string;
  phone_number: string;
  start_date: string;
}