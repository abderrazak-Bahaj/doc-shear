"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentCard from "@/components/document-card";
import { toast } from "@/components/ui/use-toast"; // Ensure toast is imported correctly
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Document {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
  privacy: string;
  viewCount: number;
  publicSlug?: string;
  oneTimeKey?: string;
}

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newDocType, setNewDocType] = useState<"regular" | "one-time">(
    "regular"
  );
  const [title, setTitle] = useState("");
  const [oneTimeDoc, setOneTimeDoc] = useState<any>(null);
  const [docSelected, setDocSeleced] = useState<any>(null);

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
      const isOneTime = newDocType === "one-time";
      const publicSlug = isOneTime
        ? Math.random().toString(36).substring(2, 15)
        : undefined;
      const oneTimeKey = isOneTime
        ? Math.random().toString(36).substring(2, 10)
        : undefined;

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title || "Untitled Document",
          content: "<p>Start writing your document...</p>",
          privacy: isOneTime ? "one-time" : "private",
          publicSlug,
          oneTimeKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create document");
      }

      const document = await response.json();

      if (isOneTime) {
        const oneTimeViewLink = `${window.location.origin}/one-time/${document.publicSlug}`;
        setOneTimeDoc({
          link: oneTimeViewLink,
          key: oneTimeKey,
        });
      } else {
        router.push(`/documents/${document._id}`);
      }

      setDocuments((prev) => [document, ...prev]);
      if (!isOneTime) {
        setShowDialog(false);
      }
    } catch (error) {
      console.error("Error creating document:", error);
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive",
      });
    }
  };

  const handleDocumentDeleted = (deletedId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc._id !== deletedId));
  };

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Documents</h1>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={() => handleDocumentDeleted(doc._id)}
            onCopy={() => setDocSeleced(doc)}
          />
        ))}
      </div>

      <Dialog open={!!docSelected} onOpenChange={(open)=>!open && setDocSeleced(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogDescription>
              Create a new document and choose its type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Title</label>
              <Input value={docSelected?.title} readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">One-time View Link</label>
              <div className="flex items-center gap-2">
                <Input
                  value={`${window.location.origin}/one-time/${docSelected?.publicSlug}`}
                  readOnly
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/one-time/${docSelected?.publicSlug}`
                    );
                    toast({
                      title: "Success",
                      description: "Link copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>

              <label className="text-sm font-medium">Key</label>
              <div className="flex items-center gap-2">
                <Input value={docSelected?.oneTimeKey} readOnly />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(docSelected?.oneTimeKey);
                    toast({
                      title: "Success",
                      description: "Key copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Share this link with someone. The document will be deleted after
                it's viewed.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDocSeleced(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogDescription>
              Create a new document and choose its type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Title</label>
              <Input
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select
                value={newDocType}
                onValueChange={(value: "regular" | "one-time") =>
                  setNewDocType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Document</SelectItem>
                  <SelectItem value="one-time">One-time View</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {oneTimeDoc && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  One-time View Link
                </label>
                <div className="flex items-center gap-2">
                  <Input value={oneTimeDoc?.link} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(oneTimeDoc?.link);
                      toast({
                        title: "Success",
                        description: "Link copied to clipboard",
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>

                <label className="text-sm font-medium">Key</label>
                <div className="flex items-center gap-2">
                  <Input value={oneTimeDoc?.key} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(oneTimeDoc?.key);
                      toast({
                        title: "Success",
                        description: "Key copied to clipboard",
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Share this link with someone. The document will be deleted
                  after it's viewed.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setOneTimeDoc(null);
                setTitle("");
                setNewDocType("regular");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateDocument}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
