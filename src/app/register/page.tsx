"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/**
 * 注册页已隐藏：不再开放自助注册。
 * 直接访问 /register 会重定向到登录页。
 * 如需恢复自助注册，可从 git 历史还原本文件的原注册表单实现。
 */
export default function RegisterPage() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace("/login");
  }, [router]);

  return null;
}
