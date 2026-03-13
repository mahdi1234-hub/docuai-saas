"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, BarChart3, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await signIn("email", { email, callbackUrl: "/dashboard" });
      toast.success("Check your email for the sign-in link!");
    } catch {
      toast.error("Failed to send sign-in link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 text-white flex-col justify-between p-12">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            DocuAI
          </h1>
          <p className="text-zinc-400 mt-2">AI-Powered Document Intelligence</p>
        </div>
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-zinc-800">
              <Sparkles className="h-6 w-6 text-zinc-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Smart PDF Analysis</h3>
              <p className="text-zinc-400 text-sm">Upload and analyze documents with AI-powered insights</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-zinc-800">
              <MessageSquare className="h-6 w-6 text-zinc-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Chat with Documents</h3>
              <p className="text-zinc-400 text-sm">Ask questions and get instant answers from your PDFs</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-zinc-800">
              <BarChart3 className="h-6 w-6 text-zinc-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Analytics Dashboard</h3>
              <p className="text-zinc-400 text-sm">Track document usage and insights over time</p>
            </div>
          </div>
        </div>
        <p className="text-zinc-600 text-sm">&copy; 2024 DocuAI. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
              <FileText className="h-8 w-8" />
              <span className="text-2xl font-bold">DocuAI</span>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account with email OTP</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending link..." : "Sign in with Email"}
              </Button>
            </form>
            <Separator className="my-6" />
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                No account? Enter your email and we will create one for you.
              </p>
              <div className="flex gap-2 justify-center">
                <Badge variant="secondary">Secure</Badge>
                <Badge variant="secondary">Passwordless</Badge>
                <Badge variant="secondary">Free</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
