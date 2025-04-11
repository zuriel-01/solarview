import { LoginForm } from "@/components/auth/LoginForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  
  // Redirect to data page if already authenticated
  if (session?.user) {
    redirect("/data");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Solar Panel Monitoring
          </h1>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and the password provided by your solar panel company
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}