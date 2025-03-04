import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentData } from '@/types';
import { updateDocument as apiUpdateDocument } from '@/services/api';

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
      queryClient.setQueryData(['document', data._id], data);
    },
  });
}
