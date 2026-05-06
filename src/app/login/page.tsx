import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#f8fafc] px-4 py-12">
      <LoginForm />
    </div>
  );
}
