export interface Comment {
  id: string;
  author: string;
  text: string;
  date: Date;
  profileUrl?: string;
}

export interface Post {
  id: string;
  text: string;
  date: Date;
  url: string;
  comments: Comment[];
  audioUrl?: string;
  title?: string;
  sourceUrl?: string;
}
