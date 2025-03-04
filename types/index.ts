export interface DocumentData {
  _id: string;
  title: string;
  content: string;
  userId: string;
  privacy: 'private' | 'public' | 'restricted' | 'one-time';
  publicSlug?: string;
  oneTimeKey?: string;
  viewCount: number;
  lastViewedAt?: Date;
  allowedUsers?: Array<{
    email: string;
    role: 'viewer' | 'editor';
  }>;
  createdAt: Date;
  updatedAt: Date;
}
export interface Document {
  _id: string;
  title: string; 
  content: string;
  updatedAt: string;
  privacy?: "private" | "public" | "restricted";
  viewCount: number;
  publicSlug?: string;
  oneTimeKey?: string;
}