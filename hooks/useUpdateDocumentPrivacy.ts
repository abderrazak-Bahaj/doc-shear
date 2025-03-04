import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentData } from '@/types';
import { updateDocument } from '@/services/api';

interface UpdatePrivacyParams {
  id: string;
  privacy: 'private' | 'public' | 'restricted';
  publicSlug?: string;
}

async function updatePrivacy(params: UpdatePrivacyParams): Promise<DocumentData> {
  const response = await updateDocument(params.id, {
    privacy: params.privacy,
    publicSlug: params.publicSlug,
  });

  if (!response.ok) {
    throw new Error('Failed to update privacy');
  }

  return response.json();
}

export function useUpdateDocumentPrivacy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePrivacy,
    onSuccess: data => {
      queryClient.setQueryData(['document', data._id], data);
    },
  });
}
