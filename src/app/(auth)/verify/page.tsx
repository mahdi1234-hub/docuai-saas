import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 w-fit mb-4">
            <Mail className="h-8 w-8 text-zinc-600 dark:text-zinc-300" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            A sign-in link has been sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to sign in to your DocuAI account.
            The link will expire in 24 hours.
          </p>
          <div className="flex gap-2 justify-center">
            <Badge variant="outline">Check spam folder</Badge>
            <Badge variant="outline">Link expires in 24h</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
