'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentCard from '@/components/document-card';
import { toast } from '@/hooks/use-toast';
import CreateDocument from '@/components/modal/create-document';
import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '@/services/api';
import ViewLink from '@/components/modal/view-link';
import ConfirmDeletion from '@/components/modal/confirm-deletion';
import { Document } from '@/types';

export default function DocumentsPage() {
  const [showDialogAddNew, setShowDialogAddNew] = useState(false);
  const [docSelected, setDocSeleced] = useState<Document | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  });

  if (isLoading) {
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
        <Button onClick={() => setShowDialogAddNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents?.map(doc => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={() => setDocToDelete(doc)}
            onCopy={() => setDocSeleced(doc)}
          />
        ))}
      </div>

      <ViewLink docSelected={docSelected} setDocSeleced={setDocSeleced} />
      <ConfirmDeletion docToDelete={docToDelete} setDocToDelete={setDocToDelete} />
      <CreateDocument showDialog={showDialogAddNew} setShowDialog={setShowDialogAddNew} />
    </div>
  );
}
