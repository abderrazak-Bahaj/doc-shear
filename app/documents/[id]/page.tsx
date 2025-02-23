"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Save,
  Share2,
  Globe,
  Lock,
  Copy,
  Eye,
  UserPlus,
  Mail,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

interface DocumentData {
  _id: string;
  title: string;
  content: string;
  userId: string;
  privacy: "private" | "public" | "restricted";
  publicSlug?: string;
  viewCount: number;
  lastViewedAt?: string;
  allowedUsers: Array<{
    email: string;
    role: "viewer" | "editor";
    confirmedAt: string;
  }>;
  pendingInvites: Array<{
    email: string;
    role: "viewer" | "editor";
    invitedAt: string;
  }>;
}

export default function DocumentPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "editor">("viewer");

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }
        const data = await response.json();

        // If document is not public and user is not authenticated, redirect to login
        if (data.privacy !== "public" && !session?.user?.email) {
          router.push("/auth/signin");
          return;
        }

        setDocument({
          ...data,
          allowedUsers: data.allowedUsers || [],
          pendingInvites: data.pendingInvites || [],
        });
        setTitle(data.title);
        setContent(data.content);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load document",
          variant: "destructive",
        });
        router.push("/documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [params.id, router, session?.user?.email, toast]);

  const handleSave = async () => {
    if (!session?.user?.email) {
      toast({
        title: "Error",
        description: "You must be logged in to save changes",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          privacy: document?.privacy,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save document");
      }

      const updatedDoc = await response.json();
      setDocument({
        ...updatedDoc,
        allowedUsers: updatedDoc.allowedUsers || [],
        pendingInvites: updatedDoc.pendingInvites || [],
      });

      toast({
        title: "Success",
        description: "Document saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacyChange = async (privacy: "private" | "public" | "restricted") => {
    if (!session?.user?.email) {
      toast({
        title: "Error",
        description: "You must be logged in to change privacy settings",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a public slug if making document public
      const publicSlug = privacy === "public" ? 
        Math.random().toString(36).substring(2, 15) + Date.now().toString(36) : 
        undefined;

      console.log("Updating document privacy:", { privacy, publicSlug }); // Debug log

      const response = await fetch(`/api/documents/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          privacy,
          publicSlug,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update privacy");
      }

      const updatedDoc = await response.json();
      console.log("Updated document:", updatedDoc); // Debug log

      setDocument({
        ...updatedDoc,
        allowedUsers: updatedDoc.allowedUsers || [],
        pendingInvites: updatedDoc.pendingInvites || [],
      });

      // Show success message with share link if made public
      if (privacy === "public" && publicSlug) {
        const shareUrl = `${window.location.origin}/shared/${publicSlug}`;
        toast({
          title: "Document is now public",
          description: "Share link has been copied to clipboard",
        });
        navigator.clipboard.writeText(shareUrl);
      } else {
        toast({
          title: "Success",
          description: `Document is now ${privacy}`,
        });
      }

      // Force a rerender of the dialog content
      setShowShareDialog(false);
      setTimeout(() => setShowShareDialog(true), 0);
    } catch (error) {
      console.error("Error updating privacy:", error); // Debug log
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    }
  };

  const handleInviteUser = async () => {
    if (!session?.user?.email) {
      toast({
        title: "Error",
        description: "You must be logged in to invite users",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/documents/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: params.id,
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invite");
      }

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });

      setInviteEmail("");
      const updatedDoc = await fetch(`/api/documents/${params.id}`).then((r) =>
        r.json()
      );
      setDocument({
        ...updatedDoc,
        allowedUsers: updatedDoc.allowedUsers || [],
        pendingInvites: updatedDoc.pendingInvites || [],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = () => {
    if (document?.publicSlug) {
      const shareUrl = `${window.location.origin}/shared/${document.publicSlug}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Share link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!document) {
    return null;
  }

  const isOwner = session?.user?.email === document.userId;
  const canEdit = isOwner || document.allowedUsers.some(
    (user) => user.email === session?.user?.email && user.role === "editor"
  );

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title"
              className="text-2xl font-bold flex-1"
              readOnly={!canEdit}
            />
            <div className="flex items-center gap-2">
              {isOwner && (
                <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share Document</DialogTitle>
                      <DialogDescription>
                        Choose how you want to share this document
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="privacy" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="privacy">Privacy</TabsTrigger>
                        <TabsTrigger value="invite">Invite</TabsTrigger>
                      </TabsList>
                      <TabsContent value="privacy" className="space-y-4">
                        <div className="space-y-4">
                          <div
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                              document.privacy === "private"
                                ? "bg-primary/10"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => handlePrivacyChange("private")}
                          >
                            <div className="flex items-center gap-3">
                              <Lock className="h-5 w-5" />
                              <div>
                                <p className="font-medium">Private</p>
                                <p className="text-sm text-muted-foreground">
                                  Only you can access
                                </p>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                              document.privacy === "restricted"
                                ? "bg-primary/10"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => handlePrivacyChange("restricted")}
                          >
                            <div className="flex items-center gap-3">
                              <UserPlus className="h-5 w-5" />
                              <div>
                                <p className="font-medium">Restricted</p>
                                <p className="text-sm text-muted-foreground">
                                  Only invited people can access
                                </p>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                              document.privacy === "public"
                                ? "bg-primary/10"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => handlePrivacyChange("public")}
                          >
                            <div className="flex items-center gap-3">
                              <Globe className="h-5 w-5" />
                              <div>
                                <p className="font-medium">Public</p>
                                <p className="text-sm text-muted-foreground">
                                  Anyone with the link can view
                                </p>
                              </div>
                            </div>
                            {document.privacy === "public" && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Eye className="h-4 w-4 mr-1" />
                                {document.viewCount || 0} views
                              </div>
                            )}
                          </div>
                        </div>
                        {document.privacy === "public" && document.publicSlug && (
                          <div className="space-y-2 mt-4">
                            <Label>Share link</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                readOnly
                                value={`${window.location.origin}/shared/${document.publicSlug}`}
                              />
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={copyShareLink}
                                title="Copy link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                              <Eye className="h-4 w-4" />
                              <span>{document.viewCount || 0} views</span>
                              {document.lastViewedAt && (
                                <span>
                                  • Last viewed{" "}
                                  {new Date(document.lastViewedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="invite" className="space-y-4">
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label>Email address</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="email"
                                placeholder="Enter email address"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                              />
                              <Select
                                value={inviteRole}
                                onValueChange={(value: "viewer" | "editor") =>
                                  setInviteRole(value)
                                }
                              >
                                <SelectTrigger className="w-[110px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                  <SelectItem value="editor">Editor</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button
                            onClick={handleInviteUser}
                            disabled={!inviteEmail}
                            className="w-full"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Invite
                          </Button>
                          {(document.allowedUsers?.length || 0) > 0 ||
                            (document.pendingInvites?.length || 0) > 0 ? (
                            <div className="space-y-4 mt-4">
                              <Label>Shared with</Label>
                              <div className="space-y-2">
                                {document.allowedUsers?.map((user) => (
                                  <div
                                    key={user.email}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <div>
                                      <p className="font-medium">{user.email}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {user.role.charAt(0).toUpperCase() +
                                          user.role.slice(1)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                {document.pendingInvites?.map((invite) => (
                                  <div
                                    key={invite.email}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <div>
                                      <p className="font-medium">{invite.email}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Pending {invite.role} invitation
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              )}
              {canEdit && (
                <Button
                  variant="default"
                  className="gap-2"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              )}
            </div>
          </div>
          <TipTapEditor
            content={content}
            onChange={setContent}
            editable={canEdit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
