import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Admin Login", robots: { index: false } };

export default function AdminLoginPage() {
  return <LoginForm />;
}
