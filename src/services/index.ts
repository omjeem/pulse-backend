import jwtService from "./auth/jwt";
import tenant from "./db/tenant";
import user from "./db/user";
import video from "./db/video";
import { frameModeration } from "./moderation/frame";

const services = {
  user,
  jwtService,
  tenant,
  video,
  moderation: {
    frameModeration,
  },
};

export default services;
