import jwtService from "./auth/jwt";
import team from "./db/team";
import tenant from "./db/tenant";
import user from "./db/user";
import video from "./db/video";
import { frameModeration } from "./moderation/frame";

const services = {
  user,
  jwtService,
  tenant,
  team,
  video,
  moderation: {
    frameModeration,
  },
};

export default services;
