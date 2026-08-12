import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";

// 管理员：获取全部用户
export async function GET() {
  const id = await getSessionUserId();
  if (!id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { id } });
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      mustChangePassword: u.mustChangePassword,
      createdAt: u.createdAt.toISOString(),
    })),
  });
}
