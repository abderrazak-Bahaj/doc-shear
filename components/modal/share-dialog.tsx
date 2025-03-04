"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Share2,
  Globe,
  Lock,
  Copy,
  Eye,
  UserPlus,
  Mail,
  Loader2,
} from "lucide-react";
import { DocumentData } from "@/types";
import { useUpdateDocumentPrivacy } from "@/hooks/useUpdateDocumentPrivacy";
import { useInviteUser } from "@/hooks/useInviteUser";

interface ShareDialogProps {
  document: DocumentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inviteSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  role: Yup.string().oneOf(['viewer', 'editor']).required('Role is required'),
});

export function ShareDialog({ document, open, onOpenChange }: ShareDialogProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"privacy" | "invite">("privacy");
  const [selectedPrivacy, setSelectedPrivacy] = useState<"private" | "public" | "restricted">(document.privacy);
  const [isEditing, setIsEditing] = useState(false);
  
  const { mutate: updatePrivacy, isPending } = useUpdateDocumentPrivacy();
  const { mutate: inviteUser } = useInviteUser();

  const inviteFormik = useFormik({
    initialValues: {
      email: '',
      role: 'viewer' as 'viewer' | 'editor',
    },
    validationSchema: inviteSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!session?.user?.email) {
        toast({
          title: "Error",
          description: "You must be logged in to invite users",
          variant: "destructive",
        });
        return;
      }

      inviteUser(
        {
          documentId: document._id,
          email: values.email,
          role: values.role,
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Invitation sent successfully",
            });
            resetForm();
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to send invitation",
              variant: "destructive",
            });
          },
        }
      );
    },
  });

  const handlePrivacySelect = (privacy: "private" | "public" | "restricted") => {
    setSelectedPrivacy(privacy);
    setIsEditing(true);
  };

  const handlePrivacyUpdate = () => {
    if (!session?.user?.email) {
      toast({
        title: "Error",
        description: "You must be logged in to change privacy settings",
        variant: "destructive",
      });
      return;
    }

    const publicSlug = selectedPrivacy === "public"
      ? Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
      : undefined;

    updatePrivacy(
      {
        id: document._id,
        privacy: selectedPrivacy,
        publicSlug,
      },
      {
        onSuccess: (updatedDoc) => {
          if (selectedPrivacy === "public" && publicSlug) {
            const shareUrl = `${window.location.origin}/shared/${publicSlug}`;
            toast({
              title: "Document is now public",
              description: "Share link has been copied to clipboard",
            });
            navigator.clipboard.writeText(shareUrl);
          } else {
            toast({
              title: "Success",
              description: `Document is now ${selectedPrivacy}`,
            });
          }
          setIsEditing(false);
          onOpenChange(false);
          setTimeout(() => onOpenChange(true), 0);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update privacy settings",
            variant: "destructive",
          });
        },
      }
    );
  };

  const copyShareLink = () => {
    if (document.publicSlug) {
      const shareUrl = `${window.location.origin}/shared/${document.publicSlug}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Share link copied to clipboard",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        <Tabs value={activeTab} onValueChange={(value: "privacy" | "invite") => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="invite">Invite</TabsTrigger>
          </TabsList>
          <TabsContent value="privacy" className="space-y-4">
            <div className="space-y-4">
              <div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                  selectedPrivacy === "private" ? "bg-primary/10" : "hover:bg-muted"
                }`}
                onClick={() => handlePrivacySelect("private")}
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
                {selectedPrivacy === "private" && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                  selectedPrivacy === "restricted" ? "bg-primary/10" : "hover:bg-muted"
                }`}
                onClick={() => handlePrivacySelect("restricted")}
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
                {selectedPrivacy === "restricted" && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                  selectedPrivacy === "public" ? "bg-primary/10" : "hover:bg-muted"
                }`}
                onClick={() => handlePrivacySelect("public")}
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
                <div className="flex items-center gap-2">
                  {document.privacy === "public" && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Eye className="h-4 w-4 mr-1" />
                      {document.viewCount || 0} views
                    </div>
                  )}
                  {selectedPrivacy === "public" && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
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
              </div>
            )}

{isEditing && selectedPrivacy !== document.privacy && (
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPrivacy(document.privacy);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePrivacyUpdate}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Privacy"
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="invite" className="space-y-4">
            <form onSubmit={inviteFormik.handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label>Email address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    {...inviteFormik.getFieldProps('email')}
                  />
                  <Select
                    value={inviteFormik.values.role}
                    onValueChange={(value: "viewer" | "editor") =>
                      inviteFormik.setFieldValue('role', value)
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
                {inviteFormik.touched.email && inviteFormik.errors.email && (
                  <p className="text-sm text-destructive">{inviteFormik.errors.email}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={!inviteFormik.isValid || inviteFormik.isSubmitting}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </form>
            {document.allowedUsers?.length > 0 && (
              <div className="space-y-4 mt-4">
                <Label>Shared with</Label>
                <div className="space-y-2">
                  {document.allowedUsers.map((user) => (
                    <div
                      key={user.email}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {document.pendingInvites?.length > 0 && (
              <div className="space-y-4 mt-4">
                <Label>Pending Invites</Label>
                <div className="space-y-2">
                  {document.pendingInvites.map((invite) => (
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
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
