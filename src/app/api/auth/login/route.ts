import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const { name, password } = await req.json();
  if (!name || !password) {
    return NextResponse.json({ error: "请输入账号和密码" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { name: String(name).trim() } });
  if (!user) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }
  await setSession(user.id);
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  });
}
