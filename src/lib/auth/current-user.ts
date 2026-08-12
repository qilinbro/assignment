import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";

/** 获取当前登录用户（从 session cookie），未登录返回 null */
export async function getCurrentUser() {
  const id = await getSessionUserId();
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}
