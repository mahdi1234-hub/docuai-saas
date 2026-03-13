"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  FileText,
  MessageSquare,
  Zap,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface DocItem {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  pageCount: number;
  size: number;
  _count: { chunks: number; messages: number };
}

interface ConvoItem {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  _count: { messages: number };
}

export default function AnalyticsPage() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [conversations, setConversations] = useState<ConvoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/documents").then((r) => r.json()),
      fetch("/api/conversations").then((r) => r.json()),
    ])
      .then(([docs, convos]) => {
        setDocuments(Array.isArray(docs) ? docs : []);
        setConversations(Array.isArray(convos) ? convos : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalChunks = documents.reduce(
    (acc, d) => acc + (d._count?.chunks || 0),
    0
  );
  const totalMessages = conversations.reduce(
    (acc, c) => acc + (c._count?.messages || 0),
    0
  );
  const totalSize = documents.reduce((acc, d) => acc + d.size, 0);
  const readyDocs = documents.filter((d) => d.status === "ready").length;
  const processingDocs = documents.filter(
    (d) => d.status === "processing"
  ).length;
  const errorDocs = documents.filter((d) => d.status === "error").length;

  const statusData = [
    { name: "Ready", value: readyDocs, color: "#18181b" },
    { name: "Processing", value: processingDocs, color: "#71717a" },
    { name: "Error", value: errorDocs, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const topDocsByChunks = [...documents]
    .sort((a, b) => (b._count?.chunks || 0) - (a._count?.chunks || 0))
    .slice(0, 10)
    .map((d) => ({
      name: d.name.length > 20 ? d.name.substring(0, 20) + "..." : d.name,
      chunks: d._count?.chunks || 0,
      messages: d._count?.messages || 0,
    }));

  const topConvosByMessages = [...conversations]
    .sort((a, b) => (b._count?.messages || 0) - (a._count?.messages || 0))
    .slice(0, 10);

  // Activity over time (group by date)
  const activityMap = new Map<string, { docs: number; convos: number }>();
  documents.forEach((d) => {
    const date = new Date(d.createdAt).toLocaleDateString();
    const existing = activityMap.get(date) || { docs: 0, convos: 0 };
    activityMap.set(date, { ...existing, docs: existing.docs + 1 });
  });
  conversations.forEach((c) => {
    const date = new Date(c.createdAt).toLocaleDateString();
    const existing = activityMap.get(date) || { docs: 0, convos: 0 };
    activityMap.set(date, { ...existing, convos: existing.convos + 1 });
  });
  const activityData = Array.from(activityMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const chartConfig = {
    chunks: { label: "Chunks", color: "#18181b" },
    messages: { label: "Messages", color: "#71717a" },
    docs: { label: "Documents", color: "#18181b" },
    convos: { label: "Conversations", color: "#71717a" },
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Document processing and usage analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                <CheckCircle className="mr-1 h-3 w-3" />
                {readyDocs}
              </Badge>
              {processingDocs > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {processingDocs}
                </Badge>
              )}
              {errorDocs > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errorDocs}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Conversations
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalMessages} total messages
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Vector Embeddings
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChunks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Chunks in Pinecone
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Storage
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSize(totalSize)}</div>
            <Progress
              value={Math.min((totalSize / (100 * 1024 * 1024)) * 100, 100)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              of 100 MB limit
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of document processing status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statusData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No data yet
                  </p>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Documents by Chunks</CardTitle>
                <CardDescription>
                  Documents with the most embedded chunks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topDocsByChunks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No data yet
                  </p>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topDocsByChunks} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={120}
                          tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="chunks"
                          fill="#18181b"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
              <CardDescription>
                Detailed view of all documents and their metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Chunks</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {doc.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              doc.status === "ready"
                                ? "default"
                                : doc.status === "error"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatSize(doc.size)}</TableCell>
                        <TableCell>{doc.pageCount}</TableCell>
                        <TableCell>{doc._count?.chunks || 0}</TableCell>
                        <TableCell>{doc._count?.messages || 0}</TableCell>
                        <TableCell>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Over Time</CardTitle>
              <CardDescription>
                Documents and conversations created per day
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No activity data yet
                </p>
              ) : (
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="docs"
                        stroke="#18181b"
                        strokeWidth={2}
                        dot={{ fill: "#18181b" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="convos"
                        stroke="#71717a"
                        strokeWidth={2}
                        dot={{ fill: "#71717a" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Conversations</CardTitle>
              <CardDescription>
                Most active conversations by message count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Conversation</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topConvosByMessages.map((convo) => (
                      <TableRow key={convo.id}>
                        <TableCell className="font-medium max-w-[300px] truncate">
                          {convo.title}
                        </TableCell>
                        <TableCell>{convo._count?.messages || 0}</TableCell>
                        <TableCell>
                          {new Date(convo.updatedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
