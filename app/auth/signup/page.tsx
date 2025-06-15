"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async () => {
    setLoading(true);

    if (!email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Email, password, and confirm password are required.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: existingUsernames, error: usernameCheckError } =
      await supabase.from("profiles").select("id").eq("username", username);

    if (usernameCheckError) {
      toast({
        title: "Error checking username",
        description: usernameCheckError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (existingUsernames && existingUsernames.length > 0) {
      toast({
        title: "Username taken",
        description: "Please choose another.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      toast({
        title: "Signup failed",
        description: signUpError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (data?.user?.id) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user.id, username }]);

      if (profileError) {
        toast({
          title: "Profile creation failed",
          description: profileError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    toast({
      title: "Signup successful",
      description: "Your account has been created!",
    });

    setLoading(false);
    router.push("/auth/login");
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
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
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
        <Button
          onClick={handleSignup}
          className="w-full mt-4"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>
      </div>

      <p className="text-center text-sm mt-4">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 underline">
          Login
        </a>
      </p>
    </div>
  );
}
