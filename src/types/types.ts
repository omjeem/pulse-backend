import { Types } from "mongoose";

export interface UserTokenPayload {
  user: {
    userId: Types.ObjectId;
    email: string;
  };
}

