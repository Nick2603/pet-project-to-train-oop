import { ILikesInfo } from "../types/IComment";
import { LikeStatus } from "../types/LikeStatusEnum";

export const getUserLikeStatus = (
  likesInfo: ILikesInfo,
  userId?: string
): LikeStatus => {
  const { likes, dislikes } = likesInfo;

  if (!userId) {
    return LikeStatus.None;
  }

  if (likes.userIds.includes(userId)) {
    return LikeStatus.Like;
  }

  if (dislikes.userIds.includes(userId)) {
    return LikeStatus.Dislike;
  }

  return LikeStatus.None;
};
