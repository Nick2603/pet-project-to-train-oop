import { BlogsRepository } from "../repositories/blogsRepository";
import { IBlog } from "../types/IBlog";

export class BlogsService {
  constructor(protected readonly blogsRepository: BlogsRepository) {}

  async deleteAllBlogs(): Promise<void> {
    await this.blogsRepository.deleteAllBlogs();
  }

  async getBlogById(id: string): Promise<IBlog | null> {
    return await this.blogsRepository.getBlogById(id);
  }

  async createBlog(
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<IBlog> {
    const newBlog: IBlog = {
      id: Date.now().toString(),
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    await this.blogsRepository.createBlog(newBlog);
    return {
      id: newBlog.id,
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
      isMembership: newBlog.isMembership,
    };
  }

  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<boolean> {
    return this.blogsRepository.updateBlog(id, name, description, websiteUrl);
  }

  async deleteBlog(id: string): Promise<boolean> {
    return this.blogsRepository.deleteBlog(id);
  }
}
