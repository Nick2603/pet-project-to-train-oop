import { LikeStatus } from "./LikeStatusEnum";

export interface IPostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: {
      addedAt: Date;
      userId: string;
      login: string;
    }[];
  };
}

export interface ILikeInfo {
  userId: string;
  login: string;
  likeStatus: LikeStatus;
  addedAt: Date;
}

export interface IPostDBModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  likesInfo: ILikeInfo[];
}
