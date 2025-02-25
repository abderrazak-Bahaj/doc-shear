"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Lock, Eye, AlertTriangle } from "lucide-react";

interface DocumentData {
  _id: string;
  title: string;
  content: string;
}

export default function OneTimeDocumentPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewed, setViewed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/one-time/${params.slug}?key=${key}`);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to access document");
      }

      const data = await response.json();
      setDocument(data);
      setViewed(true);
    } catch (error) {
      console.error("Error accessing document:", error);
      setError(error instanceof Error ? error.message : "Failed to access document");
    } finally {
      setLoading(false);
    }
  };

  if (viewed && document) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-yellow-500" />
              One-Time View Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-500 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Important Notice</p>
                <p>This document can only be viewed once. Once you leave this page, you won't be able to access it again.</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <TipTapEditor
              content={document.content}
              onChange={() => {}}
              editable={false}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Enter Access Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter the document key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={loading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !key}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accessing...
                </>
              ) : (
                "View Document"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
