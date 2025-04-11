import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Solar Panel Monitoring
          </h1>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
            Recover your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ll send a one-time password to your email
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}