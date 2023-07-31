import { ILikeInfo, IPostDBModel, IPostViewModel } from "../types/IPost";
import { LikeStatus } from "../types/LikeStatusEnum";

export const getUserLikeStatusForPost = (
  likesInfo: ILikeInfo[],
  userId?: string
): LikeStatus | null => {
  if (!userId) return null;

  const userInfo = likesInfo.find((like) => like.userId === userId);

  if (!userInfo) return null;

  return userInfo.likeStatus;
};

const getNewestLikes = (likesInfo: ILikeInfo[]) => {
  return likesInfo
    .filter((like) => like.likeStatus === LikeStatus.Like)
    .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
    .map((like) => ({
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.login,
    }))
    .slice(0, 3);
};

export const mapPostDBTypeToViewType = (
  post: IPostDBModel,
  userId?: string
): IPostViewModel => {
  const myStatus = getUserLikeStatusForPost(post.likesInfo, userId);

  const likesCount = post.likesInfo.filter(
    (like) => like.likeStatus === LikeStatus.Like
  ).length;
  const dislikesCount = post.likesInfo.filter(
    (like) => like.likeStatus === LikeStatus.Dislike
  ).length;

  return {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount,
      dislikesCount,
      myStatus: myStatus || LikeStatus.None,
      newestLikes: getNewestLikes(post.likesInfo),
    },
  };
};
