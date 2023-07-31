import { LikeStatus } from "./LikeStatusEnum";

export interface ICommentatorInfo {
  userId: string;
  userLogin: string;
}

export interface ILikesInfo {
  likes: {
    count: number;
    userIds: string[];
  };
  dislikes: {
    count: number;
    userIds: string[];
  };
}

export interface ICommentViewModel {
  id: string;
  postId?: string;
  content: string;
  commentatorInfo: ICommentatorInfo;
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
}

export interface ICommentDBModel {
  id: string;
  postId?: string;
  content: string;
  commentatorInfo: ICommentatorInfo;
  createdAt: string;
  likesInfo: ILikesInfo;
}
