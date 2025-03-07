import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentData } from '@/types';
import { updateDocument as apiUpdateDocument } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
async function updateDocument(params: DocumentData): Promise<DocumentData> {
  const response = await apiUpdateDocument(params.id, { ...params });
  if (!response.ok) {
    throw new Error('Failed to update document');
  }
  return response.json();
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDocument,
    onSuccess: data => {
      toast({
        title: 'Success',
        description: 'Document updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['document', data._id] });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to update document',
        variant: 'destructive',
      });
      console.error('Error updating document:', error);
    },
  });
}
