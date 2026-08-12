import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash("aloyispretty", 10);
  await prisma.user.upsert({
    where: { name: "aloy" },
    update: { password: adminPass, email: "admin@example.com", role: "ADMIN", mustChangePassword: false },
    create: {
      name: "aloy",
      email: "admin@example.com",
      password: adminPass,
      role: "ADMIN",
      mustChangePassword: false,
    },
  });

  const defaultPass = await bcrypt.hash("123456", 10);

  // 助教 T01–T50
  const tas = [];
  for (let i = 1; i <= 50; i++) {
    const n = String(i).padStart(2, "0");
    tas.push({
      name: `T${n}`,
      email: `t${n}@example.com`,
      password: defaultPass,
      role: "TA",
      mustChangePassword: true,
    });
  }

  // 学生 S001–S500
  const students = [];
  for (let i = 1; i <= 500; i++) {
    const n = String(i).padStart(3, "0");
    students.push({
      name: `S${n}`,
      email: `s${n}@example.com`,
      password: defaultPass,
      role: "STUDENT",
      mustChangePassword: true,
    });
  }

  // skipDuplicates：已存在的账号（同 name）跳过，不覆盖真实用户改过的密码
  await prisma.user.createMany({ data: tas, skipDuplicates: true });
  await prisma.user.createMany({ data: students, skipDuplicates: true });

  const counts = await prisma.user.groupBy({
    by: ["role"],
    _count: { _all: true },
  });
  console.log("✅ Seed 完成。用户统计：");
  counts.forEach((c) => console.log(`   ${c.role}: ${c._count._all}`));
  console.log(`   合计: ${await prisma.user.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
