import { useQuery } from '@tanstack/react-query';
import { getDocument } from '@/lib/api';
import { DocumentData } from '@/types';

export function useDocument(id: string) {
  return useQuery<DocumentData>({
    queryKey: ['document', id ],
    queryFn: () => getDocument(id),
    enabled: !!id, // Only fetch if we have an ID and user is logged in
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('permission') || error.message.includes('sign in')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
