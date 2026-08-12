export type UserRole = "ADMIN" | "TA" | "STUDENT";

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  createdAt: Date;
}

export interface CreateUserData {
  name: string;
  email?: string;
  role: UserRole;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
}
