"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  MessageSquare,
  Upload,
  BarChart3,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  pageCount: number;
  _count: { chunks: number; messages: number };
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  _count: { messages: number };
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/documents").then((r) => r.json()),
      fetch("/api/conversations").then((r) => r.json()),
    ]).then(([docs, convos]) => {
      setDocuments(Array.isArray(docs) ? docs : []);
      setConversations(Array.isArray(convos) ? convos : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalChunks = documents.reduce((acc, d) => acc + (d._count?.chunks || 0), 0);
  const totalMessages = conversations.reduce((acc, c) => acc + (c._count?.messages || 0), 0);
  const readyDocs = documents.filter((d) => d.status === "ready").length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to DocuAI - Your AI Document Intelligence Platform</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/chat"><MessageSquare className="mr-2 h-4 w-4" />New Chat</Link>
          </Button>
          <Button asChild>
            <Link href="/documents"><Upload className="mr-2 h-4 w-4" />Upload PDF</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">{readyDocs} ready for querying</p>
            <Progress value={documents.length > 0 ? (readyDocs / documents.length) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-xs text-muted-foreground">{totalMessages} total messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Document Chunks</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChunks}</div>
            <p className="text-xs text-muted-foreground">Embedded in vector store</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter((d) => d.status === "processing").length}</div>
            <p className="text-xs text-muted-foreground">Documents in pipeline</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Recent Documents</TabsTrigger>
          <TabsTrigger value="conversations">Recent Conversations</TabsTrigger>
        </TabsList>
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Your recently uploaded PDF documents</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
                  <p className="text-muted-foreground">Upload your first PDF to get started</p>
                  <Button asChild className="mt-4">
                    <Link href="/documents"><Plus className="mr-2 h-4 w-4" />Upload Document</Link>
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pages</TableHead>
                        <TableHead>Chunks</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.slice(0, 10).map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.name}</TableCell>
                          <TableCell>
                            <Badge variant={doc.status === "ready" ? "default" : doc.status === "error" ? "destructive" : "secondary"}>
                              {doc.status === "ready" && <CheckCircle className="mr-1 h-3 w-3" />}
                              {doc.status === "processing" && <Clock className="mr-1 h-3 w-3" />}
                              {doc.status === "error" && <AlertCircle className="mr-1 h-3 w-3" />}
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{doc.pageCount}</TableCell>
                          <TableCell>{doc._count?.chunks || 0}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="conversations">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Your recent AI chat conversations</CardDescription>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No conversations yet</h3>
                  <p className="text-muted-foreground">Start chatting with your documents</p>
                  <Button asChild className="mt-4">
                    <Link href="/chat"><Plus className="mr-2 h-4 w-4" />New Chat</Link>
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {conversations.slice(0, 10).map((convo) => (
                      <Link key={convo.id} href={`/chat?id=${convo.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <div>
                            <p className="font-medium text-sm">{convo.title}</p>
                            <p className="text-xs text-muted-foreground">{convo._count?.messages || 0} messages</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(convo.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/documents">
            <CardHeader>
              <Upload className="h-8 w-8 text-zinc-600" />
              <CardTitle className="text-lg">Upload & Process</CardTitle>
              <CardDescription>Upload PDFs to analyze with AI</CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/chat">
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-zinc-600" />
              <CardTitle className="text-lg">Chat with Docs</CardTitle>
              <CardDescription>Ask questions about your documents</CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/analytics">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-zinc-600" />
              <CardTitle className="text-lg">View Analytics</CardTitle>
              <CardDescription>Track usage and document insights</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}
