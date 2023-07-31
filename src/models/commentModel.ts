import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { WithId } from "mongodb";
import {
  ICommentDBModel,
  ICommentatorInfo,
  ILikesInfo,
} from "../types/IComment";

const CommentatorInfoSchema = new Schema<ICommentatorInfo>(
  {
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
  },
  { _id: false }
);

const likesInfo = new Schema<ILikesInfo>(
  {
    likes: {
      count: { type: Number, required: true, default: 0 },
      userIds: [{ type: String }],
    },
    dislikes: {
      count: { type: Number, required: true, default: 0 },
      userIds: [{ type: String }],
    },
  },
  { _id: false }
);

const CommentSchema = new Schema<WithId<ICommentDBModel>>({
  _id: {
    type: String,
    required: true,
    immutable: true,
    alias: "id",
    default: uuidv4,
  },
  postId: { type: String },
  content: { type: String, required: true },
  createdAt: { type: String, required: true },
  commentatorInfo: { type: CommentatorInfoSchema, required: true },
  likesInfo: { type: likesInfo, required: true },
});

CommentSchema.set("toJSON", {
  transform: function (_, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export const CommentModel = model<ICommentDBModel>("comments", CommentSchema);
