import { ILikeInfo, IPostDBModel } from "../types/IPost";
import { PostModel } from "../models/postModel";
import { blogsRepository } from "../composition/compositionRoot";
import { LikeStatus } from "../types/LikeStatusEnum";

export class PostsRepository {
  async deleteAllPosts(): Promise<void> {
    await PostModel.deleteMany({});
  }

  async getPostById(id: string): Promise<IPostDBModel | null> {
    return await PostModel.findOne({ _id: id }, { __v: 0 });
  }

  async createPost(newPost: IPostDBModel): Promise<IPostDBModel> {
    return await PostModel.create(newPost);
  }

  async updatePost(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ): Promise<boolean> {
    const blog = await blogsRepository.getBlogById(blogId);
    const result = await PostModel.updateOne(
      { _id: id },
      { title, shortDescription, content, blogId, blogName: blog!.name }
    );
    return result.matchedCount === 1;
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await PostModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async addNewLikedUserInfo(postId: string, newLikeInfo: ILikeInfo) {
    const result = await PostModel.updateOne(
      { _id: postId },
      { $push: { likesInfo: newLikeInfo } }
    );

    return result.matchedCount === 1;
  }

  async hasUserLikedAlready(postId: string, userId: string) {
    const post = await PostModel.findOne({ _id: postId });

    if (!post) {
      return false;
    }

    const likedInfoIndex = post.likesInfo.findIndex(
      (likeInfo) => likeInfo.userId === userId
    );

    if (likedInfoIndex === -1) {
      return false;
    }

    return likedInfoIndex;
  }

  async updateLikedUserInfo(
    postId: string,
    userId: string,
    newLikeStatus: LikeStatus
  ) {
    const likedInfoIndex = await this.hasUserLikedAlready(postId, userId);

    if (likedInfoIndex === false || likedInfoIndex < 0) {
      return false;
    }

    const post = await PostModel.findOne({ _id: postId });

    if (!post) {
      return false;
    }

    post.likesInfo[likedInfoIndex].likeStatus = newLikeStatus;

    const updatedPost = await post.save();

    return !!updatedPost;
  }
}
