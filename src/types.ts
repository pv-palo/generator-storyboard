export interface Frame {
  number: number;
  text: string;
  link: string;
}

export interface StoryboardConfig {
  projectName: string;
  author: string;
  date: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
}
