import { UserTokenPayload } from "./types";

declare module "express-serve-static-core" {
  interface Request extends UserTokenPayload  {}
}
