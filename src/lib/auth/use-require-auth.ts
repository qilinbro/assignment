"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * 客户端路由守卫：
 *  - 未登录 → 跳 /login
 *  - 已登录但需首次改密（且不在改密页）→ 跳 /change-password
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.mustChangePassword && pathname !== "/change-password") {
      router.replace("/change-password");
    }
  }, [loading, user, router, pathname]);

  return { user, loading };
}
