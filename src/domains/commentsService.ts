import { mapCommentDBTypeToViewType } from "../mappers/mapCommentDBTypeToViewType";
import { CommentsRepository } from "../repositories/commentsRepository";
import { UsersRepository } from "../repositories/usersRepository";
import { ICommentViewModel, ICommentDBModel } from "../types/IComment";
import { LikeStatus } from "../types/LikeStatusEnum";
import { getUserLikeStatus } from "../utils/getUserLikeStatus";

export class CommentsService {
  constructor(
    protected readonly commentsRepository: CommentsRepository,
    protected readonly usersRepository: UsersRepository
  ) {}

  async deleteAllComments(): Promise<void> {
    await this.commentsRepository.deleteAllComments();
  }

  async getCommentById(
    id: string,
    userId?: string
  ): Promise<ICommentViewModel | null> {
    const result = await this.commentsRepository.getCommentById(id);
    if (result) {
      return mapCommentDBTypeToViewType(result, userId);
    }
    return null;
  }

  async createComment(
    content: string,
    postId: string,
    userId: string
  ): Promise<ICommentViewModel> {
    const user = await this.usersRepository.getUserById(userId);
    const newComment: ICommentDBModel = {
      id: Date.now().toString(),
      postId,
      content,
      commentatorInfo: {
        userId,
        userLogin: user!.accountData.login,
      },
      createdAt: new Date().toISOString(),
      likesInfo: {
        likes: {
          count: 0,
          userIds: [],
        },
        dislikes: {
          count: 0,
          userIds: [],
        },
      },
    };
    const result = await this.commentsRepository.createComment(newComment);
    const viewModel = mapCommentDBTypeToViewType(result, userId);
    return {
      id: viewModel.id,
      content: viewModel.content,
      commentatorInfo: viewModel.commentatorInfo,
      createdAt: viewModel.createdAt,
      likesInfo: viewModel.likesInfo,
    };
  }

  async updateComment(
    commentId: string,
    content: string,
    userId: string
  ): Promise<"Updated" | "Forbidden" | "Not found"> {
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) return "Not found";
    if (comment?.commentatorInfo.userId !== userId) return "Forbidden";
    const updateResult = await this.commentsRepository.updateComment(
      commentId,
      content
    );
    if (!updateResult) return "Not found";
    return "Updated";
  }

  async deleteComment(
    commentId: string,
    userId: string
  ): Promise<"Updated" | "Forbidden" | "Not found"> {
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) return "Not found";
    if (comment?.commentatorInfo.userId !== userId) return "Forbidden";
    const updateResult = await this.commentsRepository.deleteComment(commentId);
    if (!updateResult) return "Not found";
    return "Updated";
  }

  async updateLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus
  ): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) return false;

    const myStatus = getUserLikeStatus(comment.likesInfo, userId);

    if (myStatus === likeStatus) return true;

    if (myStatus === LikeStatus.None) {
      if (likeStatus === LikeStatus.Like) {
        try {
          await this.commentsRepository.addLike(comment.id);
          await this.commentsRepository.addLikedUser(comment.id, userId);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }

      if (likeStatus === LikeStatus.Dislike) {
        try {
          await this.commentsRepository.addDislike(comment.id);
          await this.commentsRepository.addDislikedUser(comment.id, userId);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }
    }

    if (myStatus === LikeStatus.Like) {
      if (likeStatus === LikeStatus.Dislike) {
        try {
          await this.commentsRepository.removeLike(comment.id);
          await this.commentsRepository.removeLikedUser(comment.id, userId);
          await this.commentsRepository.addDislike(comment.id);
          await this.commentsRepository.addDislikedUser(comment.id, userId);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }

      if (likeStatus === LikeStatus.None) {
        try {
          await this.commentsRepository.removeLike(comment.id);
          await this.commentsRepository.removeLikedUser(comment.id, userId);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }
    }

    if (myStatus === LikeStatus.Dislike) {
      if (likeStatus === LikeStatus.Like) {
        try {
          await this.commentsRepository.removeDislike(comment.id);
          await this.commentsRepository.removeDislikedUser(comment.id, userId);
          await this.commentsRepository.addLike(comment.id);
          await this.commentsRepository.addLikedUser(comment.id, userId);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }

      if (likeStatus === LikeStatus.None) {
        try {
          await this.commentsRepository.removeDislike(comment.id);
          await this.commentsRepository.removeDislikedUser(comment.id, userId);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }
    }

    return false;
  }
}
