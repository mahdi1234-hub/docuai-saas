"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useEdgeStore } from "@/lib/edgestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Send,
  Paperclip,
  FileText,
  Bot,
  User,
  Plus,
  Trash2,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  document?: { id: string; name: string } | null;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  _count: { messages: number };
}

interface DocItem {
  id: string;
  name: string;
  status: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { edgestore } = useEdgeStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(
    searchParams.get("id")
  );
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    }
    setLoadingConvos(false);
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      /* ignore */
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(
        Array.isArray(data)
          ? data.filter((d: DocItem) => d.status === "ready")
          : []
      );
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadDocuments();
  }, [loadConversations, loadDocuments]);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    }
  }, [currentConversation, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        role: "user",
        content: userMessage,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId: currentConversation,
          documentId: selectedDocument || undefined,
        }),
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (!currentConversation && data.conversationId) {
        setCurrentConversation(data.conversationId);
        loadConversations();
      }

      setMessages((prev) => [
        ...prev.filter((m) => !m.id.startsWith("temp-")),
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: userMessage,
          createdAt: new Date().toISOString(),
        },
        data.message,
      ]);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadRes = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress: number) => setUploadProgress(progress),
      });

      const docRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          url: uploadRes.url,
          size: file.size,
        }),
      });

      const document = await docRes.json();

      const arrayBuffer = await file.arrayBuffer();
      const pdfText = extractPdfText(arrayBuffer);

      await fetch(`/api/documents/${document.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pdfText, pageCount: 1 }),
      });

      toast.success(`"${file.name}" uploaded and processed!`);
      setSelectedDocument(document.id);
      loadDocuments();
      setUploadDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const newChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setSelectedDocument("");
  };

  const deleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (currentConversation === id) {
        newChat();
      }
      loadConversations();
    } catch {
      toast.error("Failed to delete conversation");
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversations Sidebar */}
      <div className="hidden lg:flex w-72 flex-col border-r bg-white dark:bg-zinc-900">
        <div className="p-4">
          <Button onClick={newChat} className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loadingConvos ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : conversations.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No conversations yet
              </p>
            ) : (
              conversations.map((convo) => (
                <div
                  key={convo.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    currentConversation === convo.id
                      ? "bg-zinc-100 dark:bg-zinc-800"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                  onClick={() => setCurrentConversation(convo.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{convo.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {convo._count?.messages || 0} messages
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(convo.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-zinc-600" />
            <h2 className="font-semibold">DocuAI Assistant</h2>
            {selectedDocument && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {documents.find((d) => d.id === selectedDocument)?.name ||
                  "Document"}
                <button onClick={() => setSelectedDocument("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedDocument} onValueChange={setSelectedDocument}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select document..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No document</SelectItem>
                {documents.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Upload a PDF and ask questions about it, or start chatting to
                analyze your documents with AI.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setInput("Summarize the key points of my document")
                  }
                >
                  <FileText className="mr-2 h-4 w-4" /> Try a prompt
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role !== "user" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-zinc-900 text-white text-xs">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    {msg.document && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        <FileText className="mr-1 h-3 w-3" />
                        {msg.document.name}
                      </Badge>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-zinc-900 text-white text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-white dark:bg-zinc-900">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload PDF</TooltipContent>
                </Tooltip>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload PDF Document</DialogTitle>
                  <DialogDescription>
                    Upload a PDF to analyze and chat about with AI
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-zinc-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload PDF</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 20MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  {uploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-xs text-center text-muted-foreground">
                        {uploadProgress < 100
                          ? "Uploading..."
                          : "Processing document..."}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your documents..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={sending || !input.trim()}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function extractPdfText(arrayBuffer: ArrayBuffer): string {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const rawText = decoder.decode(uint8Array);

    const matches = rawText.match(/\(([^)]+)\)/g);
    let text = "";
    if (matches) {
      text = matches
        .map((m) => m.slice(1, -1))
        .filter((t) => t.length > 1 && /[a-zA-Z]/.test(t))
        .join(" ");
    }

    if (text.length < 50) {
      text =
        "PDF document uploaded. Content may require OCR processing for full text extraction.";
    }

    return text;
  } catch {
    return "PDF document uploaded. Content extraction pending.";
  }
}
