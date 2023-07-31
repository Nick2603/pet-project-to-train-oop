import { IPostDBModel } from "../types/IPost";
import { QueryParamType } from "../types/QueryParamType";
import { PostModel } from "../models/postModel";
import { SortOrder } from "mongoose";

type PostsWithMetaType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: IPostDBModel[];
};

interface IGetPostsInput {
  title: QueryParamType;
  sortBy: QueryParamType;
  sortDirection: QueryParamType;
  pageNumber: QueryParamType;
  pageSize: QueryParamType;
  blogId?: string;
}

export class PostsQueryRepository {
  async getPosts({
    title,
    sortBy = "createdAt",
    sortDirection = "desc",
    pageNumber = "1",
    pageSize = "10",
    blogId,
  }: IGetPostsInput): Promise<PostsWithMetaType> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (blogId) {
      filter.blogId = blogId;
    }

    const totalCount = await PostModel.countDocuments(filter);
    const posts = await PostModel.find(filter)
      .sort({ [sortBy.toString()]: sortDirection as SortOrder })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    return {
      pagesCount: Math.ceil(totalCount / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: posts,
    };
  }
}
