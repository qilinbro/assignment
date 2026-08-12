import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "assignment_session";
const secret = process.env.SESSION_SECRET || "dev-insecure-secret";

/** HMAC 签名 */
function sign(value: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

/** 建立 session：写入 httpOnly cookie（userId + 签名） */
export async function setSession(userId: string): Promise<void> {
  const value = `${userId}.${sign(userId)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 天
  });
}

/** 清除 session */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** 读取当前登录用户 id（验签），无效返回 null */
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig) return null;
  if (sign(id) !== sig) return null; // 签名不符
  return id;
}
