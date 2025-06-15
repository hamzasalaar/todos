"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Email and password are required.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    toast({
      title: "Login successful",
      description: "You have successfully logged in.",
    });
    setLoading(false);

    if (data?.session) {
      console.log("Session exists, redirecting...");

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 300);
    } else {
      toast({
        title: "Login failed",
        description: "Please check your email and password and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <Button
          onClick={handleLogin}
          className="w-full mt-4"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </div>
      <p className="text-center text-sm mt-4">
        Haven&apos;t Registered?{" "}
        <a href="/auth/signup" className="text-blue-600 underline">
          Register
        </a>
      </p>
    </div>
  );
}
