import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  MessageSquare,
  BarChart3,
  Upload,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-7 w-7" />
            <span className="text-xl font-bold">DocuAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="mr-1 h-3 w-3" /> AI-Powered Document Intelligence
        </Badge>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
          Chat with your
          <br />
          <span className="text-zinc-500">PDF documents</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Upload PDFs, analyze content with AI, and get instant answers. Powered by
          advanced LLM technology and vector search for accurate document understanding.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/login">
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">View Demo</Link>
          </Button>
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need for document AI</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete SaaS platform for uploading, processing, and intelligently querying your PDF documents.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Upload className="h-10 w-10 text-zinc-600 mb-2" />
              <CardTitle>Upload & Process</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload PDF documents that are automatically processed, chunked, and embedded
                for intelligent search and retrieval.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-zinc-600 mb-2" />
              <CardTitle>AI Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Chat with your documents using advanced AI. Get accurate answers with
                references to specific pages and sections.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-zinc-600 mb-2" />
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track document processing, chat usage, and embedding metrics with
                beautiful charts and detailed reports.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-zinc-600 mb-2" />
              <CardTitle>Vector Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pinecone-powered vector database ensures fast and accurate semantic
                search across all your document chunks.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-zinc-600 mb-2" />
              <CardTitle>Secure Auth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Passwordless email OTP authentication keeps your account secure.
                All data is encrypted and stored safely.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-zinc-600 mb-2" />
              <CardTitle>CDN Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                EdgeStore CDN ensures your documents are stored reliably and served
                quickly from locations worldwide.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Sign up for free and start chatting with your documents in minutes.
        </p>
        <Button size="lg" asChild>
          <Link href="/login">
            Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            DocuAI
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, shadcn/ui, Groq, Pinecone, and EdgeStore
          </p>
        </div>
      </footer>
    </div>
  );
}
