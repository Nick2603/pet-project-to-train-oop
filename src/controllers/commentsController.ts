import { Request, Response } from "express";
import { CommentsService } from "../domains/commentsService";
import { CommentsQueryRepository } from "../repositories/commentsQueryRepository";
import { CodeResponsesEnum } from "../types/CodeResponsesEnum";
import { JWTService } from "../application/jwtService";

export class CommentsController {
  constructor(
    protected readonly commentsService: CommentsService,
    protected readonly commentsQueryRepository: CommentsQueryRepository,
    protected readonly jwtService: JWTService
  ) {}

  async getCommentById(req: Request, res: Response) {
    const commentId = req.params.commentId;
    let userId: string | undefined;

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      userId = await this.jwtService.getUserIdByToken(token);
    }

    const comment = await this.commentsService.getCommentById(
      commentId,
      userId
    );
    if (comment) {
      res.status(200).send(comment);
      return;
    }
    res.sendStatus(CodeResponsesEnum.Not_found_404);
  }

  async updateComment(req: Request, res: Response) {
    const commentId = req.params.commentId;
    const content = req.body.content;
    const userId = req.user!.id;

    const result = await this.commentsService.updateComment(
      commentId,
      content,
      userId
    );
    if (result === "Not found")
      return res.sendStatus(CodeResponsesEnum.Not_found_404);
    if (result === "Forbidden")
      return res.sendStatus(CodeResponsesEnum.Forbidden_403);
    if (result === "Updated")
      return res.sendStatus(CodeResponsesEnum.No_content_204);
  }

  async deleteComment(req: Request, res: Response) {
    const commentId = req.params.commentId;
    const userId = req.user!.id;
    const result = await this.commentsService.deleteComment(
      commentId,
      userId.toString()
    );
    if (result === "Not found")
      return res.sendStatus(CodeResponsesEnum.Not_found_404);
    if (result === "Forbidden")
      return res.sendStatus(CodeResponsesEnum.Forbidden_403);
    if (result === "Updated")
      return res.sendStatus(CodeResponsesEnum.No_content_204);
  }

  async updateLikeStatus(req: Request, res: Response) {
    const commentId = req.params.commentId;
    const userId = req.user!.id;
    const likeStatus = req.body.likeStatus;

    const result = await this.commentsService.updateLikeStatus(
      commentId,
      userId,
      likeStatus
    );
    if (!result) return res.sendStatus(CodeResponsesEnum.Not_found_404);
    return res.sendStatus(CodeResponsesEnum.No_content_204);
  }
}
