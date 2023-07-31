import { ICommentDBModel } from "./../types/IComment";
import { QueryParamType } from "../types/QueryParamType";
import { CommentModel } from "../models/commentModel";
import { SortOrder } from "mongoose";

type CommentsWithMetaType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ICommentDBModel[];
};

export class CommentsQueryRepository {
  async getComments(
    sortBy: QueryParamType = "createdAt",
    sortDirection: QueryParamType = "desc",
    pageNumber: QueryParamType = "1",
    pageSize: QueryParamType = "10",
    postId: string
  ): Promise<CommentsWithMetaType> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (postId) {
      filter.postId = postId;
    }

    const totalCount = await CommentModel.countDocuments(filter);
    const comments = await CommentModel.find(filter, { postId: 0 })
      .sort({ [sortBy.toString()]: sortDirection as SortOrder })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    return {
      pagesCount: Math.ceil(totalCount / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: comments,
    };
  }
}
