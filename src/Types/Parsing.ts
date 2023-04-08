import type {DLResult, StalkResult} from './Response';
export type ParsingType = 'user' | 'post';
export type ParsingInput = {
  user: StalkResult;
  post: DLResult;
};
export interface UserResponse {
  caption: string;
  fileName: string;
  username: string;
  url: string;
}
export interface PostResponse {
  caption: string;
  fileName: string;
  username: string;
  fileNameImage: string;
  avatar: string;
  url: string | string[];
}
export type ParsingResponse = {
  user: UserResponse;
  post: PostResponse;
};
