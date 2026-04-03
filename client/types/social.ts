export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface AppUser {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
}

export interface Reaction {
  user: AppUser;
  type: ReactionType;
  _id?: string;
}

export interface PostType {
  _id: string;
  content: string;
  image?: string;
  author: AppUser;
  likes: AppUser[];
  reactions: Reaction[];
  isPrivate: boolean;
  createdAt: string;
  comments?: Array<{
    _id: string;
    content: string;
    image?: string;
    author: AppUser;
    likes: AppUser[];
    reactions?: Reaction[];
    replies: Array<{
      _id: string;
      content: string;
      author: AppUser;
      likes: AppUser[];
      createdAt: string;
    }>;
    createdAt: string;
  }>;
}
