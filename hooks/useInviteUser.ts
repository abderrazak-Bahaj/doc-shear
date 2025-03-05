import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentData } from '@/types';
import { shareDocument } from '@/lib/api';

interface InviteUserParams {
  documentId: string;
  email: string;
  role: 'viewer' | 'editor';
}

async function inviteUser(params: InviteUserParams): Promise<DocumentData> {
  const response = await shareDocument(params.documentId, params);
  if (!response.ok) {
    throw new Error('Failed to send invite');
  }
  return response.json();
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inviteUser,
    onSuccess: data => {
      queryClient.setQueryData(['document', data._id], data);
    },
  });
}
