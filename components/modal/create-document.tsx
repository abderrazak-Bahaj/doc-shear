'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createDocument } from '@/services/api';
import { useMutation } from '@tanstack/react-query';
import ErrorField from '../ui/error-field';
import { useQueryClient } from '@tanstack/react-query';
import { generateRandomString } from '@/services/utilis';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  privacy: Yup.string().required('Type is required'),
});

const initialValues = {
  title: '',
  privacy: 'private',
};

const CreateDocument = ({
  showDialog,
  setShowDialog,
}: {
  showDialog: boolean;
  setShowDialog: (showDialog: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createDocument,
    onSuccess: data => {
      toast({
        title: 'Success',
        description: 'Document created successfully',
      });
      setShowDialog(false);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to create document',
        variant: 'destructive',
      });
    },
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      const isOneTime = values.privacy === 'one-time';
      const publicSlug = isOneTime ? generateRandomString(15) : undefined;
      const oneTimeKey = isOneTime ? generateRandomString(10) : undefined;

      await mutation.mutateAsync({
        ...values,
        content: '<p>Start writing your document...</p>',
        publicSlug,
        oneTimeKey,
      });

      resetForm();
      setSubmitting(false);
    },
  });

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>Create a new document and choose its type.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Title</label>
            <Input
              placeholder="Enter document title"
              value={formik.values.title}
              onChange={formik.handleChange}
              name="title"
            />
            <ErrorField message={formik.errors.title} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <Select
              value={formik.values.privacy}
              onValueChange={(value: 'regular' | 'one-time') =>
                formik.setFieldValue('privacy', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Regular Document</SelectItem>
                <SelectItem value="one-time">One-time View</SelectItem>
              </SelectContent>
            </Select>
            <ErrorField message={formik.errors.privacy} />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowDialog(false);
              formik.resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => await formik.handleSubmit()}
            disabled={formik.isSubmitting || mutation.isPending}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocument;
