import { User, CreateUserData, UpdateUserData, UserRole } from "@/types";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByRole(role: UserRole): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  constructor() {
    // Initialize with some mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockUsers: User[] = [
      {
        id: "admin-1",
        name: "管理员",
        email: "admin@example.com",
        role: "ADMIN",
        createdAt: new Date("2024-01-01"),
      },
      // TAs
      {
        id: "ta-1",
        name: "助教01",
        email: "ta01@example.com",
        role: "TA",
        createdAt: new Date("2024-01-01"),
      },
      {
        id: "ta-2",
        name: "助教02",
        email: "ta02@example.com",
        role: "TA",
        createdAt: new Date("2024-01-01"),
      },
      {
        id: "ta-3",
        name: "助教03",
        email: "ta03@example.com",
        role: "TA",
        createdAt: new Date("2024-01-01"),
      },
      {
        id: "ta-4",
        name: "助教04",
        email: "ta04@example.com",
        role: "TA",
        createdAt: new Date("2024-01-01"),
      },
      {
        id: "ta-5",
        name: "助教05",
        email: "ta05@example.com",
        role: "TA",
        createdAt: new Date("2024-01-01"),
      },
      // Students
      {
        id: "student-1",
        name: "学生A",
        email: "student.a@example.com",
        role: "STUDENT",
        createdAt: new Date("2024-01-01"),
      },
      {
        id: "student-2",
        name: "学生B",
        email: "student.b@example.com",
        role: "STUDENT",
        createdAt: new Date("2024-01-01"),
      },
      {
        id: "student-3",
        name: "学生C",
        email: "student.c@example.com",
        role: "STUDENT",
        createdAt: new Date("2024-01-01"),
      },
    ];

    mockUsers.forEach((user) => this.users.set(user.id, user));
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return Array.from(this.users.values()).filter((user) => user.role === role);
  }

  async create(data: CreateUserData): Promise<User> {
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    const updatedUser: User = {
      ...user,
      ...data,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}

// Singleton instance
export const userRepository = new MockUserRepository();
