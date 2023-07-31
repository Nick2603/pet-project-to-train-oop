import { Request, Response } from "express";
import { BlogsService } from "../domains/blogsService";
import { BlogsQueryRepository } from "../repositories/blogsQueryRepository";
import { CodeResponsesEnum } from "../types/CodeResponsesEnum";
import { PostsService } from "../domains/postsService";
import { PostsQueryRepository } from "../repositories/postsQueryRepository";
import { mapPostDBTypeToViewType } from "../mappers/mapPostDBTypeToViewType";
import { JWTService } from "../application/jwtService";

export class BlogsController {
  constructor(
    protected readonly blogsService: BlogsService,
    protected readonly blogsQueryRepository: BlogsQueryRepository,
    protected readonly postsService: PostsService,
    protected readonly postsQueryRepository: PostsQueryRepository,
    protected readonly jwtService: JWTService
  ) {}

  async getBlogs(req: Request, res: Response) {
    const searchNameTerm = req.query.searchNameTerm;
    const sortBy = req.query.sortBy;
    const sortDirection = req.query.sortDirection;
    const pageNumber = req.query.pageNumber;
    const pageSize = req.query.pageSize;
    const blogs = await this.blogsQueryRepository.getBlogs({
      searchNameTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    });
    res.status(200).send(blogs);
  }

  async getBlogById(req: Request, res: Response) {
    const blogId = req.params.id;
    const blog = await this.blogsService.getBlogById(blogId);
    if (blog) {
      res.status(200).send(blog);
      return;
    }
    res.sendStatus(CodeResponsesEnum.Not_found_404);
  }

  async createBlog(req: Request, res: Response) {
    const name = req.body.name;
    const description = req.body.description;
    const websiteUrl = req.body.websiteUrl;

    const newBlog = await this.blogsService.createBlog(
      name,
      description,
      websiteUrl
    );
    res.status(CodeResponsesEnum.Created_201).send(newBlog);
  }

  async updateBlog(req: Request, res: Response) {
    const blogId = req.params.id;
    const name = req.body.name;
    const description = req.body.description;
    const websiteUrl = req.body.websiteUrl;

    const result = await this.blogsService.updateBlog(
      blogId,
      name,
      description,
      websiteUrl
    );
    if (result) {
      res.sendStatus(CodeResponsesEnum.No_content_204);
    } else {
      res.sendStatus(CodeResponsesEnum.Not_found_404);
    }
  }

  async deleteBlog(req: Request, res: Response) {
    const id = req.params.id;
    const result = await this.blogsService.deleteBlog(id);
    if (result) {
      res.sendStatus(CodeResponsesEnum.No_content_204);
      return;
    }
    res.sendStatus(CodeResponsesEnum.Not_found_404);
  }

  async getPostsForBlog(req: Request, res: Response) {
    const blogId = req.params.blogId;
    const blog = await this.blogsService.getBlogById(blogId);
    if (blog) {
      let userId: string | undefined;

      if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        userId = await this.jwtService.getUserIdByToken(token);
      }

      const title = req.params.title;
      const sortBy = req.query.sortBy;
      const sortDirection = req.query.sortDirection;
      const pageNumber = req.query.pageNumber;
      const pageSize = req.query.pageSize;
      const posts = await this.postsQueryRepository.getPosts({
        title,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize,
        blogId,
      });

      const postsView = posts.items.map((post) =>
        mapPostDBTypeToViewType(post, userId)
      );

      res.status(200).send({ ...posts, items: postsView });
      return;
    }
    res.sendStatus(CodeResponsesEnum.Not_found_404);
  }

  async createPostForBlog(req: Request, res: Response) {
    const blogId = req.params.blogId;
    const blog = await this.blogsService.getBlogById(blogId);
    if (blog) {
      const title = req.body.title;
      const shortDescription = req.body.shortDescription;
      const content = req.body.content;

      const newPost = await this.postsService.createPost(
        title,
        shortDescription,
        content,
        blogId
      );
      res.status(CodeResponsesEnum.Created_201).send(newPost);
      return;
    }
    res.sendStatus(CodeResponsesEnum.Not_found_404);
  }
}
