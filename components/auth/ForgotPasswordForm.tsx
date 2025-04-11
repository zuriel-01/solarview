"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // In a real app, you would call an API endpoint to send a reset email
      // For now, we'll just simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
        console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            We&apos;ve sent a recovery email to {email}. Please check your inbox.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4 rounded-md shadow-sm">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Button
          type="submit"
          disabled={isLoading || success}
          className="w-full bg-yellow-300 hover:bg-yellow-400 text-black"
        >
          {isLoading ? "Sending..." : "Send recovery email"}
        </Button>
        
        <div className="text-center text-sm">
          <a 
            href="/auth/login" 
            className="font-medium text-yellow-300 hover:text-yellow-400"
          >
            Back to login
          </a>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          <p>
            If you can&apos;t access your email, please contact your solar panel provider for assistance.
          </p>
        </div>
      </div>
    </form>
  );
}