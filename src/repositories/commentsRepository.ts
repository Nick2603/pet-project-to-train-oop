import { ICommentDBModel } from "../types/IComment";
import { CommentModel } from "../models/commentModel";

export class CommentsRepository {
  async deleteAllComments(): Promise<void> {
    await CommentModel.deleteMany({});
  }

  async getCommentById(id: string): Promise<ICommentDBModel | null> {
    return await CommentModel.findOne({ _id: id }, { __v: 0, postId: 0 });
  }

  async createComment(newComment: ICommentDBModel): Promise<ICommentDBModel> {
    return await CommentModel.create(newComment);
  }

  async updateComment(id: string, content: string): Promise<boolean> {
    const result = await CommentModel.updateOne({ _id: id }, { content });
    return result.matchedCount === 1;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await CommentModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async addLike(commentId: string) {
    const result = await CommentModel.updateOne(
      { _id: commentId },
      { $inc: { "likesInfo.likes.count": 1 } }
    );
    return result.matchedCount === 1;
  }

  async removeLike(commentId: string) {
    const result = await CommentModel.updateOne(
      { _id: commentId },
      { $inc: { "likesInfo.likes.count": -1 } }
    );
    return result.matchedCount === 1;
  }

  async addDislike(commentId: string) {
    const result = await CommentModel.updateOne(
      { _id: commentId },
      { $inc: { "likesInfo.dislikes.count": 1 } }
    );
    return result.matchedCount === 1;
  }

  async removeDislike(commentId: string) {
    const result = await CommentModel.updateOne(
      { _id: commentId },
      { $inc: { "likesInfo.dislikes.count": -1 } }
    );
    return result.matchedCount === 1;
  }

  async addLikedUser(commentId: string, userId: string) {
    const result = await CommentModel.updateOne(
      { _id: commentId },
      { $push: { "likesInfo.likes.userIds": userId } }
    );
    return result.matchedCount === 1;
  }

  async removeLikedUser(commentId: string, userId: string) {
    const result = await CommentModel.updateOne(
      { _id: commentId },
      { $pull: { "likesInfo.likes.userIds": userId } }
    );
    return result.matchedCount === 1;
  }

  async addDislikedUser(commentId: string, userId: string) {
    const result = await CommentModel.updateOne(
      { _id: commentId },
      { $push: { "likesInfo.dislikes.userIds": userId } }
    );
    return result.matchedCount === 1;
  }

  async removeDislikedUser(commentId: string, userId: string) {
    const result = await CommentModel.updateOne(
      { _id: commentId },
      { $pull: { "likesInfo.dislikes.userIds": userId } }
    );
    return result.matchedCount === 1;
  }
}
