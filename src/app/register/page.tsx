import { redirect } from "next/navigation";

/**
 * 注册入口已关闭。保留该路由用于兼容旧链接，并统一引导到登录页。
 * 注册 API 仍保留，方便后续恢复或由管理员工具调用。
 */
export default function RegisterRedirect() {
  redirect("/login");
}
