"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Calendar, Eye, Trash2, MoreVertical, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentCardProps {
  document: {
    _id: string;
    title: string;
    updatedAt: string;
    privacy?: string;
    viewCount?: number;
    oneTimeKey?: string;
  };
  onDelete?: () => void;
  onCopy?: () => void;
}

export default function DocumentCard({
  document,
  onDelete,
  onCopy,
}: DocumentCardProps) {
  const router = useRouter();
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };
  const handleClick = () => {
    router.push(`/documents/${document._id}`);
  };
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCopy?.();
  };
  
  return (
    <Card className="hover-card group cursor-pointer overflow-hidden bg-card" onClick={handleClick}>
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-start justify-between" >
          <CardTitle className="flex items-center gap-2 text-lg font-semibold group-hover:text-primary transition-colors">
            <FileText className="h-5 w-5 text-primary" />
            {document.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {document.privacy && (
              <Badge
                variant={
                  document.privacy === "public"
                    ? "default"
                    : document.privacy === "one-time"
                    ? "destructive"
                    : "secondary"
                }
              >
                {document.privacy}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {(document.privacy === "one-time" || document.privacy === "public") && (
                  <DropdownMenuItem onClick={handleCopy}>
                    <Link className="h-4 w-4 mr-2" />
                    Get link & Key
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
          </div>
          {document.privacy !== "private" && (
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{document.viewCount || 0} views</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
