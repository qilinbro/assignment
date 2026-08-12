import { userRepository } from "@/repositories";
import type { User, UserRole } from "@/types";

/**
 * Authentication Service
 *
 * Mock authentication service that can be replaced with a real provider
 * Supports NextAuth.js, Clerk, Auth0, etc.
 */

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthUser | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  isAuthenticated(): boolean;
  hasRole(role: UserRole): boolean;
  hasAnyRole(roles: UserRole[]): boolean;
}

class MockAuthService implements AuthService {
  private currentUser: AuthUser | null = null;

  // Mock users for demo purposes
  private mockUsers: AuthUser[] = [
    {
      id: "admin-1",
      name: "管理员",
      email: "admin@example.com",
      role: "ADMIN",
    },
    {
      id: "ta-1",
      name: "助教01",
      email: "ta01@example.com",
      role: "TA",
    },
    {
      id: "ta-2",
      name: "助教02",
      email: "ta02@example.com",
      role: "TA",
    },
    {
      id: "student-1",
      name: "学生A",
      email: "student.a@example.com",
      role: "STUDENT",
    },
    {
      id: "student-2",
      name: "学生B",
      email: "student.b@example.com",
      role: "STUDENT",
    },
  ];

  async login(credentials: LoginCredentials): Promise<AuthUser | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find user by email
    const user = this.mockUsers.find((u) => u.email === credentials.email);

    // In a real app, we would verify the password hash
    // For demo purposes, any password works
    if (user) {
      this.currentUser = user;
      return user;
    }

    return null;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // In a real app, this would check the session/token
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.currentUser !== null && roles.includes(this.currentUser.role);
  }

  // Demo method to simulate logging in as different users
  async loginAs(userId: string): Promise<AuthUser | null> {
    const user = this.mockUsers.find((u) => u.id === userId);
    if (user) {
      this.currentUser = user;
      return user;
    }
    return null;
  }

  // Get all available demo users
  getDemoUsers(): AuthUser[] {
    return this.mockUsers;
  }
}

// Singleton instance
export const authService = new MockAuthService();

/**
 * Authorization check helper functions
 */

export function canAccessAdminPage(user: AuthUser | null): boolean {
  return user?.role === "ADMIN";
}

export function canAccessTAPage(user: AuthUser | null): boolean {
  return user?.role === "TA" || user?.role === "ADMIN";
}

export function canAccessStudentPage(user: AuthUser | null): boolean {
  return user?.role === "STUDENT" || user?.role === "ADMIN";
}

export function canGradeSubmission(user: AuthUser | null, submissionAssignmentId: string): boolean {
  // In a real app, this would check if the user is the assigned TA
  return user?.role === "TA" || user?.role === "ADMIN";
}

export function canViewSubmission(user: AuthUser | null, studentId: string): boolean {
  // Students can only view their own submissions
  if (user?.role === "STUDENT") {
    return user.id === studentId;
  }
  // Admins and TAs can view any submission
  return user?.role === "ADMIN" || user?.role === "TA";
}

export function canDeleteSubmission(user: AuthUser | null, submissionStatus: string): boolean {
  // Only admins can delete submissions, and only if grading hasn't started
  if (user?.role !== "ADMIN") {
    return false;
  }
  return submissionStatus === "PENDING";
}
