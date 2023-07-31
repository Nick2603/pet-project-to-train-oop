import { mapCommentDBTypeToViewType } from "./../mappers/mapCommentDBTypeToViewType";
import { Request, Response } from "express";
import { PostsService } from "../domains/postsService";
import { PostsQueryRepository } from "../repositories/postsQueryRepository";
import { CodeResponsesEnum } from "../types/CodeResponsesEnum";
import { CommentsQueryRepository } from "../repositories/commentsQueryRepository";
import { CommentsService } from "../domains/commentsService";
import { JWTService } from "../application/jwtService";
import { mapPostDBTypeToViewType } from "../mappers/mapPostDBTypeToViewType";

export class PostsController {
  constructor(
    protected readonly postsService: PostsService,
    protected readonly postsQueryRepository: PostsQueryRepository,
    protected readonly commentsQueryRepository: CommentsQueryRepository,
    protected readonly commentsService: CommentsService,
    protected readonly jwtService: JWTService
  ) {}

  async getPosts(req: Request, res: Response) {
    const title = req.query.title;
    const sortBy = req.query.sortBy;
    const sortDirection = req.query.sortDirection;
    const pageNumber = req.query.pageNumber;
    const pageSize = req.query.pageSize;

    let userId: string | undefined;

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      userId = await this.jwtService.getUserIdByToken(token);
    }

    const posts = await this.postsQueryRepository.getPosts({
      title,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    });

    const postsView = posts.items.map((post) =>
      mapPostDBTypeToViewType(post, userId)
    );
    res.status(200).send({ ...posts, items: postsView });
  }

  async getPostById(req: Request, res: Response) {
    let userId: string | undefined;

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      userId = await this.jwtService.getUserIdByToken(token);
    }

    const postId = req.params.id;
    const post = await this.postsService.getPostById(postId, userId);
    if (post) {
      res.status(200).send(post);
      return;
    }
    res.sendStatus(CodeResponsesEnum.Not_found_404);
  }

  async createPost(req: Request, res: Response) {
    const title = req.body.title;
    const shortDescription = req.body.shortDescription;
    const content = req.body.content;
    const blogId = req.body.blogId;

    const newPost = await this.postsService.createPost(
      title,
      shortDescription,
      content,
      blogId
    );
    res.status(CodeResponsesEnum.Created_201).send(newPost);
  }

  async updatePost(req: Request, res: Response) {
    const postId = req.params.id;
    const title = req.body.title;
    const shortDescription = req.body.shortDescription;
    const content = req.body.content;
    const blogId = req.body.blogId;

    const result = await this.postsService.updatePost(
      postId,
      title,
      shortDescription,
      content,
      blogId
    );
    if (result) {
      res.sendStatus(CodeResponsesEnum.No_content_204);
    } else {
      res.sendStatus(CodeResponsesEnum.Not_found_404);
    }
  }

  async deletePost(req: Request, res: Response) {
    const id = req.params.id;
    const result = await this.postsService.deletePost(id);
    if (result) {
      res.sendStatus(CodeResponsesEnum.No_content_204);
      return;
    }
    res.sendStatus(CodeResponsesEnum.Not_found_404);
  }

  async getCommentsForPost(req: Request, res: Response) {
    let userId: string | undefined;

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      userId = await this.jwtService.getUserIdByToken(token);
    }

    const postId = req.params.postId;
    const post = await this.postsService.getPostById(postId);
    if (!post) {
      res.sendStatus(CodeResponsesEnum.Not_found_404);
      return;
    }

    const sortBy = req.query.sortBy;
    const sortDirection = req.query.sortDirection;
    const pageNumber = req.query.pageNumber;
    const pageSize = req.query.pageSize;
    const comments = await this.commentsQueryRepository.getComments(
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      postId
    );
    const commentsView = comments.items.map((comment) =>
      mapCommentDBTypeToViewType(comment, userId)
    );
    res.status(200).send({ ...comments, items: commentsView });
  }

  async createCommentForPost(req: Request, res: Response) {
    const postId = req.params.postId;
    const post = await this.postsService.getPostById(postId);
    if (!post) {
      res.sendStatus(CodeResponsesEnum.Not_found_404);
      return;
    }

    const userId = req.user!.id;
    const content = req.body.content;

    const newComment = await this.commentsService.createComment(
      content,
      postId,
      userId
    );
    res.status(CodeResponsesEnum.Created_201).send(newComment);
  }

  async updateLikeStatus(req: Request, res: Response) {
    const postId = req.params.postId;
    const user = req.user!;
    const likeStatus = req.body.likeStatus;

    const result = await this.postsService.updateLikeStatus(
      postId,
      user,
      likeStatus
    );
    if (!result) return res.sendStatus(CodeResponsesEnum.Not_found_404);
    return res.sendStatus(CodeResponsesEnum.No_content_204);
  }
}
