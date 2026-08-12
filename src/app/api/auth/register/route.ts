import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();
  if (!name || !password) {
    return NextResponse.json({ error: "请填写账号和密码" }, { status: 400 });
  }
  const trimmed = String(name).trim();
  const existing = await prisma.user.findUnique({ where: { name: trimmed } });
  if (existing) {
    return NextResponse.json({ error: "该账号已存在" }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: trimmed,
      email: email || null,
      password: hash,
      role: role === "TA" ? "TA" : "STUDENT",
      mustChangePassword: false, // 自助注册者已自设密码
    },
  });
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
