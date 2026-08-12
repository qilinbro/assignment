import type { UserRole } from "@/types";

/**
 * 基于 localStorage 的纯前端认证持久化层（demo 用，无后端）
 *
 * 存储：
 *  - assignment_users   用户列表（含密码，明文，仅 demo）
 *  - assignment_session 当前登录用户 id
 */

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string; // ISO 时间
}

/** 对外暴露的登录用户（不含密码） */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const USERS_KEY = "assignment_users";
const SESSION_KEY = "assignment_session";

// 预置管理员账号（不开放注册）
const SEED_USERS: StoredUser[] = [
  {
    id: "admin",
    name: "aloy",
    email: "admin@example.com",
    password: "aloyispretty",
    role: "ADMIN",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

const isBrowser = () => typeof window !== "undefined";

function toAuthUser(u: StoredUser): AuthUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt };
}

/** 读取全部用户（首次加载种入预置账号；每次强制同步预置账号为最新值） */
function readUsers(): StoredUser[] {
  if (!isBrowser()) return SEED_USERS;
  let users: StoredUser[];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    users = raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    users = [];
  }
  // 强制同步预置账号（确保 name/password 为最新，兼容旧 localStorage）
  let changed = false;
  for (const seed of SEED_USERS) {
    const idx = users.findIndex((u) => u.id === seed.id);
    if (idx === -1) {
      users.push(seed);
      changed = true;
    } else if (
      users[idx].name !== seed.name ||
      users[idx].password !== seed.password ||
      users[idx].role !== seed.role
    ) {
      users[idx] = {
        ...users[idx],
        name: seed.name,
        email: seed.email,
        password: seed.password,
        role: seed.role,
      };
      changed = true;
    }
  }
  if (changed) writeUsers(users);
  return users;
}

function writeUsers(users: StoredUser[]) {
  if (!isBrowser()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterResult {
  ok: boolean;
  error?: string;
  user?: AuthUser;
}

/** 注册新用户（校验姓名唯一） */
export function registerUser(input: RegisterInput): RegisterResult {
  const users = readUsers();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "请填写姓名" };
  if (users.some((u) => u.name === name)) {
    return { ok: false, error: "该姓名已被注册，请更换或直接登录" };
  }
  const user: StoredUser = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email: input.email.trim(),
    password: input.password,
    role: input.role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return { ok: true, user: toAuthUser(user) };
}

/** 登录校验（姓名 + 密码） */
export function loginUser(name: string, password: string): AuthUser | null {
  const users = readUsers();
  const found = users.find((u) => u.name === name.trim());
  if (!found) return null;
  if (found.password !== password) return null;
  setSession(found.id);
  return toAuthUser(found);
}

/** 按 id 直接建立会话（注册后自动登录用） */
export function setSession(userId: string) {
  if (!isBrowser()) return;
  localStorage.setItem(SESSION_KEY, userId);
}

/** 读取当前登录用户 */
export function getCurrentUser(): AuthUser | null {
  if (!isBrowser()) return null;
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const users = readUsers();
  const found = users.find((u) => u.id === id);
  return found ? toAuthUser(found) : null;
}

/** 退出登录 */
export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(SESSION_KEY);
}

/** 读取全部用户（不含密码），供管理员查看 */
export function getAllUsers(): AuthUser[] {
  return readUsers().map(toAuthUser);
}

/** 按 role 返回默认跳转路径 */
export function roleHomePath(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TA":
      return "/ta";
    case "STUDENT":
      return "/student";
    default:
      return "/";
  }
}
