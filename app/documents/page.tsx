"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentCard from "@/components/document-card";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface Document {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
  privacy: string;
  viewCount: number;
}

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchDocuments();
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleCreateDocument = async () => {
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Untitled Document",
          content: "<p>Start writing your document...</p>",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create document");
      }

      const document = await response.json();
      router.push(`/documents/${document._id}`);
    } catch (error) {
      console.error("Error creating document:", error);
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive",
      });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight">Your Documents</h1>
        <Button onClick={handleCreateDocument} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          New Document
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => (
          <DocumentCard key={document._id} document={document} />
        ))}
        {documents.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first document to get started
              </p>
              <Button onClick={handleCreateDocument} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}