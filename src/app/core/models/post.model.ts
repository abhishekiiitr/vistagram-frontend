export interface Post {
  id: string;
  username: string;
  imageBase64: string;
  caption: string;
  createdAt: string;
  likes: number;
  shares: number;
  likedByUsers?: string[];
  likedByMe?: boolean;
}