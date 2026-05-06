import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#f8fafc] px-4 py-12">
      <RegisterForm />
    </div>
  );
}
