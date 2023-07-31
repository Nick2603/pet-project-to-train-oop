import {
  getUserLikeStatusForPost,
  mapPostDBTypeToViewType,
} from "../mappers/mapPostDBTypeToViewType";
import { BlogsRepository } from "../repositories/blogsRepository";
import { PostsRepository } from "../repositories/postsRepository";
import { IPostDBModel, IPostViewModel } from "../types/IPost";
import { IUserDBModel } from "../types/IUser";
import { LikeStatus } from "../types/LikeStatusEnum";

export class PostsService {
  constructor(
    protected readonly postsRepository: PostsRepository,
    protected readonly blogsRepository: BlogsRepository
  ) {}

  async deleteAllPosts(): Promise<void> {
    await this.postsRepository.deleteAllPosts();
  }

  async getPostById(
    id: string,
    userId?: string
  ): Promise<IPostViewModel | null> {
    const foundPost = await this.postsRepository.getPostById(id);

    if (!foundPost) return null;

    return mapPostDBTypeToViewType(foundPost, userId);
  }

  async createPost(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ): Promise<IPostViewModel> {
    const blog = await this.blogsRepository.getBlogById(blogId);
    const newPost: IPostDBModel = {
      id: Date.now().toString(),
      title,
      shortDescription,
      content,
      blogId,
      createdAt: new Date().toISOString(),
      blogName: blog!.name,
      likesInfo: [],
    };
    const createdPost = await this.postsRepository.createPost(newPost);
    return mapPostDBTypeToViewType(createdPost);
  }

  async updatePost(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ): Promise<boolean> {
    return await this.postsRepository.updatePost(
      id,
      title,
      shortDescription,
      content,
      blogId
    );
  }

  async deletePost(id: string): Promise<boolean> {
    return await this.postsRepository.deletePost(id);
  }

  async updateLikeStatus(
    postId: string,
    user: IUserDBModel,
    likeStatus: LikeStatus
  ): Promise<boolean> {
    const post = await this.postsRepository.getPostById(postId);
    if (!post) return false;

    const myStatus = getUserLikeStatusForPost(post.likesInfo, user.id);

    if (!myStatus) {
      const likeInfo = {
        userId: user.id,
        login: user.accountData.login,
        likeStatus,
        addedAt: new Date(),
      };
      return this.postsRepository.addNewLikedUserInfo(post.id, likeInfo);
    }

    if (myStatus === likeStatus) return true;

    return this.postsRepository.updateLikedUserInfo(
      post.id,
      user.id,
      likeStatus
    );
  }
}
