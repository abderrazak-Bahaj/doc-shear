'use client';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TipTapEditor } from '@/components/editor/tiptap-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save} from 'lucide-react';
import { ShareDialog } from '@/components/modal/share-dialog';
import { useDocument } from '@/hooks/useDocument';
import { useUpdateDocument } from '@/hooks/useUpdateDocument';

const documentSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  content: Yup.string().required('Content is required'),
});

export default function DocumentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { data: document, isLoading, error, isError } = useDocument(params.id);
  const { mutate: updateDocument, isPending: isSaving } = useUpdateDocument();

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
    },
    validationSchema: documentSchema,
    onSubmit: async values => {
      updateDocument(
        {
          ...document,
          id: params.id,
          title: values.title,
          content: values.content,
        },
        {
          onSuccess: () => {
            toast({
              title: 'Success',
              description: 'Document saved successfully',
            });
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to save document',
              variant: 'destructive',
            });
          },
        }
      );
    },
  });

  useEffect(() => {
    if (document) {
      formik.setValues({
        title: document.title,
        content: document.content,
      });
    }
  }, [document]);

  // Show loading state
  if (isLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {error instanceof Error ? error.message : 'Failed to load document'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {error instanceof Error && error.message.includes('permission')
                  ? "You don't have access to this document. Please request access from the owner."
                  : 'There was an error loading the document. Please try again later.'}
              </p>
              <Button className="mt-4" onClick={() => router.push('/documents')}>
                Back to Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  const isOwner = document.userId === document.userId;
  const canEdit =
    isOwner ||
    document.allowedUsers.some(
      (user: { email: string; role: string }) =>
        user.email === document.userId && user.role === 'editor'
    );

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={formik.handleSubmit}>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <Input
                  {...formik.getFieldProps('title')}
                  placeholder="Document Title"
                  className="text-2xl font-bold"
                  readOnly={!canEdit}
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="text-sm text-destructive mt-1">{formik.errors.title}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isOwner && (
                  <ShareDialog
                    document={document}
                    open={showShareDialog}
                    onOpenChange={setShowShareDialog}
                  />
                )}
                {canEdit && (
                  <Button
                    type="submit"
                    variant="default"
                    className="gap-2"
                    disabled={isSaving || !formik.isValid || !formik.dirty}
                  >
                    {isSaving ? (
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
              content={formik.values.content}
              onChange={value => formik.setFieldValue('content', value)}
              editable={canEdit}
            />
            {formik.touched.content && formik.errors.content && (
              <p className="text-sm text-destructive mt-1">{formik.errors.content}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
