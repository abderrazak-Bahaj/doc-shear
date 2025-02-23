"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Calendar, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentCardProps {
  document: {
    _id: string;
    title: string;
    updatedAt: string;
    privacy?: string;
    viewCount?: number;
  };
}

export default function DocumentCard({ document }: DocumentCardProps) {
  const router = useRouter();

  return (
    <Card
      className="hover-card group cursor-pointer overflow-hidden bg-card"
      onClick={() => router.push(`/documents/${document._id}`)}
    >
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold group-hover:text-primary transition-colors">
            <FileText className="h-5 w-5 text-primary" />
            {document.title}
          </CardTitle>
          {document.privacy && (
            <Badge variant={document.privacy === "public" ? "default" : "secondary"}>
              {document.privacy}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
          </div>
          {document.viewCount !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{document.viewCount} views</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
