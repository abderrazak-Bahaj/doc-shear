import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getDocument } from "@/services/api";
import { DocumentData } from "@/types";

export function useDocument(id: string) {
  const { data: session } = useSession();

  return useQuery<DocumentData>({
    queryKey: ['document', id, session?.user?.email],
    queryFn: () => getDocument(id),
    enabled: !!id && !!session, // Only fetch if we have an ID and user is logged in
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes("permission") || error.message.includes("sign in")) {
        return false;
      }
      return failureCount < 3;
    },
  });
} 