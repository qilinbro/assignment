import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const id = await getSessionUserId();
  if (!id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { newPassword } = await req.json();
  if (!newPassword || String(newPassword).length < 6) {
    return NextResponse.json({ error: "新密码至少 6 位" }, { status: 400 });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id },
    data: { password: hash, mustChangePassword: false },
  });
  return NextResponse.json({ ok: true });
}
