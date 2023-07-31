import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { WithId } from "mongodb";
import { ILikeInfo, IPostDBModel } from "../types/IPost";
import { LikeStatus } from "../types/LikeStatusEnum";

const likesInfo = new Schema<ILikeInfo>(
  {
    userId: { type: String, required: true },
    login: { type: String, required: true },
    likeStatus: {
      type: String,
      required: true,
      enum: Object.values(LikeStatus),
    },
    addedAt: { type: Date, required: true, immutable: true },
  },
  { _id: false }
);

const PostSchema = new Schema<WithId<IPostDBModel>>({
  _id: {
    type: String,
    required: true,
    immutable: true,
    alias: "id",
    default: uuidv4,
  },
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, required: true },
  likesInfo: { type: [likesInfo], required: true },
});

PostSchema.set("toJSON", {
  transform: function (_, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export const PostModel = model<IPostDBModel>("posts", PostSchema);
