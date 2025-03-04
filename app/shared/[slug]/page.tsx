'use client';

import { useQuery } from '@tanstack/react-query';
import { TipTapEditor } from '@/components/editor/tiptap-editor';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Eye, Clock } from 'lucide-react';
import { DocumentData } from '@/types';
import { getShareDocument } from '@/services/api';

export default function SharedDocumentPage({ params }: { params: { slug: string } }) {
  const {
    data: document,
    isLoading,
    error,
  } = useQuery<DocumentData, Error>({
    queryKey: ['sharedDocument', params.slug],
    queryFn: () => getShareDocument(params.slug),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  console.log(document);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show error state
  if (error || !document) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {error?.message || 'Document not found'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                The document you're looking for might have been moved or is no longer public.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{document.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{document.viewCount} views</span>
                </div>
                {document.lastViewedAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Last viewed {new Date(document.lastViewedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            <TipTapEditor content={document.content} onChange={() => {}} editable={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
