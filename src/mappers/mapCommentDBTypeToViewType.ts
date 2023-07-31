import { ICommentDBModel, ICommentViewModel } from "../types/IComment";
import { getUserLikeStatus } from "../utils/getUserLikeStatus";

export const mapCommentDBTypeToViewType = (
  comment: ICommentDBModel,
  userId?: string
): ICommentViewModel => {
  const myStatus = getUserLikeStatus(comment.likesInfo, userId);

  return {
    id: comment.id,
    postId: comment?.postId,
    content: comment.content,
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: comment.likesInfo.likes.count,
      dislikesCount: comment.likesInfo.dislikes.count,
      myStatus: myStatus,
    },
  };
};
