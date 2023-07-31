import { CustomValidator } from "express-validator";
import { LikeStatus } from "../types/LikeStatusEnum";

export const isValidLikeStatus: CustomValidator = async (likeStatus) => {
  const isValid = Object.values(LikeStatus).includes(likeStatus);
  if (isValid) {
    return true;
  } else {
    throw new Error("Incorrect value for like status");
  }
};
